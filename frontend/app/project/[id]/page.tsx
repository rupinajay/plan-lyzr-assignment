"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KanbanBoard } from "@/components/KanbanBoard";
import { GanttChart } from "@/components/GanttChart";
import { ProjectTracker } from "@/components/ProjectTracker";
import { ArrowLeft, Kanban, Calendar, BarChart3, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { Task, GanttItem, generateReport, getGanttData, downloadCSV } from "@/lib/api";

interface ProjectData {
  id: string;
  name: string;
  tasks: Task[];
  sessionId: string | null;
  projectName: string | null;
  planId?: string;
  startDate?: string;
  endDate?: string;
}

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [ganttItems, setGanttItems] = useState<GanttItem[]>([]);
  const [planId, setPlanId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load project from localStorage
    const projects = JSON.parse(localStorage.getItem("recentProjects") || "[]");
    const currentProject = projects.find((p: any) => p.id === params.id);
    
    if (currentProject) {
      setProject({
        id: currentProject.id,
        name: currentProject.projectName || currentProject.name,
        tasks: currentProject.tasks || [],
        sessionId: currentProject.sessionId,
        projectName: currentProject.projectName
      });
      
      // Load existing timeline data if available
      if (currentProject.planId) {
        setPlanId(currentProject.planId);
        setStartDate(currentProject.startDate || "");
        setEndDate(currentProject.endDate || "");
        
        // Load Gantt data
        if (currentProject.planId) {
          getGanttData(currentProject.planId)
            .then(data => setGanttItems(data))
            .catch(err => console.error("Failed to load Gantt data:", err));
        }
      }
    }
  }, [params.id]);

  const handleTaskUpdate = (updatedTasks: Task[]) => {
    if (!project) return;
    
    // Update local state
    setProject({ ...project, tasks: updatedTasks });
    
    // Update localStorage
    const projects = JSON.parse(localStorage.getItem("recentProjects") || "[]");
    const updatedProjects = projects.map((p: any) => 
      p.id === params.id ? { ...p, tasks: updatedTasks } : p
    );
    localStorage.setItem("recentProjects", JSON.stringify(updatedProjects));
  };

  const handleGenerateTimeline = async () => {
    if (!project?.sessionId) {
      alert("No session found. Please create tasks in chat first.");
      return;
    }

    setLoading(true);
    try {
      const response = await generateReport(project.sessionId);
      setPlanId(response.plan_id);
      setStartDate(response.start_date);
      setEndDate(response.end_date);
      
      // Load Gantt data
      const ganttData = await getGanttData(response.plan_id);
      setGanttItems(ganttData);
      
      // Update tasks with dates
      handleTaskUpdate(response.tasks);
      
      // Save to localStorage with plan info
      const projects = JSON.parse(localStorage.getItem("recentProjects") || "[]");
      const updatedProjects = projects.map((p: any) => 
        p.id === params.id 
          ? { ...p, tasks: response.tasks, planId: response.plan_id, startDate: response.start_date, endDate: response.end_date }
          : p
      );
      localStorage.setItem("recentProjects", JSON.stringify(updatedProjects));
    } catch (error) {
      alert(`Failed to generate timeline: ${error instanceof Error ? error.message : "Unknown error"}`);
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

  if (!project) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading project...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
          <div>
            <h1 className="text-xl font-bold">{project.name}</h1>
            <p className="text-sm text-muted-foreground">
              {project.tasks.length} task{project.tasks.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {planId && (
            <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
          {!planId && project.tasks.length > 0 && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleGenerateTimeline}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Timeline"}
            </Button>
          )}
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="kanban" className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b px-6">
          <TabsList>
            <TabsTrigger value="kanban" className="gap-2">
              <Kanban className="h-4 w-4" />
              Kanban Board
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2" disabled={!planId}>
              <Calendar className="h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="tracker" className="gap-2" disabled={!planId}>
              <BarChart3 className="h-4 w-4" />
              Project Tracker
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="kanban" className="flex-1 overflow-hidden m-0 p-6">
          <KanbanBoard 
            tasks={project.tasks} 
            projectName={project.name}
            onTasksUpdate={handleTaskUpdate}
          />
        </TabsContent>

        <TabsContent value="timeline" className="flex-1 overflow-hidden m-0">
          {planId && ganttItems.length > 0 ? (
            <GanttChart items={ganttItems} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
              <Calendar className="h-16 w-16 opacity-20" />
              <div className="text-center">
                <p className="font-semibold mb-1">No Timeline Generated</p>
                <p className="text-sm">Click "Generate Timeline" to create a Gantt chart</p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tracker" className="flex-1 overflow-auto m-0 p-6">
          {planId && startDate && endDate ? (
            <ProjectTracker 
              tasks={project.tasks}
              projectName={project.name}
              startDate={startDate}
              endDate={endDate}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
              <BarChart3 className="h-16 w-16 opacity-20" />
              <div className="text-center">
                <p className="font-semibold mb-1">No Tracking Data</p>
                <p className="text-sm">Generate a timeline to view project metrics and progress</p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
