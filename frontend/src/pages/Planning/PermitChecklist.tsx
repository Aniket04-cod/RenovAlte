import { Card, CardContent, CardHeader, CardTitle } from '../../components/Card/Card';
import { Checkbox } from '../../components/Input/Checkbox';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../../components/Card/HoverCard';
import { Info } from 'lucide-react';

const permits = [
  {
    id: 'geg',
    name: 'GEG Energy Compliance',
    description: 'Compliance with the German Building Energy Act (GEG) for energy-efficient renovations.',
    checked: true,
  },
  {
    id: 'baug',
    name: 'Baugenehmigung',
    description: 'Building permit required for structural changes and major renovations.',
    checked: false,
  },
  {
    id: 'architect',
    name: 'Architect Approval',
    description: 'Professional architect review and approval for design and structural plans.',
    checked: false,
  },
  {
    id: 'energy-cert',
    name: 'Energy Certificate',
    description: 'Updated energy performance certificate post-renovation.',
    checked: false,
  },
  {
    id: 'heritage',
    name: 'Heritage Protection Check',
    description: 'Required if the building is listed or in a protected area.',
    checked: false,
  },
];

export function PermitChecklist() {
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
