"use client"

import { Home, MessageSquare, PlusCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"

interface RecentProject {
  id: string
  name: string
  timestamp: string
  projectName?: string | null
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onNewChat?: () => void
  onHome?: () => void
  recentProjects: RecentProject[]
  currentProjectId: string | null
  onSelectProject: (projectId: string) => void
  onDeleteProject?: (projectId: string) => void
}

export function AppSidebar({ 
  onNewChat,
  onHome,
  recentProjects,
  currentProjectId,
  onSelectProject,
  onDeleteProject,
  ...props 
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-3xl">
                  Plan.
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={onHome} 
                  tooltip="Home" 
                  className="hover:!bg-neutral-200 dark:hover:!bg-neutral-700 transition-colors"
                >
                  <Home />
                  <span>Home</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={onNewChat} 
                  tooltip="New Project" 
                  className="hover:!bg-neutral-200 dark:hover:!bg-neutral-700 transition-colors"
                >
                  <PlusCircle />
                  <span>New Project</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel>Recent Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {recentProjects.length === 0 ? (
                <div className="px-2 py-4 text-center group-data-[collapsible=icon]:hidden">
                  <p className="text-sm text-sidebar-foreground/70">
                    No projects yet
                  </p>
                  <p className="text-xs text-sidebar-foreground/50 mt-1">
                    Start a new conversation
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentProjects.map((project) => (
                    <SidebarMenuItem key={project.id} className="group/item relative">
                      <SidebarMenuButton
                        onClick={() => onSelectProject(project.id)}
                        isActive={currentProjectId === project.id}
                        tooltip={project.projectName || project.name}
                        className="hover:!bg-neutral-200 dark:hover:!bg-neutral-700 transition-colors pr-8"
                      >
                        <MessageSquare />
                        <span className="font-medium text-left w-full overflow-hidden text-ellipsis whitespace-nowrap">
                          {project.projectName || project.name}
                        </span>
                      </SidebarMenuButton>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover/item:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground group-data-[collapsible=icon]:hidden"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onDeleteProject) {
                            onDeleteProject(project.id);
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </SidebarMenuItem>
                  ))}
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
