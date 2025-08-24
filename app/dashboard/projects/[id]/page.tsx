"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalysisResults } from "@/components/analysis/analysis-results"
import { OutlineGenerator } from "@/components/analysis/outline-generator"
import { ContentDrafter } from "@/components/analysis/content-drafter"
import { ResearchGaps } from "@/components/analysis/research-gaps"
import { getProject, getProjectFiles } from "@/lib/projects"
import { getAnalysisResult, analyzeResearchGaps, getStoredOutlines } from "@/lib/gpt-analysis"
import type { Project, UploadedFile, FileAnalysis } from "@/lib/types"
import type { ResearchGapAnalysis, PaperOutline } from "@/lib/gpt-analysis"
import { FileText, Upload, Brain, PenTool, AlertTriangle, Calendar } from "lucide-react"
import Link from "next/link"

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [analyses, setAnalyses] = useState<FileAnalysis[]>([])
  const [gapAnalysis, setGapAnalysis] = useState<ResearchGapAnalysis | null>(null)
  const [outlines, setOutlines] = useState<PaperOutline[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzingGaps, setIsAnalyzingGaps] = useState(false)

  useEffect(() => {
    const loadProjectData = async () => {
      try {
        const [projectData, projectFiles] = await Promise.all([getProject(projectId), getProjectFiles(projectId)])

        if (projectData) {
          setProject(projectData)
          setFiles(projectFiles)

          // Load analyses for completed files
          const fileAnalyses: FileAnalysis[] = []
          for (const file of projectFiles) {
            if (file.status === "completed") {
              const analysis = getAnalysisResult(file.id)
              if (analysis) {
                fileAnalyses.push(analysis)
              }
            }
          }
          setAnalyses(fileAnalyses)

          // Load existing outlines
          const storedOutlines = getStoredOutlines()
          setOutlines(storedOutlines)
        }
      } catch (error) {
        console.error("Failed to load project data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProjectData()
  }, [projectId])

  const handleAnalyzeGaps = async () => {
    if (analyses.length === 0) return

    setIsAnalyzingGaps(true)
    try {
      const gapAnalysisResult = await analyzeResearchGaps(projectId, analyses)
      setGapAnalysis(gapAnalysisResult)
    } catch (error) {
      console.error("Failed to analyze research gaps:", error)
    } finally {
      setIsAnalyzingGaps(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
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
      {/* Project Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">{project.name}</h1>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/projects/${project.id}/upload`}>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Upload Files
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="mr-1 h-4 w-4" />
            Created {new Date(project.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center">
            <FileText className="mr-1 h-4 w-4" />
            {files.length} files
          </div>
          <Badge className="capitalize">{project.status}</Badge>
        </div>
      </div>

      {/* Project Content */}
      <Tabs defaultValue="files" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="files">Files & Analysis</TabsTrigger>
          <TabsTrigger value="gaps">Research Gaps</TabsTrigger>
          <TabsTrigger value="outline">Paper Outline</TabsTrigger>
          <TabsTrigger value="drafting">Content Drafting</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-6">
          {files.length > 0 ? (
            <div className="space-y-6">
              {files.map((file) => {
                const analysis = analyses.find((a) => a.fileId === file.id)
                return (
                  <Card key={file.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="font-serif text-lg">{file.name}</CardTitle>
                          <CardDescription>
                            {(file.size / 1024 / 1024).toFixed(1)} MB • Uploaded{" "}
                            {new Date(file.uploadedAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge className="capitalize">{file.status}</Badge>
                      </div>
                    </CardHeader>
                    {analysis && (
                      <CardContent>
                        <AnalysisResults analysis={analysis} />
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Files Uploaded</h3>
                <p className="text-muted-foreground mb-4">Upload PDF research papers to start analysis.</p>
                <Link href={`/dashboard/projects/${project.id}/upload`}>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Files
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="gaps">
          {gapAnalysis ? (
            <ResearchGaps gapAnalysis={gapAnalysis} />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Research Gap Analysis</h3>
                <p className="text-muted-foreground mb-4">
                  Analyze your uploaded papers to identify research gaps and opportunities.
                </p>
                <Button onClick={handleAnalyzeGaps} disabled={analyses.length === 0 || isAnalyzingGaps}>
                  {isAnalyzingGaps ? (
                    <>
                      <Brain className="mr-2 h-4 w-4 animate-pulse" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Analyze Research Gaps
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="outline">
          <OutlineGenerator analyses={analyses} />
        </TabsContent>

        <TabsContent value="drafting">
          <ContentDrafter outline={outlines[0]} />
        </TabsContent>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{files.length}</div>
                <p className="text-sm text-muted-foreground">
                  {files.filter((f) => f.status === "completed").length} analyzed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center">
                  <Brain className="mr-2 h-5 w-5" />
                  Analyses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{analyses.length}</div>
                <p className="text-sm text-muted-foreground">AI-powered insights generated</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center">
                  <PenTool className="mr-2 h-5 w-5" />
                  Outlines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{outlines.length}</div>
                <p className="text-sm text-muted-foreground">Paper structures created</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
