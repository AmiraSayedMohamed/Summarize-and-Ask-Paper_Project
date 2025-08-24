"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Lightbulb, BookOpen, TrendingUp } from "lucide-react"
import type { ResearchGapAnalysis } from "@/lib/gpt-analysis"

interface ResearchGapsProps {
  gapAnalysis: ResearchGapAnalysis
}

export function ResearchGaps({ gapAnalysis }: ResearchGapsProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-destructive text-destructive-foreground"
      case "medium":
        return "bg-accent text-accent-foreground"
      case "low":
        return "bg-secondary text-secondary-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "methodology":
        return <BookOpen className="h-4 w-4" />
      case "literature":
        return <AlertTriangle className="h-4 w-4" />
      case "data":
        return <TrendingUp className="h-4 w-4" />
      case "theoretical":
        return <Lightbulb className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Analysis Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
            Research Gap Analysis
          </CardTitle>
          <CardDescription>
            AI-powered identification of research gaps and opportunities for future investigation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Analysis Confidence</span>
            <span className="text-sm text-muted-foreground">{Math.round(gapAnalysis.confidence * 100)}%</span>
          </div>
          <Progress value={gapAnalysis.confidence * 100} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Based on analysis of {gapAnalysis.gaps.length} identified research gaps
          </p>
        </CardContent>
      </Card>

      {/* Identified Gaps */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Identified Research Gaps</CardTitle>
          <CardDescription>Critical areas requiring further investigation</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {gapAnalysis.gaps.map((gap) => (
                <div key={gap.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-lg">{gap.title}</h3>
                    <div className="flex gap-2">
                      <Badge className={getSeverityColor(gap.severity)}>{gap.severity}</Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getCategoryIcon(gap.category)}
                        {gap.category}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">{gap.description}</p>

                  <div className="bg-secondary/10 p-3 rounded-lg">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <Lightbulb className="mr-1 h-4 w-4 text-secondary" />
                      Suggested Approach
                    </h4>
                    <p className="text-sm text-muted-foreground">{gap.suggestedApproach}</p>
                  </div>

                  {gap.relatedPapers.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Related Papers</h4>
                      <div className="flex flex-wrap gap-1">
                        {gap.relatedPapers.map((paper, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {paper}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center">
            <Lightbulb className="mr-2 h-5 w-5 text-accent" />
            Research Recommendations
          </CardTitle>
          <CardDescription>Strategic recommendations for future research directions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {gapAnalysis.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-accent/5 rounded-lg">
                <div className="h-2 w-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm leading-relaxed">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Analysis Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Analysis completed on{" "}
            {new Date(gapAnalysis.createdAt).toLocaleDateString("en-US", {
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
