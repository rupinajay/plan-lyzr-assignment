const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export interface ChatRequest {
  session_id?: string;
  text: string;
  current_tasks?: Task[];  // Current table state with manual edits
}

export interface ChatResponse {
  session_id: string;
  entities: {
    project_name: string | null;
    tasks: Task[];
  };
  message: string;
}

export interface Task {
  id: string;
  title: string;
  duration_days: number;
  owner?: string;
  dependencies: string[];
  start_date?: string;  // Planned start (from timeline)
  end_date?: string;    // Planned end (from timeline)
  actual_start?: string;  // Actual start (from Kanban)
  actual_end?: string;    // Actual end (from Kanban)
  status?: string;  // todo, in-progress, done
}

export interface GenerateReportRequest {
  session_id: string;
  start_date?: string;
}

export interface GenerateReportResponse {
  plan_id: string;
  project_name: string;
  tasks: Task[];
  start_date: string;
  end_date: string;
}

export interface GanttItem {
  id: string;
  content: string;
  start: string;
  end: string;
  group: string;
}

export async function postChat(
  sessionId: string | null,
  text: string,
  currentTasks?: Task[]
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      session_id: sessionId, 
      text,
      current_tasks: currentTasks 
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Chat failed" }));
    throw new Error(error.detail || "Chat request failed");
  }

  return res.json();
}

export async function generateReport(
  sessionId: string,
  startDate?: string
): Promise<GenerateReportResponse> {
  const res = await fetch(`${API_BASE}/api/generate_report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, start_date: startDate }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Report generation failed" }));
    throw new Error(error.detail || "Report generation failed");
  }

  return res.json();
}

export async function getGanttData(planId: string): Promise<GanttItem[]> {
  const res = await fetch(`${API_BASE}/api/gantt_data/${planId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch Gantt data");
  }

  return res.json();
}

export async function downloadCSV(planId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/report/${planId}/csv`);

  if (!res.ok) {
    throw new Error("Failed to download CSV");
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `plan_${planId}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
