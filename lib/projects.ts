import type { Project, UploadedFile } from "./types"

// Mock project storage (in real app, this would be database)
export const createProject = async (name: string, description: string, userId: string): Promise<Project> => {
  const project: Project = {
    id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "active",
    filesCount: 0,
  }

  // Store in localStorage (in real app, this would be database)
  const projects = getStoredProjects()
  projects.push(project)
  localStorage.setItem("projects", JSON.stringify(projects))

  return project
}

export const getUserProjects = async (userId: string): Promise<Project[]> => {
  const projects = getStoredProjects()
  return projects.filter((p) => p.userId === userId)
}

export const getProject = async (projectId: string): Promise<Project | null> => {
  const projects = getStoredProjects()
  return projects.find((p) => p.id === projectId) || null
}

export const updateProject = async (projectId: string, updates: Partial<Project>): Promise<Project | null> => {
  const projects = getStoredProjects()
  const index = projects.findIndex((p) => p.id === projectId)

  if (index === -1) return null

  projects[index] = { ...projects[index], ...updates, updatedAt: new Date().toISOString() }
  localStorage.setItem("projects", JSON.stringify(projects))

  return projects[index]
}

export const deleteProject = async (projectId: string): Promise<boolean> => {
  const projects = getStoredProjects()
  const filtered = projects.filter((p) => p.id !== projectId)

  if (filtered.length === projects.length) return false

  localStorage.setItem("projects", JSON.stringify(filtered))

  // Also delete associated files
  const files = getStoredFiles()
  const filteredFiles = files.filter((f) => f.projectId !== projectId)
  localStorage.setItem("project_files", JSON.stringify(filteredFiles))

  return true
}

export const getProjectFiles = async (projectId: string): Promise<UploadedFile[]> => {
  const files = getStoredFiles()
  return files.filter((f) => f.projectId === projectId)
}

export const addFileToProject = async (file: UploadedFile): Promise<void> => {
  const files = getStoredFiles()
  files.push(file)
  localStorage.setItem("project_files", JSON.stringify(files))

  // Update project file count
  const projects = getStoredProjects()
  const projectIndex = projects.findIndex((p) => p.id === file.projectId)
  if (projectIndex !== -1) {
    projects[projectIndex].filesCount += 1
    projects[projectIndex].updatedAt = new Date().toISOString()
    localStorage.setItem("projects", JSON.stringify(projects))
  }
}

export const updateFileStatus = async (
  fileId: string,
  status: UploadedFile["status"],
  progress?: number,
): Promise<void> => {
  const files = getStoredFiles()
  const fileIndex = files.findIndex((f) => f.id === fileId)

  if (fileIndex !== -1) {
    files[fileIndex].status = status
    if (progress !== undefined) {
      files[fileIndex].progress = progress
    }
    localStorage.setItem("project_files", JSON.stringify(files))
  }
}

const getStoredProjects = (): Project[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("projects")
  return stored ? JSON.parse(stored) : []
}

const getStoredFiles = (): UploadedFile[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("project_files")
  return stored ? JSON.parse(stored) : []
}
