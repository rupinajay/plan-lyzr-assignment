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
  status: TaskStatus;
}

export function KanbanBoard({ tasks, projectName, onTasksUpdate }: KanbanBoardProps) {
  // Initialize tasks with status based on dates
  const [kanbanTasks, setKanbanTasks] = useState<TaskWithStatus[]>([]);
  const [draggedTask, setDraggedTask] = useState<TaskWithStatus | null>(null);

  useEffect(() => {
    setKanbanTasks(
      tasks.map(task => ({
        ...task,
        status: task.end_date ? "done" : task.start_date ? "in-progress" : "todo"
      }))
    );
  }, [tasks]);

  const columns: { id: TaskStatus; title: string; color: string }[] = [
    { id: "todo", title: "To Do", color: "bg-slate-100 dark:bg-slate-800" },
    { id: "in-progress", title: "In Progress", color: "bg-blue-50 dark:bg-blue-950" },
    { id: "done", title: "Done", color: "bg-green-50 dark:bg-green-950" },
  ];

  const getTasksByStatus = (status: TaskStatus) => {
    return kanbanTasks.filter(task => task.status === status);
  };

  const handleDragStart = (task: TaskWithStatus) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetStatus: TaskStatus) => {
    if (!draggedTask) return;

    const updatedTasks = kanbanTasks.map(task => {
      if (task.id === draggedTask.id) {
        // Update dates based on status
        const now = new Date().toISOString().split('T')[0];
        let updates: Partial<Task> = { status: targetStatus };
        
        if (targetStatus === "in-progress") {
          updates.start_date = task.start_date || now;
          updates.end_date = undefined;
        } else if (targetStatus === "done") {
          updates.start_date = task.start_date || now;
          updates.end_date = now;
        } else {
          updates.start_date = undefined;
          updates.end_date = undefined;
        }
        
        return { ...task, ...updates };
      }
      return task;
    });

    setKanbanTasks(updatedTasks);
    setDraggedTask(null);
    
    // Auto-save immediately
    if (onTasksUpdate) {
      const tasksToSave = updatedTasks.map(({ status, ...task }) => task);
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
                  className="cursor-move hover:shadow-lg transition-all border-l-4 border-l-blue-500 bg-white dark:bg-slate-800 hover:border-l-blue-600"
                  draggable
                  onDragStart={() => handleDragStart(task)}
                >
                  <CardContent className="p-3 space-y-2">
                    {/* Task Title */}
                    <div className="flex items-start gap-2">
                      <GripVertical className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug flex-1">
                        {task.title}
                      </p>
                    </div>

                    {/* Task Meta */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Duration Badge */}
                      <Badge variant="secondary" className="text-xs font-normal">
                        ⏱️ {task.duration_days}d
                      </Badge>

                      {/* Owner */}
                      <div className="flex-1">
                        <input
                          type="text"
                          value={task.owner || ''}
                          onChange={(e) => handleOwnerChange(task.id, e.target.value)}
                          placeholder="Unassigned"
                          className="w-full text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>

                    {/* Dependencies */}
                    {task.dependencies && task.dependencies.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                        <span>🔗</span>
                        <span>{task.dependencies.length} blocked by</span>
                      </div>
                    )}

                    {/* Dates */}
                    <div className="flex items-center gap-2 text-xs">
                      {task.start_date && (
                        <span className="text-slate-600 dark:text-slate-400">
                          📅 {new Date(task.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                      {task.end_date && (
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          ✓ {new Date(task.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
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
