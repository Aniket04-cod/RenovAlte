import { Button } from "../ui/button";
import { Play, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeroSectionProps {
  backgroundImage: string;
}

export function HeroSection({ backgroundImage }: HeroSectionProps) {
  const navigate = useNavigate();

  return (
    <section className="relative bg-gradient-to-br from-emerald-50 to-blue-50 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <img
          src={backgroundImage}
          alt="Home renovation"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-8 py-24 md:py-32">
        <div className="max-w-3xl">
          <h1 className="mb-6">
            Your Smart Assistant for Home Renovation and Financing in Germany
          </h1>
          <p className="text-gray-700 mb-8 text-lg">
            Plan your renovation, discover funding, and manage every step with
            AI guidance.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => navigate("/planning")}
              className="bg-emerald-600 hover:bg-emerald-700"
              size="lg"
            >
              Start Planning
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg">
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-emerald-200 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20"></div>
    </section>
  );
}
