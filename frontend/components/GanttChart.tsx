"use client";

import { useEffect, useRef, useState } from "react";
import Gantt from "frappe-gantt";
import { GanttItem } from "@/lib/api";

interface GanttChartProps {
  items: GanttItem[];
}

interface FrappeTask {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  custom_class?: string;
}

export function GanttChart({ items }: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ganttRef = useRef<any>(null);
  const [viewMode, setViewMode] = useState<"Day" | "Week" | "Month">("Day"); // Default to Day view

  useEffect(() => {
    if (!containerRef.current || items.length === 0) return;

    // Group items by owner for better organization
    const groupedItems = items.reduce((acc, item) => {
      const owner = item.group || "Unassigned";
      if (!acc[owner]) acc[owner] = [];
      acc[owner].push(item);
      return acc;
    }, {} as Record<string, GanttItem[]>);

    // Convert items to Frappe Gantt format with duration labels
    const tasks: FrappeTask[] = [];
    Object.entries(groupedItems).forEach(([owner, ownerItems]) => {
      ownerItems.forEach((item, index) => {
        const colorClass = getColorClass(owner);
        
        // Calculate duration in days
        const start = new Date(item.start);
        const end = new Date(item.end);
        const duration = Math.ceil(
          (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        tasks.push({
          id: `${owner}-${index}`,
          name: `${item.content} (${duration}d)`, // Add duration to task name
          start: item.start,
          end: item.end,
          progress: 0,
          custom_class: colorClass,
        });
      });
    });

    // Destroy existing gantt instance
    if (ganttRef.current) {
      ganttRef.current = null;
    }

    // Create new gantt instance with better spacing for Day view
    try {
      ganttRef.current = new Gantt(containerRef.current, tasks, {
        view_mode: viewMode,
        bar_height: 50, // Increased height for better visibility
        bar_corner_radius: 8,
        arrow_curve: 5,
        padding: 24, // More padding
        date_format: "YYYY-MM-DD",
        language: "en",
        ...(viewMode === "Day" ? { column_width: 80 } : 
           viewMode === "Week" ? { column_width: 50 } : 
           { column_width: 40 } as any), // Increased gap between days
        custom_popup_html: (task: any) => {
          const start = new Date(task._start);
          const end = new Date(task._end);
          const duration = Math.ceil(
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
          );

          // Extract owner from task id
          const owner = task.id.split('-')[0];

          return `
            <div class="gantt-popup">
              <div class="gantt-popup-title">${task.name}</div>
              <div class="gantt-popup-content">
                <p><strong>Owner:</strong> ${owner}</p>
                <p><strong>Start:</strong> ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                <p><strong>End:</strong> ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                <p><strong>Duration:</strong> ${duration} day${duration !== 1 ? 's' : ''}</p>
              </div>
            </div>
          `;
        },
      });
    } catch (error) {
      console.error("Error creating Gantt chart:", error);
    }

    // Cleanup
    return () => {
      if (ganttRef.current) {
        ganttRef.current = null;
      }
    };
  }, [items, viewMode]);

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No tasks to display</p>
      </div>
    );
  }

  const handleViewChange = (mode: "Day" | "Week" | "Month") => {
    setViewMode(mode);
    ganttRef.current?.change_view_mode(mode);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-background">
      {/* View Controls */}
      <div className="shrink-0 bg-background border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => handleViewChange("Day")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                viewMode === "Day"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Day View
            </button>
            <button
              onClick={() => handleViewChange("Week")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                viewMode === "Week"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Week View
            </button>
            <button
              onClick={() => handleViewChange("Month")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                viewMode === "Month"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Month View
            </button>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground font-medium">Team:</span>
            {Array.from(new Set(items.map(item => item.group || "Unassigned"))).map((owner) => (
              <div key={owner} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${getColorClass(owner).replace('bar-', 'bg-')}`} />
                <span className="text-foreground">{owner}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Gantt Chart - Scrollable */}
      <div className="flex-1 overflow-auto">
        <div ref={containerRef} className="px-6 py-6" />
      </div>
    </div>
  );
}

// Get color class based on owner
function getColorClass(owner?: string): string {
  if (!owner || owner === "Unassigned") return "bar-default";

  const colors = [
    "bar-blue",
    "bar-green",
    "bar-orange",
    "bar-purple",
    "bar-pink",
    "bar-red",
    "bar-teal",
    "bar-indigo",
  ];

  // Simple hash function to consistently assign colors
  let hash = 0;
  for (let i = 0; i < owner.length; i++) {
    hash = owner.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}
