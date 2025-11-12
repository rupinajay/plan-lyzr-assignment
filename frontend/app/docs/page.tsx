"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, MessageSquare, Calendar, Kanban, BarChart3, Download, Zap, Brain, GitBranch, Shield } from "lucide-react";

export default function DocsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to App
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="container max-w-5xl py-12 px-4 space-y-12">
          {/* Introduction */}
          <section className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Plan.</h1>
            <p className="text-xl text-muted-foreground">
              AI-Powered Project Planning & Timeline Generation
            </p>
            <p className="text-lg leading-relaxed">
              Plan. transforms natural conversations into structured project plans with visual timelines. 
              Simply describe your project, and watch as AI extracts tasks, assigns owners, calculates durations, 
              and generates professional Gantt charts—all through an intuitive chat interface.
            </p>
          </section>

          {/* Key Features */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Key Features</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <MessageSquare className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Natural Chat Interface</CardTitle>
                  <CardDescription>
                    Describe your project in plain language—no forms or rigid inputs required
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Start a conversation and let the AI guide you through project planning. 
                    It asks clarifying questions when needed and remembers context throughout the conversation.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Brain className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>AI Entity Extraction</CardTitle>
                  <CardDescription>
                    Automatically identifies tasks, durations, owners, and dependencies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Powered by advanced language models, Plan. intelligently extracts project components 
                    from your description and validates information before generating timelines.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Calendar className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Smart Timeline Generation</CardTitle>
                  <CardDescription>
                    Business-day aware scheduling with dependency resolution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Generates realistic project timelines that respect weekends, holidays, 
                    and task dependencies. View in Day, Week, or Month format with interactive Gantt charts.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Kanban className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Kanban Board View</CardTitle>
                  <CardDescription>
                    Organize tasks by status with drag-and-drop functionality
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Visualize your project workflow with a Kanban board. Track tasks through 
                    To Do, In Progress, and Done stages with easy status updates.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <BarChart3 className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Project Tracker</CardTitle>
                  <CardDescription>
                    Real-time progress monitoring and analytics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Monitor project health with visual progress indicators, task completion rates, 
                    and team workload distribution across all project phases.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Download className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Export & Share</CardTitle>
                  <CardDescription>
                    Download project plans as CSV for external tools
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Export your project timeline to CSV format for use in Microsoft Project, 
                    Excel, or other project management tools.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* How It Works */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      1
                    </div>
                    <div className="flex-1">
                      <CardTitle>Start a Conversation</CardTitle>
                      <CardDescription className="mt-2">
                        Begin by describing your project goals, timeline, and team members. 
                        Be as detailed or high-level as you like—Plan. adapts to your input style.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                    <p className="text-muted-foreground">Example:</p>
                    <p className="mt-2">&quot;I need to build a mobile app for food delivery. We have a team of 5 developers, 
                    2 designers, and a project manager. We want to launch in 3 months.&quot;</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      2
                    </div>
                    <div className="flex-1">
                      <CardTitle>AI Clarification & Extraction</CardTitle>
                      <CardDescription className="mt-2">
                        Plan.&apos;s AI analyzes your input and asks clarifying questions if needed. 
                        It identifies tasks, owners, durations, and dependencies automatically.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>✓ Validates project is planning-related (rejects irrelevant requests)</p>
                    <p>✓ Identifies missing information (team members, timeline, task owners)</p>
                    <p>✓ Extracts structured data from natural language</p>
                    <p>✓ Creates editable task table with all project details</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      3
                    </div>
                    <div className="flex-1">
                      <CardTitle>Review & Edit Tasks</CardTitle>
                      <CardDescription className="mt-2">
                        Plan. displays an editable table of all extracted tasks. 
                        Review, modify, add, or remove tasks before generating the timeline.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Each task includes: title, description, duration, owner, dependencies, and status. 
                    Edit inline or use the chat to request changes.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      4
                    </div>
                    <div className="flex-1">
                      <CardTitle>Generate Timeline</CardTitle>
                      <CardDescription className="mt-2">
                        Click &quot;Generate Timeline&quot; to create a visual Gantt chart with smart scheduling 
                        that respects business days and task dependencies.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    The scheduler automatically calculates start and end dates for all tasks, 
                    accounts for dependencies, and color-codes tasks by team member for easy visualization.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      5
                    </div>
                    <div className="flex-1">
                      <CardTitle>Manage & Track</CardTitle>
                      <CardDescription className="mt-2">
                        Use the Timeline, Kanban, and Tracker views to monitor progress. 
                        Update task statuses and track completion in real-time.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• <strong>Timeline View:</strong> Gantt chart with Day/Week/Month options</li>
                    <li>• <strong>Kanban Board:</strong> Drag-and-drop task management</li>
                    <li>• <strong>Project Tracker:</strong> Progress analytics and team workload</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Architecture */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Technical Architecture</h2>
            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
                <CardDescription>Modern, scalable architecture built for performance and reliability</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Frontend Stack
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Next.js 14 (React + TypeScript)</li>
                      <li>• shadcn/ui components (Radix UI + Tailwind)</li>
                      <li>• Frappe Gantt for timeline visualization</li>
                      <li>• Deployed on Vercel</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      Backend Stack
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• FastAPI (Python 3.11+)</li>
                      <li>• Groq AI (openai/gpt-oss-20b model)</li>
                      <li>• Pydantic for data validation</li>
                      <li>• Business-day aware scheduler</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto">
                  <pre>{`User (Browser)
  └─ Next.js Frontend
       ├─ Chat Interface (shadcn components)
       ├─ Gantt Chart Modal (Frappe Gantt)
       └─ API Client (fetch)
            ↓
  FastAPI Backend
       ├─ /api/chat              → AI entity extraction
       ├─ /api/generate_report   → Timeline generation
       ├─ /api/gantt_data        → Gantt chart data
       └─ /api/report/{id}/csv   → CSV export
            ↓
  Groq AI (LLM)
       └─ Task extraction & validation`}</pre>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Unique Features */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">What Makes Plan. Unique</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <Brain className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Contextual Understanding</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Plan. doesn&apos;t just store messages—it maintains context-aware understanding 
                    throughout the conversation. It remembers previous decisions, tracks changes, 
                    and adapts responses based on your project&apos;s evolving requirements.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Smart Validation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Advanced prompt engineering ensures the AI stays focused on project planning. 
                    It politely rejects off-topic requests and asks clarifying questions to gather 
                    all necessary information before generating plans.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Calendar className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Intelligent Scheduling</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    The scheduler automatically handles complex scenarios: parallel tasks, 
                    sequential dependencies, business-day calculations, and resource allocation. 
                    It generates realistic timelines that respect real-world constraints.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Zap className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Real-time Editing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Edit tasks inline and regenerate timelines instantly. Changes propagate 
                    automatically to all views (Timeline, Kanban, Tracker) without page refreshes. 
                    Your edits are reflected immediately in the Gantt chart.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* API Endpoints */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">API Reference</h2>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono text-lg">POST /api/chat</CardTitle>
                  <CardDescription>Send messages and receive AI responses with extracted entities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="bg-muted rounded-lg p-3 font-mono text-xs">
                    <p className="text-muted-foreground mb-2">Request Body:</p>
                    <pre>{`{
  "session_id": "uuid-string | null",
  "text": "Your message here"
}`}</pre>
                  </div>
                  <div className="bg-muted rounded-lg p-3 font-mono text-xs">
                    <p className="text-muted-foreground mb-2">Response:</p>
                    <pre>{`{
  "session_id": "uuid-string",
  "message": "AI response",
  "tasks": [...],
  "clarification_needed": false
}`}</pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-mono text-lg">POST /api/generate_report</CardTitle>
                  <CardDescription>Generate project timeline with scheduled tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="bg-muted rounded-lg p-3 font-mono text-xs">
                    <p className="text-muted-foreground mb-2">Request Body:</p>
                    <pre>{`{
  "session_id": "uuid-string",
  "start_date": "2025-01-15",
  "tasks": [optional array of edited tasks]
}`}</pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-mono text-lg">GET /api/gantt_data/:plan_id</CardTitle>
                  <CardDescription>Retrieve timeline data for Gantt chart visualization</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Returns formatted timeline items with start dates, end dates, owners, and dependencies.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-mono text-lg">GET /api/report/:plan_id/csv</CardTitle>
                  <CardDescription>Export project timeline as CSV file</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Downloads a CSV file containing all tasks with their details, suitable for import into other tools.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Security */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Security & Best Practices</h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-semibold">🔐 Data Protection</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• All API keys stored in environment variables</li>
                      <li>• HTTPS encryption for all communications</li>
                      <li>• Input validation with Pydantic schemas</li>
                      <li>• CORS configured for specific origins</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">⚡ Performance</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Rate limiting on API endpoints</li>
                      <li>• Efficient caching strategies</li>
                      <li>• Optimized LLM prompt engineering</li>
                      <li>• Fast Groq inference (70B model)</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">🎯 Reliability</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Comprehensive error handling</li>
                      <li>• Graceful degradation</li>
                      <li>• Session persistence in localStorage</li>
                      <li>• Automatic retry logic</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">🔧 Maintainability</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Modular architecture</li>
                      <li>• TypeScript for type safety</li>
                      <li>• Comprehensive documentation</li>
                      <li>• Clean code principles</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Getting Started */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Getting Started</h2>
            <Card>
              <CardHeader>
                <CardTitle>Quick Start Guide</CardTitle>
                <CardDescription>Get up and running in minutes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">1. Start a New Project</h4>
                  <p className="text-sm text-muted-foreground">
                    Click &quot;New Chat&quot; in the sidebar or start typing in the chat input to begin a new project conversation.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">2. Describe Your Project</h4>
                  <p className="text-sm text-muted-foreground">
                    Tell Plan. about your project goals, timeline, team members, and any specific requirements. 
                    The AI will extract relevant information and ask for clarification if needed.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">3. Review Extracted Tasks</h4>
                  <p className="text-sm text-muted-foreground">
                    Check the task table that appears in the chat. Edit any tasks inline by clicking on them, 
                    or continue the conversation to make adjustments.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">4. Generate Timeline</h4>
                  <p className="text-sm text-muted-foreground">
                    Click the &quot;Generate Timeline&quot; button to create a visual Gantt chart. 
                    View your project in Day, Week, or Month format with color-coded team assignments.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">5. Manage & Export</h4>
                  <p className="text-sm text-muted-foreground">
                    Switch between Timeline, Kanban, and Tracker views to manage your project. 
                    Export to CSV when ready to share or import into other tools.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Tips & Best Practices */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Tips & Best Practices</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>💡 Writing Effective Prompts</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Be specific about team member names and roles</li>
                    <li>• Include approximate durations (&quot;2 weeks&quot;, &quot;5 days&quot;)</li>
                    <li>• Mention dependencies (&quot;after design is complete&quot;)</li>
                    <li>• Describe the end goal clearly</li>
                    <li>• Break complex projects into phases</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🎯 Task Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Review extracted tasks before generating timeline</li>
                    <li>• Use inline editing for quick adjustments</li>
                    <li>• Assign clear owners to all tasks</li>
                    <li>• Update task status regularly in Kanban view</li>
                    <li>• Regenerate timeline after major edits</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>📊 Timeline Optimization</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Use Day view for short-term planning (weeks)</li>
                    <li>• Use Week view for medium-term (1-3 months)</li>
                    <li>• Use Month view for long-term projects (6+ months)</li>
                    <li>• Color coding helps track team workload</li>
                    <li>• Export to CSV for offline analysis</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🔄 Iterative Planning</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Start with high-level tasks, refine later</li>
                    <li>• Continue conversations to add detail</li>
                    <li>• Use chat to request task modifications</li>
                    <li>• Save multiple project versions</li>
                    <li>• Click on projects in sidebar to resume</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Footer */}
          <section className="border-t pt-12 pb-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold">Ready to get started?</h3>
                <p className="text-sm text-muted-foreground">Create your first AI-powered project plan today.</p>
              </div>
              <Button size="lg" onClick={() => router.push("/")}>
                Start Planning
              </Button>
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}
