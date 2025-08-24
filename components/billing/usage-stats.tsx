"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { FileText, Brain, PenTool, BarChart3, Calendar } from "lucide-react"
import type { UsageStats } from "@/lib/billing"

interface UsageStatsProps {
  stats: UsageStats
  creditLimit: number
}

export function UsageStatsComponent({ stats, creditLimit }: UsageStatsProps) {
  const usagePercentage = (stats.creditsUsed / creditLimit) * 100

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Usage This Month
          </CardTitle>
          <CardDescription>
            {formatDate(stats.currentPeriod.start)} - {formatDate(stats.currentPeriod.end)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Credits Used</span>
                <span className="text-sm text-muted-foreground">
                  {stats.creditsUsed} / {creditLimit}
                </span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {Math.max(0, creditLimit - stats.creditsUsed)} credits remaining
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Files Analyzed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.filesAnalyzed}</div>
            <p className="text-xs text-muted-foreground">PDF documents processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outlines Generated</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.outinesGenerated}</div>
            <p className="text-xs text-muted-foreground">Paper structures created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Drafted</CardTitle>
            <PenTool className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contentDrafted}</div>
            <p className="text-xs text-muted-foreground">AI-generated sections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects Created</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.projectsCreated}</div>
            <p className="text-xs text-muted-foreground">Research projects</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
