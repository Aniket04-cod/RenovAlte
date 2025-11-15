import { Card, CardContent, CardHeader, CardTitle } from '../../components/Card/Card';
import { Avatar, AvatarFallback } from '../../components/Avatar/Avatar';
import { MessageCircle } from 'lucide-react';

const stakeholders = [
  { id: 1, name: 'Johann Müller', role: 'Homeowner', initials: 'JM', color: 'bg-emerald-100 text-emerald-700' },
  { id: 2, name: 'Anna Schmidt', role: 'Architect', initials: 'AS', color: 'bg-blue-100 text-blue-700' },
  { id: 3, name: 'Klaus Weber', role: 'Contractor', initials: 'KW', color: 'bg-purple-100 text-purple-700' },
  { id: 4, name: 'Maria Fischer', role: 'Energy Consultant', initials: 'MF', color: 'bg-amber-100 text-amber-700' },
];

export function CollaborationArea() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Stakeholders</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stakeholders.map((stakeholder) => (
          <div key={stakeholder.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className={stakeholder.color}>{stakeholder.initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm">{stakeholder.name}</div>
                <div className="text-xs text-gray-600">{stakeholder.role}</div>
              </div>
            </div>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}