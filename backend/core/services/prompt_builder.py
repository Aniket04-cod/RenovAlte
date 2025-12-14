"""
Prompt Builder Service
Constructs detailed prompts for Gemini API based on user's financing form data
"""


class PromptBuilder:
	"""
	Builds structured prompts for Gemini AI based on user's renovation form data
	"""

	def build_cost_estimation_prompt(self, form_data):
		"""
		Build a detailed prompt for cost estimation

		Args:
			form_data (dict): User's form responses including:
				- renovationType: string
				- bathroomSize: string (optional)
				- bathroomElements: list (optional)
				- bathroomAccessibility: string (optional)
				- bathroomPlumbing: string (optional)
				- bathroomCondition: string (optional)

		Returns:
			str: Formatted prompt for Gemini API
		"""
		renovation_type = form_data.get('renovationType', 'general')

		# Base prompt structure
		prompt = f"""As a German renovation cost expert, analyze this project and provide a DETAILED cost estimate in JSON format.

PROJECT DATA:
- Renovation Type: {renovation_type}
- Property: Standard German residential property
- Location: Germany
"""

		# Add renovation-specific details based on type
		if renovation_type == 'bathroom':
			prompt += self._add_bathroom_details(form_data)
		elif renovation_type == 'kitchen':
			prompt += self._add_kitchen_details(form_data)
		elif renovation_type == 'electrical':
			prompt += self._add_electrical_details(form_data)
		# Add more renovation types as needed

		# Add JSON format requirements with specific German bathroom cost guidance
		prompt += """
GERMAN BATHROOM RENOVATION COST GUIDELINES (2025):

LABOR COSTS (Handwerker - German Market Rates):
- Demolition (Abbruch): 20-40 EUR per m² (older buildings cost more due to disposal requirements)
- Plumbing (Sanitär): 60-90 EUR per hour (full day: 500-700 EUR)
- Electrical (Elektrik): 50-80 EUR per hour (full day: 400-600 EUR)
- Waterproofing (Abdichtung): 40-60 EUR per m²
- Tiling (Fliesenleger):
  * Basic ceramic tiles: 30-50 EUR per m² (labor only)
  * Large format porcelain: 60-80 EUR per m² (labor only)
  * Natural stone/premium: 80-120 EUR per m² (labor only)

MATERIAL COSTS BY QUALITY LEVEL (German Market 2025):

BUDGET-FRIENDLY Materials:
- Tiles: 15-30 EUR per m² (basic ceramic from Baumarkt)
- Toilet: 150-300 EUR (standard brands like Keramag, basic models)
- Washbasin: 80-150 EUR (standard ceramic)
- Shower faucet: 80-150 EUR (basic chrome mixer)
- Basin faucet: 50-120 EUR (basic chrome)
- Bathtub (acrylic): 300-600 EUR (standard acrylic, 170cm)
- Vanity unit: 200-400 EUR (basic laminate)
- Mirror: 50-100 EUR (standard glass)
- Lighting: 30-80 EUR per fixture (basic LED)

STANDARD QUALITY - German Brands:
- Tiles: 35-60 EUR per m² (quality porcelain, German brands)
- Toilet: 300-600 EUR (Villeroy & Boch, Duravit standard lines)
- Washbasin: 150-350 EUR (Villeroy & Boch, Duravit)
- Shower faucet: 200-500 EUR (Grohe - most popular in Germany)
- Basin faucet: 150-400 EUR (Grohe)
- Bathtub (steel enamel): 600-1200 EUR (Bette/Kaldewei - German specialty)
- Countertop (quartz): 200-400 EUR per linear meter
- Vanity unit: 400-900 EUR (quality wood/lacquer)
- Mirror (LED-backlit): 200-450 EUR (with integrated lighting)
- Lighting: 80-200 EUR per fixture (branded LED, good CRI)
- Heated towel radiator: 300-700 EUR (Kermi, German brand)

PREMIUM QUALITY - Designer/High-End:
- Tiles: 70-150 EUR per m² (large format porcelain, premium finishes)
- Toilet: 600-1500 EUR (Duravit designer series, advanced features)
- Washbasin: 350-900 EUR (Duravit designer models, unique shapes)
- Shower faucet: 500-1200 EUR (Hansgrohe - premium line)
- Basin faucet: 400-1000 EUR (Hansgrohe)
- Bathtub (cast iron): 1200-2500 EUR (exceptional quality, long-lasting)
- Countertop (granite/marble): 400-800 EUR per linear meter
- Vanity unit: 900-2000 EUR (high-end wood, custom design)
- Mirror (smart): 450-900 EUR (touchscreen, Bluetooth, defogging)
- Lighting: 200-500 EUR per fixture (designer LED, smart control)
- Heated towel radiator: 700-1500 EUR (Zehnder - Swiss-German premium)
- Underfloor heating: 60-100 EUR per m² (electric), 80-120 EUR per m² (water-based)

LUXURY Materials:
- Tiles: 150-400+ EUR per m² (natural stone - marble, slate, travertine)
- Toilet: 1500-5000+ EUR (smart toilets with full bidet, Japanese tech)
- Shower faucet: 1200-3000+ EUR (Dornbracht - architectural quality)
- Basin faucet: 1000-2500+ EUR (Dornbracht - ultra-premium)
- Bathtub (stone resin): 2500-6000+ EUR (luxury freestanding, designer brands)
- Countertop (marble): 800-1500+ EUR per linear meter (Carrara, Calacatta)
- Vanity unit: 2000-5000+ EUR (bespoke cabinetry, exotic wood)
- Heated towel radiator: 1500-3500+ EUR (Vasco - designer statement pieces)

CRITICAL RULES:
1. Respond ONLY with valid JSON (no markdown, no code blocks, no extra text)
2. Do NOT use apostrophes or quotes inside description text
3. Use simple words without special characters
4. ANALYZE THE USER'S SPECIFIC CHOICES - Standard vs Medium vs High-End quality affects costs significantly
5. Consider bathroom size (m²) - larger bathrooms cost more
6. Consider building age - older buildings need more pipe/electrical work
7. Consider complexity - walk-in showers, underfloor heating, shower toilets add significant costs

COST BREAKDOWN CATEGORIES (use these):
1. "Demolition and Disposal" - Removing old bathroom, waste disposal
2. "Plumbing Work" - All pipe work, fixtures installation
3. "Electrical Work" - Lighting, ventilation, shower toilet electrical (if applicable)
4. "Waterproofing and Tiling" - Wall and floor prep, tiling labor and materials
5. "Fixtures and Fittings" - Shower/tub, toilet, sink, vanity, faucets, mirror
6. "Heating and Ventilation" - Radiator/underfloor heating, ventilation system
7. "Contingency Reserve" - 15% buffer for unexpected costs

EXACT format:
{
  "totalEstimatedCost": 45000,
  "breakdown": [
    {"category": "Demolition and Disposal", "cost": 2500, "description": "Remove old fixtures and tiles, waste disposal"},
    {"category": "Plumbing Work", "cost": 8000, "description": "Pipe relocation and fixture installation"},
    {"category": "Electrical Work", "cost": 3000, "description": "New lighting and outlets"},
    {"category": "Waterproofing and Tiling", "cost": 12000, "description": "Full tiling with mid-range materials"},
    {"category": "Fixtures and Fittings", "cost": 10000, "description": "Mid-range shower, toilet, sink, and faucets"},
    {"category": "Heating and Ventilation", "cost": 3500, "description": "Towel radiator and ventilation"},
    {"category": "Contingency Reserve", "cost": 6000, "description": "15 percent buffer for unexpected costs"}
  ],
  "contingency": 6000,
  "explanation": "Based on the specific bathroom size, quality selections, and building age provided. Costs reflect German market prices for 2025."
}

IMPORTANT: Calculate costs based on the SPECIFIC details provided above. Different choices should result in DIFFERENT cost estimates.
"""

		return prompt

	def _add_bathroom_details(self, form_data):
		"""Add comprehensive bathroom-specific details to the prompt based on German standards and quality selections"""
		details = "\nBATHROOM RENOVATION DETAILS (German Market - Quality-Based Analysis):\n"

		# STEP 1: Selected Renovation Areas
		renovation_areas = form_data.get('bathroomRenovationAreas', [])
		if renovation_areas:
			details += "\nSELECTED RENOVATION AREAS:\n"
			area_labels = {
				'shower_area': 'Shower Area',
				'bathtub': 'Bathtub',
				'toilet_area': 'Toilet/WC Area',
				'washbasin_area': 'Washbasin/Sink Area',
				'tiles_surfaces': 'Tiles & Surfaces',
				'electrical_lighting': 'Electrical & Lighting',
				'plumbing': 'Plumbing',
				'water_pressure': 'Water Pressure',
				'heating': 'Heating',
				'ventilation': 'Ventilation',
				'accessories': 'Accessories',
				'waterproofing': 'Waterproofing'
			}
			for area in renovation_areas:
				label = area_labels.get(area, area)
				details += f"- {label}\n"

		# RENOVATION GOALS & SCOPE
		renovation_goal = form_data.get('renovationGoal', [])
		if renovation_goal:
			details += "\nRENOVATION SCOPE:\n"
			for goal in renovation_goal:
				details += f"- {goal.replace('_', ' ').title()}\n"

		# BATHROOM CHARACTERISTICS
		details += "\nBATHROOM CHARACTERISTICS:\n"

		bathroom_type = form_data.get('bathroomType')
		if bathroom_type:
			details += f"- Type: {bathroom_type.replace('_', ' ').title()}\n"

		design_style = form_data.get('designStyle')
		if design_style:
			details += f"- Design Style: {design_style.title()}\n"

		metal_finish = form_data.get('metalFinish')
		if metal_finish:
			details += f"- Metal Finish: {metal_finish.title()}\n"

		color_main = form_data.get('colorSchemeMain')
		color_accent = form_data.get('colorSchemeAccent')
		if color_main or color_accent:
			details += f"- Color Scheme: Main={color_main or 'N/A'}, Accent={color_accent or 'N/A'}\n"

		# SHOWER AREA DETAILS (if selected)
		if 'shower_area' in renovation_areas:
			details += "\nSHOWER AREA - QUALITY & SPECIFICATIONS:\n"

			shower_type = form_data.get('showerType')
			if shower_type:
				shower_labels = {
					'walk_in': 'Walk-in shower (barrier-free, modern)',
					'enclosure': 'Shower enclosure (glass-enclosed)',
					'bath_shower': 'Bath + shower combo',
					'wet_room': 'Wet room (fully waterproofed)'
				}
				details += f"- Type: {shower_labels.get(shower_type, shower_type)}\n"

			# CRITICAL: Shower fixture quality selection
			shower_quality = form_data.get('showerFixtureQuality')
			if shower_quality:
				quality_map = {
					'budget': 'Budget-Friendly (basic functionality, standard features)',
					'standard': 'Standard Quality (German brands like Grohe, good durability, excellent value)',
					'premium': 'Premium Quality (Hansgrohe, Dornbracht - exceptional durability, innovative features)'
				}
				details += f"- Fixture Quality Level: {quality_map.get(shower_quality, shower_quality)}\n"
				details += f"  **This affects fixture costs significantly**\n"

			shower_fixtures = form_data.get('showerFixtures', [])
			if shower_fixtures:
				details += f"- Features: {', '.join(shower_fixtures)}\n"

			glass_type = form_data.get('showerEnclosureGlass')
			if glass_type:
				details += f"- Glass: {glass_type.title()}\n"

			glass_thickness = form_data.get('showerEnclosureThickness')
			if glass_thickness:
				details += f"- Glass Thickness: {glass_thickness}mm\n"

			frame_type = form_data.get('showerEnclosureFrame')
			if frame_type:
				details += f"- Frame: {frame_type.title()}\n"

			drain_type = form_data.get('drainType')
			if drain_type:
				details += f"- Drain Type: {drain_type.title()}\n"

		# BATHTUB DETAILS (if selected)
		if 'bathtub' in renovation_areas:
			details += "\nBATHTUB - QUALITY & SPECIFICATIONS:\n"

			bathtub_wanted = form_data.get('bathtubWanted')
			if bathtub_wanted == 'yes':
				bathtub_type = form_data.get('bathtubType')
				if bathtub_type:
					tub_labels = {
						'freestanding': 'Freestanding (standalone, luxurious)',
						'built_in': 'Built-in (alcove/drop-in, space-efficient)',
						'jacuzzi': 'Jacuzzi/Whirlpool (massage jets, spa experience)',
						'soaking': 'Deep soaking (extra deep, relaxation)'
					}
					details += f"- Type: {tub_labels.get(bathtub_type, bathtub_type)}\n"

				# CRITICAL: Bathtub material quality selection
				bathtub_quality = form_data.get('bathtubMaterialQuality')
				if bathtub_quality:
					quality_map = {
						'acrylic_budget': 'Acrylic - Budget (lightweight, affordable, standard insulation)',
						'acrylic_premium': 'Acrylic - Premium (thicker, reinforced, German brands like Bette/Kaldewei)',
						'steel_enamel': 'Steel Enamel - Standard (German specialty, Bette/Kaldewei titanium steel, 30-year warranty)',
						'cast_iron': 'Cast Iron - Premium (heavy-duty, exceptional heat retention, lasts generations)',
						'stone_resin': 'Stone Resin - Luxury (high-end composite, warm touch, contemporary luxury)'
					}
					details += f"- Material & Quality: {quality_map.get(bathtub_quality, bathtub_quality)}\n"
					details += f"  **Material choice significantly affects cost**\n"

				bathtub_size = form_data.get('bathtubSize')
				if bathtub_size:
					details += f"- Size: {bathtub_size}\n"
			else:
				details += "- No bathtub wanted\n"

		# TOILET AREA DETAILS (if selected)
		if 'toilet_area' in renovation_areas:
			details += "\nTOILET/WC - QUALITY & SPECIFICATIONS:\n"

			toilet_type = form_data.get('toiletType')
			if toilet_type:
				toilet_labels = {
					'floor_mounted': 'Floor-mounted (traditional, easier installation)',
					'wall_mounted': 'Wall-mounted/Wall-hung (modern, space-saving, easy floor cleaning)',
					'smart': 'Smart toilet (bidet, heated seat, advanced features)'
				}
				details += f"- Type: {toilet_labels.get(toilet_type, toilet_type)}\n"

			# CRITICAL: Toilet quality selection
			toilet_quality = form_data.get('toiletQuality')
			if toilet_quality:
				quality_map = {
					'budget': 'Budget-Friendly (standard brands, basic features, reliable)',
					'standard': 'Standard Quality - German Brands (Villeroy & Boch, Duravit - excellent ceramics)',
					'premium': 'Premium Quality - Designer Lines (Duravit designer series, advanced rim tech, superior hygiene)',
					'luxury_smart': 'Luxury - Smart Toilets (heated seat, auto lid, integrated bidet, air dryer, deodorizer)'
				}
				details += f"- Quality Level: {quality_map.get(toilet_quality, toilet_quality)}\n"
				details += f"  **Quality level affects ceramic quality and features**\n"

			flush_system = form_data.get('flushSystem')
			if flush_system:
				details += f"- Flush System: {flush_system.replace('_', ' ').title()}\n"

		# WASHBASIN AREA DETAILS (if selected)
		if 'washbasin_area' in renovation_areas:
			details += "\nWASHBASIN/SINK AREA - QUALITY & SPECIFICATIONS:\n"

			basin_count = form_data.get('basinCount')
			if basin_count:
				details += f"- Basin Count: {basin_count.title()}\n"

			basin_type = form_data.get('basinType')
			if basin_type:
				basin_labels = {
					'countertop': 'Countertop vessel (bowl on counter, modern design)',
					'undermount': 'Undermount (integrated under counter, clean minimalist)',
					'wall_mounted': 'Wall-mounted (floating sink, space-saving)',
					'integrated': 'Integrated sink-countertop (seamless one-piece, easy clean)'
				}
				details += f"- Type: {basin_labels.get(basin_type, basin_type)}\n"

			# CRITICAL: Basin quality selection
			basin_quality = form_data.get('basinQuality')
			if basin_quality:
				quality_map = {
					'budget': 'Budget-Friendly (standard ceramic/porcelain, functional)',
					'standard': 'Standard Quality - German Brands (Villeroy & Boch, Duravit - high-quality ceramics)',
					'premium': 'Premium Quality - Designer Basins (Duravit designer series, unique shapes, architectural quality)'
				}
				details += f"- Basin Quality: {quality_map.get(basin_quality, basin_quality)}\n"

			# CRITICAL: Faucet quality selection
			faucet_quality = form_data.get('faucetQuality')
			if faucet_quality:
				quality_map = {
					'budget': 'Budget-Friendly (standard faucets, basic chrome, basic features)',
					'standard_grohe': 'Standard Quality - Grohe (German brand, wide design range, reliable, excellent value)',
					'premium_hansgrohe': 'Premium Quality - Hansgrohe (exceptional durability, water-saving tech, elegant design)',
					'luxury_dornbracht': 'Luxury - Dornbracht (ultra-premium, architectural design, precision engineering)'
				}
				details += f"- Faucet Quality: {quality_map.get(faucet_quality, faucet_quality)}\n"
				details += f"  **Faucet brand significantly affects price (Budget: €50-150, Grohe: €150-400, Hansgrohe: €300-800, Dornbracht: €800-2000+)**\n"

			# CRITICAL: Countertop material quality
			countertop_quality = form_data.get('countertopMaterialQuality')
			if countertop_quality:
				quality_map = {
					'laminate': 'Laminate - Budget (affordable, variety of patterns, water-resistant with sealing)',
					'solid_surface': 'Solid Surface/Corian - Standard (non-porous, seamless, repairable)',
					'quartz': 'Quartz - Premium (engineered stone, non-porous, highly durable, low maintenance)',
					'granite': 'Granite - Premium (natural stone, heat/scratch resistant, periodic sealing needed)',
					'marble': 'Marble - Luxury (natural marble, unique veining, requires maintenance, premium aesthetic)'
				}
				details += f"- Countertop Material: {quality_map.get(countertop_quality, countertop_quality)}\n"
				details += f"  **Countertop material greatly affects cost**\n"

		# TILES & SURFACES DETAILS (if selected)
		if 'tiles_surfaces' in renovation_areas:
			details += "\nTILES & SURFACES - QUALITY & SPECIFICATIONS:\n"

			# CRITICAL: Floor tile quality
			floor_tile_quality = form_data.get('floorTileQuality')
			if floor_tile_quality:
				quality_map = {
					'ceramic_budget': 'Ceramic - Budget (standard ceramic, versatile, cost-effective)',
					'ceramic_standard': 'Ceramic - Standard (enhanced ceramic, better water resistance, durable)',
					'porcelain_standard': 'Porcelain - Standard (45% market share in Germany, frost resistant, low water absorption)',
					'porcelain_premium': 'Porcelain - Premium (through-body color, large formats, premium finishes, natural stone effects)',
					'natural_stone': 'Natural Stone - Luxury (marble/slate/travertine, unique appearance, requires sealing)'
				}
				details += f"- Floor Tile Quality: {quality_map.get(floor_tile_quality, floor_tile_quality)}\n"
				details += f"  **Tile quality affects material cost per m²**\n"

			floor_tile_size = form_data.get('floorTileSize')
			if floor_tile_size:
				details += f"- Floor Tile Size: {floor_tile_size} mm\n"

			# CRITICAL: Wall tile quality
			wall_tile_quality = form_data.get('wallTilesQuality')
			if wall_tile_quality:
				quality_map = {
					'ceramic_budget': 'Ceramic - Budget (basic ceramic, variety of colors)',
					'ceramic_premium': 'Ceramic - Premium (textured/glossy finishes, better quality)',
					'porcelain': 'Porcelain (superior moisture resistance, excellent for wet areas)',
					'glass_mosaic': 'Glass Mosaic - Premium (elegant, reflective, accent walls)',
					'marble_luxury': 'Marble/Natural Stone - Luxury (unique veining, requires sealing)'
				}
				details += f"- Wall Tile Quality: {quality_map.get(wall_tile_quality, wall_tile_quality)}\n"

			wall_tiles_height = form_data.get('wallTilesHeight')
			if wall_tiles_height:
				height_labels = {
					'full': 'Full height (floor to ceiling - complete coverage, best moisture protection)',
					'half': 'Half height (~1.2m - partial coverage, paint above)',
					'shower_only': 'Shower area only (tile wet areas, paint elsewhere)'
				}
				details += f"- Wall Tiling Coverage: {height_labels.get(wall_tiles_height, wall_tiles_height)}\n"
				details += f"  **Tiling height significantly affects total tile area and cost**\n"

			accent_wall = form_data.get('accentWall')
			if accent_wall:
				details += f"- Accent/Feature Wall: {accent_wall}\n"

			# Grout quality
			grout_quality = form_data.get('groutQuality')
			if grout_quality:
				quality_map = {
					'cement_budget': 'Cement-based - Budget (traditional, requires sealing)',
					'cement_premium': 'Premium cement with polymers (better flexibility, stain resistance)',
					'epoxy': 'Epoxy - Premium (waterproof, no sealing needed, superior for wet areas)'
				}
				details += f"- Grout Quality: {quality_map.get(grout_quality, grout_quality)}\n"

			grout_color = form_data.get('groutColor')
			if grout_color:
				details += f"- Grout Color: {grout_color.title()}\n"

		# ELECTRICAL & LIGHTING DETAILS (if selected)
		if 'electrical_lighting' in renovation_areas:
			details += "\nELECTRICAL & LIGHTING - QUALITY & SPECIFICATIONS:\n"

			ceiling_lights = form_data.get('ceilingLights', [])
			if ceiling_lights:
				details += f"- Ceiling Lights: {', '.join([light.replace('_', ' ').title() for light in ceiling_lights])}\n"

			# CRITICAL: Lighting quality
			lighting_quality = form_data.get('lightingQuality')
			if lighting_quality:
				quality_map = {
					'budget': 'Budget-Friendly (standard LED, functional, IP44 rated)',
					'standard': 'Standard Quality (branded LED, better light quality CRI 80+, dimmable, IP65 rated)',
					'premium': 'Premium Quality (designer LED, CRI 90+, smart control, architectural quality)'
				}
				details += f"- Lighting Fixture Quality: {quality_map.get(lighting_quality, lighting_quality)}\n"

			mirror_lights = form_data.get('mirrorLights', [])
			if mirror_lights:
				details += f"- Mirror Lights: {', '.join(mirror_lights)}\n"

			# Mirror quality
			mirror_quality = form_data.get('mirrorQuality')
			if mirror_quality:
				quality_map = {
					'budget': 'Standard Mirror (basic glass, optional fog-resistant coating)',
					'standard': 'LED-Backlit Mirror (built-in lighting, anti-fog heating)',
					'premium': 'Smart Mirror (touchscreen, Bluetooth speakers, defogging, luxury)'
				}
				details += f"- Mirror Quality: {quality_map.get(mirror_quality, mirror_quality)}\n"

			smart_features = form_data.get('smartFeatures', [])
			if smart_features:
				details += f"- Smart Features: {', '.join(smart_features)}\n"

		# PLUMBING DETAILS (if selected)
		if 'plumbing' in renovation_areas:
			details += "\nPLUMBING WORK:\n"

			plumbing_issues = form_data.get('plumbingIssues', [])
			if plumbing_issues:
				details += f"- Existing Issues: {', '.join(plumbing_issues)}\n"

			replace_pipes = form_data.get('replacePipes')
			if replace_pipes:
				details += f"- Replace Pipes: {replace_pipes.title()}\n"

			hot_water = form_data.get('hotWaterSystem')
			if hot_water:
				details += f"- Hot Water System: {hot_water}\n"

			pipe_material = form_data.get('pipeMaterial')
			if pipe_material:
				details += f"- Pipe Material Preference: {pipe_material.upper()}\n"

		# WATER PRESSURE DETAILS (if selected)
		if 'water_pressure' in renovation_areas:
			details += "\nWATER PRESSURE IMPROVEMENTS:\n"

			current_pressure = form_data.get('currentWaterPressure')
			if current_pressure:
				details += f"- Current Pressure: {current_pressure.title()}\n"

			low_pressure_location = form_data.get('lowPressureLocation', [])
			if low_pressure_location:
				details += f"- Low Pressure Locations: {', '.join(low_pressure_location)}\n"

			water_supply_type = form_data.get('waterSupplyType')
			if water_supply_type:
				details += f"- Water Supply Type: {water_supply_type.replace('_', ' ').title()}\n"

			want_stronger = form_data.get('wantStrongerPressure')
			if want_stronger:
				details += f"- Want Stronger Pressure: {want_stronger.title()}\n"

			booster_pump = form_data.get('boosterPumpOk')
			if booster_pump:
				details += f"- Booster Pump Acceptable: {booster_pump.title()}\n"

		# HEATING DETAILS (if selected)
		if 'heating' in renovation_areas:
			details += "\nHEATING SYSTEM:\n"

			heating_type = form_data.get('heatingType', [])
			if heating_type:
				heating_labels = {
					'radiator': 'Wall radiator (traditional Heizkörper)',
					'towel_radiator': 'Heated towel radiator (Handtuchheizkörper - dual function)',
					'underfloor_electric': 'Electric underfloor heating (heating mats)',
					'underfloor_water': 'Water underfloor heating (hydronic, most efficient)',
					'infrared_heater': 'Infrared panel heater (modern, efficient)'
				}
				for heating in heating_type:
					label = heating_labels.get(heating, heating)
					details += f"- {label}\n"

			# CRITICAL: Heated towel rail quality
			towel_rail_quality = form_data.get('heatedTowelRailQuality')
			if towel_rail_quality:
				quality_map = {
					'budget_standard': 'Budget - Standard brands (functional, basic models)',
					'kermi': 'Standard - Kermi (German quality, energy-efficient, good value)',
					'zehnder': 'Premium - Zehnder (Swiss-German, excellent design, superior build)',
					'vasco': 'Luxury - Vasco (designer radiators, statement pieces, premium finishes)'
				}
				details += f"- Towel Rail Quality: {quality_map.get(towel_rail_quality, towel_rail_quality)}\n"

		# VENTILATION DETAILS (if selected)
		if 'ventilation' in renovation_areas:
			details += "\nVENTILATION SYSTEM (DIN 18017 compliance):\n"

			ventilation_type = form_data.get('ventilationType')
			if ventilation_type:
				vent_labels = {
					'window_only': 'Window ventilation only (natural, no mechanical system)',
					'basic_exhaust': 'Basic exhaust fan (simple, manually controlled)',
					'humidity_sensor': 'Humidity sensor fan (auto-activates when moisture detected)',
					'timer_fan': 'Timer-controlled fan (runs after bathroom use)',
					'heat_recovery': 'Heat recovery ventilation/HRV (energy-efficient, recovers heat)'
				}
				details += f"- Type: {vent_labels.get(ventilation_type, ventilation_type)}\n"

			ventilation_capacity = form_data.get('ventilationCapacity')
			if ventilation_capacity:
				details += f"- Capacity: {ventilation_capacity}\n"

		# WATERPROOFING DETAILS (if selected)
		if 'waterproofing' in renovation_areas:
			details += "\nWATERPROOFING:\n"

			waterproofing_required = form_data.get('waterproofingRequired')
			if waterproofing_required:
				details += f"- Scope: {waterproofing_required.replace('_', ' ').title()}\n"

			waterproofing_issues = form_data.get('waterproofingIssues', [])
			if waterproofing_issues:
				details += f"- Existing Issues: {', '.join([issue.replace('_', ' ') for issue in waterproofing_issues])}\n"

			waterproofing_pref = form_data.get('waterproofingPreference')
			if waterproofing_pref:
				details += f"- Quality Preference: {waterproofing_pref.replace('_', ' ').title()}\n"

		# ACCESSORIES (if selected)
		if 'accessories' in renovation_areas:
			details += "\nACCESSORIES:\n"

			accessories = form_data.get('accessoriesWanted', [])
			if accessories:
				for accessory in accessories:
					details += f"- {accessory.replace('_', ' ').title()}\n"

		details += "\n" + "="*80 + "\n"
		details += "CRITICAL COST CALCULATION INSTRUCTIONS:\n"
		details += "="*80 + "\n"
		details += "1. ANALYZE ALL QUALITY SELECTIONS ABOVE - Budget/Standard/Premium/Luxury choices directly impact costs\n"
		details += "2. CALCULATE REALISTIC GERMAN MARKET PRICES for each quality level\n"
		details += "3. CONSIDER TOTAL AREA for tiling (floor + wall coverage affects total m²)\n"
		details += "4. FACTOR IN LABOR COSTS (German hourly rates: Plumbing 60-90 EUR/hr, Electrical 50-80 EUR/hr, Tiling 30-100 EUR/m²)\n"
		details += "5. ADD COMPLEXITY FACTORS (walk-in showers, underfloor heating, smart features increase labor and material costs)\n"
		details += "6. PROVIDE DETAILED, SPECIFIC COST BREAKDOWN for THIS EXACT PROJECT\n"
		details += "="*80 + "\n"

		return details

	def _add_kitchen_details(self, form_data):
		"""Add kitchen-specific details to the prompt"""
		# To be implemented when kitchen questions are added
		return "\nKITCHEN RENOVATION DETAILS:\n- Standard kitchen renovation\n"

	def _add_electrical_details(self, form_data):
		"""Add electrical-specific details to the prompt"""
		# To be implemented when electrical questions are added
		return "\nELECTRICAL RENOVATION DETAILS:\n- Standard electrical work\n"

	def build_financing_options_prompt(self, original_prompt, cost_estimate, form_data):
		"""
		Build financing options prompt based on original prompt and cost estimate

		Args:
			original_prompt (str): The original prompt sent for cost estimation
			cost_estimate (dict): The cost estimate response from Gemini
			form_data (dict): Original form data

		Returns:
			str: Formatted prompt for financing options generation
		"""
		total_cost = cost_estimate.get('totalEstimatedCost', 0)
		renovation_type = form_data.get('renovationType', 'general')

		prompt = f"""As a German home renovation financing expert, analyze this renovation project and provide personalized financing recommendations.

PROJECT COST ANALYSIS:
Total Estimated Cost: €{total_cost:,}

COST BREAKDOWN:
"""
		# Add breakdown details
		for item in cost_estimate.get('breakdown', []):
			prompt += f"- {item['category']}: €{item['cost']:,} ({item['description']})\n"

		prompt += f"""

ORIGINAL PROJECT DETAILS:
{original_prompt[:1500]}

===================================================================================
YOUR TASK: Generate personalized financing recommendations for this German renovation project.
===================================================================================

GERMAN FINANCING OPTIONS KNOWLEDGE BASE (2025):

1. MODERNISIERUNGSKREDIT (Modernization Loan)
   - Type: Unsecured personal loan
   - Amount: €1,000 - €80,000
   - Interest Rate: 3.5% - 8.5% (varies by creditworthiness)
   - Term: 12 - 120 months
   - Best For: Mid-sized renovations without property collateral
   - Major Providers: Deutsche Bank, Commerzbank, ING, Santander Consumer Bank
   - Requirements: Good credit score (SCHUFA), stable income
   - Advantages: Quick approval (2-7 days), no property collateral needed
   - Disadvantages: Higher interest than mortgage-based loans

2. BAUFINANZIERUNG / NACHFINANZIERUNG (Construction/Follow-up Financing)
   - Type: Mortgage-secured loan
   - Amount: €50,000 - €500,000+
   - Interest Rate: 2.5% - 4.5% (10-year fixed)
   - Term: 10 - 30 years
   - Best For: Large-scale renovations, structural work
   - Major Providers: Interhyp, Dr. Klein, local Sparkassen, Volksbanken
   - Requirements: Property ownership, property valuation, stable income
   - Advantages: Low interest rates, large amounts, long terms
   - Disadvantages: Requires property collateral, slower approval process

3. KFW FÖRDERKREDIT 261 - BEG WG (Energy-Efficient Renovation Credit)
   - Type: State-subsidized low-interest loan
   - Amount: Up to €150,000 per residential unit
   - Interest Rate: 0.01% - 1.5% (highly subsidized)
   - Repayment Grant: Up to 45% debt relief for best efficiency levels
   - Best For: Energy-efficient renovations (insulation, windows, heating, renewable energy)
   - Requirements:
     * Apply BEFORE starting construction
     * Energy consultant (Energieberater) certification required
     * Must achieve specific efficiency standards (e.g., KfW 85, KfW 70, KfW 55)
   - Application: Through local bank (Hausbank), not directly with KfW
   - Advantages: Extremely low interest, debt relief grants, long repayment terms
   - Disadvantages: Strict requirements, energy consultant costs (€500-2000), paperwork intensive

4. KFW FÖRDERKREDIT 159 - Barrier-Free Conversion
   - Type: State-subsidized loan
   - Amount: Up to €50,000
   - Interest Rate: 0.75% - 1.5%
   - Best For: Accessibility improvements (bathrooms, elevators, ramps, door widening)
   - Requirements: Apply before starting, no age/disability requirement
   - Advantages: Low interest, easier than energy efficiency loans
   - Disadvantages: Lower maximum amount

5. BAFA ZUSCHUSS - Renewable Energy Heating Grant
   - Type: Direct cash grant (non-repayable)
   - Amount: Up to €70,000 (covers up to 40% of costs)
   - Best For: Heat pumps, solar thermal systems, biomass heating, hybrid systems
   - Requirements:
     * Professional installation
     * Certified systems only
     * Apply through BAFA portal
   - Advantages: Free money, no repayment, can combine with KfW loans
   - Disadvantages: Limited to heating systems only, pre-approval required

6. WOHN-RIESTER (Home Ownership Riester Pension)
   - Type: Government-subsidized savings/loan
   - Best For: Homeowners under 50 using pension savings for renovations
   - Requirements: Riester pension contract, own property
   - Advantages: Tax benefits, government bonuses
   - Disadvantages: Complex tax implications, penalties for early withdrawal

RESPONSE FORMAT (JSON):
{{
  "recommendations": [
    {{
      "optionName": "string",
      "type": "loan|grant|subsidy",
      "provider": "string",
      "priority": 1-5,
      "estimatedAmount": "€X - €Y",
      "interestRate": "X% - Y%",
      "term": "X months/years",
      "eligibility": "Brief description",
      "pros": ["advantage 1", "advantage 2", "advantage 3"],
      "cons": ["disadvantage 1", "disadvantage 2"],
      "applicationSteps": ["step 1", "step 2", "step 3"],
      "recommendationReason": "Why this is recommended for THIS specific project"
    }}
  ],
  "summary": "2-3 sentence summary of the overall financing strategy",
  "totalFinancingNeeded": {total_cost},
  "recommendedSplit": "Brief explanation of how to combine options",
  "importantNotes": ["critical note 1", "critical note 2"],
  "nextSteps": ["immediate action 1", "immediate action 2", "immediate action 3"]
}}

CRITICAL INSTRUCTIONS:
1. Analyze the SPECIFIC PROJECT DETAILS and cost breakdown
2. Recommend 3-5 most suitable financing options for THIS exact project
3. Consider project size (€{total_cost:,}) when recommending options
4. For energy-related work (heating, insulation), STRONGLY recommend KfW/BAFA options
5. Explain WHY each option suits THIS particular renovation
6. Provide realistic interest rates and amounts for {renovation_type} renovation
7. Include step-by-step application process for each option
8. Return ONLY valid JSON (no markdown, no code blocks)

Generate the recommendations now:"""

		return prompt

	def build_image_generation_prompt(self, original_prompt, cost_estimate, form_data):
		"""
		Build image description prompt for renovation visualization

		Args:
			original_prompt (str): The original prompt sent for cost estimation
			cost_estimate (dict): The cost estimate response
			form_data (dict): Original form data

		Returns:
			str: Formatted prompt for image description generation
		"""
		renovation_type = form_data.get('renovationType', 'general')
		total_cost = cost_estimate.get('totalEstimatedCost', 0)

		# Extract key details from form_data
		design_style = form_data.get('designStyle', 'modern')
		color_main = form_data.get('colorSchemeMain', 'neutral')
		color_accent = form_data.get('colorSchemeAccent', '')

		prompt = f"""You are a renovation visualization expert. Create a detailed image description for AI image generation based on this renovation project.

PROJECT TYPE: {renovation_type.upper()} Renovation
BUDGET: €{total_cost:,}
DESIGN STYLE: {design_style}
COLOR SCHEME: Main={color_main}, Accent={color_accent}

PROJECT DETAILS:
{original_prompt[:1000]}

===================================================================================
CRITICAL: You MUST respond with ONLY a valid JSON object. No explanations, no markdown, no code blocks.
===================================================================================

Create a vivid, detailed description that could be used with AI image generators (like DALL-E, Midjourney, Stable Diffusion) to visualize this renovation.

REQUIRED JSON FORMAT - Copy this structure EXACTLY:
{{
  "imagePrompt": "Your detailed prompt for AI image generator (100-150 words) using photorealistic, architectural visualization style",
  "style": "Photorealistic",
  "keyFeatures": ["feature 1", "feature 2", "feature 3", "feature 4", "feature 5"],
  "colorPalette": ["color 1", "color 2", "color 3"],
  "materials": ["material 1", "material 2", "material 3"],
  "lighting": "Description of lighting",
  "mood": "Overall atmosphere",
  "viewpoint": "Camera angle",
  "technicalNote": "Image quality specifications"
}}

MANDATORY REQUIREMENTS:
1. The "imagePrompt" field is REQUIRED and must contain a detailed 100-150 word description
2. Include SPECIFIC details from the project (materials, finishes, colors)
3. Make the imagePrompt suitable for professional architectural visualization
4. Respond with ONLY the JSON object - NO additional text, NO markdown code blocks, NO explanations
5. The JSON must be valid and parseable

Your response must start with {{ and end with }}

Generate the JSON now:"""

		return prompt

