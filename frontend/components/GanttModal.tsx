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
import { GanttChart } from "./GanttChart";
import { getGanttData, downloadCSV, GanttItem } from "@/lib/api";
import { Download, Loader2 } from "lucide-react";

interface GanttModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string | null;
  projectName: string;
}

export function GanttModal({
  open,
  onOpenChange,
  planId,
  projectName,
}: GanttModalProps) {
  const [ganttItems, setGanttItems] = useState<GanttItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && planId) {
      loadGanttData();
    }
  }, [open, planId]);

  const loadGanttData = async () => {
    if (!planId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getGanttData(planId);
      setGanttItems(data);
    } catch (err) {
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
            Interactive project timeline with task breakdown by team member
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden mt-6 rounded-lg border shadow-sm bg-background">
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
        </div>

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
