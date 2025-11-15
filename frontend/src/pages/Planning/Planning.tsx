import Heading from "../../components/Heading/Heading";
import React, { useState } from "react";
import Text from "../../components/Text/Text";
import { ProjectSetupWizard } from "./ProjectSetupWizard";
import { RenovationPhases } from "./RenovationPhases";
import { AISuggestions } from "./AISuggestion";
import { useProject } from "../../contexts/ProjectContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Download, Save } from "lucide-react";
import { TimelineGantt } from "./TimelineGantt";
import { Button } from "../../components/Button/Button";
import { PermitChecklist } from "./PermitChecklist";
import { BudgetPreview } from "./BudgetPreview";
import { CollaborationArea } from "./CollaborationArea";

// Define the project data interface
export interface ProjectPlanData {
  buildingType: string;
  budget: number;
  startDate: string;
  goals: string[];
  buildingAge: string;
  buildingSize: number;
  bundesland: string;
  heatingSystem?: string;
  insulationType?: string;
  windowsType?: string;
  neighborImpact: string;
}

const Planning: React.FC = () => {
  const { selectedProject } = useProject();
  const navigate = useNavigate();
  const [projectPlan, setProjectPlan] = useState<ProjectPlanData | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Function to handle plan generation
  const handleGeneratePlan = async (planData: ProjectPlanData) => {
    setIsGeneratingPlan(true);
    setProjectPlan(planData);
    
    try {
      // Send data to backend API
      const response = await fetch('/api/projects/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: selectedProject?.id,
          ...planData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate plan');
      }

      const result = await response.json();
      console.log('Plan generated successfully:', result);
      
      // You can handle the response here - update state, show success message, etc.
      
    } catch (error) {
      console.error('Error generating plan:', error);
      // Handle error (show error message to user)
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Function to save draft
  const handleSaveDraft = async () => {
    if (!projectPlan) return;

    try {
      const response = await fetch('/api/projects/save-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: selectedProject?.id,
          planData: projectPlan,
          status: 'draft'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save draft');
      }

      console.log('Draft saved successfully');
      // Show success message to user
      
    } catch (error) {
      console.error('Error saving draft:', error);
      // Handle error
    }
  };

  // Function to export plan
  const handleExportPlan = async () => {
    if (!projectPlan) return;

    try {
      const response = await fetch('/api/projects/export-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: selectedProject?.id,
          planData: projectPlan
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to export plan');
      }

      const blob = await response.blob();
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `renovation-plan-${selectedProject?.id || 'project'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting plan:', error);
      // Handle error
    }
  };

  if (!selectedProject) {
    return (
      <div className="text-center py-12">
        <Heading level={1} className="mb-4">No Project Selected</Heading>
        <Text className="text-gray-600 mb-6">
          Please select a project from the Home page to access Planning options.
        </Text>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 mx-auto bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go to Home
        </button>
      </div>
    );
  } 

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-2">Planning the Work</h1>
        <p className="text-gray-600">
          Set up your renovation plan, timeline, and permits step by step.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          <ProjectSetupWizard 
            onGeneratePlan={handleGeneratePlan}
            isGenerating={isGeneratingPlan}
          />
          <RenovationPhases />
          <TimelineGantt />

          <div className="grid grid-cols-2 gap-6">
            <PermitChecklist />
            <div className="space-y-6">
              <BudgetPreview />
              <CollaborationArea />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center gap-3 pt-6 border-t">
            <Button 
              variant="primary" 
              onClick={handleExportPlan}
              disabled={!projectPlan}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Plan
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSaveDraft}
              disabled={!projectPlan}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button 
              className="ml-auto bg-emerald-600 hover:bg-emerald-700"
              disabled={!projectPlan}
            >
              Continue to Financing
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div>
          <AISuggestions />
        </div>
      </div>
    </div>
  );
};

export default Planning;