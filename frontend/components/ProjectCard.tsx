"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, CheckCircle2 } from "lucide-react";
import { Task } from "@/lib/api";

interface ProjectCardProps {
  id: string;
  name: string;
  tasks: Task[];
  onClick: () => void;
}

export function ProjectCard({ id, name, tasks, onClick }: ProjectCardProps) {
  const completedTasks = tasks.filter(t => t.start_date && t.end_date).length;
  const totalTasks = tasks.length;
  const owners = Array.from(new Set(tasks.map(t => t.owner).filter(Boolean)));
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-2"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold truncate">{name}</CardTitle>
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
