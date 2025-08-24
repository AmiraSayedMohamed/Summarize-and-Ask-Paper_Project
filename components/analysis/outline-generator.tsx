"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Plus, X, Loader2, BookOpen, Clock } from "lucide-react"
import { generatePaperOutline, saveOutline } from "@/lib/gpt-analysis"
import type { PaperOutline, FileAnalysis } from "@/lib/types"

interface OutlineGeneratorProps {
  analyses: FileAnalysis[]
  onOutlineGenerated?: (outline: PaperOutline) => void
}

export function OutlineGenerator({ analyses, onOutlineGenerated }: OutlineGeneratorProps) {
  const [researchTopic, setResearchTopic] = useState("")
  const [keyPoints, setKeyPoints] = useState<string[]>([""])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedOutline, setGeneratedOutline] = useState<PaperOutline | null>(null)
  const [error, setError] = useState("")

  const addKeyPoint = () => {
    setKeyPoints([...keyPoints, ""])
  }

  const updateKeyPoint = (index: number, value: string) => {
    const updated = [...keyPoints]
    updated[index] = value
    setKeyPoints(updated)
  }

  const removeKeyPoint = (index: number) => {
    if (keyPoints.length > 1) {
      setKeyPoints(keyPoints.filter((_, i) => i !== index))
    }
  }

  const handleGenerate = async () => {
    if (!researchTopic.trim()) {
      setError("Please enter a research topic")
      return
    }

    const validKeyPoints = keyPoints.filter((point) => point.trim())
    if (validKeyPoints.length === 0) {
      setError("Please add at least one key point")
      return
    }

    setError("")
    setIsGenerating(true)

    try {
      const outline = await generatePaperOutline(researchTopic, validKeyPoints, analyses)
      setGeneratedOutline(outline)
      saveOutline(outline)

      if (onOutlineGenerated) {
        onOutlineGenerated(outline)
      }
    } catch (err) {
      setError("Failed to generate outline. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const getTotalWordCount = (outline: PaperOutline) => {
    return outline.sections.reduce((total, section) => total + section.wordCount, 0)
  }

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center">
            <BookOpen className="mr-2 h-5 w-5" />
            Generate Paper Outline
          </CardTitle>
          <CardDescription>
            Create a structured academic paper outline based on your research topic and analysis results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="topic">Research Topic</Label>
            <Input
              id="topic"
              value={researchTopic}
              onChange={(e) => setResearchTopic(e.target.value)}
              placeholder="e.g., AI-Powered Diagnostic Systems in Healthcare"
            />
          </div>

          <div className="space-y-2">
            <Label>Key Points to Address</Label>
            {keyPoints.map((point, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  value={point}
                  onChange={(e) => updateKeyPoint(index, e.target.value)}
                  placeholder={`Key point ${index + 1}...`}
                  rows={2}
                  className="flex-1"
                />
                {keyPoints.length > 1 && (
                  <Button variant="outline" size="sm" onClick={() => removeKeyPoint(index)} className="self-start mt-1">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" onClick={addKeyPoint} className="w-full bg-transparent">
              <Plus className="mr-2 h-4 w-4" />
              Add Key Point
            </Button>
          </div>

          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Outline
          </Button>
        </CardContent>
      </Card>

      {/* Generated Outline */}
      {generatedOutline && (
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">{generatedOutline.title}</CardTitle>
            <CardDescription>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  {getTotalWordCount(generatedOutline)} words estimated
                </div>
                <div className="flex items-center">
                  <FileText className="mr-1 h-4 w-4" />
                  {generatedOutline.sections.length} sections
                </div>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {generatedOutline.sections.map((section, index) => (
                <div key={section.id} className="border-l-4 border-primary pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-lg">{section.title}</h3>
                    <Badge variant="outline">{section.wordCount} words</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{section.description}</p>

                  {section.subsections.length > 0 && (
                    <div className="space-y-3">
                      {section.subsections.map((subsection) => (
                        <div key={subsection.id} className="ml-4 border-l-2 border-muted pl-3">
                          <h4 className="font-medium text-sm mb-1">{subsection.title}</h4>
                          <p className="text-xs text-muted-foreground mb-2">{subsection.description}</p>
                          {subsection.keyPoints.length > 0 && (
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {subsection.keyPoints.map((point, pointIndex) => (
                                <li key={pointIndex} className="flex items-start">
                                  <span className="mr-2">•</span>
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
