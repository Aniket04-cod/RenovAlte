import React from "react";
import Text from "../../components/Text/Text";
import Heading from "../../components/Heading/Heading";

const Home: React.FC = () => {
  return (
    <div>
      <Heading level={1}>Welcome to RenoAlt Homne</Heading>
      <Text>This is the home page.</Text>
    </div>
  );
};

export default Home;
