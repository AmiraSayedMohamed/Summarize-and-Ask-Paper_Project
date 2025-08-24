import { EnhancedDashboardOverview } from "@/components/dashboard/enhanced-overview"

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your research activity.</p>
      </div>

      <EnhancedDashboardOverview />
    </div>
  )
}
