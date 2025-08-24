"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUploadZone } from "@/components/upload/file-upload-zone"
import { Chatbot } from "@/components/dashboard/chatbot"
import { ChatbotHighlight } from "@/components/dashboard/chatbot-highlight"
import { getProject } from "@/lib/projects"
import type { Project, UploadedFile } from "@/lib/types"
import { Upload, ArrowLeft, MessageSquare } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ProjectUploadPage() {
  const params = useParams()
  const projectId = params.id as string
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProject = async () => {
      try {
        const projectData = await getProject(projectId)
        setProject(projectData)
      } catch (error) {
        console.error("Failed to load project:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProject()
  }, [projectId])

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [allUploaded, setAllUploaded] = useState(false)
  const [highlightedFile, setHighlightedFile] = useState<string | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)

  const handleFileUploaded = (file: UploadedFile) => {
  // prepend so newest uploads appear first
  setUploadedFiles((prev) => [file, ...prev])
  }

  // Simulate all files uploaded (in real app, check status)
  useEffect(() => {
    if (uploadedFiles.length > 0 && uploadedFiles.every(f => f.status === "completed")) {
      setAllUploaded(true)
    }
  }, [uploadedFiles])

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

  if (!project) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
        <p className="text-muted-foreground mb-4">The requested project could not be found.</p>
        <Link href="/dashboard/projects">
          <Button>Back to Projects</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href={`/dashboard/projects/${project.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Project
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Upload to {project.name}</h1>
        <p className="text-muted-foreground">Add research papers to analyze with AI-powered tools.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            Upload Research Papers
          </CardTitle>
          <CardDescription>
            Upload PDF files for comprehensive AI analysis including summarization, methodology extraction, and research
            gap identification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploadZone projectId={projectId} onFileUploaded={handleFileUploaded} />
        </CardContent>
      </Card>

      {/* Uploaded files list with per-file chat button */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Uploaded Files</h3>
          <div className="space-y-2">
            {uploadedFiles.map((f) => (
              <div key={f.id} className="flex items-center justify-between border rounded p-2">
                <div>
                  <div className="font-medium">{f.name}</div>
                  <div className="text-xs text-muted-foreground">{f.status}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={selectedFileId === f.id ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedFileId(f.id);
                      setShowChat(true);
                    }}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" /> Chat
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show chatbot after all files are uploaded or via explicit toggle */}
      {allUploaded && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-2">AI Chatbot (Ask about your uploaded papers)</h2>
          <Chatbot
            paperFiles={
              selectedFileId
                ? uploadedFiles.filter((f) => f.id === selectedFileId).map((f) => ({ id: f.id, name: f.name, path: f.url || "" }))
                : uploadedFiles.map((f) => ({ id: f.id, name: f.name, path: f.url || "" }))
            }
          />
        </div>
      )}

      {/* Floating chat toggle for quick access */}
      <button
        onClick={() => setShowChat((s) => !s)}
        className="fixed bottom-6 right-6 bg-primary text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center"
        aria-label="Toggle Chat"
      >
        💬
      </button>

      {showChat && (
        <div className="fixed bottom-20 right-6 w-96 z-50">
          <div className="bg-white border rounded shadow-lg p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold mb-2">AI Chatbot</h3>
              <div className="text-sm text-muted-foreground">{selectedFileId ? "Chatting with selected paper" : "Chatting with all papers"}</div>
            </div>
            <Chatbot
              paperFiles={
                selectedFileId
                  ? uploadedFiles.filter((f) => f.id === selectedFileId).map((f) => ({ id: f.id, name: f.name, path: f.url || "" }))
                  : uploadedFiles.map((f) => ({ id: f.id, name: f.name, path: f.url || "" }))
              }
            />
            <div className="text-right mt-2 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Select a file to chat with from the list</div>
              <div>
                <button className="text-sm text-muted-foreground mr-4" onClick={() => setSelectedFileId(null)}>
                  Clear
                </button>
                <button className="text-sm text-muted-foreground" onClick={() => setShowChat(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
