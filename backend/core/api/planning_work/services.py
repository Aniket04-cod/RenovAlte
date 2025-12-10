import os
import json
import time
import hashlib
from datetime import datetime
from typing import Optional, Dict, Any, List
import logging
from concurrent.futures import ThreadPoolExecutor, TimeoutError

try:
    import google.generativeai as genai  # optional, handled below
    _HAS_GENAI = True
except Exception:
    genai = None
    _HAS_GENAI = False

# RAG imports
try:
    from .rag.retriever import get_rag_retriever
    _HAS_RAG = True
except Exception as e:
    logging.warning(f"RAG modules not available: {str(e)}")
    _HAS_RAG = False

logger = logging.getLogger(__name__)


class GeminiService:
    """Service for interacting with Google's Gemini AI (fast by default with caching and timeout)"""

    def __init__(self, use_rag: bool = True):
        # Configuration from env
        self.api_key = os.getenv("GEMINI_API_KEY")
        # Use latest public model names; override via env if needed
        self.fast_model = os.getenv("AI_FAST_MODEL", "gemini-1.5-flash-002")
        self.pro_model = os.getenv("AI_PRO_MODEL", "gemini-1.5-pro-002")
        self.default_quality = os.getenv("AI_QUALITY_DEFAULT", "auto").lower()  # fast | pro | auto
        self.timeout_ms = int(os.getenv("AI_TIMEOUT_MS", "12000"))
        
        # RAG configuration
        self.use_rag = use_rag and _HAS_RAG
        self.rag_retriever = None
        if self.use_rag:
            try:
                logger.info("Initializing RAG retriever for GeminiService")
                self.rag_retriever = get_rag_retriever()
                logger.info("RAG retriever initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize RAG retriever: {str(e)}")
                self.use_rag = False

        # File cache directory
        self.cache_dir = os.path.join(os.path.dirname(__file__), "../../../.cache")
        self.cache_dir = os.path.abspath(self.cache_dir)
        os.makedirs(self.cache_dir, exist_ok=True)

        self._fast = None
        self._pro = None

        # Minimal lightweight knowledge base (code-only RAG)
        # Keep concise to avoid token bloat; expand later if needed.
        self._kb = {
            "single-family": {
                "best_practices": [
                    "Prioritize envelope first: roof/walls/airtightness",
                    "Uw <= 1.0 W/m²K windows for efficiency",
                    "Consider heat pump + low-temp emitters",
                    "MVHR for indoor air quality and heat recovery",
                    "Plan permits early; coordinate scaffolding access",
                ],
                "regulatory_notes": "GEG compliance; check local Bauamt for structural changes",
            },
            "apartment": {
                "best_practices": [
                    "Focus on windows, balcony doors, infiltration",
                    "Coordinate HOA (WEG) rules for facade changes",
                    "Electrical safety per DIN VDE 0100",
                ],
                "regulatory_notes": "HOA approval may be required for external changes",
            },
            "commercial": {
                "best_practices": [
                    "Check occupancy, egress, fire safety systems",
                    "Right-size HVAC for loads; zoning",
                    "Acoustic treatment and lighting standards",
                ],
                "regulatory_notes": "Fire safety, accessibility (DIN 18040)",
            },
        }

    def _rag_context(self, building_type: str, goals: List[str]) -> str:
        bt = (building_type or "").lower()
        entry = self._kb.get(bt) or self._kb.get("single-family")
        if not entry:
            return ""
        bullets = []
        # Simple goal-aware selection (code-only)
        goals_l = [g.lower() for g in (goals or [])]
        if any("insulation" in g or "efficiency" in g for g in goals_l):
            bullets.append(entry["best_practices"][0])
        if any("windows" in g for g in goals_l) and len(entry["best_practices"]) > 1:
            bullets.append(entry["best_practices"][1])
        # Add 1-2 generic best practices
        for bp in entry["best_practices"]:
            if len(bullets) >= 4:
                break
            if bp not in bullets:
                bullets.append(bp)
        # Regulatory note
        bullets.append(f"Note: {entry['regulatory_notes']}")
        # Cap to 5 lines total
        bullets = bullets[:5]
        return "\n".join(f"- {b}" for b in bullets)

    def _ensure_genai(self):
        if not _HAS_GENAI:
            raise ValueError("google-generativeai SDK not installed. Install with: pip install google-generativeai")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")
        genai.configure(api_key=self.api_key)

    def _get_model(self, quality: str):
        self._ensure_genai()
        q = (quality or self.default_quality or "fast").lower()
        if q == "pro":
            if not self._pro:
                self._pro = genai.GenerativeModel(self.pro_model, generation_config={
                    "temperature": 0.3,
                    "max_output_tokens": 2048,
                    "top_p": 0.8,
                    "top_k": 40,
                })
            return self._pro
        # fast or auto default
        if not self._fast:
            self._fast = genai.GenerativeModel(self.fast_model, generation_config={
                "temperature": 0.25,
                "max_output_tokens": 1400,
                "top_p": 0.8,
                "top_k": 40,
            })
        return self._fast

    def _cache_key(self, payload: Dict[str, Any]) -> str:
        # Normalize payload: sort keys, round budget & size to reduce key explosion
        normalized = dict(payload)
        if "budget" in normalized:
            try:
                normalized["budget"] = float(normalized["budget"])
            except Exception:
                pass
        if "building_size" in normalized:
            try:
                normalized["building_size"] = int(normalized["building_size"])
            except Exception:
                pass
        blob = json.dumps(normalized, sort_keys=True, separators=(",", ":"))
        return hashlib.md5(blob.encode("utf-8")).hexdigest()

    def _cache_path(self, key: str) -> str:
        return os.path.join(self.cache_dir, f"plan_{key}.json")

    def _cache_get(self, key: str) -> Optional[dict]:
        path = self._cache_path(key)
        if not os.path.exists(path):
            return None
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return None

    def _cache_set(self, key: str, data: dict):
        try:
            with open(self._cache_path(key), "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False)
        except Exception as e:
            logger.debug(f"Cache write failed: {e}")
    
    def generate_renovation_plan(
        self,
        building_type: str,
        budget: float,
        location: str,
        building_size: int,
        renovation_goals: list,
        building_age: str,
        target_start_date: str,
        financing_preference: str,
        incentive_intent: str,
        living_during_renovation: str,
        heritage_protection: str,
        energy_certificate_available: str = None,
        surveys_require: str = None,
        neighbor_impacts: str = None,
        current_insulation_status: str = None,
        heating_system_type: str = None,
        window_type: str = None,
        known_major_issues: str = None,
        quality: Optional[str] = None,
    ) -> dict:
        """
        Generate a comprehensive renovation plan using Gemini AI
        
        Args:
            building_type: Type of building (residential, commercial, etc.)
            budget: Available budget in EUR
            location: Location (Bundesland) in Germany
            building_size: Building size in square meters
            renovation_goals: List of renovation goals
            building_age: Building construction date
            target_start_date: Target renovation start date
            financing_preference: Preferred financing method
            incentive_intent: Intent to apply for incentives
            living_during_renovation: Whether living during renovation
            heritage_protection: Heritage protection status
            energy_certificate_available: Energy certificate grade (optional)
            surveys_require: Required surveys (optional)
            neighbor_impacts: Expected neighbor impacts (optional)
            current_insulation_status: Current insulation status (optional)
            heating_system_type: Current heating system (optional)
            window_type: Current window type (optional)
            known_major_issues: Known major issues (optional)
            
        Returns:
            dict: Contains success status, plan data, and metadata
        """
        try:
            t0 = time.perf_counter()
            payload_for_cache = {
                "building_type": building_type,
                "budget": budget,
                "location": location,
                "building_size": building_size,
                "renovation_goals": sorted(list(renovation_goals or [])),
                "building_age": building_age,
                "target_start_date": target_start_date,
                "financing_preference": financing_preference,
                "incentive_intent": incentive_intent,
                "living_during_renovation": living_during_renovation,
                "heritage_protection": heritage_protection,
                "energy_certificate_available": energy_certificate_available,
                "surveys_require": surveys_require,
                "neighbor_impacts": neighbor_impacts,
                "current_insulation_status": current_insulation_status,
                "heating_system_type": heating_system_type,
                "window_type": window_type,
                "known_major_issues": known_major_issues,
            }

            # Cache lookup
            ck = self._cache_key(payload_for_cache)
            cached = self._cache_get(ck)
            if cached:
                cached["cached"] = True
                cached.setdefault("timings", {}).update({"total_ms": int((time.perf_counter() - t0) * 1000)})
                return cached

            # Construct the prompt for Gemini (with RAG context if available)
            rag = ""
            if self.use_rag and self.rag_retriever:
                try:
                    # Build a comprehensive query combining user's goals and context
                    query_parts = [
                        f"Building renovation project: {building_type}",
                        f"Goals: {', '.join(renovation_goals or [])}",
                        f"Location: {location}",
                        f"Heritage protection: {heritage_protection}" if heritage_protection else "",
                    ]
                    query = " ".join([p for p in query_parts if p])
                    
                    # Retrieve context from multiple categories
                    rag = self.rag_retriever.retrieve_multi_category(
                        query=query,
                        categories=["regulations", "permits", "incentives", "processes"],
                        chunks_per_category=1  # 1 chunk per category = 4 total, keeps prompt compact
                    )
                    logger.info(f"Retrieved RAG context: {len(rag)} chars")
                except Exception as e:
                    logger.warning(f"RAG retrieval failed, using fallback: {str(e)}")
                    rag = self._rag_context(building_type, renovation_goals)
            else:
                # Fallback to simple knowledge base
                rag = self._rag_context(building_type, renovation_goals)
            
            prompt = self._build_renovation_prompt(
                building_type=building_type,
                budget=budget,
                location=location,
                building_size=building_size,
                renovation_goals=renovation_goals,
                building_age=building_age,
                target_start_date=target_start_date,
                financing_preference=financing_preference,
                incentive_intent=incentive_intent,
                living_during_renovation=living_during_renovation,
                heritage_protection=heritage_protection,
                energy_certificate_available=energy_certificate_available,
                surveys_require=surveys_require,
                neighbor_impacts=neighbor_impacts,
                current_insulation_status=current_insulation_status,
                heating_system_type=heating_system_type,
                window_type=window_type,
                known_major_issues=known_major_issues,
                rag_context=rag,
            )
            t_prompt = time.perf_counter()

            # Choose model (fast default; upgrade to pro on demand)
            model = self._get_model(quality or "fast")

            # Run with timeout in a thread to avoid blocking
            timeout_s = max(1, int(self.timeout_ms / 1000))
            try:
                with ThreadPoolExecutor(max_workers=1) as pool:
                    future = pool.submit(lambda: model.generate_content(prompt))
                    response = future.result(timeout=timeout_s)
            except Exception as e:
                # If the fast model fails (e.g., 404 model not found), try pro as fallback once
                logger.warning(f"Fast model failed ({self.fast_model}): {e}. Trying pro model once.")
                try:
                    model = self._get_model("pro")
                    with ThreadPoolExecutor(max_workers=1) as pool:
                        future = pool.submit(lambda: model.generate_content(prompt))
                        response = future.result(timeout=timeout_s)
                except Exception as e2:
                    logger.error(f"Gemini generation failed after fallback: {e2}")
                    return {
                        'success': False,
                        'plan': {},
                        'building_type': building_type,
                        'budget': budget,
                        'location': location,
                        'error': str(e2),
                        'generated_at': datetime.now().isoformat(),
                        'cached': False,
                        'timings': {
                            'prompt_ms': int((time.perf_counter() - t0) * 1000),
                            'llm_ms': 0,
                            'parse_ms': 0,
                            'total_ms': int((time.perf_counter() - t0) * 1000),
                        },
                    }

            t_gen = time.perf_counter()

            # Parse the response
            plan_data = self._parse_gemini_response(getattr(response, "text", ""))

            # Minimal validation; if weak, escalate once to pro
            def _weak(pd: dict) -> bool:
                if not isinstance(pd, dict):
                    return True
                if len(pd.get("phases", [])) != 6:
                    return True
                if len(pd.get("gantt_chart", [])) != 6:
                    return True
                return False

            escalated = False
            if _weak(plan_data) and (quality or self.default_quality) in ("auto",):
                try:
                    model_pro = self._get_model("pro")
                    with ThreadPoolExecutor(max_workers=1) as pool:
                        future2 = pool.submit(lambda: model_pro.generate_content(prompt))
                        response2 = future2.result(timeout=max(1, int(self.timeout_ms / 1000)))
                    plan2 = self._parse_gemini_response(getattr(response2, "text", ""))
                    if not _weak(plan2):
                        plan_data = plan2
                        escalated = True
                except Exception:
                    logger.debug("Pro escalation failed; keeping fast result")
            t_parse = time.perf_counter()

            result = {
                'success': True,
                'plan': plan_data,
                'building_type': building_type,
                'budget': budget,
                'location': location,
                'error': None,
                'generated_at': datetime.now().isoformat(),
                'cached': False,
                'timings': {
                    'prompt_ms': int((t_prompt - t0) * 1000),
                    'llm_ms': int((t_gen - t_prompt) * 1000),
                    'parse_ms': int((t_parse - t_gen) * 1000),
                    'total_ms': int((t_parse - t0) * 1000),
                }
            }
            if escalated:
                result['timings']['escalated'] = True

            # Cache store
            self._cache_set(ck, dict(result))
            return result
            
        except TimeoutError:
            logger.warning("Gemini generation timed out; returning fallback plan")
            return {
                'success': True,
                'plan': self._get_fallback_plan(),
                'building_type': building_type,
                'budget': budget,
                'location': location,
                'error': None,
                'generated_at': datetime.now().isoformat(),
                'cached': False,
                'timings': {'total_ms': self.timeout_ms}
            }
        except Exception as e:
            logger.exception("GeminiService failed")
            return {
                'success': False,
                'plan': None,
                'building_type': building_type,
                'budget': budget,
                'location': location,
                'error': str(e),
                'generated_at': datetime.now().isoformat()
            }
    
    def _build_renovation_prompt(
        self,
        building_type: str,
        budget: float,
        location: str,
        building_size: int,
        renovation_goals: list,
        building_age: str,
        target_start_date: str,
        financing_preference: str,
        incentive_intent: str,
        living_during_renovation: str,
        heritage_protection: str,
        energy_certificate_available: str = None,
        surveys_require: str = None,
        neighbor_impacts: str = None,
        current_insulation_status: str = None,
        heating_system_type: str = None,
        window_type: str = None,
        known_major_issues: str = None,
        rag_context: str = ""
    ) -> str:
        """Build a compact prompt for the Gemini AI (slimmed for speed)"""
        
        # Format renovation goals as a comma-separated string
        goals_str = ", ".join(renovation_goals)
        
        prompt = f"""
    You are an expert renovation consultant (Germany) and must output STRICT JSON only. Keep responses concise but complete.

    Input:
- Building Type: {building_type}
- Location (Bundesland): {location}
- Building Size: {building_size} m²
- Building Age: {building_age}
- Heritage Protection (Denkmalschutz): {heritage_protection}

**Current Building Status:**
- Energy Certificate: {energy_certificate_available or 'Not available'}
- Current Insulation Status: {current_insulation_status or 'Not specified'}
- Heating System Type: {heating_system_type or 'Not specified'}
- Window Type: {window_type or 'Not specified'}
- Known Major Issues: {known_major_issues or 'None reported'}

Goals & Constraints:
- Goals: {goals_str}
- Budget: €{budget:,.2f}
- Target Start Date: {target_start_date}
- Living During Renovation: {living_during_renovation}

Financing & Compliance:
- Financing Preference: {financing_preference}
- Incentive Intent: {incentive_intent}
- Surveys Required: {surveys_require or 'To be determined'}
- Neighbor Impacts: {neighbor_impacts or 'None expected'}

Context (RAG hints):
{rag_context or '-'}

Output JSON schema (EXACT keys; concise values):

{{
    "project_summary": {{
        "total_estimated_cost": "€X - €Y",
        "total_duration": "X-Y months",
        "funding_readiness": "Good Match/Partial Match/Needs Review",
        "complexity_level": "Low/Medium/High",
        "key_considerations": ["point1", "point2", "point3"]
    }},
    
    "phases": [
        {{
            "id": 1,
            "title": "Site Inspection",
            "icon": "Search",
            "duration": "1-2 weeks",
            "cost": "€500 - €1,200",
            "status": "ready",
            "color": "emerald",
            "tasks": [
                {{
                    "task_name": "Task description",
                    "estimated_time": "X days",
                    "estimated_cost": "€X",
                    "required_by": "Stakeholder name"
                }}
            ],
            "required_documents": ["document1", "document2"],
            "stakeholders": ["stakeholder1", "stakeholder2"]
        }},
        {{
            "id": 2,
            "title": "Energy Audit",
            "icon": "Zap",
            "duration": "1 week",
            "cost": "€800 - €1,500",
            "status": "ready",
            "color": "blue",
            "tasks": [],
            "required_documents": [],
            "stakeholders": []
        }},
        {{
            "id": 3,
            "title": "Permit Preparation",
            "icon": "FileText",
            "duration": "2-3 weeks",
            "cost": "€1,000 - €2,000",
            "status": "pending",
            "color": "amber",
            "tasks": [],
            "required_documents": [],
            "stakeholders": []
        }},
        {{
            "id": 4,
            "title": "Contractor Selection",
            "icon": "Users",
            "duration": "2-4 weeks",
            "cost": "Variable",
            "status": "pending",
            "color": "purple",
            "tasks": [],
            "required_documents": [],
            "stakeholders": []
        }},
        {{
            "id": 5,
            "title": "Implementation",
            "icon": "Wrench",
            "duration": "8-12 weeks",
            "cost": "€35,000 - €50,000",
            "status": "pending",
            "color": "rose",
            "tasks": [],
            "required_documents": [],
            "stakeholders": []
        }},
        {{
            "id": 6,
            "title": "Final Inspection",
            "icon": "CheckCircle2",
            "duration": "1 week",
            "cost": "€300 - €600",
            "status": "pending",
            "color": "gray",
            "tasks": [],
            "required_documents": [],
            "stakeholders": []
        }}
    ],
    
    "gantt_chart": [
        {{
            "id": 1,
            "name": "Site Inspection",
            "start": 5,
            "duration": 10,
            "color": "bg-emerald-500"
        }},
        {{
            "id": 2,
            "name": "Energy Audit",
            "start": 15,
            "duration": 7,
            "color": "bg-blue-500"
        }},
        {{
            "id": 3,
            "name": "Permit Preparation",
            "start": 22,
            "duration": 14,
            "color": "bg-amber-500"
        }},
        {{
            "id": 4,
            "name": "Contractor Selection",
            "start": 36,
            "duration": 21,
            "color": "bg-purple-500"
        }},
        {{
            "id": 5,
            "name": "Implementation",
            "start": 57,
            "duration": 56,
            "color": "bg-rose-500"
        }},
        {{
            "id": 6,
            "name": "Final Inspection",
            "start": 113,
            "duration": 7,
            "color": "bg-gray-500"
        }}
    ],
    
    "permits": [
        {{
            "id": "geg",
            "name": "GEG Energy Compliance",
            "description": "Compliance with the German Building Energy Act (GEG) for energy-efficient renovations.",
            "checked": true
        }},
        {{
            "id": "baug",
            "name": "Baugenehmigung",
            "description": "Building permit required for structural changes and major renovations.",
            "checked": false
        }},
        {{
            "id": "architect",
            "name": "Architect Approval",
            "description": "Professional architect review and approval for design and structural plans.",
            "checked": false
        }},
        {{
            "id": "energy-cert",
            "name": "Energy Certificate",
            "description": "Updated energy performance certificate post-renovation.",
            "checked": false
        }},
        {{
            "id": "heritage",
            "name": "Heritage Protection Check",
            "description": "Required if the building is listed or in a protected area.",
            "checked": {str(heritage_protection == 'yes').lower()}
        }}
    ],
    
    "budget_breakdown": {{
        "total_estimated_cost": {{
            "min": 0,
            "max": 0
        }},
        "user_budget": {budget},
        "financing_readiness": "Good Match/Needs Review",
        "cost_categories": [
            {{
                "category": "Category Name",
                "estimated_cost": "€X - €Y",
                "percentage_of_total": "X%",
                "items": ["item1", "item2"]
            }}
        ],
        "contingency_fund": "€X (10-15% of total)"
    }},
    
    "kfw_funding_eligibility": {{
        "eligible_programs": [
            {{
                "program_name": "KfW Program Name",
                "program_number": "XXX",
                "type": "Grant/Loan/Subsidy",
                "max_amount": "€X or X%",
                "requirements": ["requirement1", "requirement2"],
                "energy_standard_required": "Standard description"
            }}
        ],
        "estimated_total_funding": "€X - €Y",
        "application_deadline": "Information or date",
        "next_steps": ["step1", "step2"]
    }},
    
    "stakeholders": [
        {{
            "name": "Stakeholder Name",
            "role": "Role Description",
            "when_needed": "Phase X",
            "estimated_cost": "€X - €Y",
            "how_to_find": "Recommendation"
        }}
    ],
    
    "risks_and_mitigation": [
        {{
            "risk": "Risk Description",
            "likelihood": "Low/Medium/High",
            "impact": "Low/Medium/High",
            "mitigation": "How to mitigate"
        }}
    ],
    
    "next_steps": [
        "Immediate action 1",
        "Immediate action 2",
        "Immediate action 3"
    ],
    
    "ai_suggestions": [
        "Suggestion 1",
        "Suggestion 2",
        "Suggestion 3"
    ]
}}

Rules:
1) phases: exactly 6 (ids 1..6); icons: Search, Zap, FileText, Users, Wrench, CheckCircle2; colors: emerald, blue, amber, purple, rose, gray; status: ready or pending.
2) gantt_chart: 6 items matching phases; colors bg-*-500; cumulative starts; duration in days.
3) permits: include ids 'geg','baug','architect','energy-cert','heritage'.
4) Date-based timeline should reflect start date {target_start_date}.

Return ONLY JSON, no extra text.
"""
        
        return prompt
    
    def _parse_gemini_response(self, response_text: str) -> dict:
        """
        Parse the Gemini response into structured JSON
        
        Args:
            response_text: Raw text response from Gemini
            
        Returns:
            dict: Parsed renovation plan data
        """
        try:
            # Clean up the response text
            cleaned_text = response_text.strip()
            
            # Remove markdown code blocks if present
            if cleaned_text.startswith('```json'):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.startswith('```'):
                cleaned_text = cleaned_text[3:]
            if cleaned_text.endswith('```'):
                cleaned_text = cleaned_text[:-3]
            
            cleaned_text = cleaned_text.strip()
            
            # Parse JSON
            plan_data = json.loads(cleaned_text)
            
            # Validate and ensure required structure
            plan_data = self._validate_plan_structure(plan_data)
            
            return plan_data
            
        except json.JSONDecodeError as e:
            # If JSON parsing fails, return a fallback structure
            return self._get_fallback_plan()
    
    def _validate_plan_structure(self, plan_data: dict) -> dict:
        """Ensure the plan has all required fields in correct format"""
        
        # Ensure phases have correct structure
        if 'phases' in plan_data:
            for i, phase in enumerate(plan_data['phases']):
                if 'id' not in phase:
                    phase['id'] = i + 1
                if 'icon' not in phase:
                    icons = ["Search", "Zap", "FileText", "Users", "Wrench", "CheckCircle2"]
                    phase['icon'] = icons[i] if i < len(icons) else "Search"
                if 'color' not in phase:
                    colors = ["emerald", "blue", "amber", "purple", "rose", "gray"]
                    phase['color'] = colors[i] if i < len(colors) else "gray"
                if 'status' not in phase:
                    phase['status'] = "ready" if i < 2 else "pending"
        
        # Ensure gantt_chart has correct structure
        if 'gantt_chart' in plan_data:
            colors = ["bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-purple-500", "bg-rose-500", "bg-gray-500"]
            for i, task in enumerate(plan_data['gantt_chart']):
                if 'color' not in task or not task['color'].startswith('bg-'):
                    task['color'] = colors[i] if i < len(colors) else "bg-gray-500"
        
        return plan_data
    
    def _get_fallback_plan(self) -> dict:
        """Return a basic fallback plan structure"""
        return {
            "error": "Failed to parse AI response",
            "project_summary": {
                "total_estimated_cost": "€0 - €0",
                "total_duration": "Unknown",
                "funding_readiness": "Needs Review",
                "complexity_level": "Unknown",
                "key_considerations": ["Unable to generate plan - please try again"]
            },
            "phases": [
                {
                    "id": 1,
                    "title": "Site Inspection",
                    "icon": "Search",
                    "duration": "1-2 weeks",
                    "cost": "€500 - €1,200",
                    "status": "ready",
                    "color": "emerald",
                    "tasks": [],
                    "required_documents": [],
                    "stakeholders": []
                },
                {
                    "id": 2,
                    "title": "Energy Audit",
                    "icon": "Zap",
                    "duration": "1 week",
                    "cost": "€800 - €1,500",
                    "status": "ready",
                    "color": "blue",
                    "tasks": [],
                    "required_documents": [],
                    "stakeholders": []
                },
                {
                    "id": 3,
                    "title": "Permit Preparation",
                    "icon": "FileText",
                    "duration": "2-3 weeks",
                    "cost": "€1,000 - €2,000",
                    "status": "pending",
                    "color": "amber",
                    "tasks": [],
                    "required_documents": [],
                    "stakeholders": []
                },
                {
                    "id": 4,
                    "title": "Contractor Selection",
                    "icon": "Users",
                    "duration": "2-4 weeks",
                    "cost": "Variable",
                    "status": "pending",
                    "color": "purple",
                    "tasks": [],
                    "required_documents": [],
                    "stakeholders": []
                },
                {
                    "id": 5,
                    "title": "Implementation",
                    "icon": "Wrench",
                    "duration": "8-12 weeks",
                    "cost": "€35,000 - €50,000",
                    "status": "pending",
                    "color": "rose",
                    "tasks": [],
                    "required_documents": [],
                    "stakeholders": []
                },
                {
                    "id": 6,
                    "title": "Final Inspection",
                    "icon": "CheckCircle2",
                    "duration": "1 week",
                    "cost": "€300 - €600",
                    "status": "pending",
                    "color": "gray",
                    "tasks": [],
                    "required_documents": [],
                    "stakeholders": []
                }
            ],
            "gantt_chart": [
                {"id": 1, "name": "Site Inspection", "start": 5, "duration": 10, "color": "bg-emerald-500"},
                {"id": 2, "name": "Energy Audit", "start": 15, "duration": 7, "color": "bg-blue-500"},
                {"id": 3, "name": "Permit Preparation", "start": 22, "duration": 14, "color": "bg-amber-500"},
                {"id": 4, "name": "Contractor Selection", "start": 36, "duration": 21, "color": "bg-purple-500"},
                {"id": 5, "name": "Implementation", "start": 57, "duration": 56, "color": "bg-rose-500"},
                {"id": 6, "name": "Final Inspection", "start": 113, "duration": 7, "color": "bg-gray-500"}
            ],
            "permits": [
                {
                    "id": "geg",
                    "name": "GEG Energy Compliance",
                    "description": "Compliance with the German Building Energy Act (GEG) for energy-efficient renovations.",
                    "checked": True
                },
                {
                    "id": "baug",
                    "name": "Baugenehmigung",
                    "description": "Building permit required for structural changes and major renovations.",
                    "checked": False
                },
                {
                    "id": "architect",
                    "name": "Architect Approval",
                    "description": "Professional architect review and approval for design and structural plans.",
                    "checked": False
                },
                {
                    "id": "energy-cert",
                    "name": "Energy Certificate",
                    "description": "Updated energy performance certificate post-renovation.",
                    "checked": False
                },
                {
                    "id": "heritage",
                    "name": "Heritage Protection Check",
                    "description": "Required if the building is listed or in a protected area.",
                    "checked": False
                }
            ],
            "next_steps": ["Contact support for assistance"]
        }


class MockGeminiService:
    """Mock service for testing without API calls"""
    
    def generate_renovation_plan(
        self,
        building_type: str,
        budget: float,
        location: str,
        building_size: int,
        renovation_goals: list,
        building_age: str,
        target_start_date: str,
        financing_preference: str,
        incentive_intent: str,
        living_during_renovation: str,
        heritage_protection: str,
        **kwargs
    ) -> dict:
        """Generate a mock renovation plan for testing"""
        
        goals_str = ", ".join(renovation_goals)
        
        mock_plan = {
            "project_summary": {
                "total_estimated_cost": f"€{budget * 0.8:,.0f} - €{budget * 1.2:,.0f}",
                "total_duration": "6-8 months",
                "funding_readiness": "Good Match" if incentive_intent == "yes_planning" else "Needs Review",
                "complexity_level": "Medium",
                "key_considerations": [
                    f"Building located in {location} with specific regional requirements",
                    f"Renovation goals include: {goals_str}",
                    f"Heritage protection: {heritage_protection}"
                ]
            },
            "phases": [
                {
                    "id": 1,
                    "title": "Site Inspection",
                    "icon": "Search",
                    "duration": "1-2 weeks",
                    "cost": f"€{budget * 0.02:,.0f} - €{budget * 0.03:,.0f}",
                    "status": "ready",
                    "color": "emerald",
                    "tasks": [
                        {
                            "task_name": "Initial building assessment",
                            "estimated_time": "2-3 days",
                            "estimated_cost": "€500 - €800",
                            "required_by": "Building Inspector"
                        }
                    ],
                    "required_documents": ["Building plans", "Property deed"],
                    "stakeholders": ["Building Inspector", "Architect"]
                },
                {
                    "id": 2,
                    "title": "Energy Audit",
                    "icon": "Zap",
                    "duration": "1 week",
                    "cost": f"€{budget * 0.015:,.0f} - €{budget * 0.025:,.0f}",
                    "status": "ready",
                    "color": "blue",
                    "tasks": [
                        {
                            "task_name": "Conduct energy assessment",
                            "estimated_time": "1 day",
                            "estimated_cost": "€800 - €1,500",
                            "required_by": "Energy Consultant"
                        }
                    ],
                    "required_documents": ["Energy consumption records"],
                    "stakeholders": ["Energy Consultant"]
                },
                {
                    "id": 3,
                    "title": "Permit Preparation",
                    "icon": "FileText",
                    "duration": "2-3 weeks",
                    "cost": f"€{budget * 0.03:,.0f} - €{budget * 0.05:,.0f}",
                    "status": "pending",
                    "color": "amber",
                    "tasks": [
                        {
                            "task_name": "Prepare building permit application",
                            "estimated_time": "1 week",
                            "estimated_cost": "€1,000 - €2,000",
                            "required_by": "Architect"
                        }
                    ],
                    "required_documents": ["Architectural plans", "Static calculations"],
                    "stakeholders": ["Architect", "Building Authority"]
                },
                {
                    "id": 4,
                    "title": "Contractor Selection",
                    "icon": "Users",
                    "duration": "2-4 weeks",
                    "cost": "Variable",
                    "status": "pending",
                    "color": "purple",
                    "tasks": [
                        {
                            "task_name": "Request quotes from contractors",
                            "estimated_time": "1 week",
                            "estimated_cost": "€0",
                            "required_by": "Homeowner"
                        }
                    ],
                    "required_documents": ["Contractor quotes"],
                    "stakeholders": ["Contractors"]
                },
                {
                    "id": 5,
                    "title": "Implementation",
                    "icon": "Wrench",
                    "duration": "8-12 weeks",
                    "cost": f"€{budget * 0.75:,.0f} - €{budget * 0.85:,.0f}",
                    "status": "pending",
                    "color": "rose",
                    "tasks": [
                        {
                            "task_name": "Execute renovation work",
                            "estimated_time": "8-12 weeks",
                            "estimated_cost": f"€{budget * 0.75:,.0f}",
                            "required_by": "Contractors"
                        }
                    ],
                    "required_documents": ["Construction permits"],
                    "stakeholders": ["All Contractors"]
                },
                {
                    "id": 6,
                    "title": "Final Inspection",
                    "icon": "CheckCircle2",
                    "duration": "1 week",
                    "cost": f"€{budget * 0.01:,.0f} - €{budget * 0.02:,.0f}",
                    "status": "pending",
                    "color": "gray",
                    "tasks": [
                        {
                            "task_name": "Final building inspection",
                            "estimated_time": "1 day",
                            "estimated_cost": "€300 - €600",
                            "required_by": "Building Inspector"
                        }
                    ],
                    "required_documents": ["Completion reports"],
                    "stakeholders": ["Building Inspector"]
                }
            ],
            "gantt_chart": [
                {"id": 1, "name": "Site Inspection", "start": 5, "duration": 10, "color": "bg-emerald-500"},
                {"id": 2, "name": "Energy Audit", "start": 15, "duration": 7, "color": "bg-blue-500"},
                {"id": 3, "name": "Permit Preparation", "start": 22, "duration": 14, "color": "bg-amber-500"},
                {"id": 4, "name": "Contractor Selection", "start": 36, "duration": 21, "color": "bg-purple-500"},
                {"id": 5, "name": "Implementation", "start": 57, "duration": 56, "color": "bg-rose-500"},
                {"id": 6, "name": "Final Inspection", "start": 113, "duration": 7, "color": "bg-gray-500"}
            ],
            "permits": [
                {
                    "id": "geg",
                    "name": "GEG Energy Compliance",
                    "description": "Compliance with the German Building Energy Act (GEG) for energy-efficient renovations.",
                    "checked": True
                },
                {
                    "id": "baug",
                    "name": "Baugenehmigung",
                    "description": "Building permit required for structural changes and major renovations.",
                    "checked": False
                },
                {
                    "id": "architect",
                    "name": "Architect Approval",
                    "description": "Professional architect review and approval for design and structural plans.",
                    "checked": False
                },
                {
                    "id": "energy-cert",
                    "name": "Energy Certificate",
                    "description": "Updated energy performance certificate post-renovation.",
                    "checked": False
                },
                {
                    "id": "heritage",
                    "name": "Heritage Protection Check",
                    "description": "Required if the building is listed or in a protected area.",
                    "checked": heritage_protection == "yes"
                }
            ],
            "budget_breakdown": {
                "total_estimated_cost": {
                    "min": budget * 0.9,
                    "max": budget * 1.15
                },
                "user_budget": budget,
                "financing_readiness": "Good Match",
                "cost_categories": [
                    {
                        "category": "Planning & Permits",
                        "estimated_cost": f"€{budget * 0.10:,.0f}",
                        "percentage_of_total": "10%",
                        "items": ["Architect fees", "Permits"]
                    }
                ],
                "contingency_fund": f"€{budget * 0.12:,.0f}"
            },
            "kfw_funding_eligibility": {
                "eligible_programs": [
                    {
                        "program_name": "KfW Efficient House 261",
                        "program_number": "261",
                        "type": "Loan with Grant",
                        "max_amount": "€150,000",
                        "requirements": ["Energy efficiency standard"],
                        "energy_standard_required": "EH 55"
                    }
                ],
                "estimated_total_funding": f"€{budget * 0.25:,.0f}",
                "application_deadline": "Before construction",
                "next_steps": ["Contact KfW consultant"]
            },
            "stakeholders": [
                {
                    "name": "Energy Consultant",
                    "role": "Energy assessment",
                    "when_needed": "Phase 2",
                    "estimated_cost": "€800 - €1,500",
                    "how_to_find": "Energie-Effizienz-Experten.de"
                }
            ],
            "risks_and_mitigation": [
                {
                    "risk": "Permit delays",
                    "likelihood": "Medium",
                    "impact": "High",
                    "mitigation": "Submit early"
                }
            ],
            "next_steps": [
                "Contact energy consultants",
                "Request building plans",
                "Research KfW programs"
            ],
            "ai_suggestions": [
                f"Prioritize energy efficiency for {building_type}",
                "Start permits in winter for spring construction",
                "Maximize KfW funding opportunities"
            ]
        }
        
        return {
            'success': True,
            'plan': mock_plan,
            'building_type': building_type,
            'budget': budget,
            'location': location,
            'error': None,
            'generated_at': datetime.now().isoformat()
        }


try:
    from groq import Groq
    
    class GroqService:
        """Service for interacting with Groq AI"""
        
        def __init__(self):
            """Initialize the Groq service with API key"""
            api_key = os.getenv('GROQ_API_KEY')
            
            if not api_key:
                raise ValueError("GROQ_API_KEY environment variable is not set")
            
            self.client = Groq(api_key=api_key)
        
        def generate_renovation_plan(
            self,
            building_type: str,
            budget: float,
            location: str,
            building_size: int,
            renovation_goals: list,
            building_age: str,
            target_start_date: str,
            financing_preference: str,
            incentive_intent: str,
            living_during_renovation: str,
            heritage_protection: str,
            **kwargs
        ) -> dict:
            """Generate a comprehensive renovation plan using Groq AI"""
            
            try:
                # Use the same prompt builder as GeminiService
                gemini_service = GeminiService.__new__(GeminiService)
                prompt = gemini_service._build_renovation_prompt(
                    building_type=building_type,
                    budget=budget,
                    location=location,
                    building_size=building_size,
                    renovation_goals=renovation_goals,
                    building_age=building_age,
                    target_start_date=target_start_date,
                    financing_preference=financing_preference,
                    incentive_intent=incentive_intent,
                    living_during_renovation=living_during_renovation,
                    heritage_protection=heritage_protection,
                    **kwargs
                )
                
                # Call Groq API
                chat_completion = self.client.chat.completions.create(
                    messages=[{"role": "user", "content": prompt}],
                    model="llama3-70b-8192",
                    temperature=0.7,
                    max_tokens=8000,
                )
                
                response_text = chat_completion.choices[0].message.content
                plan_data = gemini_service._parse_gemini_response(response_text)
                
                return {
                    'success': True,
                    'plan': plan_data,
                    'building_type': building_type,
                    'budget': budget,
                    'location': location,
                    'error': None,
                    'generated_at': datetime.now().isoformat()
                }
                
            except Exception as e:
                return {
                    'success': False,
                    'plan': None,
                    'building_type': building_type,
                    'budget': budget,
                    'location': location,
                    'error': str(e),
                    'generated_at': datetime.now().isoformat()
                }
                
except ImportError:
    class GroqService:
        def __init__(self):
            raise ValueError("Groq SDK not installed. Install with: pip install groq")