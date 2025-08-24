import { AdminStatsCards } from "@/components/admin/admin-stats"
import { UserManagement } from "@/components/admin/user-management"
import { ActivityLog } from "@/components/admin/activity-log"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor system performance and manage users</p>
      </div>

      <AdminStatsCards />

      <div className="grid gap-6 lg:grid-cols-2">
        <UserManagement />
        <ActivityLog />
      </div>
    </div>
  )
}
