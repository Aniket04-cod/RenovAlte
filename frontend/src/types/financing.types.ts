/**
 * Type definitions for the Financing module
 * Provides type safety across the application
 */

// ============================================================================
// Form Data Types
// ============================================================================

export interface FormData {
  // Basic Project Info
  renovationType: string;

  // STEP 0: Quality Preference (NEW)
  qualityPreference?: string;

  // STEP 1: Area Selection
  bathroomRenovationAreas?: string[]; // Array of selected renovation areas

  // SECTION 1: Renovation Goal (Always shown) - Enhanced
  renovationGoal?: string[];
  renovationGoal_other?: string; // "Other" field for renovation goal
  bathroomSize?: number; // NEW: Bathroom size in m²

  // SECTION 2: Common Fields (Always shown) - Enhanced
  bathroomType?: string;
  bathroomType_other?: string; // "Other" field
  designStyle?: string;
  designStyle_other?: string; // "Other" field
  colorSchemeMain?: string;
  colorSchemeAccent?: string;
  metalFinish?: string;
  metalFinish_other?: string; // "Other" field

  // SECTION 3: Shower Area (Conditional) - Enhanced
  showerType?: string;
  showerType_other?: string; // "Other" field
  showerFixtureQuality?: string; // NEW: Quality level for shower fixtures
  showerBrand?: string; // German market brand (legacy)
  showerBrand_other?: string; // "Other" field
  showerEnclosureGlass?: string;
  showerEnclosureThickness?: number;
  showerEnclosureFrame?: string;
  showerFixtures?: string[];
  drainType?: string;

  // SECTION 4: Bathtub (Conditional) - Enhanced
  bathtubWanted?: string;
  bathtubType?: string;
  bathtubType_other?: string; // "Other" field
  bathtubMaterialQuality?: string; // NEW: Quality level for bathtub material
  bathtubMaterial?: string; // Legacy field
  bathtubMaterial_other?: string; // "Other" field
  bathtubBrand?: string; // German market brand (legacy)
  bathtubBrand_other?: string; // "Other" field
  bathtubSize?: string;

  // SECTION 5: Toilet Area (Conditional) - Enhanced
  toiletType?: string;
  toiletType_other?: string; // "Other" field
  toiletQuality?: string; // NEW: Quality level for toilet
  toiletBrand?: string; // German market brand (legacy)
  toiletBrand_other?: string; // "Other" field
  flushSystem?: string;
  flushSystem_other?: string; // "Other" field (changed from array to string)

  // SECTION 6: Washbasin Area (Conditional) - Enhanced
  basinCount?: string;
  basinType?: string;
  basinType_other?: string; // "Other" field
  basinQuality?: string; // NEW: Quality level for basin
  basinBrand?: string; // German market brand (legacy)
  basinBrand_other?: string; // "Other" field
  faucetQuality?: string; // NEW: Quality level for faucet
  countertopMaterialQuality?: string; // NEW: Quality level for countertop
  countertopMaterial?: string; // Legacy field
  countertopMaterial_other?: string; // "Other" field
  faucetBrand?: string; // German market brand (legacy)
  faucetBrand_other?: string; // "Other" field

  // SECTION 7: Tiles & Surfaces (Conditional)
  floorTileQuality?: string; // NEW: Quality level for floor tiles
  floorTileType?: string; // Legacy field
  floorTileSize?: string;
  wallTilesQuality?: string; // NEW: Quality level for wall tiles
  wallTilesHeight?: string;
  wallTilesMaterial?: string; // Legacy field
  accentWall?: string;
  groutQuality?: string; // NEW: Quality level for grout
  groutType?: string; // Legacy field
  groutColor?: string;

  // SECTION 8: Electrical & Lighting (Conditional)
  ceilingLights?: string[];
  lightingQuality?: string; // NEW: Quality level for lighting fixtures
  mirrorLights?: string[];
  mirrorQuality?: string; // NEW: Quality level for mirror
  smartFeatures?: string[];

  // SECTION 9: Plumbing (Conditional)
  plumbingIssues?: string[];
  replacePipes?: string;
  hotWaterSystem?: string;
  pipeMaterial?: string;

  // SECTION 10: Water Pressure (Conditional)
  currentWaterPressure?: string;
  lowPressureLocation?: string[];
  waterSupplyType?: string;
  wantStrongerPressure?: string;
  boosterPumpOk?: string;

  // SECTION 11: Heating (NEW - Conditional)
  heatingType?: string[];
  heatingType_other?: string; // "Other" field
  heatedTowelRailQuality?: string; // NEW: Quality level for heated towel rail
  heatedTowelRailBrand?: string; // Legacy field
  heatedTowelRailBrand_other?: string; // "Other" field

  // SECTION 12: Ventilation (NEW - Conditional)
  ventilationType?: string;
  ventilationType_other?: string; // "Other" field
  ventilationCapacity?: string;
  ventilationCapacity_other?: string; // "Other" field

  // SECTION 13: Accessories (Conditional)
  accessoriesWanted?: string[];

  // SECTION 14: Waterproofing (Conditional)
  waterproofingRequired?: string;
  waterproofingIssues?: string[];
  waterproofingPreference?: string;

  // Future renovation types will add their fields here
}

// ============================================================================
// Financing Option Types
// ============================================================================

export type FinancingType = 'loan' | 'subsidy' | 'grant';

export interface FinancingOption {
  id: string;
  name: string;
  type: FinancingType;
  provider: string;
  description: string;
  eligibility: string[];
  interestRate?: string;
  maxAmount?: string;
  renovationTypes: string[];
  incomeRequirement?: string;
  link: string;
  advantages: string[];
}

// ============================================================================
// Cost Estimation Types
// ============================================================================

export interface CostBreakdownItem {
  category: string;
  cost: number;
  description: string;
}

export interface CostEstimate {
  totalEstimatedCost: number;
  breakdown: CostBreakdownItem[];
  contingency: number;
  explanation: string;
}

// Extended cost estimate with internal fields from backend
export interface CostEstimateResponse extends CostEstimate {
  _originalPrompt?: string;  // Internal field: original prompt sent to Gemini
  _formData?: any;            // Internal field: original form data
}

// ============================================================================
// AI Recommendation Types
// ============================================================================

export interface FinancingRecommendation {
  name: string;
  type: FinancingType;
  priority: number;
  maxAmount: string;
  interestRate: string;
  eligibility: string;
  pros: string[];
  cons: string[];
  applicationSteps: string[];
  matchScore: number;
  applicationUrl?: string; // Direct link to apply for this financing option
}

export interface RAGAnalysisResult {
  costEstimate: CostEstimate;
  recommendations: FinancingRecommendation[];
  summary: string;
  nextSteps: string[];
}

// ============================================================================
// AI Service Types
// ============================================================================

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

// ============================================================================
// Form Option Types
// ============================================================================

export interface SelectOption {
  value: string;
  label: string;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface CostCalculatorProps {
  totalEstimatedCost: number;
  breakdown: CostBreakdownItem[];
  contingency: number;
  explanation: string;
  userBudget: number;
}

export interface FinancingRecommendationsProps {
  recommendations: FinancingRecommendation[];
  summary: string;
  nextSteps: string[];
}

export interface DocumentChecklistProps {
  renovationType: string;
  ownership?: string; // Optional for backward compatibility
  energyEfficiency?: string; // Optional for backward compatibility
  estimatedBudget?: string; // Optional for backward compatibility
}

export interface FinancingAssistantProps {
  // Currently no props, but keeping for future extension
}
