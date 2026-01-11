// import React from "react";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "../../components/Card/Card";
// import { Sparkles, AlertCircle, Lightbulb, TrendingUp } from "lucide-react";

// const suggestions = [
//   {
//     id: 1,
//     icon: AlertCircle,
//     text: "Submit permit form before 12 Dec",
//     priority: "high",
//     color: "text-rose-600",
//     bgColor: "bg-rose-50",
//   },
//   {
//     id: 2,
//     icon: Lightbulb,
//     text: "Add insulation phase to qualify for grant",
//     priority: "medium",
//     color: "text-amber-600",
//     bgColor: "bg-amber-50",
//   },
//   {
//     id: 3,
//     icon: TrendingUp,
//     text: "KfW 261 funding available for your project",
//     priority: "high",
//     color: "text-emerald-600",
//     bgColor: "bg-emerald-50",
//   },
//   {
//     id: 4,
//     icon: Sparkles,
//     text: "Schedule energy audit within 2 weeks",
//     priority: "medium",
//     color: "text-blue-600",
//     bgColor: "bg-blue-50",
//   },
// ];

// export function AISuggestions() {
//   return (
//     <Card className="h-fit sticky top-24">
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <Sparkles className="w-5 h-5 text-emerald-600" />
//           AI Suggestions
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-3">
//         {suggestions.map((suggestion) => {
//           const Icon = suggestion.icon;
//           return (
//             <div
//               key={suggestion.id}
//               className={`p-3 rounded-lg flex items-start gap-3 ${suggestion.bgColor}`}
//             >
//               <Icon className={`w-4 h-4 mt-0.5 ${suggestion.color}`} />
//               <p className="text-sm">{suggestion.text}</p>
//             </div>
//           );
//         })}
//       </CardContent>
//     </Card>
//   );
// }
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/Card/Card";
import { 
  Sparkles, 
  AlertCircle, 
  Lightbulb, 
  TrendingUp, 
  Clock, 
  FileText, 
  Euro,
  Loader2 
} from "lucide-react";

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
  AlertCircle,
  Lightbulb,
  TrendingUp,
  Sparkles,
  Clock,
  FileText,
  Euro,
};

export interface Suggestion {
  id: number;
  icon: string;
  text: string;
  priority: "high" | "medium" | "low";
  color: string;
  bgColor: string;
}

interface AISuggestionsProps {
  suggestions?: Suggestion[];
  isLoading?: boolean;
}

const defaultSuggestions: Suggestion[] = [
  {
    id: 1,
    icon: "AlertCircle",
    text: "Submit permit form before deadline",
    priority: "high",
    color: "text-rose-600",
    bgColor: "bg-rose-50",
  },
  {
    id: 2,
    icon: "Lightbulb",
    text: "Add insulation phase to qualify for grant",
    priority: "medium",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    id: 3,
    icon: "TrendingUp",
    text: "KfW 261 funding available for your project",
    priority: "high",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    id: 4,
    icon: "Sparkles",
    text: "Schedule energy audit within 2 weeks",
    priority: "medium",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
];

export function AISuggestions({ suggestions, isLoading = false }: AISuggestionsProps) {
  const displaySuggestions = suggestions && suggestions.length > 0 ? suggestions : defaultSuggestions;

  return (
    <Card className="h-fit sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          AI Suggestions
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600 ml-2" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-gray-100 animate-pulse h-16"
              />
            ))}
          </div>
        ) : (
          displaySuggestions.map((suggestion) => {
            const Icon = iconMap[suggestion.icon] || Sparkles;
            return (
              <div
                key={suggestion.id}
                className={`p-3 rounded-lg flex items-start gap-3 ${suggestion.bgColor} transition-all duration-300`}
              >
                <Icon className={`w-4 h-4 mt-0.5 ${suggestion.color}`} />
                <p className="text-sm">{suggestion.text}</p>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}