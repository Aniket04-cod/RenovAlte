import Heading from "../../components/Heading/Heading";
import React from "react";
import Text from "../../components/Text/Text";
import { ProjectSetupWizard } from "./ProjectSetupWizard";
import { RenovationPhases } from "./RenovationPhases";
import { AISuggestions } from "./AISuggestion";

const Planning: React.FC = () => {
  return (
    <div>
      <Heading level={1}>Planning the work</Heading>
      <Text className="text-gray-600">
        Set up your renovation plan, timeline, and permits step by step.
      </Text>
      <div className="grid grid-cols-3 gap-6 mt-8">
        <div className="col-span-2 space-y-6">
          <ProjectSetupWizard />
          <RenovationPhases />
        </div>
        <div>
          <AISuggestions />
        </div>
      </div>
    </div>
  );
};

export default Planning;
