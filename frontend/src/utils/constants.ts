export const RENOVATIONGOALS = [
  "Energy Efficiency",
  "Insulation",
  "Windows & Doors",
  "Heating System",
  "Solar Panels",
  "Bathroom",
  "Kitchen",
  "Roof",
];

export const HEATING_SYSTEM_OPTIONS = [
  { value: "gas", label: "Gas" },
  { value: "oil", label: "Oil" },
  { value: "electric", label: "Electric" },
  { value: "heat-pump", label: "Heat Pump" },
  { value: "district-heating", label: "District Heating" },
  { value: "other", label: "Other" },
];

export const INSULATION_OPTIONS = [
  { value: "none", label: "None" },
  { value: "partial", label: "Partial (specify area like roof/attic)" },
  { value: "full", label: "Full" },
];

export const BUILDING_TYPES = [
  { value: "single-family", label: "Single Family Home" },
  { value: "multi-family", label: "Multi-Family Home" },
  { value: "apartment", label: "Apartment" },
  { value: "commercial", label: "Commercial Building" },
  { value: "villa", label: "Villa" },
  { value: "office", label: "Office" },
];

export const BUNDESLAND = [
  { value: "baden-wurttemberg", label: "Baden-Württemberg" },
  { value: "bavaria", label: "Bavaria (Bayern)" },
  { value: "berlin", label: "Berlin" },
  { value: "brandenburg", label: "Brandenburg" },
  { value: "bremen", label: "Bremen" },
  { value: "hamburg", label: "Hamburg" },
  { value: "hesse", label: "Hesse (Hessen)" },
  {
    value: "mecklenburg-vorpommern",
    label: "Mecklenburg-Vorpommern",
  },
  {
    value: "lower-saxony",
    label: "Lower Saxony (Niedersachsen)",
  },
  {
    value: "north-rhine-westphalia",
    label: "North Rhine-Westphalia (Nordrhein-Westfalen)",
  },
  {
    value: "rhineland-palatinate",
    label: "Rhineland-Palatinate (Rheinland-Pfalz)",
  },
  { value: "saarland", label: "Saarland" },
  { value: "saxony", label: "Saxony (Sachsen)" },
  {
    value: "saxony-anhalt",
    label: "Saxony-Anhalt (Sachsen-Anhalt)",
  },
  { value: "schleswig-holstein", label: "Schleswig-Holstein" },
  { value: "thuringia", label: "Thuringia (Thüringen)" },
  { value: "north-rhine-westphalia", label: "North Rhine-Westphalia (Nordrhein-Westfalen)" },
  { value: "rhineland-palatinate", label: "Rhineland-Palatinate (Rheinland-Pfalz)" },
  { value: "saarland", label: "Saarland" },
];

export const WINDOWS_TYPE_OPTIONS = [
  { value: "single-pane", label: "Single-pane" },
  { value: "double-pane", label: "Double-pane (older)" },
  { value: "triple-pane", label: "Triple-pane (modern)" },
  { value: "mixed", label: "Mixed" },
];

export const NEIGHBOR_IMPACTS_OPTIONS = [
  { value: "scaffolding", label: "Scaffolding over neighbor property" },
  { value: "noise", label: "Noise disruption" },
  { value: "access", label: "Access restrictions" },
  { value: "none", label: "None" },
];

export const FINANCING_PREFERENCE_OPTIONS = [
  { value: "personal-savings", label: "Personal savings" },
  { value: "bank-loan", label: "Bank loan" },
  { value: "kfw-loan", label: "KfW loan" },
  { value: "mixed", label: "Mixed Financing" },
];

export const INCENTIVE_INTENT_OPTIONS = [
  { value: "yes", label: "Yes, planning to apply" },
  { value: "yes-applied", label: "Yes, already applied" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Unsure" },
];

export const HERITAGE_PROTECTION = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Unsure" },
];

export const LIVING_DURING_RENOVATION_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "partial", label: "Partially" },
];

export const ENERGY_CERTIFICATE_RATING_OPTIONS = [
  { value: "a_plus", label: "A+" },
  { value: "a", label: "A" },
  { value: "b", label: "B" },
  { value: "c", label: "C" },
  { value: "d", label: "D" },
  { value: "e", label: "E" },
  { value: "f", label: "F" },
  { value: "g", label: "G" },
  { value: "h", label: "H" },
  { value: "not-available", label: "Not Available" },
];

export const KNOWN_MAJOR_ISSUES_OPTIONS = [
  { value: "mold", label: "Mold" },
  { value: "water-damage", label: "Water damage" },
  { value: "structural-cracks", label: "Structural cracks" },
  { value: "roof-leaks", label: "Roof leaks" },
  { value: "none", label: "None" },
];

export const SURVEYS_REQUIRED_OPTIONS = [
  { value: "energy-audit", label: "Energy Audit" },
  { value: "structural-assessment", label: "Structural Assessment" },
  { value: "asbestos-survey", label: "Asbestos Survey" },
  { value: "none", label: "None" },
  { value: "unsure", label: "Unsure" },
];
