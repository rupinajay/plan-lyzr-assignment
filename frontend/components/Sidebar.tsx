"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  PlusCircle, 
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RecentProject {
  id: string;
  name: string;
  timestamp: string;
}

interface SidebarProps {
  onNewChat?: () => void;
  onHome?: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
  recentProjects: RecentProject[];
  currentProjectId: string | null;
  onSelectProject: (projectId: string) => void;
}

export function Sidebar({ 
  onNewChat,
  onHome,
  isCollapsed, 
  onToggle, 
  recentProjects,
  currentProjectId,
  onSelectProject
}: SidebarProps) {
  return (
    <div 
      className={cn(
        "border-r bg-card flex flex-col h-full transition-all duration-300 ease-in-out relative",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border bg-background shadow-md hover:bg-accent"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Header */}
      <div className="p-4 space-y-2">
        {/* App Branding */}
        <div className={cn(
          "flex items-center gap-2 px-2 py-3 mb-2",
          isCollapsed ? "justify-center" : "justify-start"
        )}>
          {!isCollapsed ? (
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PLAN
            </h1>
          ) : (
            <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              P
            </div>
          )}
        </div>

        <Button 
          onClick={onHome}
          variant="ghost"
          className={cn(
            "w-full gap-2 transition-all",
            isCollapsed ? "justify-center px-0" : "justify-start"
          )}
          title={isCollapsed ? "Home" : undefined}
        >
          <Home className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Home</span>}
        </Button>
        
        <Button 
          onClick={onNewChat}
          className={cn(
            "w-full gap-2 transition-all",
            isCollapsed ? "justify-center px-0" : "justify-start"
          )}
          variant="default"
          title={isCollapsed ? "New Project" : undefined}
        >
          <PlusCircle className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>New Project</span>}
        </Button>
      </div>

      {/* Recents Section */}
      <ScrollArea className="flex-1 p-2">
        {!isCollapsed && (
          <div>
            <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Recents
            </h3>
            <div className="space-y-1 mt-2">
              {recentProjects.length === 0 ? (
                <div className="px-3 py-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    No projects yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Start a new conversation
                  </p>
                </div>
              ) : (
                recentProjects.map((project) => (
                  <Button
                    key={project.id}
                    variant={currentProjectId === project.id ? "secondary" : "ghost"}
                    className="w-full justify-start text-sm font-normal h-auto py-2 px-3 overflow-hidden"
                    onClick={() => onSelectProject(project.id)}
                  >
                    <div className="flex items-center gap-2 w-full overflow-hidden">
                      <MessageSquare className="h-4 w-4 shrink-0" />
                      <div className="flex flex-col items-start flex-1 overflow-hidden">
                        <span className="font-medium text-left w-full overflow-hidden text-ellipsis whitespace-nowrap">
                          {project.name}
                        </span>
                        <span className="text-xs text-muted-foreground w-full overflow-hidden text-ellipsis whitespace-nowrap">
                          {project.timestamp}
                        </span>
                      </div>
                    </div>
                  </Button>
                ))
              )}
            </div>
          </div>
        )}
        
        {isCollapsed && recentProjects.length > 0 && (
          <div className="space-y-1">
            {recentProjects.map((project) => (
              <Button
                key={project.id}
                variant={currentProjectId === project.id ? "secondary" : "ghost"}
                size="icon"
                className="w-full"
                onClick={() => onSelectProject(project.id)}
                title={project.name}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
