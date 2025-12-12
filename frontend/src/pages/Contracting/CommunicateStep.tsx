import React, { useState, useEffect, useRef } from "react";
import { Contractor } from "../../services/contractors";
import { Project } from "../../services/projects";
import { 
	contractingPlanningApi, 
	Conversation, 
	Message,
	MessageAction,
	ContractorOffer,
	Offer,
	OfferAnalysis
} from "../../services/contractingPlanning";
import Heading from "../../components/Heading/Heading";
import Text from "../../components/Text/Text";
import EmailPreviewModal from "../../components/EmailPreviewModal/EmailPreviewModal";
import AnalysisReportModal from "../../components/AnalysisReportModal/AnalysisReportModal";
import { 
	MessageSquare, 
	Send, 
	Loader2, 
	User, 
	Bot,
	Mail,
	Eye,
	CheckCircle,
	XCircle,
	Paperclip,
	RefreshCw,
	FileText,
	BarChart
} from "lucide-react";

interface CommunicateStepProps {
	selectedProject: Project;
	contractors: Contractor[];
	selectedContractors: Set<number>;
	onStepChange: (step: number) => void;
}

const CommunicateStep: React.FC<CommunicateStepProps> = ({
	selectedProject,
	contractors,
	selectedContractors,
	onStepChange,
}) => {
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [activeContractorId, setActiveContractorId] = useState<number | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputMessage, setInputMessage] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [isLoadingConversations, setIsLoadingConversations] = useState(true);
	const [isLoadingMessages, setIsLoadingMessages] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showEmailPreview, setShowEmailPreview] = useState(false);
	const [previewAction, setPreviewAction] = useState<MessageAction | null>(null);
	const [isActionProcessing, setIsActionProcessing] = useState(false);
	const [isAITyping, setIsAITyping] = useState(false);
	const [attachments, setAttachments] = useState<File[]>([]);
	const [showAnalysisReport, setShowAnalysisReport] = useState(false);
	const [analysisReport, setAnalysisReport] = useState<{
		content: string;
		type: 'analysis' | 'comparison';
		offer?: Offer;
		comparedOffers?: Offer[];
	} | null>(null);
	
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	
	// Scroll to bottom of messages
	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};
	
	// Load conversations on mount
	useEffect(() => {
		loadConversations();
	}, [selectedProject.id]);
	
	// Scroll to bottom when messages change
	useEffect(() => {
		scrollToBottom();
	}, [messages]);
	
	// Load messages when active contractor changes
	useEffect(() => {
		if (activeContractorId !== null) {
			loadMessages(activeContractorId);
		}
	}, [activeContractorId]);
	
	const loadConversations = async () => {
		if (!selectedProject.id) return;
		
		setIsLoadingConversations(true);
		setError(null);
		
		try {
			const response = await contractingPlanningApi.getConversations(selectedProject.id);
			setConversations(response.conversations);
			
			// Auto-select first contractor if available
			if (response.conversations.length > 0 && activeContractorId === null) {
				setActiveContractorId(response.conversations[0].contractor_id);
			}
		} catch (err) {
			console.error("Error loading conversations:", err);
			setError(err instanceof Error ? err.message : "Failed to load conversations");
		} finally {
			setIsLoadingConversations(false);
		}
	};
	
	const loadMessages = async (contractorId: number) => {
		if (!selectedProject.id) return;
		
		setIsLoadingMessages(true);
		setError(null);
		
		try {
			const response = await contractingPlanningApi.getConversationMessages(
				selectedProject.id,
				contractorId
			);
			setMessages(response.messages);
		} catch (err) {
			console.error("Error loading messages:", err);
			setError(err instanceof Error ? err.message : "Failed to load messages");
		} finally {
			setIsLoadingMessages(false);
		}
	};
	
	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (files.length > 0) {
			setAttachments((prev) => [...prev, ...files]);
		}
		// Reset input so same file can be selected again
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const handleRemoveAttachment = (index: number) => {
		setAttachments((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSendMessage = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if ((!inputMessage.trim() && attachments.length === 0) || !activeContractorId || !selectedProject.id) return;
		
		setIsSending(true);
		setIsAITyping(true);
		setError(null);
		
		const messageContent = inputMessage.trim() || ""; // Allow empty message if attachments present
		const messagesToSend = attachments.length > 0 ? attachments : undefined;
		setInputMessage(""); // Clear input immediately for better UX
		setAttachments([]); // Clear attachments
		
		try {
			const response = await contractingPlanningApi.sendMessage(
				selectedProject.id,
				activeContractorId,
				messageContent,
				messagesToSend
			);
			
			// Add user message and AI response
			const newMessages = [response.user_message, response.ai_message];
			setMessages((prev) => [...prev, ...newMessages]);
			
			// Update the last message in conversations list
			setConversations((prev) =>
				prev.map((conv) =>
					conv.contractor_id === activeContractorId
						? {
								...conv,
								last_message: response.ai_message.content,
								last_message_timestamp: response.ai_message.timestamp,
						  }
						: conv
				)
			);
		} catch (err) {
			console.error("Error sending message:", err);
			setError(err instanceof Error ? err.message : "Failed to send message");
			setInputMessage(messageContent); // Restore message on error
			setAttachments(messagesToSend || []); // Restore attachments on error
		} finally {
			setIsSending(false);
			setIsAITyping(false);
		}
	};

	const handleViewEmailPreview = (action: MessageAction) => {
		setPreviewAction(action);
		setShowEmailPreview(true);
	};

	const handleApproveAction = async (modifiedHtml?: string) => {
		if (!previewAction || !activeContractorId || !selectedProject.id) return;
		
		setIsActionProcessing(true);
		setError(null);
		
		try {
			let response: {
				action: MessageAction;
				confirmation_message?: Message;
			};
			
			// If HTML was modified, update the action first
			if (modifiedHtml && previewAction.action_type === 'send_email') {
				const modifyResponse = await contractingPlanningApi.modifyAction(
					selectedProject.id,
					activeContractorId,
					previewAction.id,
					"", // No text modifications
					modifiedHtml,
					true // Execute after modify
				);
				response = {
					action: modifyResponse.action,
					confirmation_message: modifyResponse.confirmation_message
				};
			} else {
				const approveResponse = await contractingPlanningApi.approveAction(
					selectedProject.id,
					activeContractorId,
					previewAction.id
				);
				response = {
					action: approveResponse.action,
					confirmation_message: approveResponse.confirmation_message
				};
			}
			
			// Update the message with the executed action
			setMessages((prev) =>
				prev.map((msg) => {
					if (msg.action && msg.action.id === previewAction.id) {
						return {
							...msg,
							action: response.action,
							message_type: 'ai_action_executed' as const,
							content: `✓ ${response.action.action_summary}`
						};
					}
					return msg;
				})
			);
			
			// Add confirmation message
			if (response.confirmation_message) {
				const confirmationMsg = response.confirmation_message;
				setMessages((prev) => [...prev, confirmationMsg]);
			}
			
			setShowEmailPreview(false);
			setPreviewAction(null);
		} catch (err) {
			console.error("Error approving action:", err);
			const errorMessage = err instanceof Error ? err.message : "Failed to approve action";
			setError(errorMessage);
			
			// If the action failed, update its status in the UI
			if (errorMessage.includes("credentials") || errorMessage.includes("Gmail")) {
				setMessages((prev) =>
					prev.map((msg) => {
						if (msg.action && msg.action.id === previewAction.id) {
							return {
								...msg,
								action: {
									...msg.action,
									action_status: 'failed' as const
								}
							};
						}
						return msg;
					})
				);
			}
		} finally {
			setIsActionProcessing(false);
		}
	};

	const handleRejectAction = async (actionId: number) => {
		if (!activeContractorId || !selectedProject.id) return;
		
		setIsActionProcessing(true);
		setError(null);
		
		try {
			const response = await contractingPlanningApi.rejectAction(
				selectedProject.id,
				activeContractorId,
				actionId
			);
			
			// Update the message with the rejected action
			setMessages((prev) =>
				prev.map((msg) => {
					if (msg.action && msg.action.id === actionId) {
						return {
							...msg,
							action: response.action,
							content: `[Rejected] ${response.action.action_summary}`
						};
					}
					return msg;
				})
			);
		} catch (err) {
			console.error("Error rejecting action:", err);
			setError(err instanceof Error ? err.message : "Failed to reject action");
		} finally {
			setIsActionProcessing(false);
		}
	};

	const handleExecuteAction = async (actionId: number) => {
		if (!activeContractorId || !selectedProject.id) return;
		
		setIsActionProcessing(true);
		setError(null);
		
		try {
			const response = await contractingPlanningApi.approveAction(
				selectedProject.id,
				activeContractorId,
				actionId
			);
			
			// Update the message with the executed action
			setMessages((prev) =>
				prev.map((msg) => {
					if (msg.action && msg.action.id === actionId) {
						return {
							...msg,
							action: response.action,
							message_type: 'ai_action_executed' as const,
							content: `✓ ${response.action.action_summary}`
						};
					}
					return msg;
				})
			);
			
			// Add confirmation message
			const confirmationMessage = response.confirmation_message;
			setMessages((prev) => [...prev, confirmationMessage]);
			
			// If this was an analyze_offer or compare_offers action, show the analysis
			if (response.action.action_type === 'analyze_offer' && response.action.execution_result) {
				const result = response.action.execution_result;
				if (result.analysis_report) {
					// Fetch the full offer details
					const offer = await contractingPlanningApi.getOffer(selectedProject.id, result.offer_id!);
					setAnalysisReport({
						content: result.analysis_report,
						type: 'analysis',
						offer: offer
					});
					setShowAnalysisReport(true);
				}
			} else if (response.action.action_type === 'compare_offers' && response.action.execution_result) {
				// Show comparison report in modal
				const result = response.action.execution_result;
				if (result.comparison_report) {
					const primaryOffer = await contractingPlanningApi.getOffer(selectedProject.id, result.primary_offer_id!);
					const comparedOffers: ContractorOffer[] = [];
					if (result.compared_offer_ids) {
						for (const offerId of result.compared_offer_ids) {
							const offer = await contractingPlanningApi.getOffer(selectedProject.id, offerId);
							comparedOffers.push(offer);
						}
					}
					setAnalysisReport({
						content: result.comparison_report,
						type: 'comparison',
						offer: primaryOffer,
						comparedOffers: comparedOffers
					});
					setShowAnalysisReport(true);
				}
			}
			
		} catch (err) {
			console.error("Error executing action:", err);
			const errorMessage = err instanceof Error ? err.message : "Failed to execute action";
			setError(errorMessage);
			
			// If the action failed, update its status in the UI
			setMessages((prev) =>
				prev.map((msg) => {
					if (msg.action && msg.action.id === actionId) {
						return {
							...msg,
							action: {
								...msg.action,
								action_status: 'failed' as const
							}
						};
					}
					return msg;
				})
			);
		} finally {
			setIsActionProcessing(false);
		}
	};

	
	const formatTime = (timestamp: string) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
		
		if (diffInHours < 24) {
			return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		}
		return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
	};
	
	const getActiveConversation = () => {
		return conversations.find((c) => c.contractor_id === activeContractorId);
	};
	
	if (isLoadingConversations) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
				<Text className="ml-3 text-gray-600">Loading conversations...</Text>
			</div>
		);
	}
	
	if (conversations.length === 0) {
		return (
			<div className="space-y-6 mx-auto max-w-4xl">
				<div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
					<MessageSquare className="w-12 h-12 text-blue-600 mx-auto mb-4" />
					<Heading level={2} className="text-xl mb-3">
						No Conversations Yet
					</Heading>
					<Text className="text-gray-700 mb-4">
						You haven't sent any invitations yet. Start by selecting contractors and sending invitations.
					</Text>
					<button
						onClick={() => onStepChange(2)}
						className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
					>
						Go to Matching Step
					</button>
				</div>
			</div>
		);
	}
	
	const activeConversation = getActiveConversation();
	
	// Helper function to get sender label
	const getSenderLabel = (message: Message): string => {
		if (message.sender === 'user') return 'You';
		if (message.sender === 'ai') return 'AI Assistant';
		if (message.sender === 'contractor') return 'Contractor (Email)';
		if (message.message_type === 'ai_action_request') return 'System';
		return 'System';
	};
	
	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="mb-4">
				<Heading level={2} className="text-2xl mb-1">
					Contractor Communication
				</Heading>
				<Text className="text-gray-600">
					AI-mediated conversations with your selected contractors
				</Text>
			</div>
			
			{error && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
					<Text className="text-red-800">{error}</Text>
				</div>
			)}
			
			{/* Chat Layout */}
			<div className="flex gap-4 h-[600px] bg-white rounded-lg border border-gray-200 overflow-hidden">
				{/* Left Panel - Conversations List */}
				<div className="w-80 border-r border-gray-200 flex flex-col">
					<div className="p-4 border-b border-gray-200 bg-gray-50">
						<Heading level={3} className="text-lg font-semibold flex items-center gap-2">
							<MessageSquare className="w-5 h-5 text-emerald-600" />
							Conversations
						</Heading>
					</div>
					
					<div className="flex-1 overflow-y-auto">
						{conversations.map((conversation) => (
							<button
								key={conversation.contractor_id}
								onClick={() => setActiveContractorId(conversation.contractor_id)}
								className={`w-full text-left p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
									activeContractorId === conversation.contractor_id
										? "bg-emerald-50 border-l-4 border-l-emerald-600"
										: ""
								}`}
							>
								<div className="flex items-start gap-3">
									<div className="bg-emerald-100 p-2 rounded-full flex-shrink-0">
										<User className="w-5 h-5 text-emerald-700" />
									</div>
									<div className="flex-1 min-w-0">
										<Text className="font-semibold text-gray-900 truncate">
											{conversation.contractor_name}
										</Text>
										<Text className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
											<Mail className="w-3 h-3" />
											{conversation.contractor_email}
										</Text>
										{conversation.last_message && (
											<Text className="text-sm text-gray-600 truncate mt-1">
												{conversation.last_message}
											</Text>
										)}
										{conversation.last_message_timestamp && (
											<Text className="text-xs text-gray-400 mt-1">
												{formatTime(conversation.last_message_timestamp)}
											</Text>
										)}
									</div>
								</div>
							</button>
						))}
					</div>
				</div>
				
				{/* Right Panel - Messages */}
				<div className="flex-1 flex flex-col">
					{activeConversation ? (
						<>
							{/* Contractor Header - Enhanced */}
							<div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
								<div className="flex items-center gap-3">
									<div className="bg-emerald-100 p-3 rounded-full">
										<User className="w-6 h-6 text-emerald-700" />
									</div>
									<div className="flex-1">
										<h2 className="text-lg font-semibold text-gray-900">
											{activeConversation.contractor_name}
										</h2>
										<p className="text-sm text-gray-500">
											{activeConversation.contractor_email}
										</p>
										{activeConversation.last_message_timestamp && (
											<p className="text-xs text-gray-400 mt-1">
												Last activity: {formatTime(activeConversation.last_message_timestamp)}
											</p>
										)}
									</div>
								</div>
							</div>
							
							{/* Messages Area */}
							<div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
								{isLoadingMessages ? (
									<div className="flex items-center justify-center py-8">
										<Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
										<Text className="ml-3 text-gray-600">Loading messages...</Text>
									</div>
								) : messages.length === 0 ? (
									<div className="text-center py-8">
										<MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
										<Text className="text-gray-600">
											No messages yet. Start the conversation!
										</Text>
									</div>
								) : (
									messages.map((message) => (
										<div
											key={message.id}
											className={`flex ${
												message.sender === "user" ? "justify-end" : "justify-start"
											}`}
										>
											{message.message_type === "ai_action_request" && message.action ? (
												// Action Request Message - Render based on action type
												message.action.action_type === "send_email" ? (
													// Email Draft Action
													<div className="w-full flex justify-start">
														<div className="max-w-2xl">
															{/* Sender Label */}
															<p className="text-xs uppercase tracking-wide text-gray-500 mb-1 ml-1">System</p>
															
															<div className="flex gap-2">
																<div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-blue-600">
																	<Bot className="w-4 h-4 text-white" />
																</div>
																<div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-4 flex-1 shadow-sm">
															<div className="space-y-3">
																{/* AI Message */}
																<div className="text-sm text-blue-900 font-medium">
																	{message.content}
																</div>
																
																{/* Email Preview Card */}
																<div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
																	<div className="space-y-2">
																		<div>
																			<div className="text-xs font-semibold text-gray-500 uppercase mb-1">
																				Subject
																			</div>
																			<div className="text-sm font-semibold text-gray-900">
																				{message.action.action_data.subject}
																			</div>
																		</div>
																		<div className="border-t border-gray-200 pt-2">
																			<div className="text-xs font-semibold text-gray-500 uppercase mb-1">
																				Email Preview
																			</div>
																			<div 
																				className="text-sm text-gray-700 line-clamp-3"
																				dangerouslySetInnerHTML={{
																					__html: message.action.action_data.body_html.substring(0, 200) + "..."
																				}}
																			/>
																		</div>
																	</div>
																</div>
																
																{/* Action Buttons */}
																{message.action.action_status === "pending" && (
																	<div className="flex gap-2 pt-2">
																		<button
																			onClick={() => handleViewEmailPreview(message.action!)}
																			className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
																			disabled={isActionProcessing}
																		>
																			<Eye className="w-4 h-4" />
																			Review & Send Email
																		</button>
																		<button
																			onClick={() => handleRejectAction(message.action!.id)}
																			className="px-4 py-2.5 bg-white text-gray-700 border-2 border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
																			disabled={isActionProcessing}
																		>
																			<XCircle className="w-4 h-4" />
																			Cancel
																		</button>
																	</div>
																)}
																
																{message.action.action_status === "rejected" && (
																	<div className="flex items-center gap-2 text-red-600 text-sm font-medium bg-red-50 px-3 py-2 rounded-lg">
																		<XCircle className="w-4 h-4" />
																		<span>Cancelled</span>
																	</div>
																)}
																
																{message.action.action_status === "failed" && (
																	<div className="space-y-2">
																		<div className="flex items-center gap-2 text-orange-600 text-sm font-medium bg-orange-50 px-3 py-2 rounded-lg">
																			<XCircle className="w-4 h-4" />
																			<span>Failed to send</span>
																		</div>
																		<button
																			onClick={() => handleViewEmailPreview(message.action!)}
																			className="w-full px-4 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
																			disabled={isActionProcessing}
																		>
																			<Eye className="w-4 h-4" />
																			Retry Sending
																		</button>
																	</div>
																)}
															</div>
															<Text className="text-xs text-blue-600 mt-3">
																{formatTime(message.timestamp)}
															</Text>
																</div>
															</div>
														</div>
													</div>
												) : message.action.action_type === "fetch_email" ? (
													// Fetch Email Action - Compact Design
													<div className="w-full flex justify-start">
														<div className="max-w-xl">
															{/* Sender Label */}
															<p className="text-xs uppercase tracking-wide text-gray-500 mb-1 ml-1">System</p>
															
															<div className="bg-purple-50 border border-purple-200 rounded-xl p-3 shadow-sm space-y-2">
																<div className="flex items-start gap-2 text-sm text-purple-900">
																	<Mail className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
																	<span className="font-medium break-words">
																		Fetching up to {('max_emails' in message.action.action_data) ? message.action.action_data.max_emails : 5} email(s) from {('contractor_email' in message.action.action_data) ? message.action.action_data.contractor_email : ''}...
																	</span>
																</div>
																
																{message.action.action_status === "pending" && (
																	<>
																		<div className="border-t border-purple-200 my-2"></div>
																		<div className="flex flex-col gap-2">
																			<button
																				onClick={() => handleExecuteAction(message.action!.id)}
																				className="w-full px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
																				disabled={isActionProcessing}
																			>
																				{isActionProcessing ? (
																					<>
																						<Loader2 className="w-4 h-4 animate-spin" />
																						Fetching...
																					</>
																				) : (
																					<>
																						<CheckCircle className="w-4 h-4" />
																						Fetch Emails
																					</>
																				)}
																			</button>
																			<button
																				onClick={() => handleRejectAction(message.action!.id)}
																				className="text-gray-600 hover:text-gray-800 text-sm underline text-center"
																				disabled={isActionProcessing}
																			>
																				Cancel
																			</button>
																		</div>
																	</>
																)}
																
																{message.action.action_status === "rejected" && (
																	<div className="flex items-center gap-2 text-red-600 text-xs font-medium bg-red-50 px-2 py-1 rounded">
																		<XCircle className="w-3 h-3" />
																		<span>Cancelled</span>
																	</div>
																)}
																
																{message.action.action_status === "failed" && (
																	<>
																		<div className="flex items-center gap-2 text-orange-600 text-xs font-medium bg-orange-50 px-2 py-1 rounded">
																			<XCircle className="w-3 h-3" />
																			<span>Failed to fetch</span>
																		</div>
																		<button
																			onClick={() => handleExecuteAction(message.action!.id)}
																			className="w-full px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
																			disabled={isActionProcessing}
																		>
																			{isActionProcessing ? (
																				<>
																					<Loader2 className="w-4 h-4 animate-spin" />
																					Retrying...
																				</>
																			) : (
																				<>
																					<CheckCircle className="w-4 h-4" />
																					Retry Fetching
																				</>
																			)}
																		</button>
																	</>
																)}
																
																<p className="text-xs text-gray-400">{formatTime(message.timestamp)}</p>
															</div>
														</div>
													</div>
												) : message.action.action_type === "analyze_offer" ? (
													// Analyze Offer Action
													<div className="w-full flex justify-start">
														<div className="max-w-xl">
															<p className="text-xs uppercase tracking-wide text-gray-500 mb-1 ml-1">System</p>
															
															<div className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm space-y-3">
																<div className="flex items-start gap-2 text-sm text-blue-900">
																	<FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
																	<span className="font-medium">{message.content}</span>
																</div>
																
																{message.action.action_status === "pending" && (
																	<>
																		<div className="border-t border-blue-200 pt-3"></div>
																		<div className="flex flex-col gap-2">
																			<button
																				onClick={() => handleExecuteAction(message.action!.id)}
																				className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
																				disabled={isActionProcessing}
																			>
																				{isActionProcessing ? (
																					<>
																						<Loader2 className="w-4 h-4 animate-spin" />
																						Analyzing...
																					</>
																				) : (
																					<>
																						<FileText className="w-4 h-4" />
																						Analyze Offer
																					</>
																				)}
																			</button>
																			<button
																				onClick={() => handleRejectAction(message.action!.id)}
																				className="text-gray-600 hover:text-gray-800 text-sm underline text-center"
																				disabled={isActionProcessing}
																			>
																				Cancel
																			</button>
																		</div>
																	</>
																)}
																
																{message.action.action_status === "rejected" && (
																	<div className="flex items-center gap-2 text-red-600 text-xs font-medium bg-red-50 px-2 py-1 rounded">
																		<XCircle className="w-3 h-3" />
																		<span>Cancelled</span>
																	</div>
																)}
																
																{message.action.action_status === "failed" && (
																	<>
																		<div className="flex items-center gap-2 text-orange-600 text-xs font-medium bg-orange-50 px-2 py-1 rounded">
																			<XCircle className="w-3 h-3" />
																			<span>Failed to analyze</span>
																		</div>
																		<button
																			onClick={() => handleExecuteAction(message.action!.id)}
																			className="w-full px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
																			disabled={isActionProcessing}
																		>
																			<FileText className="w-4 h-4" />
																			Retry Analysis
																		</button>
																	</>
																)}
																
																<p className="text-xs text-gray-400">{formatTime(message.timestamp)}</p>
															</div>
														</div>
													</div>
												) : message.action.action_type === "compare_offers" ? (
													// Compare Offers Action
													<div className="w-full flex justify-start">
														<div className="max-w-xl">
															<p className="text-xs uppercase tracking-wide text-gray-500 mb-1 ml-1">System</p>
															
															<div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm space-y-3">
																<div className="flex items-start gap-2 text-sm text-emerald-900">
																	<BarChart className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
																	<span className="font-medium">{message.content}</span>
																</div>
																
																{message.action.action_status === "pending" && (
																	<>
																		<div className="border-t border-emerald-200 pt-3"></div>
																		<div className="flex flex-col gap-2">
																			<button
																				onClick={() => handleExecuteAction(message.action!.id)}
																				className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
																				disabled={isActionProcessing}
																			>
																				{isActionProcessing ? (
																					<>
																						<Loader2 className="w-4 h-4 animate-spin" />
																						Comparing...
																					</>
																				) : (
																					<>
																						<BarChart className="w-4 h-4" />
																						Compare Offers
																					</>
																				)}
																			</button>
																			<button
																				onClick={() => handleRejectAction(message.action!.id)}
																				className="text-gray-600 hover:text-gray-800 text-sm underline text-center"
																				disabled={isActionProcessing}
																			>
																				Cancel
																			</button>
																		</div>
																	</>
																)}
																
																{message.action.action_status === "rejected" && (
																	<div className="flex items-center gap-2 text-red-600 text-xs font-medium bg-red-50 px-2 py-1 rounded">
																		<XCircle className="w-3 h-3" />
																		<span>Cancelled</span>
																	</div>
																)}
																
																{message.action.action_status === "failed" && (
																	<>
																		<div className="flex items-center gap-2 text-orange-600 text-xs font-medium bg-orange-50 px-2 py-1 rounded">
																			<XCircle className="w-3 h-3" />
																			<span>Failed to compare</span>
																		</div>
																		<button
																			onClick={() => handleExecuteAction(message.action!.id)}
																			className="w-full px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
																			disabled={isActionProcessing}
																		>
																			<BarChart className="w-4 h-4" />
																			Retry Comparison
																		</button>
																	</>
																)}
																
																<p className="text-xs text-gray-400">{formatTime(message.timestamp)}</p>
															</div>
														</div>
													</div>
												) : null
											) : message.message_type === "ai_action_executed" ? (
												// Action Executed Message
												<div className="w-full flex justify-start">
													<div className="max-w-xl">
														{/* Sender Label */}
														<p className="text-xs uppercase tracking-wide text-gray-500 mb-1 ml-1">System</p>
														
														<div className="flex gap-2">
															<div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-green-600">
																<CheckCircle className="w-4 h-4 text-white" />
															</div>
															<div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 shadow-sm">
																<div className="text-sm text-green-900 font-medium">
																	{message.content}
																</div>
																<Text className="text-xs text-green-700 mt-1">
																	{formatTime(message.timestamp)}
																</Text>
															</div>
														</div>
													</div>
												</div>
											) : (
												// Normal Message - With Sender Label & Max Width
												<div className={`w-full flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
													<div className="max-w-2xl">
														{/* Sender Label */}
														<p className={`text-xs uppercase tracking-wide text-gray-500 mb-1 ${message.sender === "user" ? "text-right mr-1" : "ml-1"}`}>
															{getSenderLabel(message)}
														</p>
														
														<div
															className={`flex gap-2 ${
																message.sender === "user" ? "flex-row-reverse" : "flex-row"
															}`}
														>
															{/* Avatar */}
															<div
																className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
																	message.sender === "user"
																		? "bg-emerald-600"
																		: "bg-blue-600"
																}`}
															>
																{message.sender === "user" ? (
																	<User className="w-4 h-4 text-white" />
																) : (
																	<Bot className="w-4 h-4 text-white" />
																)}
															</div>
															
															{/* Message Bubble */}
															<div
																className={`rounded-xl px-4 py-3 shadow-sm ${
																	message.sender === "user"
																		? "bg-emerald-600 text-white"
																		: "bg-white border border-gray-200 text-gray-900"
																}`}
															>
																<div
																	className={`text-sm whitespace-pre-wrap leading-relaxed ${
																		message.sender === "user" ? "text-white" : "text-gray-900"
																	}`}
																>
																	{message.content}
																</div>
																<p
																	className={`text-xs mt-2 ${
																		message.sender === "user"
																			? "text-emerald-100"
																			: "text-gray-400"
																	}`}
																>
																	{formatTime(message.timestamp)}
																</p>
															</div>
														</div>
													</div>
												</div>
											)}
										</div>
									))
								)}
								
								{/* Typing Indicator */}
								{isAITyping && (
									<div className="flex items-center space-x-2 text-gray-500 animate-pulse pl-4">
										<div className="flex items-center space-x-1">
											<span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
											<span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
											<span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
										</div>
										<p className="text-sm">AI Assistant is typing...</p>
									</div>
								)}
								
								<div ref={messagesEndRef} />
							</div>
							
							{/* Message Input - Enhanced */}
							<div className="p-4 border-t border-gray-200 bg-white">
								<form onSubmit={handleSendMessage}>
									{/* Attachments Preview */}
									{attachments.length > 0 && (
										<div className="mb-3 flex flex-wrap gap-2">
											{attachments.map((file, index) => (
												<div
													key={index}
													className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm"
												>
													<Paperclip className="w-4 h-4 text-gray-500" />
													<span className="text-gray-700 max-w-[150px] truncate">
														{file.name}
													</span>
													<span className="text-gray-400 text-xs">
														({(file.size / 1024).toFixed(1)}KB)
													</span>
													<button
														type="button"
														onClick={() => handleRemoveAttachment(index)}
														className="text-red-500 hover:text-red-700 ml-1"
													>
														<XCircle className="w-4 h-4" />
													</button>
												</div>
											))}
										</div>
									)}

									<div className="flex items-center gap-3 bg-white border-2 border-gray-300 rounded-xl px-3 py-2 shadow-sm focus-within:border-emerald-500 transition-colors">
										{/* Hidden File Input */}
										<input
											ref={fileInputRef}
											type="file"
											multiple
											accept="image/*,.pdf,.doc,.docx,.txt"
											onChange={handleFileSelect}
											className="hidden"
										/>
										
										{/* Left Icons */}
										<button
											type="button"
											onClick={() => fileInputRef.current?.click()}
											className="text-gray-400 hover:text-gray-600 transition-colors"
											title="Attach file"
											disabled={isSending}
										>
											<Paperclip className="w-5 h-5" />
										</button>
										<button
											type="button"
											className="text-gray-400 hover:text-gray-600 transition-colors"
											title="Refresh emails"
											onClick={() => activeContractorId && loadMessages(activeContractorId)}
											disabled={isSending}
										>
											<RefreshCw className="w-5 h-5" />
										</button>
										
										{/* Text Area */}
										<textarea
											value={inputMessage}
											onChange={(e) => setInputMessage(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === 'Enter' && !e.shiftKey) {
													e.preventDefault();
													handleSendMessage(e as any);
												}
											}}
											placeholder={attachments.length > 0 ? "Add a message (optional)..." : "Type your message..."}
											disabled={isSending}
											rows={1}
											className="flex-1 resize-none border-0 focus:outline-none focus:ring-0 disabled:bg-transparent disabled:cursor-not-allowed text-sm min-h-[3rem] py-2"
											style={{ maxHeight: '120px' }}
										/>
										
										{/* Send Button */}
										<button
											type="submit"
											disabled={(!inputMessage.trim() && attachments.length === 0) || isSending}
											className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 py-2 font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 flex-shrink-0"
										>
											{isSending ? (
												<>
													<Loader2 className="w-4 h-4 animate-spin" />
													Sending
												</>
											) : (
												<>
													<Send className="w-4 h-4" />
													Send
												</>
											)}
										</button>
									</div>
								</form>
							</div>
						</>
					) : (
						<div className="flex items-center justify-center h-full">
							<div className="text-center">
								<MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
								<Text className="text-gray-600">
									Select a conversation to start messaging
								</Text>
							</div>
						</div>
					)}
				</div>
			</div>
			
			{/* Email Preview Modal */}
			{showEmailPreview && previewAction && previewAction.action_type === 'send_email' && (
				<EmailPreviewModal
					emailHtml={previewAction.action_data.body_html}
					subject={previewAction.action_data.subject}
					reasoning={previewAction.action_data.reasoning}
					onApprove={handleApproveAction}
					onClose={() => {
						setShowEmailPreview(false);
						setPreviewAction(null);
					}}
					isLoading={isActionProcessing}
				/>
			)}
			
			{/* Analysis Report Modal - For both single offer analysis and comparisons */}
			{showAnalysisReport && analysisReport && (
				<AnalysisReportModal
					reportContent={analysisReport.content}
					reportType={analysisReport.type}
					offerDetails={analysisReport.offer}
					comparedOffers={analysisReport.comparedOffers}
					onClose={() => {
						setShowAnalysisReport(false);
						setAnalysisReport(null);
					}}
				/>
			)}
		</div>
	);
};

export default CommunicateStep;
