/**
 * Google Places API Service
 *
 * This service fetches contractors (renovators, laborers, construction workers) from Google Places API
 * based on location and project type. It searches for relevant business types and returns structured data.
 */

import { Contractor } from "./contractors";
import { apiRequest } from "./http";

const GOOGLE_API_KEY = "AIzaSyBrLacBhn1dhVsLy1HF6Pc-gKCUOa7pXAA";

/**
 * Type definitions for Google Places API responses
 */
interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  review_count?: number;
  business_status?: string;
  types?: string[];
  opening_hours?: {
    open_now?: boolean;
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
    html_attributions: string[];
  }>;
}

interface PlacesResponse {
  results: GooglePlaceResult[];
  next_page_token?: string;
  status: string;
  error_message?: string;
}

interface PlaceDetailsResponse {
  result: GooglePlaceDetailsResult;
  status: string;
  error_message?: string;
}

interface GooglePlaceDetailsResult {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  url?: string;
  business_status?: string;
  formatted_phone?: string;
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  review_count?: number;
  types?: string[];
}

/**
 * Mapping of project types to relevant Google Places search queries
 */
const PROJECT_TYPE_TO_SEARCH_QUERIES: Record<string, string[]> = {
  kitchen: ["kitchen renovator", "kitchen remodeler", "cabinetry contractor"],
  bathroom: ["bathroom renovator", "bathroom remodeler", "plumber"],
  basement: [
    "basement finishing contractor",
    "basement renovation",
    "construction contractor",
  ],
  roofing: ["roofing contractor", "roof repair"],
  electrical: ["electrician", "electrical contractor"],
  plumbing: ["plumber", "plumbing contractor"],
  hvac: [
    "HVAC contractor",
    "heating and cooling",
    "air conditioning contractor",
  ],
  flooring: ["flooring contractor", "floor installer"],
  windows_doors: [
    "window contractor",
    "door contractor",
    "window installation",
  ],
  exterior: ["exterior contractor", "siding contractor", "masonry contractor"],
  general: ["general contractor", "construction contractor", "home renovation"],
};

/**
 * Type for contractor specialization mapping
 */
const SPECIALIZATION_KEYWORDS: Record<string, string[]> = {
  renovator: ["renovate", "remodel", "renovation", "remodeling"],
  builder: ["build", "construction", "contractor"],
  electrician: ["electrical", "wiring", "electric"],
  plumber: ["plumb", "pipe", "water"],
  carpenter: ["carpentry", "wood", "framing"],
  painter: ["painting", "paint"],
  mason: ["masonry", "brick", "stone", "concrete"],
};

/**
 * Get coordinates from address using Google Geocoding API
 */
async function getCoordinates(
  address: string,
  city: string,
  state: string,
  postalCode: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const payload = { address, city, state, postalCode };
    const data = await apiRequest<any>(`/google/geocode/`, {
      method: "POST",
      body: JSON.stringify(payload),
      requireCsrf: true,
    });

    if (!data) return null;
    if (data.status === "OK" && data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    }

    console.warn(
      "No results from geocoding:",
      data.status || data.error_message || data.error
    );
    return null;
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    return null;
  }
}

/**
 * Search for contractors near a location using specific query
 */
async function searchContractorsNearby(
  query: string,
  location: { lat: number; lng: number },
  radius: number = 15000 // 15km default radius
): Promise<GooglePlaceResult[]> {
  try {
    const payload = { location, radius, keyword: query };
    const data = await apiRequest<any>(`/google/nearby/`, {
      method: "POST",
      body: JSON.stringify(payload),
      requireCsrf: true,
    });

    if (!data) return [];
    if (data.status === "OK" && data.results) {
      return data.results as GooglePlaceResult[];
    }

    if (data.status === "ZERO_RESULTS") {
      console.warn(`No results for query: ${query}`);
      return [];
    }

    console.error(
      "Places API error:",
      data.error_message || data.status || data.error
    );
    return [];
  } catch (error) {
    console.error("Error searching contractors:", error);
    return [];
  }
}

/**
 * Get detailed information about a place
 */
async function getPlaceDetails(
  placeId: string
): Promise<GooglePlaceDetailsResult | null> {
  try {
    const payload = { place_id: placeId };
    const data = await apiRequest<any>(`/google/details/`, {
      method: "POST",
      body: JSON.stringify(payload),
      requireCsrf: true,
    });

    if (!data) return null;
    if (data.status === "OK" && data.result) {
      return data.result as GooglePlaceDetailsResult;
    }

    console.error(
      "Place details error:",
      data.error_message || data.status || data.error
    );
    return null;
  } catch (error) {
    console.error("Error fetching place details:", error);
    return null;
  }
}

/**
 * Extract specializations from place name and types
 */
function extractSpecializations(name: string, types: string[] = []): string {
  const specializations = new Set<string>();

  const nameLower = name.toLowerCase();

  // Check specialization keywords
  Object.entries(SPECIALIZATION_KEYWORDS).forEach(([spec, keywords]) => {
    if (keywords.some((keyword) => nameLower.includes(keyword))) {
      specializations.add(spec);
    }
  });

  // Check Google Places types
  types.forEach((type) => {
    const normalized = type.replace(/_/g, " ").toLowerCase();
    if (normalized.includes("electrician")) specializations.add("electrician");
    if (normalized.includes("plumber")) specializations.add("plumber");
    if (normalized.includes("painter")) specializations.add("painter");
    if (normalized.includes("carpenter")) specializations.add("carpenter");
  });

  return Array.from(specializations).join(", ") || "General Contractor";
}

/**
 * Convert Google Place to Contractor format
 */
function convertToContractor(
  place: GooglePlaceResult,
  details: GooglePlaceDetailsResult | null = null
): Contractor {
  // Helper: generate a numeric id from Google place_id so frontend can treat Google results like DB records
  function generateIdFromPlaceId(placeId: string): number {
    // simple DJB2 string hash -> positive integer
    let hash = 5381;
    for (let i = 0; i < placeId.length; i++) {
      hash = (hash * 33) ^ placeId.charCodeAt(i);
    }
    return Math.abs(hash >>> 0);
  }

  // Prefer details.formatted_address when available (more structured)
  const fullAddress =
    details?.formatted_address || place.formatted_address || "";

  // Try to extract city, state, postal using simple heuristics from the full address
  let city = "";
  let state = "";
  let postalCode = "";

  try {
    const parts = fullAddress
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    // Typical formatted_address ends with: 'City, ST ZIP' or 'City, ST ZIP, Country'
    const cityStatePart =
      parts.length >= 2 ? parts[parts.length - 2] : parts[0] || "";

    // cityStatePart might be 'City' or 'City ST ZIP' or 'City ST'
    const csTokens = cityStatePart.split(" ").filter(Boolean);
    if (csTokens.length >= 2) {
      // last token could be ZIP or state abbreviation
      const last = csTokens[csTokens.length - 1];
      const secondLast = csTokens[csTokens.length - 2];

      // If last token is all digits, treat as postal code
      if (/^\d{4,}$/.test(last)) {
        postalCode = last;
        state = secondLast || "";
        city = csTokens.slice(0, csTokens.length - 2).join(" ");
      } else if (
        /^[A-Za-z]{2,}$/.test(last) &&
        secondLast &&
        /^[A-Za-z]{2,}$/.test(secondLast) === false
      ) {
        // e.g. 'City State'
        state = last;
        city = csTokens.slice(0, csTokens.length - 1).join(" ");
      } else {
        // Fallback: last token might be state code
        state = last;
        city = csTokens.slice(0, csTokens.length - 1).join(" ");
      }
    } else if (parts.length >= 1) {
      city = parts[parts.length - 1] || "";
    }
  } catch (err) {
    // ignore parse errors and leave fields empty
  }

  const contractor: Contractor = {
    id: generateIdFromPlaceId(place.place_id),
    // keep original Google place_id for debugging/reference
    // @ts-ignore extra property (used only for debugging/traceability)
    place_id: place.place_id,
    name: place.name,
    address: fullAddress,
    city: city || "",
    postal_code: postalCode,
    state: state || "",
    phone:
      details?.formatted_phone_number ||
      details?.international_phone_number ||
      "",
    website: details?.website || "",
    email: "",
    price_range: "", // Google API doesn't provide this
    service_area: "15km", // Based on search radius
    business_size: "",
    years_in_business: null,
    services: place.name,
    description: place.name,
    specializations: extractSpecializations(place.name, place.types),
    rating: place.rating ? Number(place.rating) : null,
    reviews_count: (place.review_count as number) || 0,
    certifications: "",
    kfw_eligible: false,
    source: "Google Places",
    additional_info: `Business Status: ${
      details?.business_status || "Active"
    }, Open: ${place.opening_hours?.open_now ? "Yes" : "No"}`,
    project_types: "",
  };

  // Log converted contractor for easier debugging in browser console
  try {
    // Use console.debug to not be too noisy unless dev tools are open
    // eslint-disable-next-line no-console
    console.debug("Converted Google Place to contractor:", {
      place_id: place.place_id,
      name: contractor.name,
      city: contractor.city,
      state: contractor.state,
      postal_code: contractor.postal_code,
    });
  } catch (e) {
    // ignore
  }

  return contractor;
}

/**
 * Main function to fetch contractors from Google Places API
 */
export async function fetchContractorsFromGooglePlaces(
  projectType: string,
  address: string,
  city: string,
  state: string,
  postalCode: string
): Promise<Contractor[]> {
  try {
    // Debug: log incoming parameters
    // eslint-disable-next-line no-console
    console.debug("fetchContractorsFromGooglePlaces called with", {
      projectType,
      address,
      city,
      state,
      postalCode,
    });

    // Get coordinates for the address
    const coordinates = await getCoordinates(address, city, state, postalCode);

    if (!coordinates) {
      console.warn("Could not geocode address - no coordinates returned", {
        address,
        city,
        state,
        postalCode,
      });
      return [];
    }

    // Debug: log coordinates
    // eslint-disable-next-line no-console
    console.debug("Geocoding result coordinates:", coordinates);

    // Get search queries for project type
    const searchQueries =
      PROJECT_TYPE_TO_SEARCH_QUERIES[projectType.toLowerCase()] ||
      PROJECT_TYPE_TO_SEARCH_QUERIES["general"];

    // Fetch contractors for each search query
    const allContractors: Map<string, Contractor> = new Map(); // Use Map to deduplicate by place_id

    for (const query of searchQueries) {
      // eslint-disable-next-line no-console
      console.debug("Searching nearby with query:", query);
      const results = await searchContractorsNearby(query, coordinates);

      // eslint-disable-next-line no-console
      console.debug(
        `Nearby search for "${query}" returned ${results.length} results`
      );

      for (const place of results) {
        // Debug: log place ids/names
        // eslint-disable-next-line no-console
        console.debug("Found place:", {
          place_id: place.place_id,
          name: place.name,
        });

        // Skip if already fetched
        if (allContractors.has(place.place_id)) {
          continue;
        }

        // Get detailed information
        const details = await getPlaceDetails(place.place_id);

        // Convert to Contractor format
        const contractor = convertToContractor(place, details || undefined);
        allContractors.set(place.place_id, contractor);

        // Add small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    // eslint-disable-next-line no-console
    console.debug(
      "Total contractors converted from Google Places:",
      allContractors.size
    );

    return Array.from(allContractors.values());
  } catch (error) {
    console.error("Error fetching contractors from Google Places:", error);
    return [];
  }
}

export const googlePlacesService = {
  fetchContractorsFromGooglePlaces,
  getCoordinates,
  searchContractorsNearby,
  getPlaceDetails,
};
