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
  tasks?: Task[];  // Optional: edited tasks to use instead of session tasks
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

export async function postChatStream(
  sessionId: string | null,
  text: string,
  onMessage: (chunk: string) => void,
  onEntities: (entities: any, sessionId: string) => void,
  onError: (error: string) => void,
  currentTasks?: Task[]
): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/api/chat/stream`, {
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

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("No response body");
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          try {
            const parsed = JSON.parse(data);
            
            if (parsed.type === 'message') {
              onMessage(parsed.content);
            } else if (parsed.type === 'entities') {
              onEntities(parsed.data, parsed.session_id);
            } else if (parsed.type === 'error') {
              onError(parsed.message);
            } else if (parsed.type === 'done') {
              // Stream complete
              break;
            }
          } catch (e) {
            // Skip invalid JSON
            console.warn('Failed to parse SSE data:', data);
          }
        }
      }
    }
  } catch (error) {
    onError(error instanceof Error ? error.message : "Stream failed");
  }
}

export async function generateReport(
  sessionId: string,
  startDate?: string,
  tasks?: Task[]
): Promise<GenerateReportResponse> {
  const res = await fetch(`${API_BASE}/api/generate_report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      session_id: sessionId, 
      start_date: startDate,
      tasks: tasks  // Send edited tasks if provided
    }),
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
