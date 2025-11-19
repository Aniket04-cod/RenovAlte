/**
 * Constants for the Financing module
 * Centralized configuration and static data
 */

import { FinancingOption, SelectOption, FormData } from '../types/financing.types';
// Import PROJECT_TYPES from projects service to ensure consistency
import { PROJECT_TYPES } from '../services/projects';

// ============================================================================
// Form Options
// ============================================================================

// Use the EXACT same project types as the Project creation form
// This ensures perfect 1:1 mapping when auto-filling from a selected project
export const RENOVATION_TYPE_OPTIONS: SelectOption[] = PROJECT_TYPES;

export const BUDGET_OPTIONS: SelectOption[] = [
  { value: 'under-10k', label: 'Under €10,000' },
  { value: '10k-30k', label: '€10,000 - €30,000' },
  { value: '30k-50k', label: '€30,000 - €50,000' },
  { value: '50k-100k', label: '€50,000 - €100,000' },
  { value: 'over-100k', label: 'Over €100,000' }
];

export const PROPERTY_TYPE_OPTIONS: SelectOption[] = [
  { value: 'house', label: 'Single-family House' },
  { value: 'apartment', label: 'Apartment/Condo' },
  { value: 'multi-family', label: 'Multi-family House' }
];

export const INCOME_OPTIONS: SelectOption[] = [
  { value: 'low', label: 'Under €2,000/month' },
  { value: 'medium-low', label: '€2,000 - €3,500/month' },
  { value: 'medium', label: '€3,500 - €5,000/month' },
  { value: 'medium-high', label: '€5,000 - €7,500/month' },
  { value: 'high', label: 'Over €7,500/month' }
];

export const PROPERTY_CONDITION_OPTIONS: SelectOption[] = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'average', label: 'Average' },
  { value: 'poor', label: 'Poor' }
];

export const TIMELINE_OPTIONS: SelectOption[] = [
  { value: 'immediate', label: 'Start immediately' },
  { value: '1-3 months', label: '1-3 months' },
  { value: '3-6 months', label: '3-6 months' },
  { value: '6-12 months', label: '6-12 months' }
];

export const CREDIT_SCORE_OPTIONS: SelectOption[] = [
  { value: 'excellent', label: 'Excellent (97-100%) - Best rates' },
  { value: 'good', label: 'Very Good (95-96%) - Approved' },
  { value: 'fair', label: 'Good (90-94%) - May be approved' },
  { value: 'poor', label: 'Fair/Poor (<90%) - Difficult' },
  { value: 'unknown', label: "I don't know my SCHUFA score" }
];

// ============================================================================
// Step 2: Property Details Options
// ============================================================================

export const PROPERTY_AGE_OPTIONS: SelectOption[] = [
  { value: 'under-5', label: 'Under 5 years (Not eligible for most programs)' },
  { value: '5-10', label: '5-10 years old' },
  { value: '10-20', label: '10-20 years old' },
  { value: '20-30', label: '20-30 years old' },
  { value: 'pre-1977', label: 'Built before 1977 (Requires Demand Certificate)' },
  { value: 'dont-know', label: "I don't know" }
];

export const PROPERTY_SIZE_OPTIONS: SelectOption[] = [
  { value: 'under-50', label: 'Under 50 sqm' },
  { value: '50-80', label: '50-80 sqm' },
  { value: '80-120', label: '80-120 sqm' },
  { value: '120-150', label: '120-150 sqm' },
  { value: '150-200', label: '150-200 sqm' },
  { value: 'over-200', label: 'Over 200 sqm' }
];

export const PROPERTY_CONDITION_EXTENDED_OPTIONS: SelectOption[] = [
  { value: 'excellent', label: 'Excellent - Recently renovated' },
  { value: 'good', label: 'Good - Well maintained' },
  { value: 'average', label: 'Average - Normal wear and tear' },
  { value: 'poor', label: 'Poor - Needs renovation' },
  { value: 'very-poor', label: 'Very Poor - Major renovation needed' }
];

export const GERMAN_STATES_OPTIONS: SelectOption[] = [
  { value: 'bw', label: 'Baden-Württemberg' },
  { value: 'by', label: 'Bavaria (Bayern)' },
  { value: 'be', label: 'Berlin' },
  { value: 'bb', label: 'Brandenburg' },
  { value: 'hb', label: 'Bremen' },
  { value: 'hh', label: 'Hamburg' },
  { value: 'he', label: 'Hesse (Hessen)' },
  { value: 'mv', label: 'Mecklenburg-Vorpommern' },
  { value: 'ni', label: 'Lower Saxony (Niedersachsen)' },
  { value: 'nw', label: 'North Rhine-Westphalia (NRW)' },
  { value: 'rp', label: 'Rhineland-Palatinate (Rheinland-Pfalz)' },
  { value: 'sl', label: 'Saarland' },
  { value: 'sn', label: 'Saxony (Sachsen)' },
  { value: 'st', label: 'Saxony-Anhalt (Sachsen-Anhalt)' },
  { value: 'sh', label: 'Schleswig-Holstein' },
  { value: 'th', label: 'Thuringia (Thüringen)' }
];

export const PROPERTY_USE_OPTIONS: SelectOption[] = [
  { value: 'owner-occupied', label: 'Owner-occupied (I live here) - 5% bonus' },
  { value: 'rental', label: 'Rental property (Rented out)' },
  { value: 'mixed', label: 'Mixed use (Partially rented)' }
];

export const RESIDENTIAL_UNITS_OPTIONS: SelectOption[] = [
  { value: '1', label: '1 unit (Single-family home/apartment)' },
  { value: '2', label: '2 units (Duplex)' },
  { value: '3-4', label: '3-4 units' },
  { value: '5-10', label: '5-10 units' },
  { value: 'over-10', label: 'Over 10 units' }
];

export const ENERGY_RATING_OPTIONS: SelectOption[] = [
  { value: 'a-plus', label: 'A+ (Best)' },
  { value: 'a', label: 'A (Excellent)' },
  { value: 'b', label: 'B (Very Good)' },
  { value: 'c', label: 'C (Good)' },
  { value: 'd', label: 'D (Average)' },
  { value: 'e', label: 'E (Below Average)' },
  { value: 'f', label: 'F (Poor)' },
  { value: 'g', label: 'G (Very Poor)' },
  { value: 'h', label: 'H (Worst)' },
  { value: 'unknown', label: "I don't know" }
];

export const YES_NO_UNKNOWN_OPTIONS: SelectOption[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unknown', label: "I don't know" }
];

// ============================================================================
// Step 3: Financial Information Options
// ============================================================================

export const ANNUAL_INCOME_OPTIONS: SelectOption[] = [
  { value: 'under-30k', label: 'Under €30,000' },
  { value: '30k-50k', label: '€30,000 - €50,000' },
  { value: '50k-70k', label: '€50,000 - €70,000' },
  { value: '70k-90k', label: '€70,000 - €90,000 ⭐ KfW 358 threshold' },
  { value: 'over-90k', label: 'Over €90,000' }
];

export const AVAILABLE_SAVINGS_OPTIONS: SelectOption[] = [
  { value: 'under-5k', label: 'Under €5,000' },
  { value: '5k-15k', label: '€5,000 - €15,000' },
  { value: '15k-30k', label: '€15,000 - €30,000' },
  { value: '30k-50k', label: '€30,000 - €50,000' },
  { value: 'over-50k', label: 'Over €50,000' }
];

export const EXISTING_DEBTS_OPTIONS: SelectOption[] = [
  { value: 'none', label: 'No existing debts' },
  { value: 'under-50k', label: 'Under €50,000' },
  { value: '50k-150k', label: '€50,000 - €150,000' },
  { value: '150k-300k', label: '€150,000 - €300,000' },
  { value: 'over-300k', label: 'Over €300,000' }
];

export const MONTHLY_DEBT_OPTIONS: SelectOption[] = [
  { value: 'none', label: 'None' },
  { value: 'under-500', label: 'Under €500/month' },
  { value: '500-1000', label: '€500 - €1,000/month' },
  { value: '1000-2000', label: '€1,000 - €2,000/month' },
  { value: 'over-2000', label: 'Over €2,000/month' }
];

export const EMPLOYMENT_STATUS_OPTIONS: SelectOption[] = [
  { value: 'permanent', label: 'Permanently employed' },
  { value: 'self-employed', label: 'Self-employed (Need 3 years tax returns)' },
  { value: 'temporary', label: 'Temporary contract' },
  { value: 'retired', label: 'Retired/Pension' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'other', label: 'Other' }
];

export const CO_APPLICANT_OPTIONS: SelectOption[] = [
  { value: 'yes-with-income', label: 'Yes, with additional income' },
  { value: 'yes-no-income', label: 'Yes, but no additional income' },
  { value: 'no', label: 'No co-applicant' },
  { value: 'prefer-not-say', label: 'Prefer not to say' }
];

// ============================================================================
// Step 4: Energy & Technical Options
// ============================================================================

export const HEATING_SYSTEM_OPTIONS: SelectOption[] = [
  { value: 'gas-boiler', label: 'Gas boiler' },
  { value: 'oil-boiler', label: 'Oil boiler (High replacement subsidy)' },
  { value: 'electric', label: 'Electric heating' },
  { value: 'district-heating', label: 'District heating (Fernwärme)' },
  { value: 'heat-pump', label: 'Heat pump (Already efficient)' },
  { value: 'biomass', label: 'Biomass/Pellet' },
  { value: 'solar-thermal', label: 'Solar thermal' },
  { value: 'unknown', label: "I don't know" }
];

export const HEATING_AGE_OPTIONS: SelectOption[] = [
  { value: '0-10', label: '0-10 years' },
  { value: '10-20', label: '10-20 years' },
  { value: 'over-20', label: 'Over 20 years (May be mandatory to replace)' },
  { value: 'unknown', label: "I don't know" }
];

export const PLANNED_MEASURES_OPTIONS: SelectOption[] = [
  { value: 'insulation', label: 'Insulation (walls/roof/floor)' },
  { value: 'windows-doors', label: 'Windows and doors' },
  { value: 'heating-system', label: 'Heating system replacement' },
  { value: 'solar-panels', label: 'Solar panels (PV)' },
  { value: 'ventilation', label: 'Ventilation system' },
  { value: 'multiple-measures', label: 'Multiple measures (Best subsidy)' },
  { value: 'complete-renovation', label: 'Complete energy renovation' }
];

export const TARGET_EFFICIENCY_OPTIONS: SelectOption[] = [
  { value: 'eh-40', label: 'Efficiency House 40 (Best - €75,000 grant)' },
  { value: 'eh-55', label: 'Efficiency House 55 (€56,250 grant)' },
  { value: 'eh-70', label: 'Efficiency House 70 (€45,000 grant)' },
  { value: 'eh-85', label: 'Efficiency House 85 (€37,500 grant)' },
  { value: 'eh-100', label: 'Efficiency House 100' },
  { value: 'individual-measures', label: 'Individual measures only (15% BAFA)' },
  { value: 'unknown', label: "I don't know yet" }
];

export const ENERGY_CONSULTANT_OPTIONS: SelectOption[] = [
  { value: 'yes', label: 'Yes, already hired' },
  { value: 'no-will-hire', label: 'No, but will hire (Required for KfW/BAFA)' },
  { value: 'no-need-recommendation', label: 'No, need recommendation' },
  { value: 'unknown', label: "I don't know if I need one" }
];

// ============================================================================
// Step 5: Timeline & Planning Options
// ============================================================================

export const PROJECT_START_OPTIONS: SelectOption[] = [
  { value: 'ready', label: 'Not started, ready to apply ✅' },
  { value: 'need-quotes', label: 'Not started, need contractor quotes' },
  { value: 'already-started', label: 'Already started (last 3 months) ⚠️' },
  { value: 'already-completed', label: 'Already completed ❌ Not eligible' },
  { value: 'planning-ahead', label: 'Planning 6+ months ahead' }
];

export const RENOVATION_DURATION_OPTIONS: SelectOption[] = [
  { value: 'under-3-months', label: 'Under 3 months' },
  { value: '3-6-months', label: '3-6 months' },
  { value: '6-12-months', label: '6-12 months' },
  { value: '1-2-years', label: '1-2 years' },
  { value: 'over-2-years', label: 'Over 2 years' },
  { value: 'not-sure', label: 'Not sure yet' }
];

export const CONTRACTOR_QUOTES_OPTIONS: SelectOption[] = [
  { value: 'yes-multiple', label: 'Yes, have multiple quotes (Best)' },
  { value: 'yes-one', label: 'Yes, have one quote' },
  { value: 'in-progress', label: 'Getting quotes now' },
  { value: 'not-yet', label: 'Not yet' },
  { value: 'unknown', label: "I don't know I need them" }
];

export const URGENCY_OPTIONS: SelectOption[] = [
  { value: 'emergency', label: 'Emergency/Urgent' },
  { value: 'this-year', label: 'This year' },
  { value: 'next-6-12-months', label: 'Next 6-12 months' },
  { value: 'planning', label: 'Planning phase' },
  { value: 'no-rush', label: 'No rush' }
];

// ============================================================================
// Step 6: Personal & Documentation Options
// ============================================================================

export const AGE_OPTIONS: SelectOption[] = [
  { value: 'under-30', label: 'Under 30' },
  { value: '30-45', label: '30-45' },
  { value: '45-60', label: '45-60' },
  { value: '60-70', label: '60-70 (Accessibility grants available)' },
  { value: 'over-70', label: 'Over 70 (Accessibility grants available)' },
  { value: 'prefer-not-say', label: 'Prefer not to say' }
];

export const HOUSEHOLD_SIZE_OPTIONS: SelectOption[] = [
  { value: '1', label: '1 person' },
  { value: '2', label: '2 people' },
  { value: '3-4', label: '3-4 people' },
  { value: '5+', label: '5 or more people' }
];

export const RESIDENCE_STATUS_OPTIONS: SelectOption[] = [
  { value: 'german-citizen', label: 'German citizen' },
  { value: 'eu-citizen', label: 'EU citizen' },
  { value: 'permanent-resident', label: 'Permanent residence permit' },
  { value: 'blue-card', label: 'EU Blue Card (Higher interest rates)' },
  { value: 'temporary', label: 'Temporary permit' },
  { value: 'other', label: 'Other' }
];

export const TAX_RESIDENT_OPTIONS: SelectOption[] = [
  { value: 'yes-filed', label: 'Yes, filed last 2 years (2022 & 2023)' },
  { value: 'yes-not-filed', label: 'Yes, but not filed yet' },
  { value: 'no', label: 'No' },
  { value: 'not-sure', label: 'Not sure' }
];

export const DOCUMENT_READY_OPTIONS: SelectOption[] = [
  { value: 'yes', label: 'Yes, have everything ready' },
  { value: 'partial', label: 'Partially ready' },
  { value: 'no', label: 'No, need to gather documents' },
  { value: 'self-employed', label: 'Self-employed (have tax returns)' },
  { value: 'unknown', label: "I don't know what's needed" }
];

export const PROPERTY_DOCS_OPTIONS: SelectOption[] = [
  { value: 'yes-all', label: 'Yes, have all documents (Grundbuchauszug, etc.)' },
  { value: 'yes-partial', label: 'Yes, have some documents' },
  { value: 'no', label: 'No, need to request' },
  { value: 'unknown', label: "I don't know what's needed" }
];

export const READY_TO_APPLY_OPTIONS: SelectOption[] = [
  { value: 'ready-now', label: 'Ready to apply now ✅' },
  { value: '1-2-weeks', label: 'Need 1-2 weeks to prepare' },
  { value: '1-3-months', label: 'Need 1-3 months to prepare' },
  { value: 'researching', label: 'Still researching options' },
  { value: 'not-sure', label: 'Not sure' }
];

// ============================================================================
// Financing Options Database
// ============================================================================

export const FINANCING_OPTIONS: FinancingOption[] = [
  {
    id: 'kfw-261',
    name: 'KfW 261 - Residential Building Credit',
    type: 'loan',
    provider: 'KfW Bank',
    description: 'Low-interest loan for energy-efficient renovation and construction',
    eligibility: ['Homeowners', 'First-time buyers', 'Landlords'],
    interestRate: '0.01% - 1.5%',
    maxAmount: '€150,000',
    renovationTypes: ['electrical', 'hvac', 'plumbing', 'windows_doors', 'roofing', 'general'],
    incomeRequirement: 'all',
    link: 'https://www.kfw.de/inlandsfoerderung/Privatpersonen/Bestehende-Immobilie/Energieeffizient-sanieren/',
    advantages: ['Very low interest rates', 'Long repayment terms', 'Grant option available']
  },
  {
    id: 'kfw-262',
    name: 'KfW 262 - Renovation Grant',
    type: 'grant',
    provider: 'KfW Bank',
    description: 'Direct grant for energy-efficient renovations, no repayment required',
    eligibility: ['Homeowners', 'Landlords'],
    maxAmount: '€75,000',
    renovationTypes: ['electrical', 'hvac', 'plumbing', 'windows_doors', 'roofing'],
    incomeRequirement: 'all',
    link: 'https://www.kfw.de/inlandsfoerderung/Privatpersonen/Bestehende-Immobilie/Energieeffizient-sanieren/',
    advantages: ['No repayment needed', 'Up to 50% subsidy', 'Combined with loan possible']
  },
  {
    id: 'kfw-270',
    name: 'KfW 270 - Energy Efficient Construction',
    type: 'loan',
    provider: 'KfW Bank',
    description: 'Loan for purchasing and constructing energy-efficient homes',
    eligibility: ['First-time buyers', 'Homeowners'],
    interestRate: '0.75% - 2.5%',
    maxAmount: '€120,000',
    renovationTypes: ['general', 'electrical', 'hvac', 'roofing', 'windows_doors'],
    incomeRequirement: 'all',
    link: 'https://www.kfw.de/inlandsfoerderung/Privatpersonen/Neubau/',
    advantages: ['Low interest rate', 'Long-term financing', 'Flexible repayment']
  },
  {
    id: 'bafa-heating',
    name: 'BAFA Heating Subsidy',
    type: 'grant',
    provider: 'BAFA (Federal Office)',
    description: 'Grant for replacing heating systems with renewable energy sources',
    eligibility: ['Homeowners', 'Landlords'],
    maxAmount: '€70,000',
    renovationTypes: ['hvac', 'plumbing', 'electrical'],
    incomeRequirement: 'all',
    link: 'https://www.bafa.de/',
    advantages: ['Up to 40% subsidy', 'Quick processing', 'Can be combined with KfW programs']
  },
  {
    id: 'regional-subsidy',
    name: 'Regional Renovation Subsidy',
    type: 'subsidy',
    provider: 'State/Municipal Government',
    description: 'Regional support programs for housing renovation (varies by state)',
    eligibility: ['Homeowners', 'Low-income households'],
    maxAmount: '€30,000',
    renovationTypes: ['bathroom', 'kitchen', 'basement', 'flooring', 'general'],
    incomeRequirement: 'medium-low',
    link: 'https://www.foerderdatenbank.de/',
    advantages: ['Local support', 'Flexible requirements', 'Can combine with federal programs']
  },
  {
    id: 'altersgerecht-umbauen',
    name: 'KfW 455-B - Age-Appropriate Conversion',
    type: 'grant',
    provider: 'KfW Bank',
    description: 'Grant for making homes accessible and barrier-free',
    eligibility: ['Homeowners', 'Tenants', 'Landlords'],
    maxAmount: '€6,250',
    renovationTypes: ['bathroom', 'general', 'flooring'],
    incomeRequirement: 'all',
    link: 'https://www.kfw.de/inlandsfoerderung/Privatpersonen/Bestehende-Immobilie/Altersgerecht-Umbauen/',
    advantages: ['No repayment', 'For all ages', 'Easy application']
  },
  {
    id: 'standard-home-loan',
    name: 'Standard Home Renovation Loan',
    type: 'loan',
    provider: 'Commercial Banks',
    description: 'Traditional bank loan for general home renovations',
    eligibility: ['Homeowners with good credit'],
    interestRate: '3% - 6%',
    maxAmount: '€100,000',
    renovationTypes: ['kitchen', 'bathroom', 'flooring', 'basement', 'exterior', 'general'],
    incomeRequirement: 'medium-high',
    link: '#',
    advantages: ['Flexible use', 'Quick approval', 'Available from most banks']
  },
  {
    id: 'windows-doors-program',
    name: 'Windows & Doors Renovation Program',
    type: 'subsidy',
    provider: 'Regional Energy Programs',
    description: 'Financial support for energy-efficient windows and doors installation',
    eligibility: ['Homeowners', 'Landlords'],
    maxAmount: '€40,000',
    renovationTypes: ['windows_doors', 'exterior'],
    incomeRequirement: 'all',
    link: 'https://www.kfw.de/',
    advantages: ['Significant subsidy', 'Reduce energy costs', 'Improve property value']
  }
];

// ============================================================================
// AI Configuration
// ============================================================================

export const AI_CONFIG = {
  GEMINI_MODEL: 'gemini-2.0-flash',
  API_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models',
  GENERATION_CONFIG: {
    temperature: 0.7,
    maxOutputTokens: 800,
    topP: 0.95,
    topK: 40
  },
  TIMEOUT_MS: 30000, // 30 seconds
  MAX_RETRIES: 2
};

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_FORM_DATA: FormData = {
  renovationType: '',
  estimatedBudget: '',
  propertyType: '',
  monthlyIncome: '',
  ownership: '',
  energyEfficiency: ''
};

// ============================================================================
// Budget Mapping (for calculations)
// ============================================================================

export const BUDGET_RANGES: Record<string, { min: number; max: number; default: number }> = {
  'under-10k': { min: 1000, max: 10000, default: 8000 },
  '10k-30k': { min: 10000, max: 30000, default: 20000 },
  '30k-50k': { min: 30000, max: 50000, default: 40000 },
  '50k-100k': { min: 50000, max: 100000, default: 75000 },
  'over-100k': { min: 100000, max: 300000, default: 150000 }
};

// ============================================================================
// UI Constants
// ============================================================================

export const FINANCING_TYPE_COLORS = {
  grant: 'bg-green-100 text-green-800 border-green-300',
  subsidy: 'bg-blue-100 text-blue-800 border-blue-300',
  loan: 'bg-purple-100 text-purple-800 border-purple-300'
};

export const FINANCING_TYPE_LABELS = {
  grant: 'Grant (No Repayment)',
  subsidy: 'Subsidy',
  loan: 'Loan'
};

export const MATCH_SCORE_COLORS = {
  high: 'text-green-600', // 80-100
  medium: 'text-blue-600', // 60-79
  low: 'text-amber-600' // 0-59
};