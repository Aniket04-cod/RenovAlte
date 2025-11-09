import { User } from "./authApi";

const API_BASE_URL = "http://localhost:8000/api";

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

export interface Project {
	id?: number;
	user?: User;
	name: string;
	project_type: string;
	location: string;
	city?: string;
	postal_code?: string;
	state?: string;
	budget: number | null;
	additional_information: string;
}

export interface ProjectType {
	value: string;
	label: string;
}

export const PROJECT_TYPES: ProjectType[] = [
	{ value: "kitchen", label: "Kitchen Renovation" },
	{ value: "bathroom", label: "Bathroom Renovation" },
	{ value: "basement", label: "Basement Renovation" },
	{ value: "roofing", label: "Roofing" },
	{ value: "electrical", label: "Electrical" },
	{ value: "plumbing", label: "Plumbing" },
	{ value: "hvac", label: "HVAC" },
	{ value: "flooring", label: "Flooring" },
	{ value: "windows_doors", label: "Windows/Doors" },
	{ value: "exterior", label: "Exterior" },
	{ value: "general", label: "General Renovation" },
];

async function handleResponse<T>(response: Response): Promise<T> {
	if (!response.ok) {
		// Handle 401 Unauthorized - user needs to re-authenticate
		if (response.status === 401) {
			// Clear any stored auth state and redirect to login
			if (typeof window !== "undefined") {
				window.location.href = "/login";
			}
		}
		const error = await response.json().catch(() => ({
			message: `HTTP error! status: ${response.status}`,
		}));
		throw new Error(error.message || `HTTP error! status: ${response.status}`);
	}
	return response.json();
}

export const projectApi = {
	async getAll(): Promise<Project[]> {
		const response = await fetch(`${API_BASE_URL}/projects/`, {
			credentials: "include",
		});
		return handleResponse<Project[]>(response);
	},

	async getById(id: number): Promise<Project> {
		const response = await fetch(`${API_BASE_URL}/projects/${id}/`, {
			credentials: "include",
		});
		return handleResponse<Project>(response);
	},

	async create(project: Omit<Project, "id">): Promise<Project> {
		const csrfToken = await ensureCsrfToken();
		const response = await fetch(`${API_BASE_URL}/projects/`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": csrfToken,
			},
			credentials: "include",
			body: JSON.stringify(project),
		});
		return handleResponse<Project>(response);
	},

	async update(id: number, project: Partial<Project>): Promise<Project> {
		const csrfToken = await ensureCsrfToken();
		const response = await fetch(`${API_BASE_URL}/projects/${id}/`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": csrfToken,
			},
			credentials: "include",
			body: JSON.stringify(project),
		});
		return handleResponse<Project>(response);
	},

	async delete(id: number): Promise<void> {
		const csrfToken = await ensureCsrfToken();
		const response = await fetch(`${API_BASE_URL}/projects/${id}/`, {
			method: "DELETE",
			headers: {
				"X-CSRFToken": csrfToken,
			},
			credentials: "include",
		});
		if (!response.ok) {
			throw new Error(`Failed to delete project: ${response.statusText}`);
		}
	},
};

export interface Contractor {
	id?: number;
	name: string;
	address: string;
	city: string;
	postal_code: string;
	state: string;
	phone: string;
	website: string;
	email: string;
	price_range: string;
	service_area: string;
	business_size: string;
	years_in_business: number | null;
	services: string;
	description: string;
	specializations: string;
	rating: number | null;
	reviews_count: number;
	certifications: string;
	kfw_eligible: boolean;
	source: string;
	additional_info: string;
	project_types: string;
}

export const contractorApi = {
	async getAll(
		projectType: string,
		city?: string,
		postal_code?: string,
		state?: string
	): Promise<Contractor[]> {
		const params = new URLSearchParams();
		params.append("project_type", projectType);
		if (city) {
			params.append("city", city);
		}
		if (postal_code) {
			params.append("postal_code", postal_code);
		}
		if (state) {
			params.append("state", state);
		}

		const response = await fetch(`${API_BASE_URL}/contractors/?${params.toString()}`, {
			credentials: "include",
		});
		return handleResponse<Contractor[]>(response);
	},
};

