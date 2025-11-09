import Heading from "../../components/Heading/Heading";
import React from "react";
import Text from "../../components/Text/Text";
import { ProjectSetupWizard } from "./ProjectSetupWizard";
import { AISuggestions } from "./AISuggestion";
import { RenovationPhases } from "./RenovationPhases";

const Contractors: React.FC = () => {
  return (
    <div>
      <Heading level={1}>Contractors</Heading>
      <Text className="text-gray-600">Find your Contractors here</Text>
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

export default Contractors;
