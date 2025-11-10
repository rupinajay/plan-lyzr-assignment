"use client";

import { useState } from "react";
import { ChatWindow } from "@/components/ChatWindow";
import { ChatInput } from "@/components/ChatInput";
import { TaskList } from "@/components/TaskList";
import { GanttModal } from "@/components/GanttModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { postChat, generateReport, Task } from "@/lib/api";
import { Calendar, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
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

  const handleSendMessage = async (text: string) => {
    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const response = await postChat(sessionId, text);
      
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
      }

      // Add assistant response
      const taskCount = response.entities.tasks?.length || 0;
      const assistantMessage = `I've extracted ${taskCount} task${
        taskCount !== 1 ? "s" : ""
      } from your message. ${
        response.entities.project_name
          ? `Project: ${response.entities.project_name}`
          : ""
      }`;

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantMessage },
      ]);
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

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">PLAN</h1>
          <p className="text-muted-foreground">
            Chat-driven project planner with AI-powered task extraction
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Chat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ChatWindow messages={messages} />
                <ChatInput onSend={handleSendMessage} disabled={loading} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Generate Report Card */}
            <Card>
              <CardHeader>
                <CardTitle>Generate Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Start Date (optional)
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button
                  onClick={handleGenerateReport}
                  disabled={loading || !sessionId || tasks.length === 0}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Calendar className="mr-2 h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Task List */}
            {tasks.length > 0 && (
              <TaskList tasks={tasks} projectName={projectName} />
            )}
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
