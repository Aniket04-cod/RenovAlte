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
import { Calendar, Goal, Sparkles } from "lucide-react";
import { useState } from "react";
import {RENOVATIONGOALS} from '../../utils/constants'


export function ProjectSetupWizard() {
  const [buildingType, setBuildingType] = useState("single-family");
  const [budget, setBudget] = useState(50000);
  const [startDate, setStartDate] = useState("2025-01-15");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    "Energy Efficiency",
    "Insulation",
  ]);

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleGeneratePlan = () => {
    const formData = {
      buildingType,
      budget,
      startDate,
      goals: selectedGoals,
    };

    // alert(buildingType + budget + startDate + selectedGoals);
    // Send formData to API or next step
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          Start Your Project Plan
        </CardTitle>
        <CardDescription>
          Tell us about your renovation project and we'll generate a customized
          plan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="building-type">Building Type</Label>
            <Select
              value={buildingType}
              options={[
                { value: "single-family", label: "Single Family Home" },
                { value: "multi-family", label: "Multi-Family Home" },
                { value: "apartment", label: "Apartment" },
                { value: "commercial", label: "Commercial Building" },
              ]}
              onChange={setBuildingType}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget">Estimated Budget (€)</Label>
            <Input
              id="budget"
              type="number"
              placeholder="50000"
              defaultValue="50000"
              onChange={(e) => setBudget(Number(e.target.value))}
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

        <div className="space-y-2">
          <Label htmlFor="timeline">Target Start Date</Label>
          <div className="relative">
            <Input
              id="timeline"
              type="date"
              defaultValue="2025-01-15"
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <Button className="w-full" onClick={handleGeneratePlan}>
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Plan
        </Button>
      </CardContent>
    </Card>
  );
}
