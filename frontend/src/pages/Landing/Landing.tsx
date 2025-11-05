import React from "react";

interface LandingPageProps {
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
    <h1 className="text-3xl font-bold mb-4">Welcome to RenovAlteGermany</h1>
    <button
      className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium"
      onClick={onLogin}
    >
      Login
    </button>
  </div>
);

export default LandingPage;
