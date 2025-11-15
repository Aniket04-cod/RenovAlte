import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card/Card";

const tasks = [
  { id: 1, name: 'Site Inspection', start: 5, duration: 10, color: 'bg-emerald-500' },
  { id: 2, name: 'Energy Audit', start: 15, duration: 7, color: 'bg-blue-500' },
  { id: 3, name: 'Permit Preparation', start: 22, duration: 14, color: 'bg-amber-500' },
  { id: 4, name: 'Contractor Selection', start: 36, duration: 21, color: 'bg-purple-500' },
  { id: 5, name: 'Implementation', start: 57, duration: 56, color: 'bg-rose-500' },
  { id: 6, name: 'Final Inspection', start: 113, duration: 7, color: 'bg-gray-500' },
];

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

export function TimelineGantt() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Timeline & Gantt Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Timeline header */}
          <div className="flex items-center gap-2 pl-48">
            {months.map((month, idx) => (
              <div key={idx} className="flex-1 text-center text-sm text-gray-600">
                {month}
              </div>
            ))}
          </div>

          {/* Timeline grid */}
          <div className="relative">
            {/* Vertical grid lines */}
            <div className="absolute left-48 right-0 top-0 bottom-0 flex">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-1 border-l border-gray-100"></div>
              ))}
            </div>

            {/* Task bars */}
            <div className="space-y-3 relative">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-4 h-10">
                  <div className="w-44 text-sm">{task.name}</div>
                  <div className="flex-1 relative">
                    <div
                      className={`absolute h-8 ${task.color} rounded flex items-center px-3 text-white text-xs shadow-sm`}
                      style={{
                        left: `${(task.start / 120) * 100}%`,
                        width: `${(task.duration / 120) * 100}%`,
                      }}
                    >
                      {task.duration} days
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}