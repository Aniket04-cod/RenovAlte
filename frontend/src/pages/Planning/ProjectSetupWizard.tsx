import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/Card/Card";
import { Button } from "../../components/Button/Button";
import { Input } from "../../components/Input/Input";
import { Label } from "../../components/Label/Ladel";
import { Select } from "../../components/Select/Select";
import { Badge } from "../../components/Bagde/Badge";
import { Calendar, Sparkles, MessageSquare, Settings } from "lucide-react";
import { useState } from "react";
import {
  RENOVATIONGOALS,
  HEATING_SYSTEM_OPTIONS,
  INSULATION_OPTIONS,
  BUNDESLAND,
  BUILDING_TYPES,
  WINDOWS_TYPE_OPTIONS,
  NEIGHBOR_IMPACTS_OPTIONS,
  FINANCING_PREFERENCE_OPTIONS,
  INCENTIVE_INTENT_OPTIONS,
  HERITAGE_PROTECTION,
  LIVING_DURING_RENOVATION_OPTIONS,
  ENERGY_CERTIFICATE_RATING_OPTIONS,
  KNOWN_MAJOR_ISSUES_OPTIONS,
  SURVEYS_REQUIRED_OPTIONS,
} from "../../utils/constants";

type InputMode = "manual" | "prompt";

export function ProjectSetupWizard() {
  const [inputMode, setInputMode] = useState<InputMode>("manual");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Manual input states
  const [buildingType, setBuildingType] = useState("single-family");
  const [budget, setBudget] = useState(50000);
  const [startDate, setStartDate] = useState("2025-01-15");
  const [buildingAge, setBuildingAge] = useState("2024-01-15");
  const [buildingSize, setBuildingSize] = useState(50);
  const [bundesland, setBundesland] = useState("hesse");
  const [heatingSystem, setHeatingSystem] = useState("electric");
  const [insulationType, setInsulationType] = useState("partial");
  const [windowsType, setWindowsType] = useState("single-pane");
  const [neighborImpact, setNeighborImpact] = useState("scaffolding");
  const [incentiveIntent, setIncentiveIntent] = useState("yes");
  const [heritageProtection, setHeritageProtection] = useState("no");
  const [livingDuringRenovation, setLivingDuringRenovation] = useState("no");
  const [knownMajorIssues, setKnownMajorIssues] = useState("");
  const [surveysRequired, setSurveysRequired] = useState("");
  const [energyCertificateRating, setEnergyCertificateRating] =
    useState("a_plus");
  const [financingPreference, setFinancingPreference] =
    useState("personal-savings");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    "Energy Efficiency",
  ]);

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleGeneratePlan = () => {
    if (inputMode === "manual") {
      const formData = {
        buildingType,
        budget,
        startDate,
        goals: selectedGoals,
        buildingAge,
        buildingSize,
        bundesland,
        heatingSystem,
        insulationType,
        windowsType,
        neighborImpact,
        financingPreference,
        incentiveIntent,
        livingDuringRenovation,
        energyCertificateRating,
        knownMajorIssues,
        surveysRequired,
      };
      console.log("Manual form data:", formData);
      // Send manual formData to API
    } else {
      // Prompt mode
      setIsGenerating(true);
      console.log("AI Prompt:", prompt);
      // Send prompt to AI API
      // Simulate API call
      setTimeout(() => {
        setIsGenerating(false);
        // Handle AI response here
      }, 2000);
    }
  };

  const handlePromptSubmit = () => {
    if (prompt.trim()) {
      handleGeneratePlan();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          Start Your Project Plan
        </CardTitle>
        <CardDescription>
          Choose how you want to set up your renovation project
        </CardDescription>

        {/* Mode Selection Tabs */}
        <div className="flex border border-gray-200 rounded-lg p-1 mt-4 bg-gray-50">
          <Button
            onClick={() => setInputMode("manual")}
            className={`flex-1 justify-center py-2 px-3 text-sm font-medium transition-colors ${
              inputMode === "manual"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-0 shadow-none"
            }`}
          >
            <Settings className="w-4 h-4" />
            Manual Setup
          </Button>
          <Button
            onClick={() => setInputMode("prompt")}
            className={`flex-1 justify-center py-2 px-3 text-sm font-medium transition-colors ${
              inputMode === "prompt"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-0 shadow-none"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            AI Prompt
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {inputMode === "manual" ? (
          // Manual Input Form
          <>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="building-type">Building Type</Label>
                <Select
                  value={buildingType}
                  options={BUILDING_TYPES}
                  onChange={setBuildingType}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Estimated Budget (€)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="50000"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="bundesland">Location (Bundesland)</Label>
                <Select
                  value={bundesland}
                  options={BUNDESLAND}
                  onChange={setBundesland}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="building-size">Building Size (m²)</Label>
                <Input
                  id="building-size"
                  type="number"
                  placeholder="60"
                  value={buildingSize}
                  onChange={(e) => setBuildingSize(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Renovation Goals</Label>
              <div className="flex flex-wrap gap-2">
                {RENOVATIONGOALS.map((goal) => (
                  <Badge
                    key={goal}
                    className={`cursor-pointer ${
                      selectedGoals.includes(goal)
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "border border-gray-300 hover:bg-gray-100 text-gray-900"
                    }`}
                    onClick={() => toggleGoal(goal)}
                  >
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="building-age"> Building Age</Label>
                <div className="relative">
                  <Input
                    id="building-age"
                    type="date"
                    value={buildingAge}
                    onChange={(e) => setBuildingAge(e.target.value)}
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeline">Target Start Date</Label>
                <div className="relative">
                  <Input
                    id="timeline"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="financing preference">
                  Financing Preference
                </Label>
                <Select
                  value={financingPreference}
                  options={FINANCING_PREFERENCE_OPTIONS}
                  onChange={setFinancingPreference}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="incentive-intent">Incentive Intent</Label>
                <Select
                  value={incentiveIntent}
                  options={INCENTIVE_INTENT_OPTIONS}
                  onChange={setIncentiveIntent}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="heritage-protection">
                  Heritage Protection (Denkmalschutz)
                </Label>
                <Select
                  value={heritageProtection}
                  options={HERITAGE_PROTECTION}
                  onChange={setHeritageProtection}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="living-during-renovation">
                  Living During Renovation
                </Label>
                <Select
                  value={livingDuringRenovation}
                  options={LIVING_DURING_RENOVATION_OPTIONS}
                  onChange={setLivingDuringRenovation}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="energy-certificate-rating">
                  Energy Certificate Available
                </Label>
                <Select
                  value={energyCertificateRating}
                  options={ENERGY_CERTIFICATE_RATING_OPTIONS}
                  onChange={setEnergyCertificateRating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="known-major-issues">Known Major Issues</Label>
                <Select
                  value={knownMajorIssues}
                  options={KNOWN_MAJOR_ISSUES_OPTIONS}
                  onChange={setKnownMajorIssues}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="surveys-required">Surveys Require</Label>
                <Select
                  value={surveysRequired}
                  options={SURVEYS_REQUIRED_OPTIONS}
                  onChange={setSurveysRequired}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="Neighbor impacts">Neighbor Impacts</Label>
                <Select
                  value={neighborImpact}
                  options={NEIGHBOR_IMPACTS_OPTIONS}
                  onChange={setNeighborImpact}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {selectedGoals.includes("Heating System") && (
                <div className="space-y-2">
                  <Label htmlFor="heating-system">Heating System Type</Label>
                  <Select
                    value={heatingSystem}
                    options={HEATING_SYSTEM_OPTIONS}
                    onChange={setHeatingSystem}
                  />
                </div>
              )}
              {selectedGoals.includes("Insulation") && (
                <div className="space-y-2">
                  <Label htmlFor="insulation-type">
                    Current Insulation Status
                  </Label>
                  <Select
                    value={insulationType}
                    options={INSULATION_OPTIONS}
                    onChange={setInsulationType}
                  />
                </div>
              )}
              {selectedGoals.includes("Windows & Doors") && (
                <div className="space-y-2">
                  <Label htmlFor="Windows-type">Window Type</Label>
                  <Select
                    value={windowsType}
                    options={WINDOWS_TYPE_OPTIONS}
                    onChange={setWindowsType}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          // Prompt Input
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ai-prompt">
                Describe your renovation project
              </Label>
              <textarea
                id="ai-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., I have a 120m² single-family house built in 1995 in Hesse. I want to improve energy efficiency with new insulation and windows, with a budget of €75,000. I'm concerned about neighbor impacts due to scaffolding."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Include details like building type, size,
                age, budget, location, and specific renovation goals for better
                results.
              </p>
            </div>
          </div>
        )}

        {/* Generate Plan Button */}
        <Button
          className="w-full"
          onClick={handleGeneratePlan}
          disabled={inputMode === "prompt" && !prompt.trim()}
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Generating Plan...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              {inputMode === "manual"
                ? "Generate Plan"
                : "Generate Plan from Prompt"}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
