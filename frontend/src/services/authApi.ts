const API_BASE_URL = "http://localhost:8000/api";

export interface User {
	id: number;
	username: string;
	email: string;
	first_name?: string;
	last_name?: string;
}

export interface LoginCredentials {
	username: string;
	password: string;
}

export interface RegisterData {
	username: string;
	email: string;
	password: string;
	password_confirm: string;
	first_name?: string;
	last_name?: string;
}

function getCsrfToken(): string {
	// Try to get CSRF token from cookies
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
	return cookieValue || "";
}

async function ensureCsrfToken(): Promise<string> {
	let token = getCsrfToken();
	if (!token) {
		// Fetch CSRF token from Django
		try {
			const response = await fetch(`${API_BASE_URL}/auth/csrf/`, {
				method: "GET",
				credentials: "include",
			});
			const data = await response.json();
			token = data.csrfToken;
		} catch (error) {
			console.error("Failed to get CSRF token:", error);
		}
	}
	return token;
}

async function handleResponse<T>(response: Response): Promise<T> {
	if (!response.ok) {
		const error = await response.json().catch(() => ({
			message: `HTTP error! status: ${response.status}`,
		}));
		throw new Error(error.message || error.detail || `HTTP error! status: ${response.status}`);
	}
	return response.json();
}

export const authApi = {
	async login(credentials: LoginCredentials): Promise<{ user: User; message: string }> {
		const csrfToken = await ensureCsrfToken();
		const response = await fetch(`${API_BASE_URL}/auth/login/`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": csrfToken,
			},
			credentials: "include",
			body: JSON.stringify(credentials),
		});
		return handleResponse<{ user: User; message: string }>(response);
	},

	async logout(): Promise<{ message: string }> {
		const csrfToken = await ensureCsrfToken();
		const response = await fetch(`${API_BASE_URL}/auth/logout/`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": csrfToken,
			},
			credentials: "include",
		});
		return handleResponse<{ message: string }>(response);
	},

	async register(userData: RegisterData): Promise<{ user: User; message: string }> {
		const csrfToken = await ensureCsrfToken();
		const response = await fetch(`${API_BASE_URL}/auth/register/`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": csrfToken,
			},
			credentials: "include",
			body: JSON.stringify(userData),
		});
		return handleResponse<{ user: User; message: string }>(response);
	},

	async getCurrentUser(): Promise<{ user: User }> {
		const response = await fetch(`${API_BASE_URL}/auth/user/`, {
			method: "GET",
			credentials: "include",
		});
		return handleResponse<{ user: User }>(response);
	},

	async checkAuthStatus(): Promise<{ authenticated: boolean; user?: User }> {
		const response = await fetch(`${API_BASE_URL}/auth/status/`, {
			method: "GET",
			credentials: "include",
		});
		return handleResponse<{ authenticated: boolean; user?: User }>(response);
	},
};

