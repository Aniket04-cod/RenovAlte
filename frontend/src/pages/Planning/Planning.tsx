import Heading from "../../components/Heading/Heading";
import React from "react";
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

const Planning: React.FC = () => {
  const { selectedProject } = useProject();
  const navigate = useNavigate(); 

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
                Set up your renovation plan, timeline, and
                permits step by step.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="col-span-2 space-y-6">
                <ProjectSetupWizard />
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
                  <Button variant="primary">
                    <Download className="w-4 h-4 mr-2" />
                    Export Plan
                  </Button>
                  <Button variant="primary">
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button className="ml-auto bg-emerald-600 hover:bg-emerald-700">
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
