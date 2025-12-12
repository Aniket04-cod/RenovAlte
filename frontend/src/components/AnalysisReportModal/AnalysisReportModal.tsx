import React, { useState } from "react";
import { X, FileText, BarChart, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./AnalysisReportModal.css";

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
	const [activeTab, setActiveTab] = useState<"report" | "details">("report");

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

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
			<div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
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
									? "Detailed analysis of the contractor offer"
									: `Comparing ${comparedOffers.length + 1} offers`}
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Tabs */}
				<div className="flex border-b border-gray-200 px-6">
					<button
						onClick={() => setActiveTab("report")}
						className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
							activeTab === "report"
								? "border-emerald-600 text-emerald-600"
								: "border-transparent text-gray-500 hover:text-gray-700"
						}`}
					>
						{reportType === "analysis" ? "Analysis Report" : "Comparison Report"}
					</button>
					<button
						onClick={() => setActiveTab("details")}
						className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
							activeTab === "details"
								? "border-emerald-600 text-emerald-600"
								: "border-transparent text-gray-500 hover:text-gray-700"
						}`}
					>
						Offer Details
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-6">
					{activeTab === "report" ? (
						<div className="prose prose-sm max-w-none markdown-content">
							<ReactMarkdown
								remarkPlugins={[remarkGfm]}
								components={{
									// Custom styling for markdown elements
									h1: ({ node, ...props }) => (
										<h1 className="text-2xl font-bold text-gray-900 mt-6 mb-4" {...props} />
									),
									h2: ({ node, ...props }) => (
										<h2 className="text-xl font-bold text-gray-900 mt-5 mb-3" {...props} />
									),
									h3: ({ node, ...props }) => (
										<h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2" {...props} />
									),
									p: ({ node, ...props }) => (
										<p className="text-gray-700 leading-relaxed mb-4" {...props} />
									),
									ul: ({ node, ...props }) => (
										<ul className="list-disc list-inside mb-4 space-y-2" {...props} />
									),
									ol: ({ node, ...props }) => (
										<ol className="list-decimal list-inside mb-4 space-y-2" {...props} />
									),
									li: ({ node, ...props }) => (
										<li className="text-gray-700" {...props} />
									),
									table: ({ node, ...props }) => (
										<div className="overflow-x-auto mb-4">
											<table className="min-w-full divide-y divide-gray-200 border border-gray-200" {...props} />
										</div>
									),
									thead: ({ node, ...props }) => (
										<thead className="bg-gray-50" {...props} />
									),
									th: ({ node, ...props }) => (
										<th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider" {...props} />
									),
									td: ({ node, ...props }) => (
										<td className="px-4 py-2 text-sm text-gray-700 border-t border-gray-200" {...props} />
									),
									strong: ({ node, ...props }) => (
										<strong className="font-semibold text-gray-900" {...props} />
									),
									code: ({ node, ...props }) => (
										<code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800" {...props} />
									),
								}}
							>
								{reportContent}
							</ReactMarkdown>
						</div>
					) : (
						<div className="space-y-4">
							{/* Primary Offer Details */}
							{offerDetails && (
								<div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
									<h3 className="text-lg font-semibold text-gray-900 mb-3">
										{reportType === "analysis" ? "Offer Details" : "Primary Offer"}
									</h3>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
												Contractor
											</p>
											<p className="text-sm font-medium text-gray-900">
												{offerDetails.contractor_name || `Contractor ${offerDetails.contractor_id}`}
											</p>
										</div>
										<div>
											<p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
												Total Price
											</p>
											<p className="text-sm font-medium text-gray-900">
												{formatPrice(offerDetails.total_price, offerDetails.currency)}
											</p>
										</div>
										<div>
											<p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
												Timeline
											</p>
											<p className="text-sm font-medium text-gray-900">
												{offerDetails.timeline_duration_days
													? `${offerDetails.timeline_duration_days} days`
													: "N/A"}
											</p>
										</div>
										<div>
											<p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
												Offer Date
											</p>
											<p className="text-sm font-medium text-gray-900">
												{formatDate(offerDetails.offer_date)}
											</p>
										</div>
									</div>
								</div>
							)}

							{/* Compared Offers (for comparison type) */}
							{reportType === "comparison" && comparedOffers.length > 0 && (
								<div className="space-y-3">
									<h3 className="text-lg font-semibold text-gray-900">
										Compared Offers
									</h3>
									{comparedOffers.map((offer, index) => (
										<div
											key={offer.id}
											className="bg-gray-50 border border-gray-200 rounded-lg p-4"
										>
											<h4 className="text-md font-medium text-gray-900 mb-3">
												Offer {index + 2} - {offer.contractor_name || `Contractor ${offer.contractor_id}`}
											</h4>
											<div className="grid grid-cols-2 gap-4">
												<div>
													<p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
														Total Price
													</p>
													<p className="text-sm font-medium text-gray-900">
														{formatPrice(offer.total_price, offer.currency)}
													</p>
												</div>
												<div>
													<p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
														Timeline
													</p>
													<p className="text-sm font-medium text-gray-900">
														{offer.timeline_duration_days
															? `${offer.timeline_duration_days} days`
															: "N/A"}
													</p>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					)}
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
