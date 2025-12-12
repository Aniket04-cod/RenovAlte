import Heading from "../../components/Heading/Heading";
import React, {useState, useEffect} from "react";
import Text from "../../components/Text/Text";
import {useProject} from "../../contexts/ProjectContext";
import {useNavigate} from "react-router-dom";
import {Contractor} from "../../services/contractors";
import {ArrowLeft, Loader2} from "lucide-react";
import Stepper, {StepperStep} from "../../components/Stepper/Stepper";
import PlanningSourceStep from "./PlanningSourceStep";
import MatchingStep from "./MatchingStep";
import InviteStep from "./InviteStep";
import CommunicateStep from "./CommunicateStep";
import {contractingPlanningApi} from "../../services/contractingPlanning";

const STEPS: StepperStep[] = [
    {id: 1, label: "Planning"},
    {id: 2, label: "Matching"},
    {id: 3, label: "Invite"},
    {id: 4, label: "Communicate"}
]

const Contracting: React.FC = () => {
    const {selectedProject} = useProject();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(1);
    const [isLoadingStep, setIsLoadingStep] = useState(true);
    const [contractors, setContractors] = useState<Contractor[]>([]);
    const [selectedContractors, setSelectedContractors] = useState<Set<number>>(new Set());
    const [customRequirements, setCustomRequirements] = useState<{description: string; files: File[]}>({
        description: "",
        files: []
    });

    // Load the saved step on mount
    useEffect(() => {
        const loadSavedStep = async () => {
            if (!selectedProject?.id) return;

            setIsLoadingStep(true);
            try {
                const planning = await contractingPlanningApi.getRequirements(selectedProject.id);
                if (planning && planning.current_step) {
                    setActiveStep(planning.current_step);
                }
            } catch (error) {
                console.error("Error loading saved step:", error);
                // If planning doesn't exist, start at step 1 (default)
            } finally {
                setIsLoadingStep(false);
            }
        };

        loadSavedStep();
    }, [selectedProject?.id]);

    // Save step whenever it changes
    useEffect(() => {
        const saveStep = async () => {
            if (!selectedProject?.id || isLoadingStep) return;

            try {
                await contractingPlanningApi.updateStep(selectedProject.id, activeStep);
            } catch (error) {
                console.error("Error saving step:", error);
            }
        };

        saveStep();
    }, [activeStep, selectedProject?.id, isLoadingStep]);

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

    const handleContractorsLoaded = (loadedContractors: Contractor[]) => {
        setContractors(loadedContractors);
    };

    const handleRequirementsChange = (description: string, files: File[]) => {
        setCustomRequirements({description, files});
    };

    // Handle step changes with validation
    const handleStepChange = (newStep: number) => {
        // Prevent going back from Communicate step (step 4)
        if (activeStep === 4 && newStep < 4) {
            return; // Block backward navigation from step 4
        }
        setActiveStep(newStep);
    };

    const renderStepContent = () => {
        if (!selectedProject) return null;

        switch (activeStep) {
            case 1:
                return (
                    <PlanningSourceStep
                        selectedProject={selectedProject}
                        onStepChange={setActiveStep}
                        onRequirementsChange={handleRequirementsChange}
                    />
                );
            case 2:
                return (
                    <MatchingStep
                        selectedProject={selectedProject}
                        selectedContractors={selectedContractors}
                        onContractorToggle={toggleContractorSelection}
                        onStepChange={setActiveStep}
                        onContractorsLoaded={handleContractorsLoaded}
                    />
                );
            case 3:
                return (
                    <InviteStep
                        selectedProject={selectedProject}
                        contractors={contractors}
                        selectedContractors={selectedContractors}
                        onStepChange={setActiveStep}
                    />
                );
            case 4:
                return (
                    <CommunicateStep
                        selectedProject={selectedProject}
                        contractors={contractors}
                        selectedContractors={selectedContractors}
                        onStepChange={setActiveStep}
                    />
                )
            default:
                return null;
        }
    };

    if (!selectedProject) {
        return (
            <div className="text-center py-8 sm:py-12 px-4">
                <Heading level={1} className="mb-3 sm:mb-4 text-xl sm:text-2xl md:text-3xl">No Project
                    Selected</Heading>
                <Text className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                    Please select a project from the Home page to access Contracting options.
                </Text>
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 mx-auto bg-emerald-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors text-sm sm:text-base"
                >
                    <ArrowLeft className="w-4 h-4"/>
                    Go to Home
                </button>
            </div>
        );
    }

    // Show loading state while fetching saved step
    if (isLoadingStep) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                <Text className="ml-3 text-gray-600">Loading...</Text>
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
                <Stepper 
                    steps={STEPS} 
                    activeStep={activeStep} 
                    onStepClick={(step) => {
                        // Prevent clicking on stepper to go back from step 4
                        if (activeStep === 4 && step < 4) {
                            return;
                        }
                        handleStepChange(step);
                    }}
                />
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 md:p-6">{renderStepContent()}</div>

        </div>
    );
};

export default Contracting;
