import Heading from "../../components/Heading/Heading";
import React from "react";
import Text from "../../components/Text/Text";
import { useProject } from "../../contexts/ProjectContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

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
      <Heading level={1}>Planning the work</Heading>
      <Text className="text-gray-600 mb-6">
        Set up your renovation plan, timeline, and permits step by step for{" "}
        <span className="font-medium">{selectedProject.name}</span>.
      </Text>

      {/* Planning content will go here */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <Text className="text-gray-500">
          Planning tools and timeline will be available here for this project.
        </Text>
      </div>
    </div>
  );
};

export default Planning;
