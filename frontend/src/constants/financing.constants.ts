/**
 * Constants for the Financing module
 * Centralized configuration and static data
 */

import { SelectOption, FormData } from '../types/financing.types';
// Import PROJECT_TYPES from projects service to ensure consistency
import { PROJECT_TYPES } from '../services/projects';

// ============================================================================
// Form Options
// ============================================================================

// Use the EXACT same project types as the Project creation form
// This ensures perfect 1:1 mapping when auto-filling from a selected project
export const RENOVATION_TYPE_OPTIONS: SelectOption[] = PROJECT_TYPES;

// All other form option constants have been removed as they are no longer needed
// The form now only uses renovationType

// ============================================================================
// Conditional Questions by Renovation Type
// ============================================================================

export interface QuestionOption {
  value: string;
  label: string;
  description?: string; // Description shown below the option
  qualityLevel?: 'budget' | 'standard' | 'premium' | 'luxury'; // Quality tier for materials
  qualityDescription?: string; // Detailed quality explanation
}

export interface Question {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'radio' | 'checkbox' | 'number' | 'text';
  options?: QuestionOption[];
  required?: boolean;
  placeholder?: string;
  unit?: string; // For number fields (e.g., "m²", "€")
  min?: number; // For number fields
  max?: number; // For number fields
  description?: string; // Overall field description/help text
  sectionTitle?: string; // For grouping questions into sections
  allowOther?: boolean; // Allow custom "Other" option
  otherPlaceholder?: string; // Placeholder for "Other" text input
}

// ============================================================================
// STEP 1: Area Selection
// ============================================================================
export const BATHROOM_AREA_SELECTION: Question[] = [
  {
    id: 'bathroomRenovationAreas',
    label: 'Which areas do you want to renovate?',
    type: 'multiselect',
    required: true,
    description: 'Select all the areas you want to include in your bathroom renovation project.',
    options: [
      { value: 'shower_area', label: 'Shower Area', description: 'Shower installation, tiles, fixtures, and drainage' },
      { value: 'bathtub', label: 'Bathtub', description: 'Bathtub installation, surrounding tiles, and fixtures' },
      { value: 'toilet_area', label: 'Toilet Area', description: 'Toilet/WC installation and surrounding area' },
      { value: 'washbasin_area', label: 'Washbasin Area', description: 'Sink, vanity, mirror, and storage' },
      { value: 'tiles_surfaces', label: 'Tiles & Surfaces', description: 'Wall and floor tiling' },
      { value: 'electrical_lighting', label: 'Electrical & Lighting', description: 'Wiring, outlets, and lighting' },
      { value: 'plumbing', label: 'Plumbing', description: 'Pipe work and water supply' },
      { value: 'water_pressure', label: 'Water Pressure', description: 'Pressure improvements' },
      { value: 'heating', label: 'Heating', description: 'Bathroom heating systems' },
      { value: 'ventilation', label: 'Ventilation', description: 'Ventilation and air quality' },
      { value: 'accessories', label: 'Accessories', description: 'Towel holders, shelves, etc.' },
      { value: 'waterproofing', label: 'Waterproofing', description: 'Moisture protection' }
    ]
  }
];

// ============================================================================
// STEP 2: Detailed Questions
// ============================================================================

// SECTION 1: Renovation Goal (Always shown)
export const RENOVATION_GOAL_QUESTIONS: Question[] = [
  {
    id: 'renovationGoal',
    label: 'Renovation Goal',
    type: 'multiselect',
    required: true,
    sectionTitle: 'Renovation Goal',
    description: 'What type of renovation are you planning?',
    allowOther: true,
    otherPlaceholder: 'Describe your specific renovation goal...',
    options: [
      { value: 'cosmetic_upgrade', label: 'Cosmetic upgrade', description: 'Paint, fixtures, minor updates' },
      { value: 'full_demolition', label: 'Full demolition + rebuild', description: 'Complete bathroom reconstruction' },
      { value: 'fixtures_only', label: 'Only fixtures replacement', description: 'Replace toilet, sink, shower, etc.' },
      { value: 'tiles_only', label: 'Only tiles replacement', description: 'New floor and wall tiles' },
      { value: 'structural_changes', label: 'Structural changes', description: 'Wall removal, layout changes' },
      { value: 'increase_space', label: 'Increase space', description: 'Expand bathroom area' }
    ]
  }
];

// SECTION 3: Common Fields (Always shown)
export const COMMON_FIELDS_QUESTIONS: Question[] = [
  {
    id: 'bathroomType',
    label: 'Bathroom Type',
    type: 'radio',
    required: true,
    sectionTitle: 'Common Fields',
    description: 'What type of bathroom is this?',
    options: [
      { value: 'master', label: 'Master bathroom', description: 'Primary bedroom bathroom' },
      { value: 'guest', label: 'Guest bathroom', description: 'For visitors' },
      { value: 'kids', label: 'Kids bathroom', description: 'Children\'s bathroom' },
      { value: 'shared', label: 'Shared bathroom', description: 'Used by multiple people' },
      { value: 'outdoor', label: 'Outdoor bathroom', description: 'Exterior bathroom' }
    ]
  },
  {
    id: 'designStyle',
    label: 'Preferred Design Style',
    type: 'radio',
    required: true,
    description: 'Choose your preferred design aesthetic',
    options: [
      { value: 'modern', label: 'Modern', description: 'Clean lines, contemporary' },
      { value: 'minimalist', label: 'Minimalist', description: 'Simple, uncluttered' },
      { value: 'luxury', label: 'Luxury', description: 'High-end, premium' },
      { value: 'industrial', label: 'Industrial', description: 'Raw, urban style' },
      { value: 'traditional', label: 'Traditional', description: 'Classic, timeless' },
      { value: 'vintage', label: 'Vintage', description: 'Retro, antique' }
    ]
  },
  {
    id: 'colorSchemeMain',
    label: 'Main Colors',
    type: 'text',
    required: false,
    placeholder: 'e.g., White, Gray, Beige',
    description: 'Enter your preferred main colors'
  },
  {
    id: 'colorSchemeAccent',
    label: 'Accent Colors',
    type: 'text',
    required: false,
    placeholder: 'e.g., Blue, Gold, Black',
    description: 'Enter your preferred accent colors'
  },
  {
    id: 'metalFinish',
    label: 'Metal Finish',
    type: 'radio',
    required: true,
    description: 'Choose metal finish for fixtures',
    options: [
      { value: 'chrome', label: 'Chrome', description: 'Shiny silver finish' },
      { value: 'black', label: 'Black', description: 'Matte or glossy black' },
      { value: 'gold', label: 'Gold', description: 'Brass or gold finish' },
      { value: 'nickel', label: 'Nickel', description: 'Brushed nickel' },
      { value: 'bronze', label: 'Bronze', description: 'Oil-rubbed bronze' }
    ]
  }
];

// SECTION 4: Shower Area (Conditional - if shower_area selected)
export const SHOWER_AREA_QUESTIONS: Question[] = [
  {
    id: 'showerType',
    label: 'Shower Type',
    type: 'radio',
    required: true,
    sectionTitle: 'Shower Area',
    description: 'What type of shower do you want?',
    options: [
      { value: 'walk_in', label: 'Walk-in shower', description: 'Open, barrier-free shower with modern design' },
      { value: 'enclosure', label: 'Shower enclosure', description: 'Glass-enclosed shower for space efficiency' },
      { value: 'bath_shower', label: 'Bath + shower combo', description: 'Combined tub and shower for flexibility' },
      { value: 'wet_room', label: 'Wet room', description: 'Fully waterproofed room with open shower area' }
    ]
  },
  {
    id: 'showerFixtureQuality',
    label: 'Shower Fixture Quality Preference',
    type: 'radio',
    required: true,
    description: 'Select the quality level for shower fixtures (faucets, shower heads, controls)',
    options: [
      {
        value: 'budget',
        label: 'Budget-Friendly',
        description: 'Basic functionality with standard features',
        qualityLevel: 'budget',
        qualityDescription: 'Reliable standard brands, essential features, good for basic renovations'
      },
      {
        value: 'standard',
        label: 'Standard Quality',
        description: 'Good quality German brands with reliable performance',
        qualityLevel: 'standard',
        qualityDescription: 'German brands like Grohe, good durability, wide range of designs, excellent value'
      },
      {
        value: 'premium',
        label: 'Premium Quality',
        description: 'High-end German brands with superior quality',
        qualityLevel: 'premium',
        qualityDescription: 'Hansgrohe, Dornbracht - exceptional durability, innovative features, elegant design'
      }
    ]
  },
  {
    id: 'showerEnclosureGlass',
    label: 'Glass Type (for Shower Enclosure)',
    type: 'radio',
    required: false,
    description: 'Type of glass for shower enclosure',
    options: [
      { value: 'clear', label: 'Clear', description: 'Transparent glass' },
      { value: 'frosted', label: 'Frosted', description: 'Privacy glass' },
      { value: 'tinted', label: 'Tinted', description: 'Colored glass' }
    ]
  },
  {
    id: 'showerEnclosureThickness',
    label: 'Glass Thickness (mm)',
    type: 'number',
    required: false,
    placeholder: 'e.g., 8',
    min: 6,
    max: 12,
    description: 'Thickness of shower glass (6-12mm)'
  },
  {
    id: 'showerEnclosureFrame',
    label: 'Frame Type',
    type: 'radio',
    required: false,
    description: 'Shower enclosure frame style',
    options: [
      { value: 'framed', label: 'Framed', description: 'With metal frame' },
      { value: 'frameless', label: 'Frameless', description: 'Minimalist, no frame' }
    ]
  },
  {
    id: 'showerFixtures',
    label: 'Shower Fixtures',
    type: 'multiselect',
    required: true,
    description: 'Select shower head types',
    options: [
      { value: 'rain', label: 'Rain shower', description: 'Overhead rainfall shower' },
      { value: 'handheld', label: 'Handheld', description: 'Detachable shower head' },
      { value: 'both', label: 'Both', description: 'Rain + Handheld' },
      { value: 'thermostatic', label: 'Thermostatic control', description: 'Temperature control' },
      { value: 'smart', label: 'Smart control', description: 'Digital/app control' }
    ]
  },
  {
    id: 'drainType',
    label: 'Drain Type',
    type: 'radio',
    required: true,
    description: 'Shower drain placement',
    options: [
      { value: 'linear', label: 'Linear', description: 'Long, narrow drain' },
      { value: 'center', label: 'Center', description: 'Central round drain' },
      { value: 'corner', label: 'Corner', description: 'Corner placement' }
    ]
  }
];

// SECTION 5: Bathtub (Conditional - if bathtub selected)
export const BATHTUB_QUESTIONS: Question[] = [
  {
    id: 'bathtubWanted',
    label: 'Do you want a bathtub?',
    type: 'radio',
    required: true,
    sectionTitle: 'Bathtub',
    description: 'Include a bathtub in your renovation?',
    options: [
      { value: 'yes', label: 'Yes', description: 'Include bathtub' },
      { value: 'no', label: 'No', description: 'No bathtub needed' }
    ]
  },
  {
    id: 'bathtubType',
    label: 'Bathtub Type',
    type: 'radio',
    required: false,
    description: 'What style of bathtub?',
    options: [
      { value: 'freestanding', label: 'Freestanding', description: 'Standalone tub for luxurious look' },
      { value: 'built_in', label: 'Built-in', description: 'Alcove or drop-in, space-efficient' },
      { value: 'jacuzzi', label: 'Jacuzzi/Whirlpool', description: 'With massage jets for spa experience' },
      { value: 'soaking', label: 'Deep soaking', description: 'Extra deep tub for relaxation' }
    ]
  },
  {
    id: 'bathtubMaterialQuality',
    label: 'Bathtub Material & Quality',
    type: 'radio',
    required: false,
    description: 'Choose bathtub material based on quality and durability',
    options: [
      {
        value: 'acrylic_budget',
        label: 'Acrylic - Budget',
        description: 'Lightweight, affordable, easy to install',
        qualityLevel: 'budget',
        qualityDescription: 'Standard acrylic bathtubs - good insulation, affordable, suitable for most renovations'
      },
      {
        value: 'acrylic_premium',
        label: 'Acrylic - Premium',
        description: 'High-grade acrylic with reinforced construction',
        qualityLevel: 'standard',
        qualityDescription: 'Thicker acrylic, better durability, enhanced comfort, German brands like Bette/Kaldewei acrylic lines'
      },
      {
        value: 'steel_enamel',
        label: 'Steel Enamel - Standard',
        description: 'Glazed steel, durable and easy to clean',
        qualityLevel: 'standard',
        qualityDescription: 'German specialty - Bette & Kaldewei titanium steel with enamel coating, excellent heat retention, 30-year warranty'
      },
      {
        value: 'cast_iron',
        label: 'Cast Iron - Premium',
        description: 'Heavy-duty, excellent heat retention, timeless',
        qualityLevel: 'premium',
        qualityDescription: 'Classic luxury material, exceptional durability, superior heat retention, lasts generations'
      },
      {
        value: 'stone_resin',
        label: 'Stone Resin - Luxury',
        description: 'Modern composite material, elegant matte finish',
        qualityLevel: 'luxury',
        qualityDescription: 'High-end material with stone-like appearance, warm to touch, contemporary luxury bathrooms'
      }
    ]
  },
  {
    id: 'bathtubSize',
    label: 'Bathtub Size',
    type: 'radio',
    required: false,
    description: 'Select bathtub dimensions',
    options: [
      { value: 'compact', label: 'Compact (140-150cm)', description: 'For smaller bathrooms' },
      { value: 'standard', label: 'Standard (160-170cm)', description: 'Most common size for average bathrooms' },
      { value: 'large', label: 'Large (180-190cm)', description: 'Spacious, for master bathrooms' },
      { value: 'extra_large', label: 'Extra Large (200cm+)', description: 'Luxury size for large bathrooms' }
    ]
  }
];

// SECTION 6: Toilet Area (Conditional - if toilet_area selected)
export const TOILET_AREA_QUESTIONS: Question[] = [
  {
    id: 'toiletType',
    label: 'Toilet Type',
    type: 'radio',
    required: true,
    sectionTitle: 'Toilet Area',
    description: 'What type of toilet?',
    options: [
      { value: 'floor_mounted', label: 'Floor-mounted', description: 'Traditional floor toilet, easier installation' },
      { value: 'wall_mounted', label: 'Wall-mounted (wall-hung)', description: 'Modern, space-saving, easier to clean floor' },
      { value: 'smart', label: 'Smart toilet', description: 'With bidet, heated seat, advanced features' }
    ]
  },
  {
    id: 'toiletQuality',
    label: 'Toilet Quality & Brand',
    type: 'radio',
    required: true,
    description: 'Select toilet quality level based on German market brands',
    options: [
      {
        value: 'budget',
        label: 'Budget-Friendly',
        description: 'Standard brands with basic features',
        qualityLevel: 'budget',
        qualityDescription: 'Reliable functionality, standard ceramic, affordable options for basic renovations'
      },
      {
        value: 'standard',
        label: 'Standard Quality - German Brands',
        description: 'Well-known German ceramic brands',
        qualityLevel: 'standard',
        qualityDescription: 'Villeroy & Boch, Duravit standard lines - excellent ceramics, good design, reliable performance'
      },
      {
        value: 'premium',
        label: 'Premium Quality - Designer Lines',
        description: 'High-end German designer toilets',
        qualityLevel: 'premium',
        qualityDescription: 'Duravit designer series, advanced rim technology, superior hygiene, elegant modern design'
      },
      {
        value: 'luxury_smart',
        label: 'Luxury - Smart Toilets',
        description: 'Advanced smart toilets with integrated bidet',
        qualityLevel: 'luxury',
        qualityDescription: 'Heated seat, automatic lid, integrated bidet, air dryer, deodorizer, premium comfort and hygiene'
      }
    ]
  },
  {
    id: 'flushSystem',
    label: 'Flush System',
    type: 'radio',
    required: true,
    description: 'Flush mechanism preferences',
    options: [
      { value: 'concealed_dual', label: 'Concealed tank with dual flush', description: 'Hidden cistern, eco-friendly two-button flush (standard)' },
      { value: 'concealed_sensor', label: 'Concealed tank with sensor', description: 'Hidden cistern, touchless automatic flush (premium)' },
      { value: 'exposed', label: 'Exposed tank', description: 'Visible cistern, easier maintenance (budget)' }
    ]
  }
];

// SECTION 7: Washbasin Area (Conditional - if washbasin_area selected)
export const WASHBASIN_AREA_QUESTIONS: Question[] = [
  {
    id: 'basinCount',
    label: 'Basin Count',
    type: 'radio',
    required: true,
    sectionTitle: 'Washbasin Area',
    description: 'Number of sinks',
    options: [
      { value: 'single', label: 'Single basin', description: 'One sink, suitable for most bathrooms' },
      { value: 'double', label: 'Double basin', description: 'Two sinks, ideal for master bathrooms' }
    ]
  },
  {
    id: 'basinType',
    label: 'Basin Type & Installation',
    type: 'radio',
    required: true,
    description: 'Sink installation style',
    options: [
      { value: 'countertop', label: 'Countertop vessel', description: 'Bowl sits on counter, modern design statement' },
      { value: 'undermount', label: 'Undermount', description: 'Integrated under counter, clean minimalist look' },
      { value: 'wall_mounted', label: 'Wall-mounted', description: 'Floating sink, space-saving for small bathrooms' },
      { value: 'integrated', label: 'Integrated sink-countertop', description: 'Seamless one-piece design, easy to clean' }
    ]
  },
  {
    id: 'basinQuality',
    label: 'Basin Quality & Brand',
    type: 'radio',
    required: true,
    description: 'Select washbasin quality level',
    options: [
      {
        value: 'budget',
        label: 'Budget-Friendly',
        description: 'Standard ceramic basins',
        qualityLevel: 'budget',
        qualityDescription: 'Basic ceramic or porcelain, functional design, affordable for standard renovations'
      },
      {
        value: 'standard',
        label: 'Standard Quality - German Brands',
        description: 'Well-known German ceramic manufacturers',
        qualityLevel: 'standard',
        qualityDescription: 'Villeroy & Boch, Duravit - high-quality ceramics, variety of designs, excellent durability'
      },
      {
        value: 'premium',
        label: 'Premium Quality - Designer Basins',
        description: 'High-end designer washbasins',
        qualityLevel: 'premium',
        qualityDescription: 'Duravit designer series, premium finishes, unique shapes, architectural quality'
      }
    ]
  },
  {
    id: 'faucetQuality',
    label: 'Faucet (Tap) Quality & Brand',
    type: 'radio',
    required: true,
    description: 'Select faucet quality level for washbasin',
    options: [
      {
        value: 'budget',
        label: 'Budget-Friendly',
        description: 'Standard faucets with basic features',
        qualityLevel: 'budget',
        qualityDescription: 'Basic chrome finish, standard functionality, affordable for basic renovations'
      },
      {
        value: 'standard_grohe',
        label: 'Standard Quality - Grohe',
        description: 'German brand with reliable performance',
        qualityLevel: 'standard',
        qualityDescription: 'Grohe - good quality, wide range of designs, reliable, excellent value for money'
      },
      {
        value: 'premium_hansgrohe',
        label: 'Premium Quality - Hansgrohe',
        description: 'High-end German faucets with superior quality',
        qualityLevel: 'premium',
        qualityDescription: 'Hansgrohe - exceptional durability, smooth operation, water-saving technology, elegant design'
      },
      {
        value: 'luxury_dornbracht',
        label: 'Luxury - Dornbracht',
        description: 'Ultra-luxury architectural faucets',
        qualityLevel: 'luxury',
        qualityDescription: 'Dornbracht - ultra-premium, architecturally designed, precision engineering, statement piece for luxury bathrooms'
      }
    ]
  },
  {
    id: 'countertopMaterialQuality',
    label: 'Countertop Material & Quality',
    type: 'radio',
    required: true,
    description: 'Choose vanity countertop material based on quality and durability',
    options: [
      {
        value: 'laminate',
        label: 'Laminate - Budget',
        description: 'Affordable, variety of colors and patterns',
        qualityLevel: 'budget',
        qualityDescription: 'Budget-friendly, water-resistant with proper sealing, good for cost-conscious renovations'
      },
      {
        value: 'solid_surface',
        label: 'Solid Surface (Corian) - Standard',
        description: 'Non-porous, seamless, easy to repair',
        qualityLevel: 'standard',
        qualityDescription: 'Durable synthetic material, seamless appearance, repairable, good mid-range option'
      },
      {
        value: 'quartz',
        label: 'Quartz - Premium',
        description: 'Engineered stone, non-porous, highly durable',
        qualityLevel: 'premium',
        qualityDescription: 'Top choice for bathrooms - extremely durable, non-porous (no bacteria/mildew), low maintenance, premium appearance'
      },
      {
        value: 'granite',
        label: 'Granite - Premium',
        description: 'Natural stone, heat and scratch resistant',
        qualityLevel: 'premium',
        qualityDescription: 'Natural stone beauty, very durable, heat resistant, requires periodic sealing'
      },
      {
        value: 'marble',
        label: 'Marble - Luxury',
        description: 'Natural marble, elegant and timeless',
        qualityLevel: 'luxury',
        qualityDescription: 'Luxurious natural stone, unique veining, softer than granite, requires maintenance and sealing, premium aesthetic'
      }
    ]
  }
];

// SECTION 8: Tiles & Surfaces (Conditional - if tiles_surfaces selected)
export const TILES_SURFACES_QUESTIONS: Question[] = [
  {
    id: 'floorTileQuality',
    label: 'Floor Tile Material & Quality',
    type: 'radio',
    required: true,
    sectionTitle: 'Tiles & Surfaces',
    description: 'Choose floor tile material based on quality and durability',
    options: [
      {
        value: 'ceramic_budget',
        label: 'Ceramic - Budget',
        description: 'Affordable, variety of colors and patterns',
        qualityLevel: 'budget',
        qualityDescription: 'Standard ceramic tiles - versatile, good for dry areas, cost-effective for basic renovations'
      },
      {
        value: 'ceramic_standard',
        label: 'Ceramic - Standard Quality',
        description: 'Higher grade ceramic with better durability',
        qualityLevel: 'standard',
        qualityDescription: 'Enhanced ceramic - better water resistance, more durable, suitable for bathroom floors'
      },
      {
        value: 'porcelain_standard',
        label: 'Porcelain - Standard',
        description: 'Dense, water-resistant, durable',
        qualityLevel: 'standard',
        qualityDescription: 'Porcelain tiles (45% market share in Germany) - frost resistant, low water absorption, ideal for bathrooms'
      },
      {
        value: 'porcelain_premium',
        label: 'Porcelain - Premium',
        description: 'Large format, through-body color, superior finish',
        qualityLevel: 'premium',
        qualityDescription: 'High-end porcelain - through-body color (no visible chips), large formats, premium finishes like natural stone effects'
      },
      {
        value: 'natural_stone',
        label: 'Natural Stone - Luxury',
        description: 'Marble, slate, or travertine',
        qualityLevel: 'luxury',
        qualityDescription: 'Authentic natural stone - unique appearance, luxurious feel, requires sealing and maintenance'
      }
    ]
  },
  {
    id: 'floorTileSize',
    label: 'Floor Tile Size',
    type: 'radio',
    required: true,
    description: 'Floor tile dimensions (larger tiles = fewer grout lines, modern look)',
    options: [
      { value: '300x300', label: '300x300 mm', description: 'Small format - traditional, more grout lines' },
      { value: '600x600', label: '600x600 mm', description: 'Large format - modern, fewer grout lines' },
      { value: '800x800', label: '800x800 mm', description: 'Extra large - contemporary, minimal grout' },
      { value: 'custom', label: 'Custom size', description: 'Specify custom dimensions' }
    ]
  },
  {
    id: 'wallTilesQuality',
    label: 'Wall Tile Material & Quality',
    type: 'radio',
    required: true,
    description: 'Choose wall tile material based on quality and style',
    options: [
      {
        value: 'ceramic_budget',
        label: 'Ceramic - Budget',
        description: 'Standard ceramic wall tiles',
        qualityLevel: 'budget',
        qualityDescription: 'Basic ceramic wall tiles - affordable, variety of colors, suitable for standard bathrooms'
      },
      {
        value: 'ceramic_premium',
        label: 'Ceramic - Premium',
        description: 'High-quality ceramic with special finishes',
        qualityLevel: 'standard',
        qualityDescription: 'Premium ceramic - textured or glossy finishes, better quality, consistent color'
      },
      {
        value: 'porcelain',
        label: 'Porcelain',
        description: 'Dense porcelain wall tiles',
        qualityLevel: 'standard',
        qualityDescription: 'Porcelain for walls - superior moisture resistance, excellent for wet areas like showers'
      },
      {
        value: 'glass_mosaic',
        label: 'Glass Mosaic - Premium',
        description: 'Glass tiles for accent areas',
        qualityLevel: 'premium',
        qualityDescription: 'Glass mosaic tiles - elegant, reflective, perfect for accent walls or shower niches'
      },
      {
        value: 'marble_luxury',
        label: 'Marble/Natural Stone - Luxury',
        description: 'Natural stone wall tiles',
        qualityLevel: 'luxury',
        qualityDescription: 'Natural marble or stone - luxurious appearance, unique veining, requires sealing'
      }
    ]
  },
  {
    id: 'wallTilesHeight',
    label: 'Wall Tiles Coverage',
    type: 'radio',
    required: true,
    description: 'How high should wall tiles go?',
    options: [
      { value: 'full', label: 'Full height (floor to ceiling)', description: 'Complete coverage, best moisture protection, modern look' },
      { value: 'half', label: 'Half height (up to ~1.2m)', description: 'Partial wall coverage, paint above, traditional style' },
      { value: 'shower_only', label: 'Shower area only', description: 'Tile only wet areas, paint elsewhere' }
    ]
  },
  {
    id: 'accentWall',
    label: 'Accent/Feature Wall',
    type: 'radio',
    required: false,
    description: 'Special feature wall with decorative tiles?',
    options: [
      { value: 'yes', label: 'Yes - Include accent wall', description: 'Add feature wall with special tiles or pattern' },
      { value: 'no', label: 'No - Uniform tiles', description: 'Same tiles throughout' }
    ]
  },
  {
    id: 'groutQuality',
    label: 'Grout Type & Quality',
    type: 'radio',
    required: false,
    description: 'Type of grout (affects durability and maintenance)',
    options: [
      {
        value: 'cement_budget',
        label: 'Cement-based grout - Budget',
        description: 'Standard grout, requires sealing',
        qualityLevel: 'budget',
        qualityDescription: 'Traditional cement grout - affordable, requires periodic sealing to prevent staining'
      },
      {
        value: 'cement_premium',
        label: 'Premium cement grout with additives',
        description: 'Enhanced cement grout, better stain resistance',
        qualityLevel: 'standard',
        qualityDescription: 'Premium cement grout with polymers - better flexibility, stain resistance, less maintenance'
      },
      {
        value: 'epoxy',
        label: 'Epoxy grout - Premium',
        description: 'Waterproof, stain-proof, highly durable',
        qualityLevel: 'premium',
        qualityDescription: 'Epoxy grout - completely waterproof, no sealing needed, best for wet areas, superior stain resistance'
      }
    ]
  },
  {
    id: 'groutColor',
    label: 'Grout Color',
    type: 'radio',
    required: false,
    description: 'Preferred grout color',
    options: [
      { value: 'white', label: 'White', description: 'Clean, classic look' },
      { value: 'gray', label: 'Gray', description: 'Modern, hides dirt better' },
      { value: 'matching', label: 'Matching tile color', description: 'Seamless appearance' },
      { value: 'contrasting', label: 'Contrasting color', description: 'Highlight tile pattern' }
    ]
  }
];

// SECTION 9: Electrical & Lighting (Conditional - if electrical_lighting selected)
export const ELECTRICAL_LIGHTING_QUESTIONS: Question[] = [
  {
    id: 'ceilingLights',
    label: 'Ceiling Lights',
    type: 'multiselect',
    required: true,
    sectionTitle: 'Electrical & Lighting',
    description: 'Select ceiling lighting options (can select multiple)',
    options: [
      { value: 'recessed', label: 'Recessed downlights', description: 'Built-in ceiling spotlights, modern clean look' },
      { value: 'led_panel', label: 'LED panel lights', description: 'Flat LED panels, even illumination, energy-efficient' },
      { value: 'chandelier', label: 'Chandelier/Pendant', description: 'Decorative hanging light for luxury bathrooms' },
      { value: 'spotlights', label: 'Adjustable spotlights', description: 'Directional spots for accent lighting' }
    ]
  },
  {
    id: 'lightingQuality',
    label: 'Lighting Fixture Quality',
    type: 'radio',
    required: true,
    description: 'Select quality level for bathroom lighting fixtures',
    options: [
      {
        value: 'budget',
        label: 'Budget-Friendly',
        description: 'Standard LED lights with basic features',
        qualityLevel: 'budget',
        qualityDescription: 'Basic LED fixtures - functional, energy-efficient, IP44 rated for bathroom use'
      },
      {
        value: 'standard',
        label: 'Standard Quality',
        description: 'Good quality German brands with better efficiency',
        qualityLevel: 'standard',
        qualityDescription: 'Branded LED fixtures - better light quality (CRI 80+), dimmable options, IP65 rated, longer warranty'
      },
      {
        value: 'premium',
        label: 'Premium Quality',
        description: 'High-end designer lighting with smart features',
        qualityLevel: 'premium',
        qualityDescription: 'Designer LED lights - excellent light quality (CRI 90+), smart control, premium finishes, architectural quality'
      }
    ]
  },
  {
    id: 'mirrorLights',
    label: 'Mirror Lights',
    type: 'multiselect',
    required: false,
    description: 'Mirror lighting options (can select multiple)',
    options: [
      { value: 'led_backlit', label: 'LED backlit mirror', description: 'Integrated LED lighting behind/around mirror, modern look' },
      { value: 'sconce', label: 'Wall sconce lights', description: 'Wall-mounted lights beside mirror, traditional elegance' },
      { value: 'illuminated_mirror', label: 'Fully illuminated mirror', description: 'Mirror with integrated LED surround lighting' }
    ]
  },
  {
    id: 'mirrorQuality',
    label: 'Mirror Quality',
    type: 'radio',
    required: false,
    description: 'Select mirror quality level',
    options: [
      {
        value: 'budget',
        label: 'Standard Mirror',
        description: 'Basic bathroom mirror',
        qualityLevel: 'budget',
        qualityDescription: 'Standard mirror - basic glass, fog-resistant coating optional'
      },
      {
        value: 'standard',
        label: 'LED-Backlit Mirror',
        description: 'Mirror with integrated LED lighting',
        qualityLevel: 'standard',
        qualityDescription: 'LED mirror - built-in lighting, anti-fog heating, modern aesthetic'
      },
      {
        value: 'premium',
        label: 'Smart Mirror',
        description: 'Digital mirror with touchscreen and smart features',
        qualityLevel: 'premium',
        qualityDescription: 'Smart mirror - touchscreen display, lighting control, Bluetooth speakers, defogging, luxury feature'
      }
    ]
  },
  {
    id: 'smartFeatures',
    label: 'Smart Technology Features',
    type: 'multiselect',
    required: false,
    description: 'Smart home integration (optional)',
    options: [
      { value: 'smart_lights', label: 'Smart lighting control', description: 'App-controlled lights with dimming and color temperature' },
      { value: 'voice_control', label: 'Voice control integration', description: 'Alexa, Google Assistant for hands-free control' },
      { value: 'motion_sensors', label: 'Motion sensor lighting', description: 'Automatic lights when entering bathroom' },
      { value: 'ambient_scenes', label: 'Lighting scenes/presets', description: 'Pre-programmed lighting moods (bright, relaxing, etc.)' }
    ]
  }
];

// SECTION 10: Plumbing (Conditional - if plumbing selected)
export const PLUMBING_QUESTIONS: Question[] = [
  {
    id: 'plumbingIssues',
    label: 'Any known plumbing issues?',
    type: 'multiselect',
    required: true,
    sectionTitle: 'Plumbing',
    description: 'Existing plumbing problems',
    options: [
      { value: 'leakage', label: 'Leakage', description: 'Water leaks' },
      { value: 'blocked', label: 'Blocked pipes', description: 'Drainage issues' },
      { value: 'old_rusted', label: 'Old or rusted pipes', description: 'Aging pipes' },
      { value: 'no_issues', label: 'No issues', description: 'Everything working' },
      { value: 'not_sure', label: 'Not sure', description: 'Need inspection' }
    ]
  },
  {
    id: 'replacePipes',
    label: 'Replace existing plumbing pipes?',
    type: 'radio',
    required: true,
    description: 'Plan to replace old pipes?',
    options: [
      { value: 'yes', label: 'Yes', description: 'Full pipe replacement' },
      { value: 'no', label: 'No', description: 'Keep existing' },
      { value: 'not_sure', label: 'Not sure', description: 'Need advice' }
    ]
  },
  {
    id: 'hotWaterSystem',
    label: 'Hot water system available?',
    type: 'radio',
    required: true,
    description: 'Is hot water available?',
    options: [
      { value: 'yes', label: 'Yes', description: 'Hot water available' },
      { value: 'no', label: 'No', description: 'Need to install' },
      { value: 'not_sure', label: 'Not sure', description: 'Need to check' }
    ]
  },
  {
    id: 'pipeMaterial',
    label: 'Pipe Material',
    type: 'radio',
    required: false,
    description: 'Preferred pipe material',
    options: [
      { value: 'pex', label: 'PEX', description: 'Flexible plastic' },
      { value: 'cpvc', label: 'CPVC', description: 'Rigid plastic' },
      { value: 'copper', label: 'Copper', description: 'Metal pipes' }
    ]
  }
];

// SECTION 10B: Water Pressure (Conditional - if water_pressure selected)
export const WATER_PRESSURE_QUESTIONS: Question[] = [
  {
    id: 'currentWaterPressure',
    label: 'Current water pressure',
    type: 'radio',
    required: true,
    sectionTitle: 'Water Pressure',
    description: 'How is your current water pressure?',
    options: [
      { value: 'good', label: 'Good', description: 'Strong pressure' },
      { value: 'average', label: 'Average', description: 'Acceptable pressure' },
      { value: 'low', label: 'Low', description: 'Weak pressure' },
      { value: 'not_sure', label: 'Not sure', description: 'Need to check' }
    ]
  },
  {
    id: 'lowPressureLocation',
    label: 'Where is pressure low?',
    type: 'multiselect',
    required: false,
    description: 'Which fixtures have low pressure?',
    options: [
      { value: 'shower', label: 'Shower', description: 'Weak shower' },
      { value: 'basin', label: 'Basin tap', description: 'Weak tap flow' },
      { value: 'toilet', label: 'Toilet flush', description: 'Weak flush' },
      { value: 'whole_bathroom', label: 'Whole bathroom', description: 'All fixtures' },
      { value: 'na', label: 'Not applicable', description: 'Pressure is fine' }
    ]
  },
  {
    id: 'waterSupplyType',
    label: 'Water supply type',
    type: 'radio',
    required: true,
    description: 'How is water supplied?',
    options: [
      { value: 'overhead', label: 'Overhead tank', description: 'Gravity-fed' },
      { value: 'underground_pump', label: 'Underground tank with pump', description: 'Pumped supply' },
      { value: 'municipal', label: 'Direct municipal supply', description: 'City water' },
      { value: 'not_sure', label: 'Not sure', description: 'Need to check' }
    ]
  },
  {
    id: 'wantStrongerPressure',
    label: 'Want stronger shower pressure?',
    type: 'radio',
    required: true,
    description: 'Improve shower pressure?',
    options: [
      { value: 'yes', label: 'Yes', description: 'Increase pressure' },
      { value: 'no', label: 'No', description: 'Keep as is' },
      { value: 'normal_fine', label: 'Normal pressure is fine', description: 'Current is OK' }
    ]
  },
  {
    id: 'boosterPumpOk',
    label: 'OK with booster pump if needed?',
    type: 'radio',
    required: true,
    description: 'Install pump if required?',
    options: [
      { value: 'yes', label: 'Yes', description: 'OK to install pump' },
      { value: 'no', label: 'No', description: 'No pump wanted' },
      { value: 'not_sure', label: 'Not sure', description: 'Need advice' }
    ]
  }
];

// SECTION 11: Heating (Conditional - if heating selected)
export const HEATING_QUESTIONS: Question[] = [
  {
    id: 'heatingType',
    label: 'Bathroom Heating System',
    type: 'multiselect',
    required: true,
    sectionTitle: 'Heating & Comfort',
    description: 'Select heating systems for your bathroom',
    allowOther: true,
    otherPlaceholder: 'Describe heating system...',
    options: [
      {
        value: 'radiator',
        label: 'Wall radiator (Heizkörper)',
        description: 'Traditional panel radiator for bathroom heating',
        qualityLevel: 'standard',
        qualityDescription: 'Traditional wall-mounted radiator - reliable heating, good for retrofit installations'
      },
      {
        value: 'towel_radiator',
        label: 'Heated towel radiator (Handtuchheizkörper)',
        description: 'Dual function: room heating + towel warming',
        qualityLevel: 'standard',
        qualityDescription: 'Popular German choice - heats room while keeping towels warm and dry, space-efficient'
      },
      {
        value: 'underfloor_electric',
        label: 'Electric underfloor heating',
        description: 'Floor heating mats, easy installation',
        qualityLevel: 'standard',
        qualityDescription: 'Electric heating mats under tiles - comfortable floor warmth, easier retrofit than water system'
      },
      {
        value: 'underfloor_water',
        label: 'Water underfloor heating',
        description: 'Hydronic system, most energy-efficient',
        qualityLevel: 'premium',
        qualityDescription: 'Water-based underfloor heating - most efficient, even heat distribution, ideal for new construction or major renovations'
      },
      {
        value: 'infrared_heater',
        label: 'Infrared panel heater',
        description: 'Modern, efficient, wall/ceiling mounted',
        qualityLevel: 'standard',
        qualityDescription: 'Modern infrared panels - efficient spot heating, quick warmth, contemporary design, wall or ceiling mount'
      }
    ]
  },
  {
    id: 'heatedTowelRailQuality',
    label: 'Heated Towel Rail Quality & Brand (if selected)',
    type: 'radio',
    required: false,
    description: 'Choose heated towel rail quality level',
    allowOther: true,
    otherPlaceholder: 'Enter specific brand preference...',
    options: [
      {
        value: 'budget_standard',
        label: 'Budget - Standard brands',
        description: 'Functional, basic models',
        qualityLevel: 'budget',
        qualityDescription: 'Basic heated towel rails - reliable functionality, standard designs, good for cost-conscious renovations'
      },
      {
        value: 'kermi',
        label: 'Standard - Kermi (German)',
        description: 'German quality, energy-efficient',
        qualityLevel: 'standard',
        qualityDescription: 'Kermi - established German brand, efficient heating, reliable quality, good value'
      },
      {
        value: 'zehnder',
        label: 'Premium - Zehnder (Swiss-German)',
        description: 'High-quality design radiators',
        qualityLevel: 'premium',
        qualityDescription: 'Zehnder - Swiss-German premium brand, excellent design options, superior build quality'
      },
      {
        value: 'vasco',
        label: 'Luxury - Vasco',
        description: 'Designer radiators, modern aesthetics',
        qualityLevel: 'luxury',
        qualityDescription: 'Vasco - luxury designer radiators, statement pieces, contemporary designs, premium finishes'
      }
    ]
  }
];

// SECTION 12: Ventilation (Conditional - if ventilation selected)
export const VENTILATION_QUESTIONS: Question[] = [
  {
    id: 'ventilationType',
    label: 'Ventilation System',
    type: 'radio',
    required: true,
    sectionTitle: 'Ventilation & Air Quality',
    description: 'What type of ventilation do you need? (Must comply with DIN 18017 German standards)',
    allowOther: true,
    otherPlaceholder: 'Describe ventilation...',
    options: [
      {
        value: 'window_only',
        label: 'Window ventilation only',
        description: 'Natural ventilation through window',
        qualityLevel: 'budget',
        qualityDescription: 'Natural ventilation - no mechanical system, relies on opening windows, only suitable if bathroom has external window'
      },
      {
        value: 'basic_exhaust',
        label: 'Basic exhaust fan',
        description: 'Simple wall or ceiling-mounted fan',
        qualityLevel: 'budget',
        qualityDescription: 'Basic mechanical ventilation - simple fan, manually controlled, removes moisture and odors'
      },
      {
        value: 'humidity_sensor',
        label: 'Humidity sensor fan',
        description: 'Automatically turns on when humidity rises',
        qualityLevel: 'standard',
        qualityDescription: 'Smart humidity-controlled fan - automatically activates when moisture detected, energy-efficient, prevents mold'
      },
      {
        value: 'timer_fan',
        label: 'Timer-controlled fan',
        description: 'Runs for set time after bathroom use',
        qualityLevel: 'standard',
        qualityDescription: 'Timer-based fan - continues running after light switch off, ensures complete moisture removal'
      },
      {
        value: 'heat_recovery',
        label: 'Heat recovery ventilation (HRV)',
        description: 'Energy-efficient, recovers warmth from exhaust air',
        qualityLevel: 'premium',
        qualityDescription: 'Premium HRV system - recovers heat from outgoing air, energy-efficient, ideal for passive houses and modern builds'
      }
    ]
  },
  {
    id: 'ventilationCapacity',
    label: 'Fan Capacity (if mechanical ventilation selected)',
    type: 'radio',
    required: false,
    description: 'Choose ventilation capacity based on bathroom size (measured in cubic meters per hour)',
    allowOther: true,
    otherPlaceholder: 'Custom capacity...',
    options: [
      {
        value: 'small',
        label: 'Small bathroom (up to 4m²) - 80m³/h',
        description: 'For compact bathrooms and powder rooms',
        qualityLevel: 'standard',
        qualityDescription: 'Suitable for small bathrooms - adequate air exchange for spaces up to 4 square meters'
      },
      {
        value: 'medium',
        label: 'Medium bathroom (4-8m²) - 120m³/h',
        description: 'For standard family bathrooms',
        qualityLevel: 'standard',
        qualityDescription: 'Most common choice - suitable for typical family bathrooms with shower or bath'
      },
      {
        value: 'large',
        label: 'Large bathroom (8m²+) - 180m³/h or more',
        description: 'For larger bathrooms or wet rooms',
        qualityLevel: 'standard',
        qualityDescription: 'Higher capacity - needed for large master bathrooms, wet rooms, or bathrooms with multiple fixtures'
      }
    ]
  }
];

// SECTION 13: Accessories (Conditional - if accessories selected)
export const ACCESSORIES_QUESTIONS: Question[] = [
  {
    id: 'accessoriesWanted',
    label: 'Which accessories do you want?',
    type: 'multiselect',
    required: true,
    sectionTitle: 'Accessories',
    description: 'Select bathroom accessories',
    options: [
      { value: 'towel_bars', label: 'Towel bars', description: 'Standard towel racks' },
      { value: 'heated_towel', label: 'Heated towel rail', description: 'Warming towel rack' },
      { value: 'toilet_paper', label: 'Toilet paper holder', description: 'TP holder' },
      { value: 'shelves', label: 'Shelves', description: 'Storage shelves' },
      { value: 'grab_bars', label: 'Grab bars', description: 'Safety rails' }
    ]
  }
];

// SECTION 14: Waterproofing (Conditional - if waterproofing selected)
export const WATERPROOFING_QUESTIONS: Question[] = [
  {
    id: 'waterproofingRequired',
    label: 'Waterproofing required?',
    type: 'radio',
    required: true,
    sectionTitle: 'Waterproofing',
    description: 'Need waterproofing work?',
    options: [
      { value: 'full', label: 'Yes, full waterproofing', description: 'Entire bathroom' },
      { value: 'shower_only', label: 'Only shower area', description: 'Just shower' },
      { value: 'floor_only', label: 'Only floor', description: 'Floor waterproofing' },
      { value: 'expert_advice', label: 'Not sure, need expert advice', description: 'Get recommendation' },
      { value: 'no', label: 'No', description: 'Not needed' }
    ]
  },
  {
    id: 'waterproofingIssues',
    label: 'Existing waterproofing issues?',
    type: 'multiselect',
    required: false,
    description: 'Current moisture problems',
    options: [
      { value: 'leakage_downstairs', label: 'Water leakage to downstairs', description: 'Leaking to below' },
      { value: 'damp_walls', label: 'Damp / wet walls', description: 'Moisture in walls' },
      { value: 'cracked_tiles', label: 'Cracked tiles', description: 'Tile damage' },
      { value: 'mold', label: 'Mold / fungus on walls or floor', description: 'Mold growth' },
      { value: 'bad_smell', label: 'Bad smell from wet areas', description: 'Odor issues' },
      { value: 'no_issues', label: 'No issues', description: 'All good' },
      { value: 'not_sure', label: 'Not sure', description: 'Need inspection' }
    ]
  },
  {
    id: 'waterproofingPreference',
    label: 'Waterproofing preference',
    type: 'radio',
    required: false,
    description: 'Quality level wanted',
    options: [
      { value: 'standard', label: 'Standard waterproofing', description: 'Basic protection' },
      { value: 'high_grade', label: 'High-grade waterproofing', description: 'Premium quality' },
      { value: 'suggest', label: 'Not sure — suggest best option', description: 'Get recommendation' }
    ]
  }
];

// Combine all questions for easy access
export const BATHROOM_QUESTIONS: Question[] = [
  ...BATHROOM_AREA_SELECTION
];

// Map renovation types to their specific questions
export const RENOVATION_QUESTIONS: Record<string, Question[]> = {
  bathroom: BATHROOM_QUESTIONS,
  // Add more renovation types here later
};

// Removed: FINANCING_OPTIONS - Not needed anymore

// Removed: AI_CONFIG - All AI calls now go through backend

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_FORM_DATA: FormData = {
  renovationType: ''
};


// Removed: UI Constants for financing types - Not needed anymore