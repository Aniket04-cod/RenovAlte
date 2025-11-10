import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/Card/Card";
import { Button } from "../../components/Button/Button";
import { Badge } from "../../components/Bagde/Badge";
import {
  Search,
  Zap,
  FileText,
  Users,
  Wrench,
  CheckCircle2,
} from "lucide-react";

type PhaseStatus = "ready" | "pending";
type PhaseColor =
  | "emerald"
  | "blue"
  | "amber"
  | "purple"
  | "rose"
  | "gray";

interface Phase {
  id: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  duration: string;
  cost: string;
  status: PhaseStatus;
  color: PhaseColor;
}

const phases: Phase[] = [
  {
    id: 1,
    title: "Site Inspection",
    icon: Search,
    duration: "1-2 weeks",
    cost: "€500 - €1,200",
    status: "ready",
    color: "emerald",
  },
  {
    id: 2,
    title: "Energy Audit",
    icon: Zap,
    duration: "1 week",
    cost: "€800 - €1,500",
    status: "ready",
    color: "blue",
  },
  {
    id: 3,
    title: "Permit Preparation",
    icon: FileText,
    duration: "2-3 weeks",
    cost: "€1,000 - €2,000",
    status: "pending",
    color: "amber",
  },
  {
    id: 4,
    title: "Contractor Selection",
    icon: Users,
    duration: "2-4 weeks",
    cost: "Variable",
    status: "pending",
    color: "purple",
  },
  {
    id: 5,
    title: "Implementation",
    icon: Wrench,
    duration: "8-12 weeks",
    cost: "€35,000 - €50,000",
    status: "pending",
    color: "rose",
  },
  {
    id: 6,
    title: "Final Inspection",
    icon: CheckCircle2,
    duration: "1 week",
    cost: "€300 - €600",
    status: "pending",
    color: "gray",
  },
];

// Helper for Tailwind dynamic color classes
const colorClass = (color: PhaseColor, bgOrText: "bg" | "text", intensity: "50" | "600") =>
  `${bgOrText}-${color}-${intensity}`;

export function RenovationPhases() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-1 text-lg font-semibold">Generated Renovation Plan</h3>
        <p className="text-gray-600">
          Your customized renovation roadmap with estimated timelines and costs
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {phases.map((phase) => {
          const Icon = phase.icon;
          return (
            <Card key={phase.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div
                    className={`p-2 rounded-lg ${colorClass(
                      phase.color,
                      "bg",
                      "50"
                    )}`}
                  >
                    <Icon
                      className={`w-5 h-5 ${colorClass(
                        phase.color,
                        "text",
                        "600"
                      )}`}
                    />
                  </div>
                  <Badge
                    // variant={phase.status === "ready" ? "default" : "secondary"}
                    // variant ='primary'
                    className={
                      phase.status === "ready"
                        ? "bg-emerald-100 text-emerald-700"
                        : ""
                    }
                  >
                    {phase.status === "ready" ? "Ready" : "Pending"}
                  </Badge>
                </div>
                <CardTitle className="mt-3">
                  Phase {phase.id}: {phase.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span>{phase.duration}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cost Range:</span>
                  <span>{phase.cost}</span>
                </div>
                <Button variant="primary" className="w-full mt-2">
                  View Tasks
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
