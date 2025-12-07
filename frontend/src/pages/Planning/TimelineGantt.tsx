import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card/Card";

interface Task {
  id: number;
  name: string;
  start: number;
  duration: number;
  color: string;
}

interface TimelineGanttProps {
  tasks?: Task[];
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
// Assuming 6 months timeline, approximately 180 days (6 * 30)
const TOTAL_TIMELINE_DAYS = 180;

export function TimelineGantt({ tasks = [] }: TimelineGanttProps) {
  if (tasks.length === 0) {
    return null; // Don't render if no tasks
  }

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
              {tasks.map((task) => {
                // Calculate position and width based on TOTAL_TIMELINE_DAYS
                const leftPercent = (task.start / TOTAL_TIMELINE_DAYS) * 100;
                const widthPercent =
                  (task.duration / TOTAL_TIMELINE_DAYS) * 100;

                return (
                  <div key={task.id} className="flex items-center gap-4 h-10">
                    <div className="w-44 text-sm">{task.name}</div>
                    <div className="flex-1 relative">
                      <div
                        className={`absolute h-8 ${task.color} rounded flex items-center px-3 text-white text-xs shadow-sm`}
                        style={{
                          left: `${Math.min(leftPercent, 100)}%`,
                          width: `${Math.min(
                            widthPercent,
                            100 - leftPercent
                          )}%`,
                          maxWidth: `${100 - leftPercent}%`, // Ensure it doesn't overflow
                        }}
                      >
                        {task.duration} days
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
