"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GanttChart } from "./GanttChart";
import { ProjectTracker } from "./ProjectTracker";
import { getGanttData, downloadCSV, GanttItem, Task } from "@/lib/api";
import { Download, Loader2, BarChart3, Calendar } from "lucide-react";

interface GanttModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string | null;
  projectName: string;
  tasks?: Task[];
  startDate?: string;
  endDate?: string;
}

export function GanttModal({
  open,
  onOpenChange,
  planId,
  projectName,
  tasks = [],
  startDate = "",
  endDate = "",
}: GanttModalProps) {
  const [ganttItems, setGanttItems] = useState<GanttItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert tasks to gantt items whenever tasks prop changes
  useEffect(() => {
    if (tasks.length > 0 && tasks[0].start_date && tasks[0].end_date) {
      // Tasks have dates, convert them directly to gantt items
      const items: GanttItem[] = tasks.map(task => ({
        id: task.id,
        content: task.title,
        start: task.start_date!,
        end: task.end_date!,
        group: task.owner || "Unassigned"
      }));
      setGanttItems(items);
      setLoading(false);
      setError(null);
    } else if (open && planId) {
      // Tasks don't have dates yet, fetch from backend
      console.log("=== GANTT MODAL LOADING ===");
      console.log("Plan ID:", planId);
      console.log("===========================");
      loadGanttData();
    }
  }, [tasks, open, planId]);

  const loadGanttData = async () => {
    if (!planId) return;

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching Gantt data for plan:", planId);
      const data = await getGanttData(planId);
      console.log("Received Gantt items:", data);
      setGanttItems(data);
    } catch (err) {
      console.error("Error loading Gantt data:", err);
      setError(err instanceof Error ? err.message : "Failed to load chart data");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    if (!planId) return;

    try {
      await downloadCSV(planId);
    } catch (err) {
      alert("Failed to download CSV");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] w-[98vw] h-[95vh] flex flex-col p-6">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold">{projectName}</DialogTitle>
          <DialogDescription className="text-base">
            Interactive project timeline with task breakdown and progress tracking
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="timeline" className="flex-1 flex flex-col overflow-hidden mt-6">
          <TabsList className="w-fit">
            <TabsTrigger value="timeline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="tracker" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Project Tracker
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="flex-1 overflow-hidden mt-4 rounded-lg border shadow-sm bg-background">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading timeline...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="text-destructive text-center">
                  <p className="font-semibold">Failed to load timeline</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            ) : (
              <GanttChart items={ganttItems} />
            )}
          </TabsContent>

          <TabsContent value="tracker" className="flex-1 overflow-auto mt-4 p-6 rounded-lg border shadow-sm bg-background">
            {tasks.length > 0 && startDate && endDate ? (
              <ProjectTracker 
                tasks={tasks}
                projectName={projectName}
                startDate={startDate}
                endDate={endDate}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>No tracking data available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center gap-2 mt-6 pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {ganttItems.length} task{ganttItems.length !== 1 ? "s" : ""} • 
            {" "}{new Set(ganttItems.map(item => item.group)).size} team member{new Set(ganttItems.map(item => item.group)).size !== 1 ? "s" : ""}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadCSV} disabled={!planId}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
