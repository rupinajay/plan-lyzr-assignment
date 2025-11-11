"use client";

import { Task } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle, Users, Calendar, TrendingUp, TrendingDown, Minus, Target } from "lucide-react";

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
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">Project Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          {start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - {end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Key Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              Across all team members
            </p>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(actualProgress)}% of total
            </p>
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        {/* Overdue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className={`h-4 w-4 ${overdueTasks > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${overdueTasks > 0 ? 'text-destructive' : ''}`}>
              {overdueTasks}
            </div>
            <p className="text-xs text-muted-foreground">
              {overdueTasks > 0 ? 'Need attention' : 'All on track'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Progress Overview
          </CardTitle>
          <CardDescription>
            Track task completion and timeline progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Actual Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Task Completion</span>
              <span className="text-2xl font-bold">{Math.round(actualProgress)}%</span>
            </div>
            <Progress value={actualProgress} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {completedTasks} of {totalTasks} tasks completed
            </p>
          </div>
          
          {/* Planned Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Timeline Progress</span>
              <span className="text-2xl font-bold text-muted-foreground">{Math.round(timeProgress)}%</span>
            </div>
            <Progress value={timeProgress} className="h-3 [&>div]:bg-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              {daysElapsed} of {totalDays} days elapsed • {daysRemaining} days remaining
            </p>
          </div>

          {/* Status Indicator */}
          <Card className={
            isOnTrack 
              ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20' 
              : 'border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20'
          }>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  isOnTrack ? 'bg-green-100 dark:bg-green-900' : 'bg-orange-100 dark:bg-orange-900'
                }`}>
                  {isOnTrack ? (
                    progressDiff < 5 
                      ? <Minus className="h-5 w-5 text-green-600 dark:text-green-400" /> 
                      : <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  )}
                </div>
                <div className="flex-1">
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
            </CardContent>
          </Card>
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
            <CardDescription>
              Individual progress and task distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {owners.map(owner => {
                const ownerTasks = tasks.filter(t => t.owner === owner);
                const ownerCompleted = ownerTasks.filter(t => t.actual_end).length;
                const ownerInProgress = ownerTasks.filter(t => t.actual_start && !t.actual_end).length;
                const ownerProgress = (ownerCompleted / ownerTasks.length) * 100;
                
                return (
                  <div key={owner} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-sm font-semibold text-primary">
                            {(owner || '?').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{owner}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {ownerCompleted} completed
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {ownerInProgress} in progress
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {ownerTasks.length - ownerCompleted - ownerInProgress} pending
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <span className="text-sm font-semibold">{Math.round(ownerProgress)}%</span>
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
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Velocity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{velocity}</div>
            <p className="text-xs text-muted-foreground">
              tasks completed per day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{owners.length}</div>
            <p className="text-xs text-muted-foreground">
              active team members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Effort</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDuration}</div>
            <p className="text-xs text-muted-foreground">
              person-days planned
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
