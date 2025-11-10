"use client";

import { useEffect, useRef } from "react";
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

  useEffect(() => {
    if (!containerRef.current || items.length === 0) return;

    // Convert items to Frappe Gantt format
    const tasks: FrappeTask[] = items.map((item, index) => ({
      id: `task-${index}`,
      name: `${item.content} (${item.group || "Unassigned"})`,
      start: item.start,
      end: item.end,
      progress: 0,
      custom_class: getColorClass(item.group),
    }));

    // Destroy existing gantt instance
    if (ganttRef.current) {
      ganttRef.current = null;
    }

    // Create new gantt instance
    try {
      ganttRef.current = new Gantt(containerRef.current, tasks, {
        view_mode: "Day",
        bar_height: 35,
        bar_corner_radius: 6,
        arrow_curve: 5,
        padding: 18,
        date_format: "YYYY-MM-DD",
        language: "en",
        custom_popup_html: (task: any) => {
          const start = new Date(task._start);
          const end = new Date(task._end);
          const duration = Math.ceil(
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
          );

          return `
            <div class="gantt-popup">
              <div class="gantt-popup-title">${task.name}</div>
              <div class="gantt-popup-content">
                <p><strong>Start:</strong> ${start.toLocaleDateString()}</p>
                <p><strong>End:</strong> ${end.toLocaleDateString()}</p>
                <p><strong>Duration:</strong> ${duration} days</p>
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
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No tasks to display</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto">
      <div className="gantt-controls mb-4 flex gap-2 px-4 pt-4">
        <button
          onClick={() => ganttRef.current?.change_view_mode("Day")}
          className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Day
        </button>
        <button
          onClick={() => ganttRef.current?.change_view_mode("Week")}
          className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
        >
          Week
        </button>
        <button
          onClick={() => ganttRef.current?.change_view_mode("Month")}
          className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
        >
          Month
        </button>
      </div>
      <div ref={containerRef} className="px-4 pb-4" />
    </div>
  );
}

// Get color class based on owner
function getColorClass(owner?: string): string {
  if (!owner) return "bar-default";

  const colors = [
    "bar-blue",
    "bar-green",
    "bar-orange",
    "bar-purple",
    "bar-pink",
  ];

  // Simple hash function to consistently assign colors
  let hash = 0;
  for (let i = 0; i < owner.length; i++) {
    hash = owner.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}
