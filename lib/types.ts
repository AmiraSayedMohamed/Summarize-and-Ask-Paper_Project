export interface Project {
  id: string
  name: string
  description: string
  userId: string
  createdAt: string
  updatedAt: string
  status: "active" | "completed" | "archived"
  filesCount: number
}

export interface UploadedFile {
  id: string
  projectId: string
  name: string
  size: number
  type: string
  uploadedAt: string
  status: "uploading" | "processing" | "completed" | "failed"
  progress: number
  url?: string
  file_path?: string
  file_id?: string
  analysis?: FileAnalysis
}

export interface FileAnalysis {
  id: string
  fileId: string
  summary: string
  keyFindings: string[]
  methodology: string[]
  researchGaps: string[]
  citations: number
  authors: string[]
  publishedYear: number
  journal: string
  doi?: string
  processedAt: string
}

export interface ProcessingJob {
  id: string
  fileId: string
  type: "pdf_analysis" | "data_analysis" | "outline_generation"
  status: "queued" | "processing" | "completed" | "failed"
  progress: number
  startedAt?: string
  completedAt?: string
  error?: string
  result?: any
}
