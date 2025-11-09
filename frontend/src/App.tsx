import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Planning from "./pages/Planning/Planning";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { TopBar } from "./components/Topbar/Topbar";
import Contractors from "./pages/Contractors";
import Financing from "./pages/Financing/Financing";
import LandingPage from "./pages/Landing/Landing";

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <LandingPage onLogin={() => setIsAuthenticated(true)} />;
  }
  return (
    <Router>
      <div className="flex bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <main className="flex-1 p-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/contractors" element={<Contractors />} />
              <Route path="/financing" element={<Financing />} />
              <Route path="/planning" element={<Planning />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
