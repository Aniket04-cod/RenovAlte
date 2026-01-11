const API_BASE = "http://localhost:8000/api/chatbot";

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

export interface ChatSession {
  id: number;
  title: string;
  session_type: string;
  is_active: boolean;
  is_plan_generated: boolean;
  message_count?: number;
  last_message?: string;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
  extracted_data?: Record<string, any>;
  messages?: ChatMessageType[];
}

export interface ChatMessageType {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface UserMemory {
  id: number;
  memory_type: string;
  key: string;
  value: string;
  confidence: number;
  created_at: string;
  updated_at: string;
}

export interface SendMessageResponse {
  response: string;
  session_id: number;
}

export interface ExtractAndGenerateResponse {
  success: boolean;
  extracted_data?: Record<string, any>;
  plan?: Record<string, any>;
  session_id?: number;
  error?: string;
}

export const chatbotApi = {
  /**
   * Send a message to the chatbot
   */
  sendMessage: async (
    message: string,
    sessionId?: number,
    image?: File
  ): Promise<SendMessageResponse> => {
    const formData = new FormData();
    formData.append("message", message);

    if (sessionId) {
      formData.append("session_id", sessionId.toString());
    }

    if (image) {
      formData.append("image", image);
    }

    const csrfToken = getCSRFToken();

    const response = await fetch(`${API_BASE}/message/`, {
      method: "POST",
      credentials: "include",
      headers: {
        ...(csrfToken && { "X-CSRFToken": csrfToken }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to send message");
    }

    return response.json();
  },

  /**
   * Get all chat sessions for current user
   */
  getSessions: async (activeOnly: boolean = true): Promise<ChatSession[]> => {
    const csrfToken = getCSRFToken();

    const response = await fetch(
      `${API_BASE}/sessions/?active_only=${activeOnly}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch sessions");
    }

    return response.json();
  },

  /**
   * Create a new chat session
   */
  createSession: async (): Promise<ChatSession> => {
    const csrfToken = getCSRFToken();

    const response = await fetch(`${API_BASE}/sessions/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken && { "X-CSRFToken": csrfToken }),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to create session");
    }

    return response.json();
  },

  /**
   * Get a specific session with all messages
   */
  getSession: async (sessionId: number): Promise<ChatSession> => {
    const csrfToken = getCSRFToken();

    const response = await fetch(`${API_BASE}/sessions/${sessionId}/`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken && { "X-CSRFToken": csrfToken }),
      },
    });

    if (!response.ok) {
      throw new Error("Session not found");
    }

    return response.json();
  },

  /**
   * Delete (deactivate) a session
   */
  deleteSession: async (sessionId: number): Promise<void> => {
    const csrfToken = getCSRFToken();

    const response = await fetch(`${API_BASE}/sessions/${sessionId}/`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken && { "X-CSRFToken": csrfToken }),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete session");
    }
  },

  /**
   * Extract data from chat and generate plan
   */
  extractAndGenerate: async (
    sessionId: number
  ): Promise<ExtractAndGenerateResponse> => {
    const csrfToken = getCSRFToken();

    const response = await fetch(`${API_BASE}/extract-and-generate/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken && { "X-CSRFToken": csrfToken }),
      },
      body: JSON.stringify({ session_id: sessionId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to extract and generate plan");
    }

    return data;
  },

  /**
   * Get user's memories
   */
  getMemories: async (): Promise<UserMemory[]> => {
    const csrfToken = getCSRFToken();

    const response = await fetch(`${API_BASE}/memory/`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken && { "X-CSRFToken": csrfToken }),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch memories");
    }

    return response.json();
  },

  /**
   * Clear all user memories
   */
  clearMemories: async (): Promise<void> => {
    const csrfToken = getCSRFToken();

    const response = await fetch(`${API_BASE}/memory/`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken && { "X-CSRFToken": csrfToken }),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to clear memories");
    }
  },
};