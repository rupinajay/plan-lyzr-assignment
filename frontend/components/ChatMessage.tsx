import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Edit2, Save } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  onTasksUpdate?: (tasks: any[]) => void;
}

interface Task {
  id: string;
  title: string;
  duration_days: number;
  owner?: string;
  dependencies: string[];
}

interface MessageData {
  type: "tasks";
  projectName: string | null;
  tasks: Task[];
  count: number;
}

interface EditableTableProps {
  messageData: MessageData;
  onSave: (tasks: Task[]) => void;
}

function EditableTable({ messageData, onSave }: EditableTableProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTasks, setEditedTasks] = useState<Task[]>(messageData.tasks);

  const handleSave = () => {
    onSave(editedTasks);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTasks(messageData.tasks);
    setIsEditing(false);
  };

  const updateTask = (index: number, field: keyof Task, value: any) => {
    const updated = [...editedTasks];
    updated[index] = { ...updated[index], [field]: value };
    setEditedTasks(updated);
  };

  return (
    <div className="max-w-[95%] rounded-lg bg-muted p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          {messageData.projectName && (
            <h3 className="text-base font-semibold text-foreground mb-1">
              Project: {messageData.projectName}
            </h3>
          )}
          <p className="text-sm text-muted-foreground">
            {editedTasks.length} task{editedTasks.length !== 1 ? "s" : ""}
          </p>
        </div>
        {!isEditing ? (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
            <Edit2 className="h-3 w-3 mr-1" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full table-fixed">
          <colgroup>
            <col style={{ width: '50px' }} />
            <col style={{ width: 'auto' }} />
            <col style={{ width: '120px' }} />
            <col style={{ width: '150px' }} />
          </colgroup>
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">No.</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Task</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">Duration</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Owner</th>
            </tr>
          </thead>
          <tbody>
            {editedTasks.map((task, index) => (
              <tr key={task.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 text-sm text-muted-foreground">{index + 1}</td>
                <td className="px-4 py-3 text-sm">
                  {isEditing ? (
                    <input
                      type="text"
                      value={task.title}
                      onChange={(e) => updateTask(index, "title", e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <span className="font-medium text-foreground block py-1.5">{task.title}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex justify-center">
                    {isEditing ? (
                      <input
                        type="number"
                        value={task.duration_days}
                        onChange={(e) => updateTask(index, "duration_days", parseInt(e.target.value) || 1)}
                        className="w-20 px-2 py-1.5 text-sm border rounded bg-background text-center focus:outline-none focus:ring-2 focus:ring-primary"
                        min="1"
                      />
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {task.duration_days} days
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  {isEditing ? (
                    <input
                      type="text"
                      value={task.owner || ""}
                      onChange={(e) => updateTask(index, "owner", e.target.value || undefined)}
                      placeholder="Unassigned"
                      className="w-full px-2 py-1.5 text-sm border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <span className="text-foreground block py-1.5">
                      {task.owner || <span className="text-muted-foreground italic">Unassigned</span>}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        {isEditing ? "Edit tasks and click Save" : "Click Edit to modify tasks or Generate Timeline to visualize"}
      </p>
    </div>
  );
}

export function ChatMessage({ role, content, onTasksUpdate }: ChatMessageProps & { onTasksUpdate?: (tasks: Task[]) => void }) {
  // Try to parse as JSON for structured data
  let messageData: MessageData | null = null;
  try {
    const parsed = JSON.parse(content);
    if (parsed.type === "tasks") {
      messageData = parsed;
      // Log the tasks data to see what we're receiving
      console.log("=== CHAT MESSAGE TASKS DATA ===");
      console.log("Tasks received:", JSON.stringify(parsed.tasks, null, 2));
      console.log("================================");
    }
  } catch {
    // Not JSON, treat as regular text
  }

  // Render editable task table
  if (messageData && role === "assistant" && onTasksUpdate) {
    return (
      <div className="flex w-full mb-4 justify-start">
        <EditableTable messageData={messageData} onSave={onTasksUpdate} />
      </div>
    );
  }

  // Regular text message
  return (
    <div
      className={cn(
        "flex w-full mb-4",
        role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-4 py-3",
          role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        <div className="text-sm leading-relaxed markdown-content">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
              li: ({ children }) => <li>{children}</li>,
              strong: ({ children }) => <strong className="font-bold">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,
              a: ({ children, href }) => (
                <a href={href} className="underline hover:opacity-80" target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
              code: ({ children }) => (
                <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-xs">
                  {children}
                </code>
              ),
              br: () => <br />,
            }}
          >
            {/* Convert single newlines to double newlines for proper Markdown paragraph rendering */}
            {content.replace(/\n/g, '\n\n')}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
