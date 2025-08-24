export interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalProjects: number
  totalDocuments: number
  totalCreditsUsed: number
  revenue: number
  newUsersThisMonth: number
  processingJobs: number
}

export interface UserActivity {
  id: string
  userId: string
  userName: string
  action: string
  details: string
  timestamp: Date
  ipAddress?: string
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: "user" | "admin" | "researcher"
  subscription: string
  creditsUsed: number
  creditsRemaining: number
  projectsCount: number
  lastActive: Date
  status: "active" | "suspended" | "pending"
  joinDate: Date
}

// Mock admin data
export const getAdminStats = async (): Promise<AdminStats> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    totalUsers: 1247,
    activeUsers: 892,
    totalProjects: 3456,
    totalDocuments: 8923,
    totalCreditsUsed: 45678,
    revenue: 23450,
    newUsersThisMonth: 156,
    processingJobs: 23,
  }
}

export const getUserActivity = async (): Promise<UserActivity[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  return [
    {
      id: "1",
      userId: "user1",
      userName: "Dr. Sarah Chen",
      action: "Document Upload",
      details: 'Uploaded "Machine Learning in Healthcare.pdf"',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      ipAddress: "192.168.1.100",
    },
    {
      id: "2",
      userId: "user2",
      userName: "Prof. Michael Rodriguez",
      action: "Analysis Complete",
      details: 'Completed analysis for project "Climate Change Research"',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      ipAddress: "192.168.1.101",
    },
    {
      id: "3",
      userId: "user3",
      userName: "Dr. Emily Watson",
      action: "Subscription Upgrade",
      details: "Upgraded from Free to Pro plan",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      ipAddress: "192.168.1.102",
    },
    {
      id: "4",
      userId: "user4",
      userName: "James Thompson",
      action: "Account Created",
      details: "New user registration",
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      ipAddress: "192.168.1.103",
    },
  ]
}

export const getAllUsers = async (): Promise<AdminUser[]> => {
  await new Promise((resolve) => setTimeout(resolve, 400))

  return [
    {
      id: "user1",
      name: "Dr. Sarah Chen",
      email: "sarah.chen@university.edu",
      role: "researcher",
      subscription: "Pro",
      creditsUsed: 450,
      creditsRemaining: 550,
      projectsCount: 12,
      lastActive: new Date(Date.now() - 1000 * 60 * 5),
      status: "active",
      joinDate: new Date("2024-01-15"),
    },
    {
      id: "user2",
      name: "Prof. Michael Rodriguez",
      email: "mrodriguez@research.org",
      role: "researcher",
      subscription: "Enterprise",
      creditsUsed: 1200,
      creditsRemaining: 2800,
      projectsCount: 28,
      lastActive: new Date(Date.now() - 1000 * 60 * 15),
      status: "active",
      joinDate: new Date("2023-11-20"),
    },
    {
      id: "user3",
      name: "Dr. Emily Watson",
      email: "ewatson@college.edu",
      role: "user",
      subscription: "Pro",
      creditsUsed: 230,
      creditsRemaining: 770,
      projectsCount: 8,
      lastActive: new Date(Date.now() - 1000 * 60 * 30),
      status: "active",
      joinDate: new Date("2024-02-10"),
    },
    {
      id: "user4",
      name: "James Thompson",
      email: "jthompson@student.edu",
      role: "user",
      subscription: "Free",
      creditsUsed: 45,
      creditsRemaining: 5,
      projectsCount: 3,
      lastActive: new Date(Date.now() - 1000 * 60 * 45),
      status: "active",
      joinDate: new Date("2024-03-01"),
    },
  ]
}

export const updateUserStatus = async (userId: string, status: "active" | "suspended" | "pending"): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  console.log(`Updated user ${userId} status to ${status}`)
}

export const updateUserRole = async (userId: string, role: "user" | "admin" | "researcher"): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  console.log(`Updated user ${userId} role to ${role}`)
}
