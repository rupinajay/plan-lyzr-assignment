"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChatWindow } from "@/components/ChatWindow";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { GanttModal } from "@/components/GanttModal";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { postChat, generateReport, Task } from "@/lib/api";
import { Calendar, Loader2, BookOpen } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface RecentProject {
  id: string;
  name: string;
  timestamp: string;
  messages: Message[];
  tasks: Task[];
  projectName: string | null;
  sessionId: string | null;
  planId?: string;
  startDate?: string;
  endDate?: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [planId, setPlanId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"home" | "chat">("home");
  const router = useRouter();

  // Load projects from localStorage on mount and handle projectId query param
  useEffect(() => {
    const saved = localStorage.getItem("recentProjects");
    if (saved) {
      try {
        const projects = JSON.parse(saved);
        setRecentProjects(projects);
        
        // Check if there's a projectId in the URL query params
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get("projectId");
        
        if (projectId) {
          // Load the specific project and switch to chat view
          const project = projects.find((p: RecentProject) => p.id === projectId);
          if (project) {
            setCurrentProjectId(project.id);
            setMessages(project.messages);
            setTasks(project.tasks);
            setProjectName(project.projectName);
            setSessionId(project.sessionId);
            setPlanId(null);
            setStartDate("");
            setViewMode("chat");
            // Clean up the URL
            window.history.replaceState({}, "", "/");
          }
        } else if (projects.length > 0) {
          // Show home view if there are projects
          setViewMode("home");
        }
      } catch (e) {
        console.error("Failed to load projects:", e);
      }
    }
  }, []); // Run only once on mount

  // Save projects to localStorage when they change
  useEffect(() => {
    if (recentProjects.length > 0) {
      localStorage.setItem("recentProjects", JSON.stringify(recentProjects));
    }
  }, [recentProjects]);

  const handleSendMessage = async (text: string) => {
    // Ensure we're in chat mode when sending a message
    setViewMode("chat");
    
    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    // If this is the first message and no project exists, create one with the message as name
    if (!currentProjectId && messages.length === 0) {
      const newProjectId = `project_${Date.now()}`;
      setCurrentProjectId(newProjectId);
      
      const newProject: RecentProject = {
        id: newProjectId,
        name: text.substring(0, 50) + (text.length > 50 ? "..." : ""),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        messages: [{ role: "user", content: text }],
        tasks: [],
        projectName: null,
        sessionId: null,
      };
      
      // Update the sidebar immediately with the new project
      const updatedProjects = [newProject, ...recentProjects];
      setRecentProjects(updatedProjects);
      localStorage.setItem("recentProjects", JSON.stringify(updatedProjects));
    }

    try {
      // Send current tasks if they exist (for modification requests)
      const currentTasks = tasks.length > 0 ? tasks : undefined;
      const response = await postChat(sessionId, text, currentTasks);
      
      // Update session ID
      if (!sessionId) {
        setSessionId(response.session_id);
      }

      // Update tasks and project name
      if (response.entities.tasks) {
        setTasks(response.entities.tasks);
      }
      
      // Only set project name if it hasn't been set yet (first extraction only)
      if (response.entities.project_name && !projectName) {
        setProjectName(response.entities.project_name);
        
        // Update project name in sidebar if AI extracted one for the first time
        if (currentProjectId) {
          const updatedProjects = recentProjects.map(p => 
            p.id === currentProjectId 
              ? { ...p, projectName: response.entities.project_name, sessionId: response.session_id, tasks: response.entities.tasks || p.tasks }
              : p
          );
          setRecentProjects(updatedProjects);
          localStorage.setItem("recentProjects", JSON.stringify(updatedProjects));
        }
      } else if (response.entities.tasks && currentProjectId) {
        // If project name already exists, just update tasks without changing the name
        const updatedProjects = recentProjects.map(p => 
          p.id === currentProjectId 
            ? { ...p, sessionId: response.session_id, tasks: response.entities.tasks || p.tasks }
            : p
        );
        setRecentProjects(updatedProjects);
        localStorage.setItem("recentProjects", JSON.stringify(updatedProjects));
      }

      // Store tasks data in message for table rendering
      const taskCount = response.entities.tasks?.length || 0;
      
      console.log("=== AI RESPONSE ===");
      console.log("Response entities:", JSON.stringify(response.entities, null, 2));
      console.log("Response message:", response.message);
      console.log("==================");
      
      if (taskCount > 0) {
        const messageData = {
          type: "tasks",
          projectName: response.entities.project_name,
          tasks: response.entities.tasks,
          count: taskCount,
        };
        
        console.log("=== MESSAGE DATA TO STORE ===");
        console.log(JSON.stringify(messageData, null, 2));
        console.log("============================");
        
        // First show the AI's response message
        setMessages((prev) => [
          ...prev,
          { 
            role: "assistant", 
            content: response.message // ← Show AI's actual message!
          },
        ]);
        
        // Then show the task table
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { 
              role: "assistant", 
              content: JSON.stringify(messageData)
            },
          ]);
        }, 100);
      } else {
        // Use the AI's message from backend
        setMessages((prev) => [
          ...prev,
          { 
            role: "assistant", 
            content: response.message // ← Use AI's actual message!
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${
            error instanceof Error ? error.message : "Failed to process message"
          }`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!sessionId) {
      alert("No session found. Please start a conversation first.");
      return;
    }

    setLoading(true);
    
    // Close modal first if it's open to force a refresh
    setModalOpen(false);

    try {
      // Send the current tasks state (including any manual edits) to the backend
      console.log("=== SENDING TO GENERATE REPORT ===");
      console.log("Current tasks being sent:", tasks);
      console.log("====================================");
      
      const response = await generateReport(sessionId, startDate || undefined, tasks);
      
      console.log("=== GENERATE REPORT RESPONSE ===");
      console.log("Plan ID:", response.plan_id);
      console.log("Tasks with dates:", JSON.stringify(response.tasks, null, 2));
      console.log("================================");
      
      // Update state with new plan data
      setPlanId(response.plan_id);
      setTasks(response.tasks);
      setProjectName(response.project_name);
      setStartDate(response.start_date);
      
      // Small delay to ensure state updates, then open modal
      setTimeout(() => {
        setModalOpen(true);
      }, 100);

      // Save planId to localStorage for current project
      if (currentProjectId) {
        const projects = JSON.parse(localStorage.getItem("recentProjects") || "[]");
        const updatedProjects = projects.map((p: RecentProject) => 
          p.id === currentProjectId 
            ? { ...p, planId: response.plan_id, startDate: response.start_date, endDate: response.end_date, tasks: response.tasks }
            : p
        );
        setRecentProjects(updatedProjects);
        localStorage.setItem("recentProjects", JSON.stringify(updatedProjects));
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Report generated! Project runs from ${response.start_date} to ${response.end_date}.`,
        },
      ]);
    } catch (error) {
      alert(
        `Failed to generate report: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    // Save current project if it has messages
    if (messages.length > 0 && currentProjectId) {
      const updatedProjects = recentProjects.map(p => 
        p.id === currentProjectId 
          ? { ...p, messages, tasks, projectName, sessionId }
          : p
      );
      setRecentProjects(updatedProjects);
      localStorage.setItem("recentProjects", JSON.stringify(updatedProjects));
    }

    // Reset to new project state (will be created on first message)
    setCurrentProjectId(null);
    setMessages([]);
    setSessionId(null);
    setTasks([]);
    setProjectName(null);
    setPlanId(null);
    setStartDate("");
    // Force chat view to show blank chat
    setViewMode("chat");
  };

  const handleProjectClick = (projectId: string) => {
    // Check if project has timeline generated
    const project = recentProjects.find(p => p.id === projectId);
    if (project?.planId) {
      // Navigate to project Kanban view
      router.push(`/project/${projectId}`);
    } else {
      // Load project in chat to generate timeline
      handleSelectProject(projectId);
      setViewMode("chat");
    }
  };

  const handleBackToHome = () => {
    // Save current project state
    if (currentProjectId && messages.length > 0) {
      const updatedProjects = recentProjects.map(p => 
        p.id === currentProjectId 
          ? { ...p, messages, tasks, projectName, sessionId }
          : p
      );
      setRecentProjects(updatedProjects);
    }
    setViewMode("home");
  };

  const handleSelectProject = (projectId: string) => {
    // Save current project state
    if (currentProjectId && messages.length > 0) {
      const updatedProjects = recentProjects.map(p => 
        p.id === currentProjectId 
          ? { ...p, messages, tasks, projectName, sessionId }
          : p
      );
      setRecentProjects(updatedProjects);
      // Save to localStorage
      localStorage.setItem("recentProjects", JSON.stringify(updatedProjects));
    }

    // Load selected project and switch to chat view
    const project = recentProjects.find(p => p.id === projectId);
    if (project) {
      setCurrentProjectId(project.id);
      setMessages(project.messages);
      setTasks(project.tasks);
      setProjectName(project.projectName);
      setSessionId(project.sessionId);
      setPlanId(null);
      setStartDate("");
      setViewMode("chat"); // Switch to chat view when selecting from sidebar
    }
  };

  const handleHome = () => {
    // Save current project state
    if (currentProjectId && messages.length > 0) {
      const updatedProjects = recentProjects.map(p => 
        p.id === currentProjectId 
          ? { ...p, messages, tasks, projectName, sessionId }
          : p
      );
      setRecentProjects(updatedProjects);
    }
    
    // Switch to home view
    if (recentProjects.length > 0) {
      setViewMode("home");
    }
  };

  const handleTasksUpdate = (updatedTasks: Task[]) => {
    // Update the tasks state immediately with manual edits
    setTasks(updatedTasks);
    
    // Update the most recent task message to reflect manual edits
    setMessages(prev => {
      const messages = [...prev];
      // Find the last message with tasks
      for (let i = messages.length - 1; i >= 0; i--) {
        try {
          const parsed = JSON.parse(messages[i].content);
          if (parsed.type === "tasks") {
            messages[i] = {
              ...messages[i],
              content: JSON.stringify({
                ...parsed,
                tasks: updatedTasks,
                count: updatedTasks.length
              })
            };
            break;
          }
        } catch {}
      }
      return messages;
    });
  };

  const handleDeleteProject = (projectId: string) => {
    // Confirm deletion
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return;
    }

    // Remove project from list
    const updatedProjects = recentProjects.filter(p => p.id !== projectId);
    setRecentProjects(updatedProjects);
    localStorage.setItem("recentProjects", JSON.stringify(updatedProjects));

    // If deleting current project, reset state and go home
    if (projectId === currentProjectId) {
      setCurrentProjectId(null);
      setMessages([]);
      setSessionId(null);
      setTasks([]);
      setProjectName(null);
      setPlanId(null);
      setStartDate("");
      
      // Show home view if there are still projects, otherwise show blank chat
      if (updatedProjects.length > 0) {
        setViewMode("home");
      } else {
        setViewMode("chat");
      }
    }
  };



  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar 
        onNewChat={handleNewChat}
        onHome={handleHome}
        recentProjects={recentProjects}
        currentProjectId={currentProjectId}
        onSelectProject={handleSelectProject}
        onDeleteProject={handleDeleteProject}
      />
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1" />
          <ThemeToggle />
          <Button variant="outline" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Docs
          </Button>
        </header>

        {/* Main Content Area */}
        {viewMode === "home" && recentProjects.length > 0 ? (
          /* Project Cards View */
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Your Projects</h2>
                <p className="text-muted-foreground">
                  Click on a project to view its Timeline, Kanban board and Project Tracker, or continue chatting about it.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    id={project.id}
                    name={project.projectName || project.name}
                    tasks={project.tasks}
                    hasTimeline={!!project.planId}
                    onClick={() => handleProjectClick(project.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Chat Section */
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {/* Chat Messages - Scrollable Area */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-6xl mx-auto p-6">
                {messages.length === 0 ? (
                  recentProjects.length === 0 ? (
                    // First time user - show welcome with feature cards
                    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
                      <div className="space-y-3 max-w-2xl">
                        <h2 className="text-3xl font-bold">Welcome to Plan.</h2>
                        <p className="text-lg text-muted-foreground">
                          Your AI-powered project planning assistant
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
                        <div className="p-4 rounded-lg border bg-card">
                          <h3 className="font-semibold mb-1">Describe Your Project</h3>
                          <p className="text-sm text-muted-foreground">
                            Chat naturally about your project goals and tasks
                          </p>
                        </div>
                        
                        <div className="p-4 rounded-lg border bg-card">
                          <h3 className="font-semibold mb-1">Edit & Refine</h3>
                          <p className="text-sm text-muted-foreground">
                            Manually edit tasks or ask AI to make changes
                          </p>
                        </div>
                        
                        <div className="p-4 rounded-lg border bg-card">
                          <h3 className="font-semibold mb-1">Visualize Timeline</h3>
                          <p className="text-sm text-muted-foreground">
                            Generate Gantt charts and track progress
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // New project - simple blank state
                    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
                      <div className="space-y-2 max-w-md">
                        <h2 className="text-2xl font-bold">New Project</h2>
                        <p className="text-muted-foreground">
                          Describe your project below to get started
                        </p>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <ChatMessage
                        key={index}
                        role={message.role}
                        content={message.content}
                        onTasksUpdate={handleTasksUpdate}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Chat Input - Bottom (fixed) */}
            <div className="px-6 pb-6 pt-4 bg-background shrink-0">
              <div className="flex gap-3 items-center max-w-6xl mx-auto">
                <ChatInput onSend={handleSendMessage} disabled={loading} />
                {tasks.length > 0 && (
                  <Button
                    onClick={handleGenerateReport}
                    disabled={loading || !sessionId}
                    size="lg"
                    className="gap-2 h-12 shrink-0 rounded-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4" />
                        Generate Timeline
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </SidebarInset>

      {/* Gantt Modal */}
      <GanttModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        planId={planId}
        projectName={projectName || "Project Timeline"}
        tasks={tasks}
        startDate={startDate}
        endDate={startDate}
      />
    </SidebarProvider>
  );
}
