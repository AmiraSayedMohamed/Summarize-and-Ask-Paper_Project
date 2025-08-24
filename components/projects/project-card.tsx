"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, MoreHorizontal } from "lucide-react"
import type { Project } from "@/lib/types"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ProjectCardProps {
  project: Project
  onDelete?: (projectId: string) => void
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return "bg-secondary text-secondary-foreground"
      case "completed":
        return "bg-primary text-primary-foreground"
      case "archived":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="font-serif text-lg mb-1">{project.name}</CardTitle>
            <CardDescription className="line-clamp-2">
              {project.description || "No description provided"}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/projects/${project.id}`}>View Details</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/projects/${project.id}/upload`}>Upload Files</Link>
              </DropdownMenuItem>
              {onDelete && (
                <DropdownMenuItem className="text-destructive" onClick={() => onDelete(project.id)}>
                  Delete Project
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Badge className={getStatusColor(project.status)}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <FileText className="h-4 w-4 mr-1" />
            {project.filesCount} files
          </div>
        </div>

        <div className="flex items-center text-xs text-muted-foreground mb-4">
          <Calendar className="h-3 w-3 mr-1" />
          Created {formatDate(project.createdAt)}
        </div>

        <div className="flex gap-2">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/dashboard/projects/${project.id}`}>View Project</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/projects/${project.id}/upload`}>Upload</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
