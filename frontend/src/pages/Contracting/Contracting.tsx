// TODO: Refactor and extract components for all steps.

import Heading from "../../components/Heading/Heading";
import React, { useState, useEffect, useCallback } from "react";
import Text from "../../components/Text/Text";
import { useProject } from "../../contexts/ProjectContext";
import { useNavigate } from "react-router-dom";
import { contractorApi, Contractor } from "../../services/contractors";
import { PROJECT_TYPES } from "../../services/projects";
import { ArrowLeft, Star, MapPin, CheckCircle2, Loader2, X, Users, Mail, Send, User, Sparkles, ChevronDown } from "lucide-react";
import Stepper, { StepperStep } from "../../components/Stepper/Stepper";
import AIAssistant from "../../components/AIAssistant/AIAssistant";

const STEPS: StepperStep[] = [
	{ id: 1, label: "Matching" },
	{ id: 2, label: "Invite" },
	{ id: 3, label: "Offers" },
	{ id: 4, label: "Compare" },
	{ id: 5, label: "Draft" },
	{ id: 6, label: "Sign" },
];

const Contracting: React.FC = () => {
	const { selectedProject } = useProject();
	const navigate = useNavigate();
	const [activeStep, setActiveStep] = useState(1);
	const [contractors, setContractors] = useState<Contractor[]>([]);
	const [selectedContractors, setSelectedContractors] = useState<Set<number>>(new Set());
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [emailSubject, setEmailSubject] = useState("");
	const [emailBody, setEmailBody] = useState("");
	const [sendingEmail, setSendingEmail] = useState(false);
	const [emailSent, setEmailSent] = useState(false);
	const [visibleContractorsCount, setVisibleContractorsCount] = useState(3);
	const [contractorDescriptions, setContractorDescriptions] = useState<Map<number, string>>(new Map());
	const [generatingDescriptions, setGeneratingDescriptions] = useState<Set<number>>(new Set());

	const loadContractors = useCallback(async () => {
		if (!selectedProject) return;

		setLoading(true);
		setError(null);
		try {
			const data = await contractorApi.getAll(
				selectedProject.project_type,
				selectedProject.city,
				selectedProject.postal_code,
				selectedProject.state
			);
			setContractors(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load contractors");
		} finally {
			setLoading(false);
		}
	}, [selectedProject]);

	useEffect(() => {
		if (selectedProject && activeStep === 1) {
			loadContractors();
			setVisibleContractorsCount(3); // Reset pagination when loading new contractors
			setContractorDescriptions(new Map()); // Clear descriptions
		}
	}, [selectedProject, activeStep, loadContractors]);

	const generateDefaultEmailBody = useCallback((): string => {
		if (!selectedProject) return "";

		const projectTypeLabel = PROJECT_TYPES.find((pt) => pt.value === selectedProject.project_type)?.label || selectedProject.project_type;
		const address = [selectedProject.city, selectedProject.state].filter(Boolean).join(", ") || selectedProject.address;
		const budget = selectedProject.budget ? `€${selectedProject.budget.toLocaleString()}` : "To be discussed";

		return `Dear Contractor,

I hope this email finds you well. I am reaching out to invite you to submit a proposal for my renovation project.

Project Details:
- Project Type: ${projectTypeLabel}
- Address: ${address}
- Budget: ${budget}
${selectedProject.additional_information ? `- Additional Information: ${selectedProject.additional_information}` : ""}

I would appreciate it if you could review the project details and provide a quote at your earliest convenience. Please let me know if you need any additional information or would like to schedule a site visit.

Thank you for your time and consideration.

Best regards`;
	}, [selectedProject]);

	// Generate default email template when entering Invite step
	useEffect(() => {
		if (activeStep === 2 && selectedProject && selectedContractors.size > 0) {
			const defaultSubject = `Project Invitation: ${selectedProject.name}`;
			const defaultBody = generateDefaultEmailBody();
			setEmailSubject(defaultSubject);
			setEmailBody(defaultBody);
			setEmailSent(false);
		}
	}, [activeStep, selectedProject, selectedContractors, generateDefaultEmailBody]);

	const handleSendEmail = async () => {
		if (!selectedProject || selectedContractors.size === 0) return;

		const selectedContractorsList = contractors.filter(
			(c) => c.id !== undefined && selectedContractors.has(c.id)
		);

		// Validate that all contractors have email addresses
		const contractorsWithoutEmail = selectedContractorsList.filter((c) => !c.email);
		if (contractorsWithoutEmail.length > 0) {
			setError(`Some contractors don't have email addresses: ${contractorsWithoutEmail.map((c) => c.name).join(", ")}`);
			return;
		}

		setSendingEmail(true);
		setError(null);

		try {
			// TODO: Implement actual email sending API call
			// For now, simulate sending
			await new Promise((resolve) => setTimeout(resolve, 1500));
			
			// In a real implementation, you would call an API like:
			// await contractorApi.sendInvitations({
			//   projectId: selectedProject.id,
			//   contractorIds: Array.from(selectedContractors),
			//   subject: emailSubject,
			//   body: emailBody
			// });

			setEmailSent(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to send email");
		} finally {
			setSendingEmail(false);
		}
	};

	const toggleContractorSelection = (contractorId: number) => {
		setSelectedContractors((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(contractorId)) {
				newSet.delete(contractorId);
			} else {
				newSet.add(contractorId);
			}
			return newSet;
		});
	};

	const generateWhyThisContractor = useCallback(async (contractor: Contractor): Promise<string> => {
		if (!selectedProject) return "";

		// Simulate AI generation with a smart template-based approach
		// In production, this would call an actual AI API
		return new Promise((resolve) => {
			setTimeout(() => {
				const reasons: string[] = [];
				const projectTypeLabel = PROJECT_TYPES.find((pt) => pt.value === selectedProject.project_type)?.label || selectedProject.project_type;

				// Analyze contractor attributes and generate personalized reasons
				const rating = contractor.rating !== null && contractor.rating !== undefined ? Number(contractor.rating) : null;
				if (rating && rating >= 4.5) {
					reasons.push(`Excellent rating of ${rating.toFixed(1)}/5.0 with ${contractor.reviews_count} reviews`);
				} else if (rating && rating >= 4.0) {
					reasons.push(`Strong rating of ${rating.toFixed(1)}/5.0`);
				}

				if (contractor.years_in_business && contractor.years_in_business >= 10) {
					reasons.push(`${contractor.years_in_business} years of proven experience in the industry`);
				} else if (contractor.years_in_business && contractor.years_in_business >= 5) {
					reasons.push(`Established business with ${contractor.years_in_business} years of experience`);
				}

				if (contractor.specializations) {
					const specializations = contractor.specializations.toLowerCase();
					if (specializations.includes(selectedProject.project_type) || 
					    specializations.includes(projectTypeLabel.toLowerCase())) {
						reasons.push(`Specializes in ${projectTypeLabel} projects`);
					} else if (contractor.specializations) {
						reasons.push(`Offers specialized services: ${contractor.specializations.substring(0, 100)}${contractor.specializations.length > 100 ? '...' : ''}`);
					}
				}

				if (contractor.kfw_eligible) {
					reasons.push(`KfW eligible, which can help with financing options for your project`);
				}

				if (contractor.city && contractor.state && 
				    selectedProject.city && selectedProject.state &&
				    contractor.city.toLowerCase() === selectedProject.city.toLowerCase() &&
				    contractor.state.toLowerCase() === selectedProject.state.toLowerCase()) {
					reasons.push(`Local contractor based in ${contractor.city}, ensuring quick response times and local expertise`);
				} else if (contractor.city && contractor.state) {
					reasons.push(`Located in ${contractor.city}, ${contractor.state}, providing regional knowledge`);
				}

				if (contractor.certifications) {
					reasons.push(`Certified professional with ${contractor.certifications.substring(0, 80)}${contractor.certifications.length > 80 ? '...' : ''}`);
				}

				if (contractor.business_size) {
					const size = contractor.business_size.toLowerCase();
					if (size.includes('large') || size.includes('established')) {
						reasons.push(`Established ${contractor.business_size} business with resources to handle complex projects`);
					} else if (size.includes('small') || size.includes('local')) {
						reasons.push(`${contractor.business_size} business offering personalized attention and competitive pricing`);
					}
				}

				// Generate final description
				let description = `This contractor is well-suited for your ${projectTypeLabel} project`;
				if (reasons.length > 0) {
					description += ` because:\n\n`;
					reasons.forEach((reason, index) => {
						description += `${index + 1}. ${reason}\n`;
					});
				} else {
					description += `. They offer professional services and have experience in the renovation industry.`;
				}

				resolve(description);
			}, 800); // Simulate AI processing time
		});
	}, [selectedProject]);

	const handleGenerateDescription = useCallback(async (contractor: Contractor) => {
		if (!contractor.id || contractorDescriptions.has(contractor.id)) return;

		setGeneratingDescriptions((prev) => new Set(prev).add(contractor.id!));
		try {
			const description = await generateWhyThisContractor(contractor);
			setContractorDescriptions((prev) => {
				const newMap = new Map(prev);
				newMap.set(contractor.id!, description);
				return newMap;
			});
		} catch (err) {
			console.error("Failed to generate description:", err);
		} finally {
			setGeneratingDescriptions((prev) => {
				const newSet = new Set(prev);
				newSet.delete(contractor.id!);
				return newSet;
			});
		}
	}, [contractorDescriptions, generateWhyThisContractor]);

	const handleLoadMore = () => {
		setVisibleContractorsCount((prev) => Math.min(prev + 3, contractors.length));
	};

	const renderMatchingStep = () => {
		const selectedContractorsList = contractors.filter(
			(c) => c.id !== undefined && selectedContractors.has(c.id)
		);

		return (
			<div className="space-y-4 sm:space-y-6">
				{/* Selected Contractors Section */}
				{selectedContractors.size > 0 && (
					<div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-200 p-3 sm:p-4 md:p-6 shadow-sm">
						<div className="flex items-center gap-3 mb-4">
							<div className="bg-emerald-600 p-2 rounded-lg">
								<Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
							</div>
							<div className="flex-1">
								<Heading level={3} className="text-lg sm:text-xl text-gray-900 mb-1">
									Selected Contractors
								</Heading>
								<Text className="text-sm sm:text-base text-gray-700">
									{selectedContractors.size} contractor{selectedContractors.size !== 1 ? "s" : ""} selected for invitation
								</Text>
							</div>
						</div>

						{/* Selected Contractors List */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
							{selectedContractorsList.map((contractor) => (
								<div
									key={contractor.id}
									className="bg-white rounded-lg border border-emerald-200 p-3 sm:p-4 flex items-start justify-between gap-3 hover:shadow-md transition-shadow"
								>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1">
											<CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
											<h4 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
												{contractor.name}
											</h4>
										</div>
										{contractor.rating !== null && contractor.rating !== undefined && (
											<div className="flex items-center gap-1 mb-1">
												<Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
												<span className="text-xs sm:text-sm font-medium text-gray-700">
													{Number(contractor.rating).toFixed(1)}
												</span>
												{contractor.reviews_count > 0 && (
													<span className="text-xs text-gray-500">
														({contractor.reviews_count})
													</span>
												)}
											</div>
										)}
										{contractor.city && contractor.state && (
											<div className="flex items-center gap-1 text-xs text-gray-600">
												<MapPin className="w-3 h-3" />
												<span className="truncate">
													{contractor.city}, {contractor.state}
												</span>
											</div>
										)}
									</div>
									<button
										onClick={(e) => {
											e.stopPropagation();
											if (contractor.id !== undefined) {
												toggleContractorSelection(contractor.id);
											}
										}}
										className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
										title="Remove contractor"
									>
										<X className="w-4 h-4 sm:w-5 sm:h-5" />
									</button>
								</div>
							))}
						</div>

						{/* Action Button */}
						{selectedContractors.size > 0 && (
							<div className="mt-4 pt-4 border-t border-emerald-200">
								<button
									onClick={() => setActiveStep(2)}
									className="w-full sm:w-auto bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
								>
									<Users className="w-4 h-4" />
									<span>Proceed to Invite ({selectedContractors.size})</span>
								</button>
							</div>
						)}
					</div>
				)}

				{/* Selection Count Badge (when no contractors selected) */}
				{selectedContractors.size === 0 && (
					<div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
						<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
							<Text className="text-xs sm:text-sm text-gray-600">
								Select contractors to invite for your project
							</Text>
							<div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 w-full sm:w-auto justify-center sm:justify-start">
								<Users className="w-4 h-4 text-gray-400" />
								<span className="text-xs sm:text-sm font-medium text-gray-600">0 selected</span>
							</div>
						</div>
					</div>
				)}

				{/* Loading State */}
				{loading && (
					<div className="flex items-center justify-center py-8 sm:py-12">
						<Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-emerald-600" />
						<Text className="ml-2 sm:ml-3 text-gray-600 text-sm sm:text-base">Loading contractors...</Text>
					</div>
				)}

				{/* Error State */}
				{error && !loading && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
						<Text className="text-red-800 text-sm sm:text-base">{error}</Text>
					</div>
				)}

				{/* Contractors List */}
				{!loading && !error && (
					<>
						{contractors.length === 0 ? (
							<div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg border border-gray-200 px-4">
								<Text className="text-gray-500 text-sm sm:text-base">
									No contractors found matching your project criteria.
								</Text>
							</div>
						) : (
							<>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
									{contractors.slice(0, visibleContractorsCount).map((contractor) => {
										const isSelected = contractor.id !== undefined && selectedContractors.has(contractor.id);
										const hasDescription = contractor.id !== undefined && contractorDescriptions.has(contractor.id);
										const isGenerating = contractor.id !== undefined && generatingDescriptions.has(contractor.id);
										const description = contractor.id !== undefined ? contractorDescriptions.get(contractor.id) : null;

										return (
											<div
												key={contractor.id}
												className={`
													border-2 rounded-lg p-4 sm:p-5 cursor-pointer transition-all relative overflow-hidden
													${isSelected
														? "border-emerald-500 bg-emerald-50 shadow-lg ring-2 ring-emerald-200"
														: "border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md hover:bg-emerald-50/30"
													}
												`}
												onClick={() => contractor.id !== undefined && toggleContractorSelection(contractor.id)}
											>
												{/* Selection Indicator Badge */}
												{isSelected && (
													<div className="absolute top-2 right-2 bg-emerald-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-md z-10">
														<CheckCircle2 className="w-3 h-3" />
														<span className="hidden sm:inline">Selected</span>
													</div>
												)}

												<div className="flex items-start justify-between mb-2 sm:mb-3 pr-12 sm:pr-16">
													<div className="flex-1 min-w-0">
														<h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-900 mb-1 sm:mb-2 truncate">
															{contractor.name}
														</h3>
														{contractor.rating !== null && contractor.rating !== undefined && (
															<div className="flex items-center gap-1.5 text-xs sm:text-sm mb-1 sm:mb-2 flex-wrap">
																<Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
																<span className="font-semibold text-gray-900">
																	{Number(contractor.rating).toFixed(1)}
																</span>
																{contractor.reviews_count > 0 && (
																	<span className="text-gray-500 text-xs">
																		({contractor.reviews_count} {contractor.reviews_count === 1 ? 'review' : 'reviews'})
																	</span>
																)}
															</div>
														)}
													</div>
												</div>

												{contractor.city && contractor.state && (
													<div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
														<MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 flex-shrink-0" />
														<span className="font-medium truncate">
															{contractor.city}, {contractor.state}
														</span>
													</div>
												)}

												{contractor.specializations && (
													<div className="mb-2 sm:mb-3">
														<Text className="text-xs font-medium text-gray-500 mb-1 sm:mb-1.5 uppercase tracking-wide">
															Specializations
														</Text>
														<Text className="text-xs sm:text-sm text-gray-700 line-clamp-2 leading-relaxed">
															{contractor.specializations}
														</Text>
													</div>
												)}

												{/* AI Generated "Why this contractor" Section */}
												<div className="mb-2 sm:mb-3">
													{!hasDescription && !isGenerating && (
														<button
															onClick={(e) => {
																e.stopPropagation();
																handleGenerateDescription(contractor);
															}}
															className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-medium py-2 px-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
														>
															<Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
															<span>Why this contractor?</span>
														</button>
													)}
													{isGenerating && (
														<div className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-600 py-2 px-3 bg-gray-50 rounded-lg">
															<Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-emerald-600" />
															<span>Generating insights...</span>
														</div>
													)}
													{hasDescription && description && (
														<div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-3">
															<div className="flex items-start gap-2 mb-2">
																<Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
																<Text className="text-xs font-semibold text-emerald-900 uppercase tracking-wide">
																	Why this contractor?
																</Text>
															</div>
															<Text className="text-xs sm:text-sm text-gray-700 whitespace-pre-line leading-relaxed">
																{description}
															</Text>
														</div>
													)}
												</div>

												<div className="flex items-center gap-2 flex-wrap">
													{contractor.years_in_business && (
														<div className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium">
															<span>🏢</span>
															<span>{contractor.years_in_business} years</span>
														</div>
													)}

													{contractor.kfw_eligible && (
														<div className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-medium">
															<span>✓</span>
															<span>KfW Eligible</span>
														</div>
													)}
												</div>
											</div>
										);
									})}
								</div>

								{/* Load More Button */}
								{visibleContractorsCount < contractors.length && (
									<div className="flex justify-center mt-6">
										<button
											onClick={handleLoadMore}
											className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg"
										>
											<ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
											<span>Load More Contractors ({contractors.length - visibleContractorsCount} remaining)</span>
										</button>
									</div>
								)}
							</>
						)}
					</>
				)}
			</div>
		);
	};

	const renderInviteStep = () => {
		const selectedContractorsList = contractors.filter(
			(c) => c.id !== undefined && selectedContractors.has(c.id)
		);

		if (selectedContractorsList.length === 0) {
			return (
				<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6 text-center">
					<Users className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-600 mx-auto mb-3" />
					<Heading level={3} className="text-lg sm:text-xl text-gray-900 mb-2">
						No Contractors Selected
					</Heading>
					<Text className="text-gray-600 text-sm sm:text-base mb-4">
						Please go back to the Matching step and select contractors to invite.
					</Text>
					<button
						onClick={() => setActiveStep(1)}
						className="bg-emerald-600 text-white px-4 sm:px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 mx-auto"
					>
						<ArrowLeft className="w-4 h-4" />
						Back to Matching
					</button>
				</div>
			);
		}

		return (
			<div className="space-y-4 sm:space-y-6">
				{/* Recipients Section */}
				<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-4 sm:p-6">
					<div className="flex items-center gap-3 mb-4">
						<div className="bg-blue-600 p-2 rounded-lg">
							<Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
						</div>
						<div className="flex-1">
							<Heading level={3} className="text-lg sm:text-xl text-gray-900 mb-1">
								Recipients
							</Heading>
							<Text className="text-sm sm:text-base text-gray-700">
								{selectedContractorsList.length} contractor{selectedContractorsList.length !== 1 ? "s" : ""} will receive this invitation
							</Text>
						</div>
					</div>

					{/* Recipients List */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
						{selectedContractorsList.map((contractor) => (
							<div
								key={contractor.id}
								className="bg-white rounded-lg border border-blue-200 p-3 sm:p-4 hover:shadow-md transition-shadow"
							>
								<div className="flex items-start gap-2 mb-2">
									<User className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
									<div className="flex-1 min-w-0">
										<h4 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
											{contractor.name}
										</h4>
										{contractor.email && (
											<Text className="text-xs sm:text-sm text-gray-600 truncate mt-1">
												{contractor.email}
											</Text>
										)}
										{!contractor.email && (
											<Text className="text-xs text-red-600 mt-1">No email address</Text>
										)}
									</div>
								</div>
								{contractor.city && contractor.state && (
									<div className="flex items-center gap-1 text-xs text-gray-500">
										<MapPin className="w-3 h-3" />
										<span className="truncate">
											{contractor.city}, {contractor.state}
										</span>
									</div>
								)}
							</div>
						))}
					</div>
				</div>

				{/* Email Draft Section */}
				{emailSent ? (
					<div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 sm:p-6 text-center">
						<CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 text-green-600 mx-auto mb-4" />
						<Heading level={3} className="text-lg sm:text-xl text-gray-900 mb-2">
							Invitations Sent Successfully!
						</Heading>
						<Text className="text-gray-600 text-sm sm:text-base mb-4">
							Your invitations have been sent to {selectedContractorsList.length} contractor{selectedContractorsList.length !== 1 ? "s" : ""}.
						</Text>
						<div className="flex flex-col sm:flex-row gap-3 justify-center">
							<button
								onClick={() => setActiveStep(3)}
								className="bg-emerald-600 text-white px-4 sm:px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
							>
								Proceed to Offers
							</button>
							<button
								onClick={() => {
									setEmailSent(false);
									setEmailSubject(`Project Invitation: ${selectedProject?.name}`);
									setEmailBody(generateDefaultEmailBody());
								}}
								className="bg-gray-200 text-gray-700 px-4 sm:px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
							>
								Send Another
							</button>
						</div>
					</div>
				) : (
					<div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
						<div className="flex items-center gap-3 mb-4 sm:mb-6">
							<div className="bg-emerald-600 p-2 rounded-lg">
								<Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
							</div>
							<div>
								<Heading level={3} className="text-lg sm:text-xl text-gray-900 mb-1">
									Email Draft
								</Heading>
								<Text className="text-sm text-gray-600">
									Review and customize your invitation email
								</Text>
							</div>
						</div>

						{/* Error Message */}
						{error && (
							<div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4">
								<Text className="text-red-800 text-sm sm:text-base">{error}</Text>
							</div>
						)}

						{/* Email Form */}
						<div className="space-y-4 sm:space-y-6">
							{/* Subject Field */}
							<div>
								<label htmlFor="email-subject" className="block text-sm font-medium text-gray-700 mb-2">
									Subject
								</label>
								<input
									id="email-subject"
									type="text"
									value={emailSubject}
									onChange={(e) => setEmailSubject(e.target.value)}
									className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
									placeholder="Enter email subject"
								/>
							</div>

							{/* Body Field */}
							<div>
								<label htmlFor="email-body" className="block text-sm font-medium text-gray-700 mb-2">
									Message
								</label>
								<textarea
									id="email-body"
									value={emailBody}
									onChange={(e) => setEmailBody(e.target.value)}
									rows={12}
									className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base resize-y font-mono"
									placeholder="Enter email message"
								/>
								<Text className="text-xs text-gray-500 mt-1">
									You can customize this message before sending
								</Text>
							</div>

							{/* Action Buttons */}
							<div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
								<button
									onClick={handleSendEmail}
									disabled={sendingEmail || !emailSubject.trim() || !emailBody.trim()}
									className="flex-1 sm:flex-none bg-emerald-600 text-white px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
								>
									{sendingEmail ? (
										<>
											<Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
											<span>Sending...</span>
										</>
									) : (
										<>
											<Send className="w-4 h-4 sm:w-5 sm:h-5" />
											<span>Send Invitations</span>
										</>
									)}
								</button>
								<button
									onClick={() => {
										setEmailSubject(`Project Invitation: ${selectedProject?.name}`);
										setEmailBody(generateDefaultEmailBody());
									}}
									className="bg-gray-200 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
								>
									Reset to Default
								</button>
								<button
									onClick={() => setActiveStep(1)}
									className="bg-gray-200 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
								>
									Back
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		);
	};

	const renderStepContent = () => {
		switch (activeStep) {
			case 1:
				return renderMatchingStep();
			case 2:
				return renderInviteStep();
			case 3:
				return (
					<div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 text-center">
						<Text className="text-gray-500 text-sm sm:text-base">Offers step - Coming soon</Text>
					</div>
				);
			case 4:
				return (
					<div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 text-center">
						<Text className="text-gray-500 text-sm sm:text-base">Compare step - Coming soon</Text>
					</div>
				);
			case 5:
				return (
					<div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 text-center">
						<Text className="text-gray-500 text-sm sm:text-base">Draft step - Coming soon</Text>
					</div>
				);
			case 6:
				return (
					<div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 text-center">
						<Text className="text-gray-500 text-sm sm:text-base">Sign step - Coming soon</Text>
					</div>
				);
			default:
				return null;
		}
	};

	if (!selectedProject) {
		return (
			<div className="text-center py-8 sm:py-12 px-4">
				<Heading level={1} className="mb-3 sm:mb-4 text-xl sm:text-2xl md:text-3xl">No Project Selected</Heading>
				<Text className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
					Please select a project from the Home page to access Contracting options.
				</Text>
				<button
					onClick={() => navigate("/")}
					className="flex items-center gap-2 mx-auto bg-emerald-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors text-sm sm:text-base"
				>
					<ArrowLeft className="w-4 h-4" />
					Go to Home
				</button>
			</div>
		);
	}

	return (
		<div className="space-y-4 sm:space-y-6">
			<div>
				<Heading level={1} className="text-xl sm:text-2xl md:text-3xl mb-2 sm:mb-3">Contracting</Heading>
				<Text className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
					Manage contractors and contracting details for{" "}
					<span className="font-medium">{selectedProject.name}</span>.
				</Text>
			</div>

			{/* Stepper */}
			<div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 overflow-x-auto">
				<Stepper steps={STEPS} activeStep={activeStep} onStepClick={setActiveStep} />
			</div>

			{/* Step Content */}
			<div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 md:p-6">{renderStepContent()}</div>

			{/* AI Assistant - Only show in Matching step */}
			{activeStep === 1 && <AIAssistant />}
		</div>
	);
};

export default Contracting;
