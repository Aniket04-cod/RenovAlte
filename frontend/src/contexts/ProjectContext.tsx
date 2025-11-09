import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Project } from "../services/api";

interface ProjectContextType {
	selectedProject: Project | null;
	selectProject: (project: Project | null) => void;
	clearProject: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const STORAGE_KEY = "selectedProject";

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);

	// Load selected project from localStorage on mount
	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				const project = JSON.parse(stored);
				setSelectedProject(project);
			} catch (error) {
				console.error("Failed to parse stored project:", error);
				localStorage.removeItem(STORAGE_KEY);
			}
		}
	}, []);

	// Save selected project to localStorage whenever it changes
	useEffect(() => {
		if (selectedProject) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedProject));
		} else {
			localStorage.removeItem(STORAGE_KEY);
		}
	}, [selectedProject]);

	const selectProject = (project: Project | null) => {
		setSelectedProject(project);
	};

	const clearProject = () => {
		setSelectedProject(null);
	};

	return (
		<ProjectContext.Provider value={{ selectedProject, selectProject, clearProject }}>
			{children}
		</ProjectContext.Provider>
	);
};

export const useProject = (): ProjectContextType => {
	const context = useContext(ProjectContext);
	if (context === undefined) {
		throw new Error("useProject must be used within a ProjectProvider");
	}
	return context;
};

