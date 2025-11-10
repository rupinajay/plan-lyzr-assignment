"use client";

import { useState } from "react";
import { ChatWindow } from "@/components/ChatWindow";
import { ChatInput } from "@/components/ChatInput";
import { Sidebar } from "@/components/Sidebar";
import { GanttModal } from "@/components/GanttModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  const handleSendMessage = async (text: string) => {
    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    // If this is the first message and no project exists, create one
    if (!currentProjectId && messages.length === 0) {
      const newProjectId = `project_${Date.now()}`;
      setCurrentProjectId(newProjectId);
      
      const newProject: RecentProject = {
        id: newProjectId,
        name: text.substring(0, 50) + (text.length > 50 ? "..." : ""),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        messages: [],
        tasks: [],
        projectName: null,
        sessionId: null,
      };
      
      setRecentProjects(prev => [newProject, ...prev]);
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
      if (response.entities.project_name) {
        setProjectName(response.entities.project_name);
        // Update the existing recent entry with the proper project name
        if (currentProjectId) {
          setRecentProjects(prev => prev.map(p => 
            p.id === currentProjectId 
              ? { ...p, name: response.entities.project_name || p.name, projectName: response.entities.project_name }
              : p
          ));
        }
      }

      // Store tasks data in message for table rendering
      const taskCount = response.entities.tasks?.length || 0;
      
      if (taskCount > 0) {
        const messageData = {
          type: "tasks",
          projectName: response.entities.project_name,
          tasks: response.entities.tasks,
          count: taskCount,
        };
        
        setMessages((prev) => [
          ...prev,
          { 
            role: "assistant", 
            content: JSON.stringify(messageData)
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { 
            role: "assistant", 
            content: "I'm listening! Please describe your project tasks, timelines, and team members."
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

    try {
      const response = await generateReport(sessionId, startDate || undefined);
      setPlanId(response.plan_id);
      setTasks(response.tasks);
      setProjectName(response.project_name);
      setModalOpen(true);

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
    }

    // Reset to no project (will be created on first message)
    setCurrentProjectId(null);
    setMessages([]);
    setSessionId(null);
    setTasks([]);
    setProjectName(null);
    setPlanId(null);
    setStartDate("");
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
    }

    // Load selected project
    const project = recentProjects.find(p => p.id === projectId);
    if (project) {
      setCurrentProjectId(project.id);
      setMessages(project.messages);
      setTasks(project.tasks);
      setProjectName(project.projectName);
      setSessionId(project.sessionId);
      setPlanId(null);
      setStartDate("");
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



  return (
    <main className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        onNewChat={handleNewChat}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        recentProjects={recentProjects}
        currentProjectId={currentProjectId}
        onSelectProject={handleSelectProject}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="bg-card px-6 py-4 flex items-center justify-between border-b">
          <h1 className="text-2xl font-bold">Plan.</h1>
          <Button variant="outline" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Docs
          </Button>
        </div>

        {/* Chat Section */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full min-h-0">
            {/* Chat Messages - Middle (scrollable) */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <div className="h-full p-6">
                <ChatWindow messages={messages} onTasksUpdate={handleTasksUpdate} />
              </div>
            </div>
            
            {/* Chat Input - Bottom (fixed) */}
            <div className="px-6 pb-6 pt-4 border-t bg-background">
              <div className="flex gap-3 items-center max-w-5xl mx-auto">
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
        </div>
      </div>

      {/* Gantt Modal */}
      <GanttModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        planId={planId}
        projectName={projectName || "Project Timeline"}
      />
    </main>
  );
}
