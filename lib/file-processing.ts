import type { UploadedFile, FileAnalysis, ProcessingJob } from "./types"

// Mock file storage (in real app, this would be AWS S3/MinIO)
export const uploadFile = async (file: File, projectId: string): Promise<UploadedFile> => {
  // Real upload to FastAPI backend
  const uploadedFile: UploadedFile = {
    id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    projectId,
    name: file.name,
    size: file.size,
    type: file.type,
    uploadedAt: new Date().toISOString(),
    status: "uploading",
    progress: 0,
  }

  // Upload file to backend (defensive parsing: check content-type before .json())
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload/`, {
    method: "POST",
    body: formData,
  });
  const ct = response.headers.get("content-type") || "";
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Upload failed ${response.status}: ${body.slice(0,300)}`);
  }
  if (!ct.includes("application/json")) {
    const body = await response.text();
    console.error("Expected JSON but got:", body);
    throw new Error("Server returned non-JSON response; check network/devtools.");
  }
  const data = await response.json();
  // response includes both file_path (server path) and public_url (served path)
  return {
    ...uploadedFile,
    status: "processing",
    progress: 100,
    url: data.public_url, // public URL used by frontend
    file_path: data.file_path, // absolute path used by server-side parsing
    file_id: data.file_id,
  };
}

// Mock processing queue (in real app, this would be Redis + Celery)
export const queueFileProcessing = async (fileId: string): Promise<ProcessingJob> => {
  const job: ProcessingJob = {
    id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    fileId,
    type: "pdf_analysis",
    status: "queued",
    progress: 0,
    startedAt: new Date().toISOString(),
  }

  // Simulate processing
  setTimeout(() => {
    simulateProcessing(job.id)
  }, 1000)

  return job
}

const simulateProcessing = async (jobId: string) => {
  // This would normally be handled by a background worker
  // Simulate processing steps: PDF extraction -> GPT analysis -> result storage

  // Mock analysis result
  const mockAnalysis: FileAnalysis = {
    id: `analysis_${Date.now()}`,
    fileId: jobId.replace("job_", "file_"),
    summary:
      "This paper presents a comprehensive study on machine learning applications in healthcare, focusing on diagnostic accuracy improvements through deep learning algorithms. The research demonstrates significant performance gains over traditional methods.",
    keyFindings: [
      "Deep learning models achieved 94.2% accuracy in medical image classification",
      "Reduced diagnostic time by 40% compared to traditional methods",
      "Identified 3 novel biomarkers for early disease detection",
    ],
    methodology: [
      "Convolutional Neural Networks (CNN) for image analysis",
      "Cross-validation with 10,000 patient samples",
      "Statistical significance testing using t-tests and ANOVA",
    ],
    researchGaps: [
      "Limited diversity in patient demographics",
      "Lack of longitudinal studies beyond 2 years",
      "Insufficient analysis of model interpretability",
    ],
    citations: 127,
    authors: ["Dr. Sarah Johnson", "Prof. Michael Chen", "Dr. Emily Rodriguez"],
    publishedYear: 2023,
    journal: "Journal of Medical AI",
    doi: "10.1000/182",
    processedAt: new Date().toISOString(),
  }

  // Store the analysis result (in real app, this would be in database)
  localStorage.setItem(`analysis_${jobId}`, JSON.stringify(mockAnalysis))
}

export const getFileAnalysis = async (fileId: string): Promise<FileAnalysis | null> => {
  // In real app, this would query the database
  const stored = localStorage.getItem(`analysis_job_${fileId}`)
  return stored ? JSON.parse(stored) : null
}

export const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (file.type !== "application/pdf") {
    return { valid: false, error: "Only PDF files are allowed" }
  }

  // Check file size (max 50MB)
  const maxSize = 50 * 1024 * 1024
  if (file.size > maxSize) {
    return { valid: false, error: "File size must be less than 50MB" }
  }

  return { valid: true }
}
