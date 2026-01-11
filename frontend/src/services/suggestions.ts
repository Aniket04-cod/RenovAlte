const API_BASE = "http://localhost:8000/api/renovation";

// Helper function to get CSRF token from cookies
function getCSRFToken(): string | null {
  const name = "csrftoken";
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export interface Suggestion {
  id: number;
  icon: string;
  text: string;
  priority: "high" | "medium" | "low";
  color: string;
  bgColor: string;
}

export interface SuggestionsContext {
  building_type?: string;
  budget?: number;
  location?: string;
  goals?: string[];
  renovation_specification?: string;
  renovation_standard?: string;
  current_question?: string;
  dynamic_answers?: Record<string, any>;
}

export const suggestionsApi = {
  /**
   * Get dynamic AI suggestions based on context
   */
  getSuggestions: async (context: SuggestionsContext): Promise<Suggestion[]> => {
    try {
      const csrfToken = getCSRFToken();

      const response = await fetch(`${API_BASE}/suggestions/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
        body: JSON.stringify({ context }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      // Return default suggestions on error
      return [
        {
          id: 1,
          icon: "AlertCircle",
          text: "Check permit requirements for your area",
          priority: "high",
          color: "text-rose-600",
          bgColor: "bg-rose-50",
        },
        {
          id: 2,
          icon: "Lightbulb",
          text: "Consider energy efficiency upgrades",
          priority: "medium",
          color: "text-amber-600",
          bgColor: "bg-amber-50",
        },
        {
          id: 3,
          icon: "TrendingUp",
          text: "Explore KfW funding programs",
          priority: "high",
          color: "text-emerald-600",
          bgColor: "bg-emerald-50",
        },
        {
          id: 4,
          icon: "Sparkles",
          text: "Schedule an energy audit",
          priority: "medium",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
        },
      ];
    }
  },
};