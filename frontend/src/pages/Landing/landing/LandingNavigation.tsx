import { Button } from '../ui/button';

interface LandingNavigationProps {
  onLogin?: () => void;
}

const menuItems = ['Home', 'Features', 'How It Works', 'About', 'Contact'];

export function LandingNavigation({ onLogin }: LandingNavigationProps) {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="text-emerald-600">RenovAlteGermany</div>
          
          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-gray-700 hover:text-emerald-600 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onLogin}>Login</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
