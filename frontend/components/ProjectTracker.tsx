"use client";

import { Task } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, AlertCircle, Users } from "lucide-react";

interface ProjectTrackerProps {
  tasks: Task[];
  projectName: string;
  startDate: string;
  endDate: string;
}

export function ProjectTracker({ tasks, projectName, startDate, endDate }: ProjectTrackerProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.end_date).length;
  const inProgressTasks = tasks.filter(t => t.start_date && !t.end_date).length;
  const todoTasks = totalTasks - completedTasks - inProgressTasks;
  
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const owners = Array.from(new Set(tasks.map(t => t.owner).filter(Boolean)));
  const totalDuration = tasks.reduce((sum, t) => sum + t.duration_days, 0);
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const timeProgress = Math.max(0, Math.min(100, (daysElapsed / totalDays) * 100));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-2">Project Tracker</h3>
        <p className="text-sm text-muted-foreground">
          {start.toLocaleDateString()} - {end.toLocaleDateString()}
        </p>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overall Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Task Completion</span>
              <span className="font-semibold">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Time Elapsed</span>
              <span className="font-semibold">{Math.round(timeProgress)}%</span>
            </div>
            <Progress value={timeProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Task Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Task Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm">Completed</span>
            </div>
            <span className="font-semibold">{completedTasks}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm">In Progress</span>
            </div>
            <span className="font-semibold">{inProgressTasks}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm">To Do</span>
            </div>
            <span className="font-semibold">{todoTasks}</span>
          </div>
        </CardContent>
      </Card>

      {/* Team & Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Team Members</span>
            </div>
            <span className="font-semibold">{owners.length}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Duration</span>
            <span className="font-semibold">{totalDuration} days</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Project Days</span>
            <span className="font-semibold">{totalDays} days</span>
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      {owners.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {owners.map(owner => {
                const ownerTasks = tasks.filter(t => t.owner === owner);
                const ownerCompleted = ownerTasks.filter(t => t.end_date).length;
                return (
                  <div key={owner} className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                    <span className="text-sm font-medium">{owner}</span>
                    <span className="text-xs text-muted-foreground">
                      {ownerCompleted}/{ownerTasks.length}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
