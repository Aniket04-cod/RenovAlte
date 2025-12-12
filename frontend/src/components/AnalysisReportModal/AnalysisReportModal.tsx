import React, { useState, useRef } from "react";
import { 
	X, 
	FileText, 
	BarChart, 
	Download, 
	CheckCircle2, 
	AlertCircle, 
	AlertTriangle,
	Clock,
	DollarSign,
	Shield,
	ThumbsUp,
	ThumbsDown,
	HelpCircle,
	ChevronDown,
	ChevronUp,
	TrendingUp,
	Calendar,
	ClipboardCheck,
	FileCheck,
	Award,
	Info
} from "lucide-react";
import "./AnalysisReportModal.css";
import type { StructuredAnalysis, StructuredComparison } from "../../types/offerAnalysis";

interface ContractorOffer {
	id: number;
	contractor_id: number;
	contractor_name?: string;
	total_price?: number;
	currency: string;
	timeline_duration_days?: number;
	offer_date?: string;
}

interface AnalysisReportModalProps {
	reportContent: string;
	reportType: "analysis" | "comparison";
	offerDetails?: ContractorOffer;
	comparedOffers?: ContractorOffer[];
	onClose: () => void;
}

const AnalysisReportModal: React.FC<AnalysisReportModalProps> = ({
	reportContent,
	reportType,
	offerDetails,
	comparedOffers = [],
	onClose,
}) => {
	const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
	const contentRef = useRef<HTMLDivElement>(null);
	
	// State for collapsible sections
	const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
		pricing: false,
		timeline: false,
		scope: false,
		terms: false,
		quality: false,
		risks: false
	});
	
	const toggleSection = (section: string) => {
		setExpandedSections(prev => ({
			...prev,
			[section]: !prev[section]
		}));
	};

	const formatPrice = (price?: number, currency?: string) => {
		if (!price) return "N/A";
		return new Intl.NumberFormat("de-DE", {
			style: "currency",
			currency: currency || "EUR",
		}).format(price);
	};

	const formatDate = (dateString?: string) => {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleDateString("de-DE");
	};

	const getRecommendationConfig = (recommendation: string) => {
		switch (recommendation) {
			case "recommended":
				return {
					label: "Recommended",
					icon: CheckCircle2,
					bgColor: "bg-green-50",
					borderColor: "border-green-200",
					textColor: "text-green-800",
					badgeColor: "bg-green-100 text-green-800",
				};
			case "acceptable":
				return {
					label: "Acceptable with Clarification",
					icon: CheckCircle2,
					bgColor: "bg-blue-50",
					borderColor: "border-blue-200",
					textColor: "text-blue-800",
					badgeColor: "bg-blue-100 text-blue-800",
				};
			case "caution":
				return {
					label: "Proceed with Caution",
					icon: AlertTriangle,
					bgColor: "bg-yellow-50",
					borderColor: "border-yellow-200",
					textColor: "text-yellow-800",
					badgeColor: "bg-yellow-100 text-yellow-800",
				};
			case "not_recommended":
				return {
					label: "Not Recommended",
					icon: AlertCircle,
					bgColor: "bg-red-50",
					borderColor: "border-red-200",
					textColor: "text-red-800",
					badgeColor: "bg-red-100 text-red-800",
				};
			default:
				return {
					label: "Under Review",
					icon: HelpCircle,
					bgColor: "bg-gray-50",
					borderColor: "border-gray-200",
					textColor: "text-gray-800",
					badgeColor: "bg-gray-100 text-gray-800",
				};
		}
	};

	const getRiskConfig = (riskLevel: string) => {
		switch (riskLevel) {
			case "low":
				return {
					label: "Low Risk",
					color: "text-green-600",
					bgColor: "bg-green-50",
					borderColor: "border-green-200",
				};
			case "medium":
				return {
					label: "Medium Risk",
					color: "text-yellow-600",
					bgColor: "bg-yellow-50",
					borderColor: "border-yellow-200",
				};
			case "high":
				return {
					label: "High Risk",
					color: "text-red-600",
					bgColor: "bg-red-50",
					borderColor: "border-red-200",
				};
			default:
				return {
					label: "Risk Assessment",
					color: "text-gray-600",
					bgColor: "bg-gray-50",
					borderColor: "border-gray-200",
				};
		}
	};

	const handleDownloadPDF = async () => {
		setIsGeneratingPDF(true);
		try {
			// Dynamically import jsPDF and html2canvas
			const { default: jsPDF } = await import('jspdf');
			const { default: html2canvas } = await import('html2canvas');

			if (!contentRef.current) return;

			// Create a temporary container with all content visible
			const tempContainer = document.createElement('div');
			tempContainer.style.position = 'absolute';
			tempContainer.style.left = '-9999px';
			tempContainer.style.width = '800px';
			tempContainer.style.backgroundColor = 'white';
			tempContainer.style.padding = '40px';
			
			// Clone and append content
			const clonedContent = contentRef.current.cloneNode(true) as HTMLElement;
			
			// Remove any collapse states
			const collapsibles = clonedContent.querySelectorAll('[data-collapsible]');
			collapsibles.forEach((el) => {
				(el as HTMLElement).style.display = 'block';
			});
			
			tempContainer.appendChild(clonedContent);
			document.body.appendChild(tempContainer);

			// Generate canvas
			const canvas = await html2canvas(tempContainer, {
				scale: 2,
				useCORS: true,
				logging: false,
				backgroundColor: '#ffffff',
			});

			// Remove temporary container
			document.body.removeChild(tempContainer);

			// Create PDF
			const imgWidth = 210; // A4 width in mm
			const pageHeight = 297; // A4 height in mm
			const imgHeight = (canvas.height * imgWidth) / canvas.width;
			let heightLeft = imgHeight;

			const pdf = new jsPDF('p', 'mm', 'a4');
			let position = 0;

			// Add image to PDF
			const imgData = canvas.toDataURL('image/png');
			pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
			heightLeft -= pageHeight;

			// Add new pages if needed
			while (heightLeft >= 0) {
				position = heightLeft - imgHeight;
				pdf.addPage();
				pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
				heightLeft -= pageHeight;
			}

			// Download PDF
			const fileName = reportType === "analysis" 
				? `Offer_Analysis_${offerDetails?.contractor_name || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`
				: `Offer_Comparison_${new Date().toISOString().split('T')[0]}.pdf`;
			
			pdf.save(fileName);
		} catch (error) {
			console.error('Error generating PDF:', error);
			alert('Failed to generate PDF. Please try again.');
		} finally {
			setIsGeneratingPDF(false);
		}
	};

	// Extract structured data from content string
	const extractStructuredData = (content: string): StructuredAnalysis | StructuredComparison | null => {
		try {
			// The backend now sends structured_data directly as JSON
			const parsed = JSON.parse(content);
			return parsed;
		} catch (error) {
			console.error('Failed to parse structured data from content:', error);
			console.error('Content received:', content?.substring(0, 500));
			return null;
		}
	};

	// Render single offer analysis view
	const renderAnalysisView = () => {
		const data = extractStructuredData(reportContent) as StructuredAnalysis;
		
		if (!data || !data.executive_summary || !data.recommendation) {
			console.error('Invalid structured data for analysis');
			return (
				<div className="space-y-4">
					<div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4">
						<p className="text-sm text-red-800">
							<strong>Error:</strong> Failed to load analysis data. Please try generating the analysis again.
						</p>
					</div>
				</div>
			);
		}
		
		return renderAnalysisWithData(data);
	};

	// Separate function to render the modern UI
	const renderAnalysisWithData = (data: StructuredAnalysis) => {
		const recommendationConfig = getRecommendationConfig(data.recommendation);
		const riskConfig = getRiskConfig(data.risk_level);
		const RecommendationIcon = recommendationConfig.icon;

		return (
			<div className="space-y-6">
				{/* Hero Section - Recommendation */}
				<div className={`${recommendationConfig.bgColor} ${recommendationConfig.borderColor} border-2 rounded-xl p-6`}>
					<div className="flex items-start gap-4">
						<div className={`${recommendationConfig.badgeColor} p-3 rounded-lg`}>
							<RecommendationIcon className="w-8 h-8" />
						</div>
						<div className="flex-1">
							<div className="flex items-center gap-3 mb-2">
								<h3 className={`text-xl font-bold ${recommendationConfig.textColor}`}>
									{recommendationConfig.label}
								</h3>
								<span className={`px-3 py-1 rounded-full text-sm font-semibold ${recommendationConfig.badgeColor}`}>
									Score: {data.overall_score}/10
								</span>
							</div>
							<p className="text-gray-700 leading-relaxed mb-2">
								{data.executive_summary}
							</p>
							{data.recommendation_reasoning && (
								<p className="text-gray-600 text-sm italic">
									{data.recommendation_reasoning}
								</p>
							)}
						</div>
					</div>
				</div>

				{/* Quick Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{/* Price Card */}
					<div className="stat-card bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
						<div className="flex items-center gap-3 mb-2">
							<div className="bg-emerald-100 p-2 rounded-lg">
								<DollarSign className="w-5 h-5 text-emerald-600" />
							</div>
							<span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
								Price
							</span>
						</div>
						<div className="text-2xl font-bold text-gray-900 mb-1">
							{formatPrice(offerDetails?.total_price, offerDetails?.currency)}
						</div>
						<div className="flex items-center gap-2">
							<span className={`text-sm font-medium ${
								data.pricing_analysis.value_rating === 'excellent' ? 'text-green-600' :
								data.pricing_analysis.value_rating === 'good' ? 'text-blue-600' :
								data.pricing_analysis.value_rating === 'fair' ? 'text-yellow-600' : 'text-red-600'
							}`}>
								{data.pricing_analysis.value_rating.charAt(0).toUpperCase() + data.pricing_analysis.value_rating.slice(1)} value
							</span>
							<span className="text-xs text-gray-500">• {data.pricing_analysis.price_vs_budget}</span>
						</div>
					</div>

					{/* Timeline Card */}
					<div className="stat-card bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
						<div className="flex items-center gap-3 mb-2">
							<div className="bg-blue-100 p-2 rounded-lg">
								<Clock className="w-5 h-5 text-blue-600" />
							</div>
							<span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
								Timeline
							</span>
						</div>
						<div className="text-2xl font-bold text-gray-900 mb-1">
							{data.timeline_assessment.estimated_duration_days} days
						</div>
						<div className="flex items-center gap-2">
							{data.timeline_assessment.duration_realistic ? (
								<span className="text-sm font-medium text-green-600">Realistic</span>
							) : (
								<span className="text-sm font-medium text-yellow-600">Optimistic</span>
							)}
						</div>
					</div>

					{/* Risk Card */}
					<div className={`stat-card bg-white border-2 ${riskConfig.borderColor} rounded-lg p-4 hover:shadow-md transition-shadow`}>
						<div className="flex items-center gap-3 mb-2">
							<div className={`${riskConfig.bgColor} p-2 rounded-lg`}>
								<Shield className={`w-5 h-5 ${riskConfig.color}`} />
							</div>
							<span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
								Risk Level
							</span>
						</div>
						<div className={`text-2xl font-bold mb-1 ${riskConfig.color}`}>
							{riskConfig.label}
						</div>
						{data.risk_factors && data.risk_factors.length > 0 && (
							<div className="text-xs text-gray-600">
								{data.risk_factors.length} factor{data.risk_factors.length > 1 ? 's' : ''} identified
							</div>
						)}
					</div>
				</div>

				{/* Strengths & Weaknesses */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Strengths */}
					<div className="bg-green-50 border-2 border-green-200 rounded-lg p-5">
						<div className="flex items-center gap-2 mb-4">
							<ThumbsUp className="w-5 h-5 text-green-600" />
							<h4 className="font-bold text-gray-900">Strengths</h4>
						</div>
						<ul className="space-y-2">
							{data.strengths.map((strength, index) => (
								<li key={index} className="flex items-start gap-2 text-sm text-gray-700">
									<CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
									<span>{strength}</span>
								</li>
							))}
						</ul>
					</div>

					{/* Weaknesses */}
					<div className="bg-red-50 border-2 border-red-200 rounded-lg p-5">
						<div className="flex items-center gap-2 mb-4">
							<ThumbsDown className="w-5 h-5 text-red-600" />
							<h4 className="font-bold text-gray-900">Weaknesses</h4>
						</div>
						<ul className="space-y-2">
							{data.weaknesses.map((weakness, index) => (
								<li key={index} className="flex items-start gap-2 text-sm text-gray-700">
									<AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
									<span>{weakness}</span>
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Detailed Analysis - Modern Interactive Sections */}
				<div className="space-y-3">
					<h4 className="font-bold text-gray-900 text-lg mb-2 flex items-center gap-2">
						<FileText className="w-5 h-5 text-emerald-600" />
						Detailed Analysis
					</h4>
					
					{/* Pricing Analysis - Collapsible */}
					<div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all">
						<button 
							onClick={() => toggleSection('pricing')}
							className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
						>
							<div className="flex items-center gap-3">
								<div className="bg-emerald-100 p-2 rounded-lg">
									<TrendingUp className="w-5 h-5 text-emerald-600" />
								</div>
								<div className="text-left">
									<h5 className="font-bold text-gray-900">Pricing Analysis</h5>
									<div className="flex items-center gap-2 mt-1">
										<span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
											data.pricing_analysis.value_rating === 'excellent' ? 'bg-green-100 text-green-700' :
											data.pricing_analysis.value_rating === 'good' ? 'bg-blue-100 text-blue-700' :
											data.pricing_analysis.value_rating === 'fair' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
										}`}>
											{data.pricing_analysis.value_rating.toUpperCase()}
										</span>
										<span className="text-xs text-gray-500">{data.pricing_analysis.price_vs_budget} budget</span>
										<span className={`text-xs font-medium ${
											data.pricing_analysis.cost_breakdown_quality === 'transparent' ? 'text-green-600' :
											data.pricing_analysis.cost_breakdown_quality === 'adequate' ? 'text-blue-600' : 'text-yellow-600'
										}`}>• {data.pricing_analysis.cost_breakdown_quality}</span>
									</div>
								</div>
							</div>
							{expandedSections.pricing ? (
								<ChevronUp className="w-5 h-5 text-gray-400" />
							) : (
								<ChevronDown className="w-5 h-5 text-gray-400" />
							)}
						</button>
						{expandedSections.pricing && (
							<div className="px-4 pb-4 space-y-3 border-t border-gray-200 pt-3 bg-gradient-to-b from-emerald-50/30 to-white" data-collapsible>
								<p className="text-sm text-gray-700 leading-relaxed">{data.pricing_analysis.summary}</p>
								{data.pricing_analysis.market_comparison && (
									<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
										<div className="flex items-start gap-2">
											<Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
											<div>
												<p className="text-xs font-semibold text-blue-800 mb-1">Market Comparison</p>
												<p className="text-xs text-gray-700">{data.pricing_analysis.market_comparison}</p>
											</div>
										</div>
									</div>
								)}
								{data.pricing_analysis.unusual_line_items && data.pricing_analysis.unusual_line_items.length > 0 && (
									<div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
										<p className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1">
											<AlertCircle className="w-3.5 h-3.5" />
											Unusual Line Items
										</p>
										<div className="space-y-1.5">
											{data.pricing_analysis.unusual_line_items.map((item, idx) => (
												<div key={idx} className="flex items-start gap-2">
													<span className="text-amber-600 text-xs mt-0.5">▸</span>
													<span className="text-xs text-gray-700">{item}</span>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						)}
					</div>

					{/* Timeline Assessment - Collapsible */}
					<div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all">
						<button 
							onClick={() => toggleSection('timeline')}
							className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
						>
							<div className="flex items-center gap-3">
								<div className="bg-blue-100 p-2 rounded-lg">
									<Calendar className="w-5 h-5 text-blue-600" />
								</div>
								<div className="text-left">
									<h5 className="font-bold text-gray-900">Timeline Assessment</h5>
									<div className="flex items-center gap-2 mt-1">
										<span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
											data.timeline_assessment.duration_realistic ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
										}`}>
											{data.timeline_assessment.duration_realistic ? 'REALISTIC' : 'OPTIMISTIC'}
										</span>
										<span className="text-xs text-gray-500">{data.timeline_assessment.estimated_duration_days} days estimated</span>
									</div>
								</div>
							</div>
							{expandedSections.timeline ? (
								<ChevronUp className="w-5 h-5 text-gray-400" />
							) : (
								<ChevronDown className="w-5 h-5 text-gray-400" />
							)}
						</button>
						{expandedSections.timeline && (
							<div className="px-4 pb-4 space-y-3 border-t border-gray-200 pt-3 bg-gradient-to-b from-blue-50/30 to-white" data-collapsible>
								<p className="text-sm text-gray-700 leading-relaxed">{data.timeline_assessment.summary}</p>
								{data.timeline_assessment.start_date_assessment && (
									<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
										<p className="text-xs font-semibold text-blue-800 mb-1">Start Date Assessment</p>
										<p className="text-xs text-gray-700">{data.timeline_assessment.start_date_assessment}</p>
									</div>
								)}
								{data.timeline_assessment.scheduling_risks && data.timeline_assessment.scheduling_risks.length > 0 && (
									<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
										<p className="text-xs font-semibold text-yellow-800 mb-2 flex items-center gap-1">
											<AlertTriangle className="w-3.5 h-3.5" />
											Scheduling Risks
										</p>
										<div className="space-y-1.5">
											{data.timeline_assessment.scheduling_risks.map((risk, idx) => (
												<div key={idx} className="flex items-start gap-2">
													<span className="text-yellow-600 text-xs mt-0.5">▸</span>
													<span className="text-xs text-gray-700">{risk}</span>
												</div>
											))}
										</div>
									</div>
								)}
								{data.timeline_assessment.seasonal_factors && (
									<div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
										<p className="text-xs font-semibold text-purple-800 mb-1">Seasonal Factors</p>
										<p className="text-xs text-gray-700">{data.timeline_assessment.seasonal_factors}</p>
									</div>
								)}
							</div>
						)}
					</div>

					{/* Scope Analysis - Collapsible */}
					{data.scope_analysis && (
						<div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all">
							<button 
								onClick={() => toggleSection('scope')}
								className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
							>
								<div className="flex items-center gap-3">
									<div className="bg-purple-100 p-2 rounded-lg">
										<ClipboardCheck className="w-5 h-5 text-purple-600" />
									</div>
									<div className="text-left">
										<h5 className="font-bold text-gray-900">Scope Analysis</h5>
										<div className="flex items-center gap-2 mt-1">
											<span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
												data.scope_analysis.completeness_rating === 'comprehensive' ? 'bg-green-100 text-green-700' :
												data.scope_analysis.completeness_rating === 'adequate' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
											}`}>
												{data.scope_analysis.completeness_rating.toUpperCase()}
											</span>
											{data.scope_analysis.potential_gaps && data.scope_analysis.potential_gaps.length > 0 && (
												<span className="text-xs text-amber-600 font-medium">• {data.scope_analysis.potential_gaps.length} potential gap{data.scope_analysis.potential_gaps.length > 1 ? 's' : ''}</span>
											)}
										</div>
									</div>
								</div>
								{expandedSections.scope ? (
									<ChevronUp className="w-5 h-5 text-gray-400" />
								) : (
									<ChevronDown className="w-5 h-5 text-gray-400" />
								)}
							</button>
							{expandedSections.scope && (
								<div className="px-4 pb-4 space-y-3 border-t border-gray-200 pt-3 bg-gradient-to-b from-purple-50/30 to-white" data-collapsible>
									<p className="text-sm text-gray-700 leading-relaxed">{data.scope_analysis.summary}</p>
									{data.scope_analysis.included_items && data.scope_analysis.included_items.length > 0 && (
										<div className="bg-green-50 border border-green-200 rounded-lg p-3">
											<p className="text-xs font-semibold text-green-800 mb-2 flex items-center gap-1">
												<CheckCircle2 className="w-3.5 h-3.5" />
												Included Items
											</p>
											<div className="grid grid-cols-1 gap-1.5">
												{data.scope_analysis.included_items.map((item, idx) => (
													<div key={idx} className="flex items-center gap-2">
														<div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
														<span className="text-xs text-gray-700">{item}</span>
													</div>
												))}
											</div>
										</div>
									)}
									{data.scope_analysis.potential_gaps && data.scope_analysis.potential_gaps.length > 0 && (
										<div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
											<p className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1">
												<AlertCircle className="w-3.5 h-3.5" />
												Potential Gaps
											</p>
											<div className="space-y-1.5">
												{data.scope_analysis.potential_gaps.map((gap, idx) => (
													<div key={idx} className="flex items-start gap-2">
														<span className="text-amber-600 text-xs mt-0.5">▸</span>
														<span className="text-xs text-gray-700">{gap}</span>
													</div>
												))}
											</div>
										</div>
									)}
									{data.scope_analysis.material_quality_assessment && (
										<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
											<p className="text-xs font-semibold text-blue-800 mb-1">Material Quality</p>
											<p className="text-xs text-gray-700">{data.scope_analysis.material_quality_assessment}</p>
										</div>
									)}
								</div>
							)}
						</div>
					)}

					{/* Terms and Conditions - Collapsible */}
					{data.terms_and_conditions && (
						<div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all">
							<button 
								onClick={() => toggleSection('terms')}
								className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
							>
								<div className="flex items-center gap-3">
									<div className="bg-indigo-100 p-2 rounded-lg">
										<FileCheck className="w-5 h-5 text-indigo-600" />
									</div>
									<div className="text-left">
										<h5 className="font-bold text-gray-900">Terms & Conditions</h5>
										<div className="flex items-center gap-2 mt-1">
											<span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
												data.terms_and_conditions.payment_terms_fairness === 'fair' ? 'bg-green-100 text-green-700' :
												data.terms_and_conditions.payment_terms_fairness === 'acceptable' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
											}`}>
												{data.terms_and_conditions.payment_terms_fairness.toUpperCase()}
											</span>
											<span className={`text-xs font-medium ${
												data.terms_and_conditions.warranty_adequate ? 'text-green-600' : 'text-amber-600'
											}`}>• Warranty {data.terms_and_conditions.warranty_adequate ? 'adequate' : 'needs review'}</span>
										</div>
									</div>
								</div>
								{expandedSections.terms ? (
									<ChevronUp className="w-5 h-5 text-gray-400" />
								) : (
									<ChevronDown className="w-5 h-5 text-gray-400" />
								)}
							</button>
							{expandedSections.terms && (
								<div className="px-4 pb-4 space-y-3 border-t border-gray-200 pt-3 bg-gradient-to-b from-indigo-50/30 to-white" data-collapsible>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
										<div className="bg-green-50 border border-green-200 rounded-lg p-3">
											<p className="text-xs font-semibold text-green-800 mb-1.5 flex items-center gap-1">
												<DollarSign className="w-3.5 h-3.5" />
												Payment Terms
											</p>
											<p className="text-xs text-gray-700 mb-2">{data.terms_and_conditions.payment_terms_summary}</p>
											<p className="text-xs text-gray-600 italic">{data.terms_and_conditions.payment_schedule_analysis}</p>
										</div>
										<div className={`border rounded-lg p-3 ${
											data.terms_and_conditions.warranty_adequate ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
										}`}>
											<p className={`text-xs font-semibold mb-1.5 flex items-center gap-1 ${
												data.terms_and_conditions.warranty_adequate ? 'text-green-800' : 'text-amber-800'
											}`}>
												<Shield className="w-3.5 h-3.5" />
												Warranty Coverage
											</p>
											<p className="text-xs text-gray-700">{data.terms_and_conditions.warranty_assessment}</p>
										</div>
									</div>
									{data.terms_and_conditions.insurance_coverage && (
										<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
											<p className="text-xs font-semibold text-blue-800 mb-1">Insurance Coverage</p>
											<p className="text-xs text-gray-700">{data.terms_and_conditions.insurance_coverage}</p>
										</div>
									)}
									{data.terms_and_conditions.special_conditions_concerns && data.terms_and_conditions.special_conditions_concerns.length > 0 && (
										<div className="bg-red-50 border border-red-200 rounded-lg p-3">
											<p className="text-xs font-semibold text-red-800 mb-2 flex items-center gap-1">
												<AlertTriangle className="w-3.5 h-3.5" />
												Special Conditions Concerns
											</p>
											<div className="space-y-1.5">
												{data.terms_and_conditions.special_conditions_concerns.map((concern, idx) => (
													<div key={idx} className="flex items-start gap-2">
														<span className="text-red-600 text-xs mt-0.5">▸</span>
														<span className="text-xs text-gray-700">{concern}</span>
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							)}
						</div>
					)}

					{/* Quality Indicators - Collapsible */}
					{data.quality_indicators && (
						<div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all">
							<button 
								onClick={() => toggleSection('quality')}
								className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
							>
								<div className="flex items-center gap-3">
									<div className="bg-amber-100 p-2 rounded-lg">
										<Award className="w-5 h-5 text-amber-600" />
									</div>
									<div className="text-left">
										<h5 className="font-bold text-gray-900">Quality Indicators</h5>
										<div className="flex items-center gap-2 mt-1">
											<span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
												data.quality_indicators.professionalism_rating === 'high' ? 'bg-green-100 text-green-700' :
												data.quality_indicators.professionalism_rating === 'medium' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
											}`}>
												{data.quality_indicators.professionalism_rating.toUpperCase()}
											</span>
											{data.quality_indicators.certifications_standards && data.quality_indicators.certifications_standards.length > 0 && (
												<span className="text-xs text-blue-600 font-medium">• {data.quality_indicators.certifications_standards.length} certification{data.quality_indicators.certifications_standards.length > 1 ? 's' : ''}</span>
											)}
										</div>
									</div>
								</div>
								{expandedSections.quality ? (
									<ChevronUp className="w-5 h-5 text-gray-400" />
								) : (
									<ChevronDown className="w-5 h-5 text-gray-400" />
								)}
							</button>
							{expandedSections.quality && (
								<div className="px-4 pb-4 space-y-3 border-t border-gray-200 pt-3 bg-gradient-to-b from-amber-50/30 to-white" data-collapsible>
									<p className="text-sm text-gray-700 leading-relaxed">{data.quality_indicators.offer_presentation_quality}</p>
									{data.quality_indicators.certifications_standards && data.quality_indicators.certifications_standards.length > 0 && (
										<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
											<p className="text-xs font-semibold text-blue-800 mb-2">Standards & Certifications</p>
											<div className="flex flex-wrap gap-2">
												{data.quality_indicators.certifications_standards.map((cert, idx) => (
													<span key={idx} className="inline-flex items-center gap-1 text-xs bg-white border border-blue-300 text-blue-700 px-2.5 py-1 rounded-full font-medium">
														<CheckCircle2 className="w-3 h-3" />
														{cert}
													</span>
												))}
											</div>
										</div>
									)}
									{data.quality_indicators.material_brands_mentioned && data.quality_indicators.material_brands_mentioned.length > 0 && (
										<div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
											<p className="text-xs font-semibold text-purple-800 mb-2">Material Brands</p>
											<div className="flex flex-wrap gap-2">
												{data.quality_indicators.material_brands_mentioned.map((brand, idx) => (
													<span key={idx} className="text-xs bg-white border border-purple-300 text-purple-700 px-2.5 py-1 rounded-full">
														{brand}
													</span>
												))}
											</div>
										</div>
									)}
									{data.quality_indicators.contractor_credibility_signals && data.quality_indicators.contractor_credibility_signals.length > 0 && (
										<div className="bg-green-50 border border-green-200 rounded-lg p-3">
											<p className="text-xs font-semibold text-green-800 mb-2">Credibility Signals</p>
											<div className="space-y-1.5">
												{data.quality_indicators.contractor_credibility_signals.map((signal, idx) => (
													<div key={idx} className="flex items-center gap-2">
														<CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0" />
														<span className="text-xs text-gray-700">{signal}</span>
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							)}
						</div>
					)}

					{/* Risk Factors - Collapsible */}
					{data.risk_factors && data.risk_factors.length > 0 && (
						<div className="bg-white border-2 border-red-200 rounded-lg overflow-hidden hover:shadow-md transition-all">
							<button 
								onClick={() => toggleSection('risks')}
								className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors"
							>
								<div className="flex items-center gap-3">
									<div className={`${getRiskConfig(data.risk_level).bgColor} p-2 rounded-lg`}>
										<AlertTriangle className={`w-5 h-5 ${getRiskConfig(data.risk_level).color}`} />
									</div>
									<div className="text-left">
										<h5 className="font-bold text-gray-900">Risk Factors</h5>
										<div className="flex items-center gap-2 mt-1">
											<span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
												data.risk_level === 'low' ? 'bg-green-100 text-green-700' :
												data.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
											}`}>
												{data.risk_level.toUpperCase()} RISK
											</span>
											<span className="text-xs text-gray-500">• {data.risk_factors.length} factor{data.risk_factors.length > 1 ? 's' : ''} identified</span>
										</div>
									</div>
								</div>
								{expandedSections.risks ? (
									<ChevronUp className="w-5 h-5 text-gray-400" />
								) : (
									<ChevronDown className="w-5 h-5 text-gray-400" />
								)}
							</button>
							{expandedSections.risks && (
								<div className="px-4 pb-4 space-y-2 border-t border-red-200 pt-3 bg-gradient-to-b from-red-50/30 to-white" data-collapsible>
									{data.risk_factors.map((risk, index) => (
										<div key={index} className="bg-white border border-red-200 rounded-lg p-3 hover:border-red-300 transition-colors">
											<div className="flex items-start gap-2">
												<AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
												<span className="text-sm text-gray-700">{risk}</span>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					)}
				</div>

				{/* Conversation Updates */}
				{data.conversation_context && data.conversation_context.has_conversation_updates && (
					<div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5">
						<h4 className="font-bold text-gray-900 mb-3">💬 Conversation Updates</h4>
						{data.conversation_context.key_clarifications && data.conversation_context.key_clarifications.length > 0 && (
							<div className="mb-3">
								<p className="text-sm font-semibold text-blue-800 mb-2">Key Clarifications:</p>
								<ul className="space-y-1">
									{data.conversation_context.key_clarifications.map((clarification, idx) => (
										<li key={idx} className="text-sm text-gray-700">• {clarification}</li>
									))}
								</ul>
							</div>
						)}
						{data.conversation_context.impact_on_evaluation && (
							<p className="text-sm text-gray-700 italic">{data.conversation_context.impact_on_evaluation}</p>
						)}
					</div>
				)}

				{/* Additional Insights */}
				{data.additional_insights && (
					<div className="insights-card">
						<div className="section-header">
							<div className="section-header-icon insights">
								<Info className="w-5 h-5 text-white" />
							</div>
							<div>
								<h4 className="section-header-title">Additional Insights</h4>
								<p className="section-header-subtitle">Expert observations and opportunities</p>
							</div>
						</div>
						<div className="insight-grid">
							{data.additional_insights.negotiation_opportunities && data.additional_insights.negotiation_opportunities.length > 0 && (
								<div className="insight-section">
									<p className="insight-label">Negotiation Opportunities</p>
									<div className="space-y-1 pl-6">
										{data.additional_insights.negotiation_opportunities.map((opp, idx) => (
											<div key={idx} className="insight-list-item">
												<span>{opp}</span>
											</div>
										))}
									</div>
								</div>
							)}
							{data.additional_insights.notable_observations && data.additional_insights.notable_observations.length > 0 && (
								<div className="insight-section">
									<p className="insight-label">Notable Observations</p>
									<div className="space-y-1 pl-6">
										{data.additional_insights.notable_observations.map((obs, idx) => (
											<div key={idx} className="insight-list-item">
												<span>{obs}</span>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Questions to Ask */}
				{data.key_questions && data.key_questions.length > 0 && (
					<div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5">
						<div className="flex items-center gap-2 mb-4">
							<HelpCircle className="w-5 h-5 text-blue-600" />
							<h4 className="font-bold text-gray-900">Important Questions to Ask</h4>
						</div>
						<ul className="space-y-2">
							{data.key_questions.map((question, index) => (
								<li key={index} className="flex items-start gap-2 text-sm text-gray-700">
									<span className="font-semibold text-blue-600 mt-0.5">{index + 1}.</span>
									<span>{question}</span>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		);
	};

	// Render comparison view
	const renderComparisonView = () => {
		const data = extractStructuredData(reportContent) as StructuredComparison;
		
		if (!data || !data.executive_summary || !data.recommended_contractor) {
			console.error('Invalid structured data for comparison');
			return (
				<div className="space-y-4">
					<div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4">
						<p className="text-sm text-red-800">
							<strong>Error:</strong> Failed to load comparison data. Please try generating the comparison again.
						</p>
					</div>
				</div>
			);
		}

		return (
			<div className="space-y-6">
				{/* Executive Summary */}
				<div className="comparison-summary-card">
					<div className="comparison-summary-content">
						<div className="comparison-summary-header">
							<div className="comparison-summary-icon-wrapper">
								<div className="comparison-summary-icon">
									<BarChart className="w-8 h-8 text-white" />
								</div>
							</div>
							<div className="comparison-summary-text">
								<h3 className="comparison-summary-title">Comparison Summary</h3>
								<p className="comparison-summary-description">
									{data.executive_summary}
								</p>
								{data.recommendation_reasoning && (
									<div className="comparison-summary-reasoning">
										<p>{data.recommendation_reasoning}</p>
									</div>
								)}
							</div>
						</div>
						
						{/* Contractor Quick Cards */}
						<div className="contractor-quick-cards">
							<div className="contractor-quick-card recommended">
								<div className="contractor-quick-label recommended">
									<Award className="contractor-quick-icon" />
									<span>Top Recommendation</span>
								</div>
								<div className="contractor-quick-name" title={data.recommended_contractor}>
									{data.recommended_contractor}
								</div>
								<div className="contractor-quick-badge">
									<CheckCircle2 className="w-3.5 h-3.5" />
									Best Overall Choice
								</div>
							</div>
							
							{data.runner_up_contractor && (
								<div className="contractor-quick-card runner-up">
									<div className="contractor-quick-label runner-up">
										<TrendingUp className="contractor-quick-icon" />
										<span>Runner-Up</span>
									</div>
									<div className="contractor-quick-name" title={data.runner_up_contractor}>
										{data.runner_up_contractor}
									</div>
									<div className="contractor-quick-badge">
										<Info className="w-3.5 h-3.5" />
										Alternative Option
									</div>
								</div>
							)}
							
							<div className="contractor-quick-card best-value">
								<div className="contractor-quick-label best-value">
									<DollarSign className="contractor-quick-icon" />
									<span>Best Value</span>
								</div>
								<div className="contractor-quick-name" title={data.best_value_contractor}>
									{data.best_value_contractor}
								</div>
								<div className="contractor-quick-badge">
									<TrendingUp className="w-3.5 h-3.5" />
									Price Performance
								</div>
							</div>
						</div>

						{/* Summary Stats */}
						{data.comparison_matrix && (
							<div className="summary-stats">
								<div className="summary-stat-item">
									<div className="summary-stat-icon contractors">
										<Award className="w-4 h-4 text-white" />
									</div>
									<div className="summary-stat-content">
										<span className="summary-stat-label">Contractors</span>
										<span className="summary-stat-value">{data.comparison_matrix.length} Compared</span>
									</div>
								</div>
								{data.comparison_matrix.length > 1 && (
									<>
										<div className="summary-stat-item">
											<div className="summary-stat-icon range">
												<DollarSign className="w-4 h-4 text-white" />
											</div>
											<div className="summary-stat-content">
												<span className="summary-stat-label">Price Range</span>
												<span className="summary-stat-value">
													{formatPrice(
														Math.min(...data.comparison_matrix.map(c => c.total_price || 0)),
														data.comparison_matrix[0].currency
													)} - {formatPrice(
														Math.max(...data.comparison_matrix.map(c => c.total_price || 0)),
														data.comparison_matrix[0].currency
													)}
												</span>
											</div>
										</div>
										<div className="summary-stat-item">
											<div className="summary-stat-icon timeline">
												<Clock className="w-4 h-4 text-white" />
											</div>
											<div className="summary-stat-content">
												<span className="summary-stat-label">Timeline Range</span>
												<span className="summary-stat-value">
													{Math.min(...data.comparison_matrix.map(c => c.timeline_days || 0))} - {Math.max(...data.comparison_matrix.map(c => c.timeline_days || 0))} days
												</span>
											</div>
										</div>
									</>
								)}
							</div>
						)}
					</div>
				</div>

				{/* Key Differences */}
				{data.key_differences && data.key_differences.length > 0 && (
					<div className="key-differences-card">
						<div className="section-header">
							<div className="section-header-icon timeline">
								<AlertCircle className="w-5 h-5 text-white" />
							</div>
							<div>
								<h4 className="section-header-title">Key Differences</h4>
								<p className="section-header-subtitle">Critical distinctions between contractor offers</p>
							</div>
						</div>
						<div className="flex flex-wrap gap-2 mb-4">
							<span className="difference-badge">
								<TrendingUp className="w-3 h-3" />
								{data.key_differences.length} Notable Difference{data.key_differences.length > 1 ? 's' : ''}
							</span>
						</div>
						<div className="space-y-2">
							{data.key_differences.map((diff, index) => (
								<div key={index} className="difference-item">
									<p className="difference-content">{diff}</p>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Comparison Matrix */}
				{data.comparison_matrix && data.comparison_matrix.length > 0 && (
					<div className="space-y-6">
						<div className="contractor-comparison-header">
							<div className="contractor-comparison-icon">
								<BarChart className="w-5 h-5 text-white" />
							</div>
							<div>
								<h4 className="font-bold text-gray-900 text-lg">Contractor Comparison</h4>
								<p className="text-sm text-gray-600">Detailed side-by-side analysis</p>
							</div>
						</div>
						{data.comparison_matrix.map((contractor, index) => {
							const riskConfig = getRiskConfig(contractor.risk_level);
							const isRecommended = contractor.contractor_name === data.recommended_contractor;
							
							return (
								<div 
									key={contractor.contractor_id} 
									className={`contractor-card ${isRecommended ? 'recommended' : ''}`}
								>
									{/* Header */}
									<div className="contractor-header">
										<div className="contractor-name-section">
											<h5 className="contractor-name">
												{contractor.contractor_name}
												{isRecommended && (
													<span className="recommended-badge">
														<Award className="w-3 h-3" />
														Recommended
													</span>
												)}
											</h5>
											<div className="contractor-price">
												{formatPrice(contractor.total_price, contractor.currency)}
											</div>
											<div className="contractor-timeline">
												<Clock className="w-4 h-4 text-gray-500" />
												<span>{contractor.timeline_days} days completion time</span>
											</div>
										</div>
										<div className="contractor-rating-section">
											<div className="contractor-overall-rating">
												{contractor.overall_rating.toFixed(1)}
											</div>
											<div className="contractor-rating-label">Overall Score</div>
										</div>
									</div>

									{/* Rating Bars */}
									<div className="contractor-ratings">
										<div className="rating-item">
											<div className="rating-header">
												<div className="rating-label">
													<DollarSign className="rating-icon text-emerald-600" />
													<span>Price</span>
												</div>
												<span className="rating-value">{contractor.price_rating}/5</span>
											</div>
											<div className="rating-bar-container">
												<div 
													className="rating-bar-fill price" 
													style={{ width: `${(contractor.price_rating / 5) * 100}%` }}
												></div>
											</div>
										</div>
										<div className="rating-item">
											<div className="rating-header">
												<div className="rating-label">
													<Clock className="rating-icon text-blue-600" />
													<span>Timeline</span>
												</div>
												<span className="rating-value">{contractor.timeline_rating}/5</span>
											</div>
											<div className="rating-bar-container">
												<div 
													className="rating-bar-fill timeline" 
													style={{ width: `${(contractor.timeline_rating / 5) * 100}%` }}
												></div>
											</div>
										</div>
										<div className="rating-item">
											<div className="rating-header">
												<div className="rating-label">
													<Award className="rating-icon text-purple-600" />
													<span>Quality</span>
												</div>
												<span className="rating-value">{contractor.quality_rating}/5</span>
											</div>
											<div className="rating-bar-container">
												<div 
													className="rating-bar-fill quality" 
													style={{ width: `${(contractor.quality_rating / 5) * 100}%` }}
												></div>
											</div>
										</div>
										<div className="rating-item">
											<div className="rating-header">
												<div className="rating-label">
													<FileCheck className="rating-icon text-amber-600" />
													<span>Terms</span>
												</div>
												<span className="rating-value">{contractor.terms_rating}/5</span>
											</div>
											<div className="rating-bar-container">
												<div 
													className="rating-bar-fill terms" 
													style={{ width: `${(contractor.terms_rating / 5) * 100}%` }}
												></div>
											</div>
										</div>
									</div>

									{/* Strengths & Weaknesses */}
									<div className="contractor-sw-section">
										<div className="strengths-section">
											<div className="sw-header">
												<CheckCircle2 className="w-4 h-4" />
												<span>Key Strengths</span>
											</div>
											<div className="sw-list">
												{contractor.strengths.slice(0, 3).map((strength, idx) => (
													<div key={idx} className="sw-item">
														<CheckCircle2 className="w-3.5 h-3.5 icon" />
														<span>{strength}</span>
													</div>
												))}
											</div>
										</div>
										<div className="weaknesses-section">
											<div className="sw-header">
												<AlertCircle className="w-4 h-4" />
												<span>Areas of Concern</span>
											</div>
											<div className="sw-list">
												{contractor.weaknesses.slice(0, 3).map((weakness, idx) => (
													<div key={idx} className="sw-item">
														<AlertCircle className="w-3.5 h-3.5 icon" />
														<span>{weakness}</span>
													</div>
												))}
											</div>
										</div>
									</div>

									{/* Risk Level Footer */}
									<div className="contractor-footer">
										<div className="risk-indicator">
											<Shield className="w-4 h-4 text-gray-600" />
											<span className="text-gray-600">Risk Assessment:</span>
											<div className={`risk-dot ${contractor.risk_level}`}></div>
											<span className={riskConfig.color}>{riskConfig.label}</span>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}

				{/* Scenario Recommendations */}
				{data.scenario_recommendations && (
					<div className="bg-white border-2 border-gray-200 rounded-lg p-5">
						<h4 className="font-bold text-gray-900 mb-4">📋 Recommendation by Priority</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<div className="bg-green-50 border border-green-200 rounded-lg p-3">
								<span className="text-xs font-semibold text-green-700 uppercase">Lowest Cost</span>
								<p className="font-bold text-gray-900 mt-1">{data.scenario_recommendations.lowest_cost}</p>
							</div>
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
								<span className="text-xs font-semibold text-blue-700 uppercase">Fastest Completion</span>
								<p className="font-bold text-gray-900 mt-1">{data.scenario_recommendations.fastest_completion}</p>
							</div>
							<div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
								<span className="text-xs font-semibold text-purple-700 uppercase">Highest Quality</span>
								<p className="font-bold text-gray-900 mt-1">{data.scenario_recommendations.highest_quality}</p>
							</div>
							<div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
								<span className="text-xs font-semibold text-emerald-700 uppercase">Best Overall Value</span>
								<p className="font-bold text-gray-900 mt-1">{data.scenario_recommendations.best_overall_value}</p>
							</div>
						</div>
					</div>
				)}

				{/* Detailed Comparisons */}
				{data.detailed_comparisons && (
					<div className="detailed-comparison-card">
						<div className="p-6">
							<div className="section-header">
								<div className="section-header-icon price">
									<BarChart className="w-5 h-5 text-white" />
								</div>
								<div>
									<h4 className="section-header-title">Detailed Comparisons</h4>
									<p className="section-header-subtitle">In-depth analysis across key dimensions</p>
								</div>
							</div>
							<div className="space-y-3">
								{data.detailed_comparisons.price_analysis && (
									<div className="comparison-item comparison-item-price">
										<div className="comparison-item-icon bg-emerald-100">
											<DollarSign className="w-4 h-4 text-emerald-600" />
										</div>
										<div>
											<p className="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-1">Price Analysis</p>
											<p className="text-sm text-gray-700 leading-relaxed">{data.detailed_comparisons.price_analysis}</p>
										</div>
									</div>
								)}
								{data.detailed_comparisons.timeline_analysis && (
									<div className="comparison-item comparison-item-timeline">
										<div className="comparison-item-icon bg-blue-100">
											<Clock className="w-4 h-4 text-blue-600" />
										</div>
										<div>
											<p className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-1">Timeline Analysis</p>
											<p className="text-sm text-gray-700 leading-relaxed">{data.detailed_comparisons.timeline_analysis}</p>
										</div>
									</div>
								)}
								{data.detailed_comparisons.quality_analysis && (
									<div className="comparison-item comparison-item-quality">
										<div className="comparison-item-icon bg-purple-100">
											<Award className="w-4 h-4 text-purple-600" />
										</div>
										<div>
											<p className="text-xs font-bold text-purple-800 uppercase tracking-wide mb-1">Quality Analysis</p>
											<p className="text-sm text-gray-700 leading-relaxed">{data.detailed_comparisons.quality_analysis}</p>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				)}

				{/* Trade-offs */}
				{data.trade_offs && data.trade_offs.length > 0 && (
					<div className="tradeoff-card">
						<div className="section-header">
							<div className="section-header-icon tradeoff">
								<TrendingUp className="w-5 h-5 text-white" />
							</div>
							<div>
								<h4 className="section-header-title">Important Trade-offs</h4>
								<p className="section-header-subtitle">Key considerations when choosing between contractors</p>
							</div>
						</div>
						<div className="flex flex-wrap gap-2 mb-4">
							<span className="tradeoff-badge">
								<AlertTriangle className="w-3 h-3" />
								{data.trade_offs.length} Trade-off{data.trade_offs.length > 1 ? 's' : ''} Identified
							</span>
						</div>
						<div className="space-y-2">
							{data.trade_offs.map((tradeOff, index) => (
								<div key={index} className="tradeoff-item">
									<p className="text-sm text-gray-800 font-medium leading-relaxed">{tradeOff}</p>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Negotiation Opportunities */}
				{data.negotiation_opportunities && data.negotiation_opportunities.length > 0 && (
					<div className="negotiation-card">
						<div className="section-header">
							<div className="section-header-icon negotiation">
								<TrendingUp className="w-5 h-5 text-white" />
							</div>
							<div>
								<h4 className="section-header-title">Negotiation Opportunities</h4>
								<p className="section-header-subtitle">Areas where you can potentially improve terms</p>
							</div>
						</div>
						<div className="flex flex-wrap gap-2 mb-4">
							<span className="negotiation-badge">
								<CheckCircle2 className="w-3 h-3" />
								{data.negotiation_opportunities.length} Opportunit{data.negotiation_opportunities.length > 1 ? 'ies' : 'y'} Found
							</span>
						</div>
						<div className="space-y-2">
							{data.negotiation_opportunities.map((opp, index) => (
								<div key={index} className="negotiation-item">
									<p className="text-sm text-gray-800 font-medium leading-relaxed">{opp}</p>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Next Steps */}
				{data.next_steps && data.next_steps.length > 0 && (
					<div className="next-steps-card">
						<div className="section-header">
							<div className="section-header-icon steps">
								<ClipboardCheck className="w-5 h-5 text-white" />
							</div>
							<div>
								<h4 className="section-header-title">Recommended Next Steps</h4>
								<p className="section-header-subtitle">Action plan to move forward with confidence</p>
							</div>
						</div>
						<div className="space-y-3">
							{data.next_steps.map((step, index) => (
								<div key={index}>
									<div className="step-item">
										<div className="step-number">
											{index + 1}
										</div>
										<p className="step-content">{step}</p>
									</div>
									{index < data.next_steps.length - 1 && (
										<div className="step-divider"></div>
									)}
								</div>
							))}
						</div>
					</div>
				)}

				{/* Additional Insights */}
				{data.additional_insights && (
					<div className="insights-card">
						<div className="section-header">
							<div className="section-header-icon insights">
								<Info className="w-5 h-5 text-white" />
							</div>
							<div>
								<h4 className="section-header-title">Additional Insights</h4>
								<p className="section-header-subtitle">Expert observations and market context</p>
							</div>
						</div>
						<div className="insight-grid">
							{data.additional_insights.market_context && (
								<div className="insight-section">
									<p className="insight-label">Market Context</p>
									<p className="insight-content">{data.additional_insights.market_context}</p>
								</div>
							)}
							{data.additional_insights.standout_observations && data.additional_insights.standout_observations.length > 0 && (
								<div className="insight-section">
									<p className="insight-label">Key Observations</p>
									<div className="space-y-1 pl-6">
										{data.additional_insights.standout_observations.map((obs, idx) => (
											<div key={idx} className="insight-list-item">
												<span>{obs}</span>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
			<div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
					<div className="flex items-center gap-3 flex-1">
						<div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
							{reportType === "analysis" ? (
								<FileText className="w-5 h-5 text-white" />
							) : (
								<BarChart className="w-5 h-5 text-white" />
							)}
						</div>
						<div>
							<h2 className="text-xl font-bold text-gray-900">
								{reportType === "analysis" ? "Offer Analysis" : "Offer Comparison"}
							</h2>
							<p className="text-sm text-gray-600 mt-0.5">
								{reportType === "analysis"
									? `Analysis for ${offerDetails?.contractor_name || "Contractor"}`
									: `Comparing ${comparedOffers.length + 1} offers`}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<button
							onClick={handleDownloadPDF}
							disabled={isGeneratingPDF}
							className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
						>
							{isGeneratingPDF ? (
								<>
									<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
									Generating...
								</>
							) : (
								<>
									<Download className="w-4 h-4" />
									Download PDF
								</>
							)}
						</button>
						<button
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
						>
							<X className="w-5 h-5" />
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-6" ref={contentRef}>
					{reportType === "analysis" ? renderAnalysisView() : renderComparisonView()}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
					<button
						onClick={onClose}
						className="px-5 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
};

export default AnalysisReportModal;
