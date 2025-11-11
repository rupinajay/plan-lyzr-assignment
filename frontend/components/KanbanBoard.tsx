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
    { id: "in-progress", title: "In Progress", color: "bg-slate-100 dark:bg-slate-800" },
    { id: "done", title: "Done", color: "bg-slate-100 dark:bg-slate-800" },
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
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Drag cards to update status • Click to edit</p>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
        {columns.map(column => (
          <div 
            key={column.id} 
            className="flex flex-col min-h-0 bg-neutral-100 dark:bg-neutral-900 rounded-lg"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          >
            {/* Column Header */}
            <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
                  {column.title}
                </h3>
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                  {getTasksByStatus(column.id).length}
                </span>
              </div>
            </div>

            {/* Column Content */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2">
              {getTasksByStatus(column.id).map(task => (
                <Card 
                  key={task.id} 
                  className="cursor-move hover:shadow-md transition-shadow bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                  draggable
                  onDragStart={() => handleDragStart(task)}
                >
                  <CardContent className="p-0">
                    {/* Header - Title & Drag Handle */}
                    <div className="flex items-start gap-2 p-3 pb-2">
                      <GripVertical className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 leading-tight flex-1">
                        {task.title}
                      </p>
                    </div>

                    {/* Body - Metadata */}
                    <div className="px-3 pb-2 space-y-2">
                      {/* Duration & Dependencies */}
                      <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                        <span>{task.duration_days}d</span>
                        {task.dependencies && task.dependencies.length > 0 && (
                          <>
                            <span className="text-neutral-300 dark:text-neutral-700">•</span>
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
                        className="w-full text-xs px-2 py-1.5 rounded bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500 focus:bg-white dark:focus:bg-neutral-800"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Footer - Timeline & Status */}
                    <div className="px-3 py-2 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-100 dark:border-neutral-800">
                      <div className="space-y-1">
                        {/* Planned Timeline */}
                        {task.start_date && task.end_date && (
                          <div className="text-xs text-neutral-500 dark:text-neutral-500">
                            Planned: {new Date(task.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {' - '}
                            {new Date(task.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        )}
                        
                        {/* Actual Status */}
                        {task.actual_start && (
                          <div className="text-xs">
                            {task.actual_end ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                Completed {new Date(task.actual_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            ) : (
                              <span className="text-amber-600 dark:text-amber-400 font-medium">
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
                <div className="flex items-center justify-center h-32 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg">
                  <p className="text-sm text-neutral-400 dark:text-neutral-600">Drop cards here</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
