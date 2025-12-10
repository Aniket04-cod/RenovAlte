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
/* import { BudgetPreview } from "./BudgetPreview"; */
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
  heritageProtection: string;
  heatingSystem?: string;
  insulationType?: string;
  windowsType?: string;
  neighborImpact: string;
  financingPreference: string;
  incentiveIntent: string;
  livingDuringRenovation: string;
  energyCertificateRating: string;
  knownMajorIssues: string;
  surveysRequired: string;
}

// API Response interfaces
interface ApiPlanResponse {
  success: boolean;
  plan: {
    phases: any[];
    gantt_chart: any[];
    permits: any[];
    stakeholders: any[];
    // ... other fields
  };
  // ... other fields
}

export function Planning() {
  const { selectedProject } = useProject();
  const navigate = useNavigate();
  const [projectPlan, setProjectPlan] = useState<ProjectPlanData | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [apiPlanData, setApiPlanData] = useState<ApiPlanResponse | null>(null);

  // Function to handle plan generation
  const handleGeneratePlan = async (planData: ProjectPlanData) => {
    setIsGeneratingPlan(true);
    setProjectPlan(planData);

    try {
      // Map frontend field names to backend API field names
      // Build payload and only include optional fields when present
      const requestPayload: any = {
        building_type: planData.buildingType,
        budget: planData.budget,
        location: planData.bundesland, // Maps to Bundesland choice field
        building_size: planData.buildingSize,
        renovation_goals: planData.goals, // Should be array of goal choices
        building_age: planData.buildingAge, // ISO date format: YYYY-MM-DD
        target_start_date: planData.startDate, // ISO date format: YYYY-MM-DD
        financing_preference: planData.financingPreference,
        incentive_intent: planData.incentiveIntent,
        living_during_renovation: planData.livingDuringRenovation,
        heritage_protection: planData.heritageProtection,
      };

      if (planData.energyCertificateRating) {
        requestPayload.energy_certificate_available = planData.energyCertificateRating;
      }
      if (planData.heatingSystem) {
        requestPayload.heating_system_type = planData.heatingSystem;
      }
      if (planData.windowsType) {
        requestPayload.window_type = planData.windowsType;
      }
      if (planData.insulationType) {
        requestPayload.current_insulation_status = planData.insulationType;
      }

      // Log payload both as object and JSON for easier copy/paste debugging
      console.log("Sending renovation plan request:", requestPayload);
      try {
        console.log("Sending renovation plan request (JSON):", JSON.stringify(requestPayload));
      } catch (e) {
        // ignore stringify errors
      }

      const response = await fetch("http://127.0.0.1:8000/api/renovation/generate-plan/", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        // Try to parse error details from response
        try {
          const errorData = await response.json();
          console.error("API Error Response:", errorData);
          throw new Error(`API error: ${JSON.stringify(errorData)}`);
        } catch (e) {
          throw new Error(`Failed to generate plan (Status: ${response.status})`);
        }
      }

      const result: ApiPlanResponse = await response.json();
      console.log("Plan generated successfully:", result);
      setApiPlanData(result);

    } catch (error) {
      console.error("Error generating plan:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
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
          
          {/* Show components only when API data is available */}
          {apiPlanData && (
            <>
              <RenovationPhases phases={apiPlanData.plan.phases} />
              <TimelineGantt tasks={apiPlanData.plan.gantt_chart} />

              <div className="grid grid-cols-2 gap-6">
                <PermitChecklist permits={apiPlanData.plan.permits} />
                <div className="space-y-6">
                 {/*  <BudgetPreview /> */}
                  <CollaborationArea stakeholders={apiPlanData.plan.stakeholders} />
                </div>
              </div>
            </>
          )}

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
}

export default Planning;