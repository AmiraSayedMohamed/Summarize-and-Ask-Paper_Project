"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { type AdminUser, getAllUsers, updateUserStatus, updateUserRole } from "@/lib/admin"
import { formatDistanceToNow } from "date-fns"
import { MoreHorizontal, Shield, User, Crown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers()
        setUsers(data)
      } catch (error) {
        console.error("Failed to fetch users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleStatusChange = async (userId: string, status: "active" | "suspended" | "pending") => {
    try {
      await updateUserStatus(userId, status)
      setUsers(users.map((user) => (user.id === userId ? { ...user, status } : user)))
    } catch (error) {
      console.error("Failed to update user status:", error)
    }
  }

  const handleRoleChange = async (userId: string, role: "user" | "admin" | "researcher") => {
    try {
      await updateUserRole(userId, role)
      setUsers(users.map((user) => (user.id === userId ? { ...user, role } : user)))
    } catch (error) {
      console.error("Failed to update user role:", error)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />
      case "researcher":
        return <Crown className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="h-10 w-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                </div>
                <div className="h-6 bg-muted rounded w-16"></div>
                <div className="h-8 bg-muted rounded w-8"></div>
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
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getRoleIcon(user.role)}
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{user.subscription}</Badge>
                  <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="text-right">
                  <div>{user.projectsCount} projects</div>
                  <div>{user.creditsRemaining} credits left</div>
                </div>
                <div className="text-right">
                  <div>Last active:</div>
                  <div>{formatDistanceToNow(user.lastActive)} ago</div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleRoleChange(user.id, "user")}>Set as User</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRoleChange(user.id, "researcher")}>
                      Set as Researcher
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRoleChange(user.id, "admin")}>Set as Admin</DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(user.id, user.status === "active" ? "suspended" : "active")}
                      className={user.status === "active" ? "text-red-600" : "text-green-600"}
                    >
                      {user.status === "active" ? "Suspend User" : "Activate User"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
