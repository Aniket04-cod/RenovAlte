import { API_BASE_URL } from "./http";

export interface ContractingPlanningRequest {
	project_id: number;
	description: string;
	files?: File[];
}

export interface ContractingPlanningFile {
	id: number;
	file: string;
	filename: string;
	uploaded_at: string;
}

export interface AIQuestionOption {
	id: string;
	text: string;
}

export interface AIQuestion {
	id: string;
	type: "multiple_choice" | "text_input";
	question: string;
	options?: AIQuestionOption[]; // Only for multiple_choice
	placeholder?: string; // Only for text_input
}

export interface UserAnswers {
	[questionId: string]: string; // Maps question ID to selected option ID (multiple_choice) or text response (text_input)
}

export interface ContractingPlanningResponse {
	id: number;
	project_id: number;
	description: string;
	files: ContractingPlanningFile[];
	ai_summary?: string | null;
	ai_questions?: AIQuestion[] | null;
	user_answers?: UserAnswers | null;
	current_step: number;
	created_at: string;
	updated_at: string;
}

export interface InvitationFile {
	id: number;
	filename: string;
	url: string;
}

export interface InvitationResponse {
	email_html: string;
	renovation_plan_html: string;
	relevant_files: InvitationFile[];
}

export type MessageAction = 
	| {
		id: number;
		action_type: 'send_email' | 'draft_email';
		action_status: 'pending' | 'approved' | 'rejected' | 'executed' | 'failed';
		action_data: {
			subject: string;
			body_html: string;
			recipient_email: string;
			reasoning: string;
		};
		action_summary: string;
		execution_result?: {
			message_id?: string;
			thread_id?: string;
			recipient?: string;
			subject?: string;
		} | null;
		created_at: string;
		updated_at: string;
	}
	| {
		id: number;
		action_type: 'fetch_email';
		action_status: 'pending' | 'approved' | 'rejected' | 'executed' | 'failed';
		action_data: {
			max_emails: number;
			contractor_email: string;
			reasoning: string;
		};
		action_summary: string;
		execution_result?: {
			emails_count?: number;
			contractor_email?: string;
			emails?: Array<{
				message_id: string;
				thread_id: string;
				from: string;
				subject: string;
				body: string;
				received_at: string | null;
			}>;
		} | null;
		created_at: string;
		updated_at: string;
	};

export interface Message {
	id: number;
	sender: 'user' | 'ai' | 'contractor';
	message_type: 'user' | 'ai' | 'ai_action_request' | 'ai_action_executed';
	content: string;
	timestamp: string;
	contractor_id: number;
	action?: MessageAction;
}

export interface Conversation {
	contractor_id: number;
	contractor_name: string;
	contractor_email: string;
	last_message: string;
	last_message_timestamp: string | null;
	unread_count: number;
}

export interface ConversationListResponse {
	conversations: Conversation[];
}

export interface ConversationMessagesResponse {
	messages: Message[];
}

export interface SendMessageResponse {
	user_message: Message;
	ai_message: Message;
	action?: MessageAction;
	type: 'normal' | 'action_request';
}

export interface ApproveActionResponse {
	success: boolean;
	action: MessageAction;
	confirmation_message: Message;
	result: {
		message_id?: string;
		thread_id?: string;
		recipient?: string;
		subject?: string;
	};
}

export interface RejectActionResponse {
	success: boolean;
	action: MessageAction;
}

export interface ModifyActionResponse {
	success: boolean;
	executed: boolean;
	action: MessageAction;
	confirmation_message?: Message;
	result?: {
		message_id?: string;
		thread_id?: string;
		recipient?: string;
		subject?: string;
	};
}

const getCsrfToken = (): string => {
	if (typeof document === "undefined" || !document.cookie) {
		return "";
	}

	const name = "csrftoken";
	const cookies = document.cookie.split(";") ?? [];

	for (const cookie of cookies) {
		const trimmedCookie = cookie.trim();
		if (trimmedCookie.startsWith(`${name}=`)) {
			return decodeURIComponent(trimmedCookie.substring(name.length + 1));
		}
	}

	return "";
};

const fetchCsrfToken = async (): Promise<string> => {
	try {
		const response = await fetch(`${API_BASE_URL}/auth/csrf/`, {
			method: "GET",
			credentials: "include",
		});

		const data = await response.json();
		return data.csrfToken ?? "";
	} catch (error) {
		console.error("Failed to get CSRF token:", error);
		return "";
	}
};

const ensureCsrfToken = async (): Promise<string> => {
	const token = getCsrfToken();
	return token || (await fetchCsrfToken());
};

export const contractingPlanningApi = {
	/**
	 * Submit contracting planning requirements with optional file uploads
	 */
	async submitRequirements(
		request: ContractingPlanningRequest
	): Promise<ContractingPlanningResponse> {
		const csrfToken = await ensureCsrfToken();

		// Create FormData to handle file uploads
		const formData = new FormData();
		formData.append("project_id", request.project_id.toString());
		formData.append("description", request.description);

		// Append files if provided
		if (request.files && request.files.length > 0) {
			request.files.forEach((file) => {
				formData.append("files", file);
			});
		}

		const response = await fetch(`${API_BASE_URL}/contracting/planning/`, {
			method: "POST",
			credentials: "include",
			headers: {
				"X-CSRFToken": csrfToken,
				// Don't set Content-Type - browser will set it with boundary for multipart/form-data
			},
			body: formData,
		});

		if (!response.ok) {
			// Handle error response
			let message = `HTTP error! status: ${response.status}`;
			try {
				const contentType = response.headers.get("content-type") || "";
				if (contentType.includes("application/json")) {
					const data = await response.json();
					if (data.detail) {
						message = data.detail;
					} else if (data.message) {
						message = data.message;
					} else if (typeof data === "object") {
						// Extract first error message from object
						for (const value of Object.values(data)) {
							if (Array.isArray(value) && value.length > 0) {
								message = value[0];
								break;
							} else if (typeof value === "string") {
								message = value;
								break;
							}
						}
					}
				}
			} catch {
				// Keep default message
			}

			throw new Error(message);
		}

		return response.json();
	},

	/**
	 * Get planning requirements for a project
	 */
	async getRequirements(projectId: number): Promise<ContractingPlanningResponse | null> {
		const response = await fetch(
			`${API_BASE_URL}/contracting/planning/${projectId}/`,
			{
				method: "GET",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		if (response.status === 404) {
			return null;
		}

		if (!response.ok) {
			throw new Error(`Failed to fetch requirements: ${response.status}`);
		}

		return response.json();
	},

	/**
	 * Submit user answers to AI-generated questions
	 */
	async submitAnswers(
		projectId: number,
		userAnswers: UserAnswers
	): Promise<ContractingPlanningResponse> {
		const csrfToken = await ensureCsrfToken();

		const response = await fetch(
			`${API_BASE_URL}/contracting/planning/${projectId}/answers/`,
			{
				method: "PUT",
				credentials: "include",
				headers: {
					"X-CSRFToken": csrfToken,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ user_answers: userAnswers }),
			}
		);

		if (!response.ok) {
			let message = `HTTP error! status: ${response.status}`;
			try {
				const data = await response.json();
				message = data.detail || data.message || message;
			} catch {
				// Keep default message
			}
			throw new Error(message);
		}

		return response.json();
	},

	/**
	 * Generate invitation email and renovation plan for selected contractors
	 */
	async generateInvitation(
		projectId: number,
		contractorIds: number[]
	): Promise<InvitationResponse> {
		const csrfToken = await ensureCsrfToken();

		const response = await fetch(
			`${API_BASE_URL}/contracting/planning/${projectId}/invitation/`,
			{
				method: "POST",
				credentials: "include",
				headers: {
					"X-CSRFToken": csrfToken,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ contractor_ids: contractorIds }),
			}
		);

		if (!response.ok) {
			let message = `HTTP error! status: ${response.status}`;
			try {
				const data = await response.json();
				message = data.detail || data.message || message;
			} catch {
				// Keep default message
			}
			throw new Error(message);
		}

		return response.json();
	},

	/**
	 * Generate PDF from HTML content
	 */
	async generatePDF(
		projectId: number,
		htmlContent: string,
		filename: string
	): Promise<Blob> {
		const csrfToken = await ensureCsrfToken();

		const response = await fetch(
			`${API_BASE_URL}/contracting/planning/${projectId}/pdf/`,
			{
				method: "POST",
				credentials: "include",
				headers: {
					"X-CSRFToken": csrfToken,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ html_content: htmlContent, filename }),
			}
		);

		if (!response.ok) {
			let message = `HTTP error! status: ${response.status}`;
			try {
				const data = await response.json();
				message = data.detail || data.message || message;
			} catch {
				// Keep default message
			}
			throw new Error(message);
		}

		return response.blob();
	},

	/**
	 * Modify invitation email using AI based on user prompt
	 */
	async modifyEmailWithAI(
		projectId: number,
		currentEmailHtml: string,
		userPrompt: string
	): Promise<{ email_html: string }> {
		const csrfToken = await ensureCsrfToken();

		const response = await fetch(
			`${API_BASE_URL}/contracting/planning/${projectId}/invitation/modify/`,
			{
				method: "POST",
				credentials: "include",
				headers: {
					"X-CSRFToken": csrfToken,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					current_email_html: currentEmailHtml,
					user_prompt: userPrompt,
				}),
			}
		);

		if (!response.ok) {
			let message = `HTTP error! status: ${response.status}`;
			try {
				const data = await response.json();
				message = data.detail || data.message || message;
			} catch {
				// Keep default message
			}
			throw new Error(message);
		}

		return response.json();
	},

	/**
	 * Send invitation emails to contractors via Gmail
	 */
	async sendInvitations(
		projectId: number,
		contractorIds: number[],
		emailHtml: string,
		renovationPlanHtml: string,
		attachmentFileIds?: number[]
	): Promise<{
		success: number;
		failed: number;
		errors: Array<{ contractor_id: number; contractor_name: string; error: string }>;
		sent_emails: Array<{
			id: number;
			contractor_id: number;
			contractor_name: string;
			contractor_email: string;
			message_id: string;
		}>;
	}> {
		const csrfToken = await ensureCsrfToken();

		const response = await fetch(
			`${API_BASE_URL}/contracting/planning/${projectId}/invitation/send/`,
			{
				method: "POST",
				credentials: "include",
				headers: {
					"X-CSRFToken": csrfToken,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					contractor_ids: contractorIds,
					email_html: emailHtml,
					renovation_plan_html: renovationPlanHtml,
					attachment_file_ids: attachmentFileIds || [],
				}),
			}
		);

		if (!response.ok) {
			let message = `HTTP error! status: ${response.status}`;
			try {
				const data = await response.json();
				message = data.detail || data.message || message;
			} catch {
				// Keep default message
			}
			throw new Error(message);
		}

		return response.json();
	},

	/**
	 * Get list of conversations with contractors
	 */
	async getConversations(projectId: number): Promise<ConversationListResponse> {
		const response = await fetch(
			`${API_BASE_URL}/contracting/planning/${projectId}/conversations/`,
			{
				method: "GET",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		if (!response.ok) {
			let message = `HTTP error! status: ${response.status}`;
			try {
				const data = await response.json();
				message = data.detail || data.message || message;
			} catch {
				// Keep default message
			}
			throw new Error(message);
		}

		return response.json();
	},

	/**
	 * Get messages for a specific contractor conversation
	 */
	async getConversationMessages(
		projectId: number,
		contractorId: number
	): Promise<ConversationMessagesResponse> {
		const response = await fetch(
			`${API_BASE_URL}/contracting/planning/${projectId}/conversations/${contractorId}/messages/`,
			{
				method: "GET",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		if (!response.ok) {
			let message = `HTTP error! status: ${response.status}`;
			try {
				const data = await response.json();
				message = data.detail || data.message || message;
			} catch {
				// Keep default message
			}
			throw new Error(message);
		}

		return response.json();
	},

	/**
	 * Send a message in a contractor conversation
	 */
	async sendMessage(
		projectId: number,
		contractorId: number,
		content: string,
		attachments?: File[]
	): Promise<SendMessageResponse> {
		const csrfToken = await ensureCsrfToken();

		let body: FormData | string;
		let headers: Record<string, string> = {
			"X-CSRFToken": csrfToken,
		};

		// Use FormData if attachments are provided
		if (attachments && attachments.length > 0) {
			const formData = new FormData();
			formData.append("content", content);
			
			// Append each file
			attachments.forEach((file) => {
				formData.append("attachments", file);
			});
			
			body = formData;
			// Don't set Content-Type for FormData - browser will set it with boundary
		} else {
			headers["Content-Type"] = "application/json";
			body = JSON.stringify({ content });
		}

		const response = await fetch(
			`${API_BASE_URL}/contracting/planning/${projectId}/conversations/${contractorId}/messages/`,
			{
				method: "POST",
				credentials: "include",
				headers,
				body,
			}
		);

		if (!response.ok) {
			let message = `HTTP error! status: ${response.status}`;
			try {
				const data = await response.json();
				message = data.detail || data.message || message;
			} catch {
				// Keep default message
			}
			throw new Error(message);
		}

		return response.json();
	},

	/**
	 * Update the current step in the contracting workflow
	 */
	async updateStep(projectId: number, step: number): Promise<{ current_step: number; message: string }> {
		const csrfToken = await ensureCsrfToken();

		const response = await fetch(
			`${API_BASE_URL}/contracting/planning/${projectId}/step/`,
			{
				method: "PUT",
				credentials: "include",
				headers: {
					"X-CSRFToken": csrfToken,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ current_step: step }),
			}
		);

		if (!response.ok) {
			let message = `HTTP error! status: ${response.status}`;
			try {
				const data = await response.json();
				message = data.detail || data.message || message;
			} catch {
				// Keep default message
			}
			throw new Error(message);
		}

		return response.json();
	},

	/**
	 * Approve and execute a pending action
	 */
	async approveAction(
		projectId: number,
		contractorId: number,
		actionId: number
	): Promise<ApproveActionResponse> {
		const csrfToken = await ensureCsrfToken();

		const response = await fetch(
			`${API_BASE_URL}/contracting/planning/${projectId}/conversations/${contractorId}/actions/${actionId}/approve/`,
			{
				method: "POST",
				credentials: "include",
				headers: {
					"X-CSRFToken": csrfToken,
					"Content-Type": "application/json",
				},
			}
		);

		if (!response.ok) {
			let message = `HTTP error! status: ${response.status}`;
			try {
				const data = await response.json();
				message = data.detail || data.message || message;
			} catch {
				// Keep default message
			}
			throw new Error(message);
		}

		return response.json();
	},

	/**
	 * Reject a pending action
	 */
	async rejectAction(
		projectId: number,
		contractorId: number,
		actionId: number
	): Promise<RejectActionResponse> {
		const csrfToken = await ensureCsrfToken();

		const response = await fetch(
			`${API_BASE_URL}/contracting/planning/${projectId}/conversations/${contractorId}/actions/${actionId}/reject/`,
			{
				method: "POST",
				credentials: "include",
				headers: {
					"X-CSRFToken": csrfToken,
					"Content-Type": "application/json",
				},
			}
		);

		if (!response.ok) {
			let message = `HTTP error! status: ${response.status}`;
			try {
				const data = await response.json();
				message = data.detail || data.message || message;
			} catch {
				// Keep default message
			}
			throw new Error(message);
		}

		return response.json();
	},

	/**
	 * Modify a pending action
	 */
	async modifyAction(
		projectId: number,
		contractorId: number,
		actionId: number,
		modifications?: string,
		emailHtml?: string,
		executeAfterModify?: boolean
	): Promise<ModifyActionResponse> {
		const csrfToken = await ensureCsrfToken();

		const response = await fetch(
			`${API_BASE_URL}/contracting/planning/${projectId}/conversations/${contractorId}/actions/${actionId}/modify/`,
			{
				method: "POST",
				credentials: "include",
				headers: {
					"X-CSRFToken": csrfToken,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					modifications,
					email_html: emailHtml,
					execute: executeAfterModify || false,
				}),
			}
		);

		if (!response.ok) {
			let message = `HTTP error! status: ${response.status}`;
			try {
				const data = await response.json();
				message = data.detail || data.message || message;
			} catch {
				// Keep default message
			}
			throw new Error(message);
		}

		return response.json();
	},
};

