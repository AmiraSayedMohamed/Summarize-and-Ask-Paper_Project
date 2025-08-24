"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type UserActivity, getUserActivity } from "@/lib/admin"
import { formatDistanceToNow } from "date-fns"
import { Activity, Upload, CheckCircle, CreditCard, UserPlus } from "lucide-react"

export function ActivityLog() {
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await getUserActivity()
        setActivities(data)
      } catch (error) {
        console.error("Failed to fetch activities:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "Document Upload":
        return <Upload className="h-4 w-4 text-blue-600" />
      case "Analysis Complete":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "Subscription Upgrade":
        return <CreditCard className="h-4 w-4 text-purple-600" />
      case "Account Created":
        return <UserPlus className="h-4 w-4 text-emerald-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityColor = (action: string) => {
    switch (action) {
      case "Document Upload":
        return "bg-blue-100 text-blue-800"
      case "Analysis Complete":
        return "bg-green-100 text-green-800"
      case "Subscription Upgrade":
        return "bg-purple-100 text-purple-800"
      case "Account Created":
        return "bg-emerald-100 text-emerald-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="h-8 w-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-muted rounded w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4 p-3 border rounded-lg">
              <div className="flex-shrink-0">{getActivityIcon(activity.action)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{activity.userName}</span>
                  <Badge className={getActivityColor(activity.action)}>{activity.action}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{activity.details}</p>
                {activity.ipAddress && <p className="text-xs text-muted-foreground mt-1">IP: {activity.ipAddress}</p>}
              </div>
              <div className="text-sm text-muted-foreground">{formatDistanceToNow(activity.timestamp)} ago</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
