"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

interface TaskListProps {
  tasks: Task[];
  projectName: string | null;
}

export function TaskList({ tasks, projectName }: TaskListProps) {
  if (tasks.length === 0) {
    return null;
  }

  // Calculate actual duration from dates if available
  const getActualDuration = (task: Task) => {
    if (task.start_date && task.end_date) {
      const start = new Date(task.start_date);
      const end = new Date(task.end_date);
      const duration = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      return duration;
    }
    return task.duration_days;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{projectName || "Project Tasks"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="border rounded-lg p-3 hover:bg-accent transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{task.title}</h4>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {getActualDuration(task)} days
                    </Badge>
                    {task.owner && (
                      <Badge variant="outline" className="text-xs">
                        {task.owner}
                      </Badge>
                    )}
                    {task.dependencies.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {task.dependencies.length} dependencies
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
