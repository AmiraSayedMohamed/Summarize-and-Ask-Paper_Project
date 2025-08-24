"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PenTool, Loader2, Copy, RefreshCw } from "lucide-react"
import { generateContent, saveContentDraft } from "@/lib/gpt-analysis"
import type { ContentDraft, PaperOutline } from "@/lib/gpt-analysis"

interface ContentDrafterProps {
  outline?: PaperOutline
  onContentGenerated?: (draft: ContentDraft) => void
}

export function ContentDrafter({ outline, onContentGenerated }: ContentDrafterProps) {
  const [selectedSectionId, setSelectedSectionId] = useState("")
  const [keyPoints, setKeyPoints] = useState("")
  const [context, setContext] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDraft, setGeneratedDraft] = useState<ContentDraft | null>(null)
  const [error, setError] = useState("")

  const handleGenerate = async () => {
    if (!selectedSectionId) {
      setError("Please select a section")
      return
    }

    if (!keyPoints.trim()) {
      setError("Please provide key points to expand")
      return
    }

    setError("")
    setIsGenerating(true)

    try {
      const selectedSection = outline?.sections.find((s) => s.id === selectedSectionId)
      const sectionTitle = selectedSection?.title || "Content Section"

      const keyPointsList = keyPoints.split("\n").filter((point) => point.trim())

      const draft = await generateContent(selectedSectionId, sectionTitle, keyPointsList, context)

      setGeneratedDraft(draft)
      saveContentDraft(draft)

      if (onContentGenerated) {
        onContentGenerated(draft)
      }
    } catch (err) {
      setError("Failed to generate content. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    if (generatedDraft) {
      await navigator.clipboard.writeText(generatedDraft.content)
    }
  }

  const regenerateContent = () => {
    if (generatedDraft) {
      setGeneratedDraft(null)
      handleGenerate()
    }
  }

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center">
            <PenTool className="mr-2 h-5 w-5" />
            Content Drafting
          </CardTitle>
          <CardDescription>Transform your key points into academic-quality content with AI assistance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {outline && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Section</label>
              <Select value={selectedSectionId} onValueChange={setSelectedSectionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a section to draft..." />
                </SelectTrigger>
                <SelectContent>
                  {outline.sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.title} ({section.wordCount} words)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Key Points (one per line)</label>
            <Textarea
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              placeholder={`Enter your key points, one per line:
• Main argument or finding
• Supporting evidence
• Methodology details
• Implications`}
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Context (optional)</label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Provide any additional context, specific requirements, or style preferences..."
              rows={3}
            />
          </div>

          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Academic Content
          </Button>
        </CardContent>
      </Card>

      {/* Generated Content */}
      {generatedDraft && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif">{generatedDraft.title}</CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-4 mt-1">
                    <Badge variant="outline">{generatedDraft.wordCount} words</Badge>
                    <Badge variant="outline" className="capitalize">
                      {generatedDraft.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Generated {new Date(generatedDraft.createdAt).toLocaleString()}
                    </span>
                  </div>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={regenerateContent}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="bg-muted/30 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{generatedDraft.content}</pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
