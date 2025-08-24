"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type AdminStats, getAdminStats } from "@/lib/admin"
import { Users, FileText, CreditCard, Activity, DollarSign, UserPlus, Clock } from "lucide-react"

export function AdminStatsCards() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAdminStats()
        setStats(data)
      } catch (error) {
        console.error("Failed to fetch admin stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-20"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-1"></div>
              <div className="h-3 bg-muted rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      description: `${stats.newUsersThisMonth} new this month`,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Active Users",
      value: stats.activeUsers.toLocaleString(),
      description: `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}% of total`,
      icon: Activity,
      color: "text-green-600",
    },
    {
      title: "Total Projects",
      value: stats.totalProjects.toLocaleString(),
      description: "Research projects created",
      icon: FileText,
      color: "text-indigo-600",
    },
    {
      title: "Documents Processed",
      value: stats.totalDocuments.toLocaleString(),
      description: "PDFs analyzed",
      icon: FileText,
      color: "text-purple-600",
    },
    {
      title: "Credits Used",
      value: stats.totalCreditsUsed.toLocaleString(),
      description: "Total platform usage",
      icon: CreditCard,
      color: "text-orange-600",
    },
    {
      title: "Revenue",
      value: `$${stats.revenue.toLocaleString()}`,
      description: "Monthly recurring revenue",
      icon: DollarSign,
      color: "text-emerald-600",
    },
    {
      title: "New Users",
      value: stats.newUsersThisMonth.toString(),
      description: "This month",
      icon: UserPlus,
      color: "text-cyan-600",
    },
    {
      title: "Processing Jobs",
      value: stats.processingJobs.toString(),
      description: "Currently running",
      icon: Clock,
      color: "text-amber-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
