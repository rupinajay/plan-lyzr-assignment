"use client";

import { Task } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, AlertCircle, Users, Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ProjectTrackerProps {
  tasks: Task[];
  projectName: string;
  startDate: string;
  endDate: string;
}

export function ProjectTracker({ tasks, projectName, startDate, endDate }: ProjectTrackerProps) {
  const totalTasks = tasks.length;
  
  // Actual progress based on user actions (actual_end means completed)
  const completedTasks = tasks.filter(t => t.actual_end).length;
  const inProgressTasks = tasks.filter(t => t.actual_start && !t.actual_end).length;
  const todoTasks = totalTasks - completedTasks - inProgressTasks;
  
  const actualProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  // Planned progress based on timeline
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.max(0, Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, totalDays - daysElapsed);
  const timeProgress = Math.max(0, Math.min(100, (daysElapsed / totalDays) * 100));
  
  // Calculate if project is on track
  const isOnTrack = actualProgress >= timeProgress;
  const progressDiff = Math.abs(actualProgress - timeProgress);
  
  const owners = Array.from(new Set(tasks.map(t => t.owner).filter(Boolean)));
  const totalDuration = tasks.reduce((sum, t) => sum + t.duration_days, 0);

  // Calculate overdue tasks (tasks whose planned end_date has passed but not completed)
  const overdueTasks = tasks.filter(t => {
    if (t.actual_end) return false; // Already completed
    if (!t.end_date) return false; // No planned end date
    const plannedEnd = new Date(t.end_date);
    return plannedEnd < today;
  }).length;

  // Calculate completion velocity (tasks completed per day)
  const projectStarted = tasks.some(t => t.actual_start);
  const velocity = projectStarted && daysElapsed > 0 ? (completedTasks / daysElapsed).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-1">Project Dashboard</h2>
        <p className="text-muted-foreground">
          {start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - {end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Tasks</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">{totalTasks}</p>
              </div>
              <div className="w-12 h-12 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-700 dark:text-blue-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Completed</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">{completedTasks}</p>
              </div>
              <div className="w-12 h-12 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-700 dark:text-green-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">In Progress</p>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-2">{inProgressTasks}</p>
              </div>
              <div className="w-12 h-12 bg-orange-200 dark:bg-orange-800 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-700 dark:text-orange-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overdue */}
        <Card className={`bg-gradient-to-br ${overdueTasks > 0 ? 'from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800' : 'from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${overdueTasks > 0 ? 'text-red-700 dark:text-red-300' : 'text-slate-600 dark:text-slate-400'}`}>Overdue</p>
                <p className={`text-3xl font-bold mt-2 ${overdueTasks > 0 ? 'text-red-900 dark:text-red-100' : 'text-slate-700 dark:text-slate-300'}`}>{overdueTasks}</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${overdueTasks > 0 ? 'bg-red-200 dark:bg-red-800' : 'bg-slate-200 dark:bg-slate-700'}`}>
                <AlertCircle className={`h-6 w-6 ${overdueTasks > 0 ? 'text-red-700 dark:text-red-300' : 'text-slate-600 dark:text-slate-400'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Actual Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Task Completion</span>
              <span className="text-2xl font-bold">{Math.round(actualProgress)}%</span>
            </div>
            <Progress value={actualProgress} className="h-4" />
            <p className="text-xs text-muted-foreground">
              {completedTasks} of {totalTasks} tasks completed
            </p>
          </div>
          
          {/* Planned Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Timeline Progress</span>
              <span className="text-2xl font-bold text-muted-foreground">{Math.round(timeProgress)}%</span>
            </div>
            <Progress value={timeProgress} className="h-4 [&>div]:bg-slate-400" />
            <p className="text-xs text-muted-foreground">
              {daysElapsed} of {totalDays} days elapsed • {daysRemaining} days remaining
            </p>
          </div>

          {/* Status Indicator */}
          <div className={`p-4 rounded-lg border-2 ${
            isOnTrack 
              ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' 
              : 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isOnTrack ? 'bg-green-100 dark:bg-green-900' : 'bg-orange-100 dark:bg-orange-900'
              }`}>
                {isOnTrack ? (
                  progressDiff < 5 ? <Minus className="h-5 w-5 text-green-600 dark:text-green-400" /> : <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                )}
              </div>
              <div>
                <p className={`font-semibold ${isOnTrack ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'}`}>
                  {isOnTrack ? (
                    progressDiff < 5 ? 'On Track' : 'Ahead of Schedule'
                  ) : (
                    'Behind Schedule'
                  )}
                </p>
                <p className={`text-sm ${isOnTrack ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                  {isOnTrack 
                    ? progressDiff < 5 
                      ? `Project is progressing as planned`
                      : `You're ${Math.round(progressDiff)}% ahead of the timeline`
                    : `You're ${Math.round(progressDiff)}% behind the planned timeline`
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Performance */}
      {owners.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {owners.map(owner => {
                const ownerTasks = tasks.filter(t => t.owner === owner);
                const ownerCompleted = ownerTasks.filter(t => t.actual_end).length;
                const ownerInProgress = ownerTasks.filter(t => t.actual_start && !t.actual_end).length;
                const ownerProgress = (ownerCompleted / ownerTasks.length) * 100;
                
                return (
                  <div key={owner} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-primary">{(owner || '?').charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-medium">{owner}</p>
                          <p className="text-xs text-muted-foreground">
                            {ownerCompleted} completed • {ownerInProgress} in progress • {ownerTasks.length - ownerCompleted - ownerInProgress} pending
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold">{Math.round(ownerProgress)}%</span>
                    </div>
                    <Progress value={ownerProgress} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Completion Velocity</p>
              <p className="text-2xl font-bold">{velocity}</p>
              <p className="text-xs text-muted-foreground">tasks per day</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Team Size</p>
              <p className="text-2xl font-bold">{owners.length}</p>
              <p className="text-xs text-muted-foreground">active members</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Effort</p>
              <p className="text-2xl font-bold">{totalDuration}</p>
              <p className="text-xs text-muted-foreground">person-days</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
