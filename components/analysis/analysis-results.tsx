"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Users, Calendar, ExternalLink, Lightbulb, Microscope, AlertTriangle } from "lucide-react"
import type { FileAnalysis } from "@/lib/types"

interface AnalysisResultsProps {
  analysis: FileAnalysis
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  return (
    <div className="space-y-6">
      {/* Paper Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Paper Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Authors</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {analysis.authors.map((author, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <Users className="mr-1 h-3 w-3" />
                    {author}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Publication Details</p>
              <div className="mt-1 space-y-1">
                <p className="text-sm">
                  {analysis.journal} ({analysis.publishedYear})
                </p>
                {analysis.doi && (
                  <div className="flex items-center text-sm text-primary">
                    <ExternalLink className="mr-1 h-3 w-3" />
                    DOI: {analysis.doi}
                  </div>
                )}
                <p className="text-sm text-muted-foreground">{analysis.citations} citations</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Executive Summary</CardTitle>
          <CardDescription>AI-generated comprehensive summary of the research paper</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{analysis.summary}</p>
        </CardContent>
      </Card>

      {/* Key Findings */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center">
            <Lightbulb className="mr-2 h-5 w-5 text-accent" />
            Key Findings
          </CardTitle>
          <CardDescription>Major discoveries and results from the research</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {analysis.keyFindings.map((finding, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-accent/5 rounded-lg">
                  <div className="h-2 w-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm leading-relaxed">{finding}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Methodology */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center">
            <Microscope className="mr-2 h-5 w-5 text-secondary" />
            Methodology
          </CardTitle>
          <CardDescription>Research methods and approaches used in the study</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {analysis.methodology.map((method, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-secondary/5 rounded-lg">
                  <div className="h-2 w-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm leading-relaxed">{method}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Research Gaps */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
            Research Gaps
          </CardTitle>
          <CardDescription>Identified limitations and areas for future research</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {analysis.researchGaps.map((gap, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-destructive/5 rounded-lg">
                  <div className="h-2 w-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm leading-relaxed">{gap}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Processing Info */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Analysis Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            Processed on{" "}
            {new Date(analysis.processedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
