import { UserManagement } from "@/components/admin/user-management"
import { ActivityLog } from "@/components/admin/activity-log"

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Manage user accounts, roles, and permissions</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UserManagement />
        </div>
        <div>
          <ActivityLog />
        </div>
      </div>
    </div>
  )
}
