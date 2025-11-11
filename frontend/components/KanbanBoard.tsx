"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/lib/api";
import { GripVertical } from "lucide-react";

interface KanbanBoardProps {
  tasks: Task[];
  projectName: string;
  onTasksUpdate?: (tasks: Task[]) => void;
}

type TaskStatus = "todo" | "in-progress" | "done";

interface TaskWithStatus extends Task {
  kanbanStatus: TaskStatus;
}

export function KanbanBoard({ tasks, projectName, onTasksUpdate }: KanbanBoardProps) {
  const [kanbanTasks, setKanbanTasks] = useState<TaskWithStatus[]>([]);
  const [draggedTask, setDraggedTask] = useState<TaskWithStatus | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Initialize tasks - use status from backend or default to "todo"
    if (!initialized || kanbanTasks.length === 0) {
      setKanbanTasks(
        tasks.map(task => ({
          ...task,
          kanbanStatus: (task.status as TaskStatus) || "todo"
        }))
      );
      setInitialized(true);
    } else {
      // Update existing tasks without resetting status
      setKanbanTasks(prevTasks => 
        prevTasks.map(prevTask => {
          const updatedTask = tasks.find(t => t.id === prevTask.id);
          return updatedTask 
            ? { ...updatedTask, kanbanStatus: prevTask.kanbanStatus } 
            : prevTask;
        })
      );
    }
  }, [tasks, initialized, kanbanTasks.length]);

  const columns: { id: TaskStatus; title: string; color: string }[] = [
    { id: "todo", title: "To Do", color: "bg-slate-100 dark:bg-slate-800" },
    { id: "in-progress", title: "In Progress", color: "bg-blue-50 dark:bg-blue-950" },
    { id: "done", title: "Done", color: "bg-green-50 dark:bg-green-950" },
  ];

  const getTasksByStatus = (status: TaskStatus) => {
    return kanbanTasks.filter(task => task.kanbanStatus === status);
  };

  const handleDragStart = (task: TaskWithStatus) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetStatus: TaskStatus) => {
    if (!draggedTask) return;

    const now = new Date().toISOString().split('T')[0];

    const updatedTasks = kanbanTasks.map(task => {
      if (task.id === draggedTask.id) {
        const updates: any = { kanbanStatus: targetStatus, status: targetStatus };
        
        if (targetStatus === "in-progress") {
          // Set actual start date
          updates.actual_start = task.actual_start || now;
          updates.actual_end = undefined;
        } else if (targetStatus === "done") {
          // Set actual completion date
          updates.actual_start = task.actual_start || now;
          updates.actual_end = now;
        } else {
          // Moving back to todo - clear actual dates
          updates.actual_start = undefined;
          updates.actual_end = undefined;
        }
        
        return { ...task, ...updates };
      }
      return task;
    });

    setKanbanTasks(updatedTasks);
    setDraggedTask(null);
    
    // Auto-save immediately with updated dates for ProjectTracker
    if (onTasksUpdate) {
      const tasksToSave = updatedTasks.map(({ kanbanStatus, ...task }) => task);
      onTasksUpdate(tasksToSave);
    }
  };

  const handleOwnerChange = (taskId: string, newOwner: string) => {
    const updatedTasks = kanbanTasks.map(task =>
      task.id === taskId ? { ...task, owner: newOwner || undefined } : task
    );
    
    setKanbanTasks(updatedTasks);
    
    // Auto-save immediately
    if (onTasksUpdate) {
      const tasksToSave = updatedTasks.map(({ status, ...task }) => task);
      onTasksUpdate(tasksToSave);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{projectName}</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">Drag cards to update status • Click to edit</p>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
        {columns.map(column => (
          <div 
            key={column.id} 
            className="flex flex-col min-h-0 bg-slate-100 dark:bg-slate-900 rounded-lg"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          >
            {/* Column Header */}
            <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  {column.title}
                </h3>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  {getTasksByStatus(column.id).length}
                </span>
              </div>
            </div>

            {/* Column Content */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2">
              {getTasksByStatus(column.id).map(task => (
                <Card 
                  key={task.id} 
                  className="cursor-move hover:shadow-md transition-shadow bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  draggable
                  onDragStart={() => handleDragStart(task)}
                >
                  <CardContent className="p-0">
                    {/* Header - Title & Drag Handle */}
                    <div className="flex items-start gap-2 p-3 pb-2">
                      <GripVertical className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-tight flex-1">
                        {task.title}
                      </p>
                    </div>

                    {/* Body - Metadata */}
                    <div className="px-3 pb-2 space-y-2">
                      {/* Duration & Dependencies */}
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <span>{task.duration_days}d</span>
                        {task.dependencies && task.dependencies.length > 0 && (
                          <>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span>{task.dependencies.length} blocked</span>
                          </>
                        )}
                      </div>

                      {/* Owner Assignment */}
                      <input
                        type="text"
                        value={task.owner || ''}
                        onChange={(e) => handleOwnerChange(task.id, e.target.value)}
                        placeholder="Unassigned"
                        className="w-full text-xs px-2 py-1.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Footer - Timeline & Status */}
                    <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                      <div className="space-y-1">
                        {/* Planned Timeline */}
                        {task.start_date && task.end_date && (
                          <div className="text-xs text-slate-500 dark:text-slate-500">
                            Planned: {new Date(task.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {' - '}
                            {new Date(task.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        )}
                        
                        {/* Actual Status */}
                        {task.actual_start && (
                          <div className="text-xs">
                            {task.actual_end ? (
                              <span className="text-green-600 dark:text-green-400 font-medium">
                                Completed {new Date(task.actual_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            ) : (
                              <span className="text-blue-600 dark:text-blue-400 font-medium">
                                Started {new Date(task.actual_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {getTasksByStatus(column.id).length === 0 && (
                <div className="flex items-center justify-center h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                  <p className="text-sm text-slate-400 dark:text-slate-600">Drop cards here</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
