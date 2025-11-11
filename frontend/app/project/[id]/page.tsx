"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KanbanBoard } from "@/components/KanbanBoard";
import { GanttChart } from "@/components/GanttChart";
import { ProjectTracker } from "@/components/ProjectTracker";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
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

interface RecentProject {
  id: string;
  name: string;
  timestamp: string;
  messages: any[];
  tasks: Task[];
  projectName: string | null;
  sessionId: string | null;
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
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);

  useEffect(() => {
    // Load project from localStorage
    const projects = JSON.parse(localStorage.getItem("recentProjects") || "[]");
    setRecentProjects(projects);
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
    
    // If Gantt data exists, reload it to reflect changes
    if (planId) {
      getGanttData(planId)
        .then(data => setGanttItems(data))
        .catch(err => console.error("Failed to reload Gantt data:", err));
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

  const handleNewChat = () => {
    router.push("/");
  };

  const handleHome = () => {
    router.push("/");
  };

  const handleSelectProject = (projectId: string) => {
    router.push(`/project/${projectId}`);
  };

  if (!project) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading project...</p>
      </div>
    );
  }

  // If no timeline generated yet, show message to go back to chat
  if (!planId || !startDate || !endDate) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <Calendar className="h-16 w-16 text-muted-foreground opacity-20" />
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">No Timeline Generated</h2>
          <p className="text-muted-foreground max-w-md">
            Please generate a timeline from the chat interface first. Click "Generate Timeline" after describing your project tasks.
          </p>
          <Button onClick={() => router.push("/")} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Chat
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar 
        onNewChat={handleNewChat}
        onHome={handleHome}
        recentProjects={recentProjects}
        currentProjectId={params.id as string}
        onSelectProject={handleSelectProject}
      />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-4 flex-1">
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
          </div>
        </header>
        
        {/* Tabs */}
        <Tabs defaultValue="kanban" className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b px-4">
            <TabsList>
              <TabsTrigger value="kanban" className="gap-2">
                <Kanban className="h-4 w-4" />
                Kanban Board
              </TabsTrigger>
              <TabsTrigger value="timeline" className="gap-2">
                <Calendar className="h-4 w-4" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="tracker" className="gap-2">
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
            <GanttChart items={ganttItems} />
          </TabsContent>

          <TabsContent value="tracker" className="flex-1 overflow-auto m-0 p-6">
            <ProjectTracker 
              tasks={project.tasks}
              projectName={project.name}
              startDate={startDate}
              endDate={endDate}
            />
          </TabsContent>
        </Tabs>
      </SidebarInset>
    </SidebarProvider>
  );
}
