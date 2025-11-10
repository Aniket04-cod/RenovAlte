import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { projectApi, Project, PROJECT_TYPES } from "../../services/projects";
import Heading from "../../components/Heading/Heading";
import Text from "../../components/Text/Text";
import { Plus, Edit, Trash2, X, CheckCircle2, Sparkles } from "lucide-react";
import { useProject } from "../../contexts/ProjectContext";

const Home: React.FC = () => {
	const { selectedProject: contextSelectedProject, selectProject } = useProject();
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);
	const [formData, setFormData] = useState<Omit<Project, "id">>({
		name: "",
		project_type: "general",
		location: "",
		city: "",
		postal_code: "",
		state: "",
		budget: null,
		additional_information: "",
	});
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		loadProjects();
	}, []);

	const loadProjects = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await projectApi.getAll();
			setProjects(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load projects");
		} finally {
			setLoading(false);
		}
	};

	const validateForm = (): boolean => {
		const errors: Record<string, string> = {};
		if (!formData.name.trim()) {
			errors.name = "Project Name is required";
		}
		if (!formData.city?.trim()) {
			errors.city = "City is required";
		}
		if (!formData.state?.trim()) {
			errors.state = "State is required";
		}
		if (formData.budget !== null && formData.budget < 0) {
			errors.budget = "Budget must be a positive number";
		}
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleOpenCreateModal = () => {
		setSelectedProject(null);
		setFormData({
			name: "",
			project_type: "general",
			location: "",
			city: "",
			postal_code: "",
			state: "",
			budget: null,
			additional_information: "",
		});
		setFormErrors({});
		setIsModalOpen(true);
	};

	const handleSelectProject = (project: Project) => {
		selectProject(project);
	};

	const handleOpenEditModal = (project: Project) => {
		setSelectedProject(project);
		setFormData({
			name: project.name,
			project_type: project.project_type,
			location: project.location || "",
			city: project.city || "",
			postal_code: project.postal_code || "",
			state: project.state || "",
			budget: project.budget,
			additional_information: project.additional_information,
		});
		setFormErrors({});
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedProject(null);
		setFormErrors({});
		setError(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) return;

		try {
			setError(null);
			if (selectedProject?.id) {
				await projectApi.update(selectedProject.id, formData);
			} else {
				await projectApi.create(formData);
			}
			handleCloseModal();
			loadProjects();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to save project");
		}
	};

	const handleDeleteClick = (project: Project) => {
		setSelectedProject(project);
		setIsDeleteModalOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!selectedProject?.id) return;

		try {
			setError(null);
			await projectApi.delete(selectedProject.id);
			setIsDeleteModalOpen(false);
			setSelectedProject(null);
			loadProjects();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to delete project");
		}
	};

	const formatBudget = (budget: number | null): string => {
		if (budget === null) return "Not specified";
		return new Intl.NumberFormat("de-DE", {
			style: "currency",
			currency: "EUR",
		}).format(budget);
	};

	const getProjectTypeLabel = (value: string): string => {
		return PROJECT_TYPES.find((type) => type.value === value)?.label || value;
	};

	return (
		<div className="space-y-8">
			{/* Renovation Assistant Overview */}
			<div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-4 sm:p-6 md:p-8 shadow-sm">
				<div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
					<div className="bg-emerald-600 p-2 sm:p-3 rounded-lg shadow-md flex-shrink-0">
						<Sparkles className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
					</div>
					<div className="flex-1 min-w-0">
						<Heading level={1} className="mb-2 sm:mb-3 text-gray-900 text-lg sm:text-xl md:text-2xl">
							Welcome to Your Renovation Assistant
						</Heading>
						<Text className="text-gray-700 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4">
							Here you can manage all your renovation projects in one place. 
							Create new projects, track your progress, and let our AI-powered assistant guide you through every step of your renovation journey.
						</Text>
						<Text className="text-gray-600 text-xs sm:text-sm">
							Select a project to start planning, explore financing options, and connect with contractors. 
						</Text>
					</div>
				</div>
			</div>

			{/* Projects Section */}
			<div>
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
					<Heading level={2}>Projects</Heading>
					<button
						onClick={handleOpenCreateModal}
						className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors w-full sm:w-auto justify-center"
					>
						<Plus className="w-5 h-5" />
						<span className="text-sm sm:text-base">Create Project</span>
					</button>
				</div>

				{loading ? (
					<div className="text-center py-12 bg-white rounded-lg border border-gray-200">
						<Text className="text-gray-600">Loading projects...</Text>
					</div>
				) : projects.length === 0 ? (
					<div className="text-center py-12 bg-white rounded-lg border border-gray-200">
						<Text className="text-gray-600 mb-4">No projects found.</Text>
						<button
							onClick={handleOpenCreateModal}
							className="text-emerald-600 hover:text-emerald-700 font-medium"
						>
							Create your first project
						</button>
					</div>
				) : (
					<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
						{/* Desktop Table View */}
						<div className="hidden md:block overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gray-50 border-b border-gray-200">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Project Name
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Type
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Location
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Budget
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{projects.map((project) => {
										const isSelected = contextSelectedProject?.id === project.id;
										return (
											<tr
												key={project.id}
												className={`hover:bg-gray-50 ${
													isSelected ? "bg-emerald-50 border-l-4 border-emerald-500" : ""
												}`}
											>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="flex items-center gap-2">
														<div className="text-sm font-medium text-gray-900">
															{project.name}
														</div>
														{isSelected && (
															<span title="Selected project">
																<CheckCircle2 className="w-4 h-4 text-emerald-600" />
															</span>
														)}
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="text-sm text-gray-500">
														{getProjectTypeLabel(project.project_type)}
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="text-sm text-gray-500">
														{project.location}
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="text-sm text-gray-500">
														{formatBudget(project.budget)}
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
													<div className="flex items-center gap-2">
														<button
															onClick={() => handleSelectProject(project)}
															className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
																isSelected
																	? "bg-emerald-600 text-white hover:bg-emerald-700"
																	: "bg-gray-100 text-gray-700 hover:bg-gray-200"
															}`}
															title={isSelected ? "Project selected" : "Select project"}
														>
															{isSelected ? "Selected" : "Select"}
														</button>
														<button
															onClick={() => handleOpenEditModal(project)}
															className="text-emerald-600 hover:text-emerald-900 p-1 rounded"
															title="Edit"
														>
															<Edit className="w-4 h-4" />
														</button>
														<button
															onClick={() => handleDeleteClick(project)}
															className="text-red-600 hover:text-red-900 p-1 rounded"
															title="Delete"
														>
															<Trash2 className="w-4 h-4" />
														</button>
													</div>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>

						{/* Mobile Card View */}
						<div className="md:hidden p-4 space-y-4">
							{projects.map((project) => {
								const isSelected = contextSelectedProject?.id === project.id;
								return (
									<div
										key={project.id}
										className={`bg-white border rounded-lg p-4 shadow-sm ${
											isSelected ? "border-emerald-500 border-2 bg-emerald-50" : "border-gray-200"
										}`}
									>
										<div className="flex items-start justify-between mb-3">
											<div className="flex items-center gap-2 flex-1 min-w-0">
												<h3 className="text-base font-semibold text-gray-900 truncate">
													{project.name}
												</h3>
												{isSelected && (
													<CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
												)}
											</div>
										</div>
										<div className="space-y-2 mb-4">
											<div className="flex items-center justify-between">
												<span className="text-xs font-medium text-gray-500 uppercase">Type</span>
												<span className="text-sm text-gray-900">
													{getProjectTypeLabel(project.project_type)}
												</span>
											</div>
											<div className="flex items-center justify-between">
												<span className="text-xs font-medium text-gray-500 uppercase">Location</span>
												<span className="text-sm text-gray-900">{project.location}</span>
											</div>
											<div className="flex items-center justify-between">
												<span className="text-xs font-medium text-gray-500 uppercase">Budget</span>
												<span className="text-sm text-gray-900">{formatBudget(project.budget)}</span>
											</div>
										</div>
										<div className="flex items-center gap-2 pt-3 border-t border-gray-200">
											<button
												onClick={() => handleSelectProject(project)}
												className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
													isSelected
														? "bg-emerald-600 text-white hover:bg-emerald-700"
														: "bg-gray-100 text-gray-700 hover:bg-gray-200"
												}`}
											>
												{isSelected ? "Selected" : "Select"}
											</button>
											<button
												onClick={() => handleOpenEditModal(project)}
												className="p-2 text-emerald-600 hover:text-emerald-900 hover:bg-emerald-50 rounded transition-colors"
												title="Edit"
											>
												<Edit className="w-5 h-5" />
											</button>
											<button
												onClick={() => handleDeleteClick(project)}
												className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
												title="Delete"
											>
												<Trash2 className="w-5 h-5" />
											</button>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}
			</div>

			{/* Create/Edit Modal */}
			{isModalOpen && createPortal(
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
					<div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
						<div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
							<Heading level={2} className="text-lg sm:text-xl">
								{selectedProject ? "Edit Project" : "Create Project"}
							</Heading>
							<button
								onClick={handleCloseModal}
								className="text-gray-400 hover:text-gray-600 flex-shrink-0"
							>
								<X className="w-5 h-5 sm:w-6 sm:h-6" />
							</button>
						</div>
						<form onSubmit={handleSubmit} className="p-4 sm:p-6">
							{error && (
								<div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
									{error}
								</div>
							)}
							{Object.keys(formErrors).length > 0 && (
								<div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
									<p className="font-medium mb-2">Please fix the following errors:</p>
									<ul className="list-disc list-inside space-y-1">
										{Object.values(formErrors).map((err, index) => (
											<li key={index} className="text-sm">{err}</li>
										))}
									</ul>
								</div>
							)}
							<div className="space-y-4">
								<div>
									<label
										htmlFor="name"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Project Name *
									</label>
									<input
										type="text"
										id="name"
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
										className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
											formErrors.name ? "border-red-500" : "border-gray-300"
										}`}
									/>
									{formErrors.name && (
										<p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
									)}
								</div>

								<div>
									<label
										htmlFor="project_type"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Project Type *
									</label>
									<select
										id="project_type"
										value={formData.project_type}
										onChange={(e) =>
											setFormData({ ...formData, project_type: e.target.value })
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
									>
										{PROJECT_TYPES.map((type) => (
											<option key={type.value} value={type.value}>
												{type.label}
											</option>
										))}
									</select>
								</div>

								<div>
									<label
										htmlFor="location"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Address
									</label>
									<input
										type="text"
										id="location"
										value={formData.location}
										onChange={(e) =>
											setFormData({ ...formData, location: e.target.value })
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
										placeholder="Street address"
									/>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<label
											htmlFor="city"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											City *
										</label>
										<input
											type="text"
											id="city"
											value={formData.city}
											onChange={(e) =>
												setFormData({ ...formData, city: e.target.value })
											}
											className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
												formErrors.city
													? "border-red-500"
													: "border-gray-300"
											}`}
										/>
										{formErrors.city && (
											<p className="mt-1 text-sm text-red-600">
												{formErrors.city}
											</p>
										)}
									</div>

									<div>
										<label
											htmlFor="state"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											State *
										</label>
										<input
											type="text"
											id="state"
											value={formData.state}
											onChange={(e) =>
												setFormData({ ...formData, state: e.target.value })
											}
											className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
												formErrors.state
													? "border-red-500"
													: "border-gray-300"
											}`}
										/>
										{formErrors.state && (
											<p className="mt-1 text-sm text-red-600">
												{formErrors.state}
											</p>
										)}
									</div>
								</div>

								<div>
									<label
										htmlFor="postal_code"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Postal Code
									</label>
									<input
										type="text"
										id="postal_code"
										value={formData.postal_code}
										onChange={(e) =>
											setFormData({ ...formData, postal_code: e.target.value })
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
										placeholder="Postal code"
									/>
								</div>

								<div>
									<label
										htmlFor="budget"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Budget (EUR)
									</label>
									<input
										type="number"
										id="budget"
										step="0.01"
										min="0"
										value={formData.budget ?? ""}
										onChange={(e) =>
											setFormData({
												...formData,
												budget: e.target.value
													? parseFloat(e.target.value)
													: null,
											})
										}
										className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
											formErrors.budget
												? "border-red-500"
												: "border-gray-300"
										}`}
										placeholder="Enter budget amount"
									/>
									{formErrors.budget && (
										<p className="mt-1 text-sm text-red-600">{formErrors.budget}</p>
									)}
								</div>

								<div>
									<label
										htmlFor="additional_information"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Additional Information
									</label>
									<textarea
										id="additional_information"
										rows={6}
										value={formData.additional_information}
										onChange={(e) =>
											setFormData({
												...formData,
												additional_information: e.target.value,
											})
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
										placeholder="Enter additional context for our AI-powered Assistant..."
									/>
								</div>
							</div>

							<div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
								<button
									type="button"
									onClick={handleCloseModal}
									className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
								>
									{selectedProject ? "Update" : "Create"}
								</button>
							</div>
						</form>
					</div>
				</div>,
				document.body
			)}

			{/* Delete Confirmation Modal */}
			{isDeleteModalOpen && selectedProject && createPortal(
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
					<div className="bg-white rounded-lg shadow-xl w-full max-w-md">
						<div className="p-4 sm:p-6">
							<Heading level={2} className="mb-4 text-lg sm:text-xl">
								Delete Project
							</Heading>
							<Text className="mb-6 text-sm sm:text-base">
								Are you sure you want to delete "{selectedProject.name}"? This action
								cannot be undone.
							</Text>
							<div className="flex flex-col sm:flex-row justify-end gap-3">
								<button
									onClick={() => {
										setIsDeleteModalOpen(false);
										setSelectedProject(null);
									}}
									className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
								>
									Cancel
								</button>
								<button
									onClick={handleDeleteConfirm}
									className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
								>
									Delete
								</button>
							</div>
						</div>
					</div>
				</div>,
				document.body
			)}
		</div>
	);
};

export default Home;
