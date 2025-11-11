"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, CheckCircle2 } from "lucide-react";
import { Task } from "@/lib/api";

interface ProjectCardProps {
  id: string;
  name: string;
  tasks: Task[];
  hasTimeline?: boolean;
  onClick: () => void;
}

export function ProjectCard({ id, name, tasks, hasTimeline, onClick }: ProjectCardProps) {
  const completedTasks = tasks.filter(t => t.actual_end).length;
  const totalTasks = tasks.length;
  const owners = Array.from(new Set(tasks.map(t => t.owner).filter(Boolean)));
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-2"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold truncate">{name}</CardTitle>
          {!hasTimeline && (
            <span className="text-xs bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full whitespace-nowrap">
              No timeline
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="h-4 w-4" />
            <span>{completedTasks}/{totalTasks} tasks</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{owners.length} members</span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
