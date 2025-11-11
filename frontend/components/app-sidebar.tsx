"use client"

import { Home, MessageSquare, PlusCircle } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

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
}

export function AppSidebar({ 
  onNewChat,
  onHome,
  recentProjects,
  currentProjectId,
  onSelectProject,
  ...props 
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-xl">
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
                <SidebarMenuButton onClick={onHome} tooltip="Home">
                  <Home />
                  <span>Home</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onNewChat} tooltip="New Project">
                  <PlusCircle />
                  <span>New Project</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
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
                    <SidebarMenuItem key={project.id}>
                      <SidebarMenuButton
                        onClick={() => onSelectProject(project.id)}
                        isActive={currentProjectId === project.id}
                        tooltip={project.projectName || project.name}
                        className="transition-colors duration-200"
                      >
                        <MessageSquare />
                        <span className="font-medium text-left w-full overflow-hidden text-ellipsis whitespace-nowrap">
                          {project.projectName || project.name}
                        </span>
                      </SidebarMenuButton>
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
