import { Card, CardContent, CardHeader, CardTitle } from '../../components/Card/Card';
import { Checkbox } from '../../components/Input/Checkbox';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../../components/Card/HoverCard';
import { Info } from 'lucide-react';

interface Permit {
  id: string;
  name: string;
  description: string;
  checked: boolean;
}

interface PermitChecklistProps {
  permits?: Permit[];
}

export function PermitChecklist({ permits = [] }: PermitChecklistProps) {
  if (permits.length === 0) {
    return null; // Don't render if no permits
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permit and Approval Checklist</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {permits.map((permit) => (
          <div key={permit.id} className="flex items-start gap-3">
            <Checkbox id={permit.id} defaultChecked={permit.checked} className="mt-1" />
            <div className="flex-1">
              <label htmlFor={permit.id} className="text-sm cursor-pointer flex items-center gap-2">
                {permit.name}
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <p className="text-sm">{permit.description}</p>
                  </HoverCardContent>
                </HoverCard>
              </label>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}