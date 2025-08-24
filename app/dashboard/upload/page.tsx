"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUploadZone } from "@/components/upload/file-upload-zone"
import { CreateProjectDialog } from "@/components/projects/create-project-dialog"
import { useAuth } from "@/contexts/auth-context"
import { getUserProjects } from "@/lib/projects"
import type { Project, UploadedFile } from "@/lib/types"
import { Upload, FolderPlus } from "lucide-react"

export default function UploadPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const loadProjects = async () => {
      if (!user) return

      try {
        const userProjects = await getUserProjects(user.id)
        setProjects(userProjects)

        // Auto-select first project if available
        if (userProjects.length > 0 && !selectedProjectId) {
          setSelectedProjectId(userProjects[0].id)
        }
      } catch (error) {
        console.error("Failed to load projects:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProjects()
  }, [user, selectedProjectId])

  const handleProjectCreated = (project: Project) => {
    setProjects((prev) => [project, ...prev])
    setSelectedProjectId(project.id)
  }

  const handleFileUploaded = (file: UploadedFile) => {
    // Refresh projects to update file count
    if (user) {
      getUserProjects(user.id).then(setProjects)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Upload Research Papers</h1>
        <p className="text-muted-foreground">Upload PDF files to analyze with AI-powered literature analysis tools.</p>
      </div>

      {/* Project Selection */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-serif flex items-center">
            <FolderPlus className="mr-2 h-5 w-5" />
            Select Project
          </CardTitle>
          <CardDescription>Choose a project to organize your uploaded papers, or create a new one.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name} ({project.filesCount} files)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <CreateProjectDialog onProjectCreated={handleProjectCreated} />
          </div>
        </CardContent>
      </Card>

      {/* Upload Zone */}
      {selectedProjectId ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-serif flex items-center">
              <Upload className="mr-2 h-5 w-5" />
              Upload Files
            </CardTitle>
            <CardDescription>
              Upload PDF research papers for AI-powered analysis and insight extraction.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploadZone projectId={selectedProjectId} onFileUploaded={handleFileUploaded} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderPlus className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Project Selected</h3>
            <p className="text-muted-foreground mb-4">
              Create a new project or select an existing one to start uploading files.
            </p>
            <CreateProjectDialog onProjectCreated={handleProjectCreated} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
