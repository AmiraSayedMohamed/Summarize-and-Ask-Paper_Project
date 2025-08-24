"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { FileText, Clock, CheckCircle, AlertCircle, TrendingUp, Upload, Brain, CreditCard } from "lucide-react"
import Link from "next/link"

export function EnhancedDashboardOverview() {
  // Mock data for enhanced dashboard
  const recentProjects = [
    {
      id: "1",
      name: "Machine Learning in Healthcare",
      status: "completed",
      documentsCount: 15,
      lastUpdated: "2 hours ago",
      progress: 100,
    },
    {
      id: "2",
      name: "Climate Change Research",
      status: "processing",
      documentsCount: 8,
      lastUpdated: "1 day ago",
      progress: 65,
    },
    {
      id: "3",
      name: "Quantum Computing Applications",
      status: "draft",
      documentsCount: 3,
      lastUpdated: "3 days ago",
      progress: 25,
    },
  ]

  const quickStats = [
    {
      title: "Active Projects",
      value: "12",
      change: "+2 this week",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "Documents Analyzed",
      value: "156",
      change: "+23 this month",
      icon: Brain,
      color: "text-purple-600",
    },
    {
      title: "Credits Used",
      value: "450",
      change: "550 remaining",
      icon: CreditCard,
      color: "text-emerald-600",
    },
    {
      title: "Research Gaps Found",
      value: "34",
      change: "Across all projects",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "processing":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "draft":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Projects</CardTitle>
            <p className="text-sm text-muted-foreground">Your latest research projects and their status</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/projects">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(project.status)}
                  <div>
                    <div className="font-medium">{project.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {project.documentsCount} documents • Updated {project.lastUpdated}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                    <div className="mt-2 w-24">
                      <Progress value={project.progress} className="h-2" />
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/projects/${project.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <p className="text-sm text-muted-foreground">Get started with common tasks</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button asChild className="h-auto p-4 flex-col space-y-2">
              <Link href="/dashboard/upload">
                <Upload className="h-6 w-6" />
                <span>Upload New Papers</span>
                <span className="text-xs text-muted-foreground">Start a new research project</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto p-4 flex-col space-y-2 bg-transparent">
              <Link href="/dashboard/analysis">
                <Brain className="h-6 w-6" />
                <span>Analyze Data</span>
                <span className="text-xs text-muted-foreground">Generate insights from your data</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto p-4 flex-col space-y-2 bg-transparent">
              <Link href="/dashboard/billing">
                <CreditCard className="h-6 w-6" />
                <span>Manage Credits</span>
                <span className="text-xs text-muted-foreground">Purchase more analysis credits</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
