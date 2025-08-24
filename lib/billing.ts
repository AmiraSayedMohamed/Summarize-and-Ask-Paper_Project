export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  interval: "month" | "year"
  credits: number
  features: string[]
  maxProjects: number
  maxFilesPerProject: number
  priority: "standard" | "high" | "premium"
  popular?: boolean
}

export interface Subscription {
  id: string
  userId: string
  planId: string
  status: "active" | "canceled" | "past_due" | "trialing"
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  createdAt: string
  updatedAt: string
}

export interface PaymentMethod {
  id: string
  userId: string
  type: "card" | "bank_account"
  last4: string
  brand: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
  createdAt: string
}

export interface Invoice {
  id: string
  userId: string
  subscriptionId?: string
  amount: number
  currency: string
  status: "paid" | "pending" | "failed" | "refunded"
  description: string
  invoiceDate: string
  dueDate: string
  paidAt?: string
  downloadUrl?: string
}

export interface CreditTransaction {
  id: string
  userId: string
  type: "purchase" | "usage" | "refund" | "bonus"
  amount: number
  description: string
  relatedId?: string // file ID, project ID, etc.
  createdAt: string
}

export interface UsageStats {
  userId: string
  currentPeriod: {
    start: string
    end: string
  }
  filesAnalyzed: number
  creditsUsed: number
  projectsCreated: number
  outinesGenerated: number
  contentDrafted: number
}

// Subscription plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for getting started with AI research analysis",
    price: 0,
    interval: "month",
    credits: 50,
    maxProjects: 3,
    maxFilesPerProject: 5,
    priority: "standard",
    features: [
      "50 analysis credits per month",
      "Up to 3 projects",
      "5 files per project",
      "Basic AI analysis",
      "Paper summarization",
      "Research gap identification",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "Advanced features for serious researchers and academics",
    price: 29,
    interval: "month",
    credits: 500,
    maxProjects: 25,
    maxFilesPerProject: 50,
    priority: "high",
    popular: true,
    features: [
      "500 analysis credits per month",
      "Up to 25 projects",
      "50 files per project",
      "Advanced AI analysis",
      "Paper outline generation",
      "Content drafting assistance",
      "Data analysis tools",
      "Priority processing",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Unlimited access for institutions and research teams",
    price: 99,
    interval: "month",
    credits: 2000,
    maxProjects: -1, // unlimited
    maxFilesPerProject: -1, // unlimited
    priority: "premium",
    features: [
      "2000 analysis credits per month",
      "Unlimited projects",
      "Unlimited files per project",
      "Premium AI models",
      "Custom integrations",
      "Team collaboration",
      "Advanced analytics",
      "Dedicated support",
      "Custom training",
      "API access",
    ],
  },
]

// Credit costs for different operations
export const CREDIT_COSTS = {
  FILE_ANALYSIS: 10,
  OUTLINE_GENERATION: 15,
  CONTENT_DRAFTING: 20,
  RESEARCH_GAP_ANALYSIS: 25,
  DATA_ANALYSIS: 30,
}

// Mock Stripe integration (in real app, this would use actual Stripe API)
export const createSubscription = async (
  userId: string,
  planId: string,
  paymentMethodId: string,
): Promise<Subscription> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const subscription: Subscription = {
    id: `sub_${Date.now()}`,
    userId,
    planId,
    status: "active",
    currentPeriodStart: new Date().toISOString(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    cancelAtPeriodEnd: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  // Store subscription
  const subscriptions = getStoredSubscriptions()
  subscriptions.push(subscription)
  localStorage.setItem("subscriptions", JSON.stringify(subscriptions))

  return subscription
}

export const cancelSubscription = async (subscriptionId: string): Promise<Subscription> => {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const subscriptions = getStoredSubscriptions()
  const index = subscriptions.findIndex((s) => s.id === subscriptionId)

  if (index === -1) throw new Error("Subscription not found")

  subscriptions[index].cancelAtPeriodEnd = true
  subscriptions[index].updatedAt = new Date().toISOString()

  localStorage.setItem("subscriptions", JSON.stringify(subscriptions))

  return subscriptions[index]
}

export const addPaymentMethod = async (userId: string, cardDetails: any): Promise<PaymentMethod> => {
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const paymentMethod: PaymentMethod = {
    id: `pm_${Date.now()}`,
    userId,
    type: "card",
    last4: cardDetails.number.slice(-4),
    brand: cardDetails.brand || "visa",
    expiryMonth: cardDetails.expiryMonth,
    expiryYear: cardDetails.expiryYear,
    isDefault: true,
    createdAt: new Date().toISOString(),
  }

  const paymentMethods = getStoredPaymentMethods()
  // Set all other methods as non-default
  paymentMethods.forEach((pm) => {
    if (pm.userId === userId) pm.isDefault = false
  })
  paymentMethods.push(paymentMethod)

  localStorage.setItem("payment_methods", JSON.stringify(paymentMethods))

  return paymentMethod
}

export const purchaseCredits = async (
  userId: string,
  amount: number,
  paymentMethodId: string,
): Promise<CreditTransaction> => {
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const transaction: CreditTransaction = {
    id: `txn_${Date.now()}`,
    userId,
    type: "purchase",
    amount,
    description: `Purchased ${amount} credits`,
    createdAt: new Date().toISOString(),
  }

  // Store transaction
  const transactions = getStoredTransactions()
  transactions.push(transaction)
  localStorage.setItem("credit_transactions", JSON.stringify(transactions))

  return transaction
}

export const deductCredits = async (
  userId: string,
  amount: number,
  description: string,
  relatedId?: string,
): Promise<CreditTransaction> => {
  const transaction: CreditTransaction = {
    id: `txn_${Date.now()}`,
    userId,
    type: "usage",
    amount: -amount, // negative for usage
    description,
    relatedId,
    createdAt: new Date().toISOString(),
  }

  const transactions = getStoredTransactions()
  transactions.push(transaction)
  localStorage.setItem("credit_transactions", JSON.stringify(transactions))

  return transaction
}

export const getUserSubscription = async (userId: string): Promise<Subscription | null> => {
  const subscriptions = getStoredSubscriptions()
  return subscriptions.find((s) => s.userId === userId && s.status === "active") || null
}

export const getUserPaymentMethods = async (userId: string): Promise<PaymentMethod[]> => {
  const paymentMethods = getStoredPaymentMethods()
  return paymentMethods.filter((pm) => pm.userId === userId)
}

export const getUserInvoices = async (userId: string): Promise<Invoice[]> => {
  const invoices = getStoredInvoices()
  return invoices
    .filter((i) => i.userId === userId)
    .sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime())
}

export const getUserCreditBalance = async (userId: string): Promise<number> => {
  const transactions = getStoredTransactions()
  const userTransactions = transactions.filter((t) => t.userId === userId)

  return userTransactions.reduce((balance, transaction) => balance + transaction.amount, 0)
}

export const getUserUsageStats = async (userId: string): Promise<UsageStats> => {
  const transactions = getStoredTransactions()
  const currentMonth = new Date()
  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

  const monthlyTransactions = transactions.filter(
    (t) =>
      t.userId === userId &&
      t.type === "usage" &&
      new Date(t.createdAt) >= startOfMonth &&
      new Date(t.createdAt) <= endOfMonth,
  )

  return {
    userId,
    currentPeriod: {
      start: startOfMonth.toISOString(),
      end: endOfMonth.toISOString(),
    },
    filesAnalyzed: monthlyTransactions.filter((t) => t.description.includes("analysis")).length,
    creditsUsed: Math.abs(monthlyTransactions.reduce((sum, t) => sum + t.amount, 0)),
    projectsCreated: 0, // Would be calculated from project creation data
    outinesGenerated: monthlyTransactions.filter((t) => t.description.includes("outline")).length,
    contentDrafted: monthlyTransactions.filter((t) => t.description.includes("content")).length,
  }
}

// Storage utilities
const getStoredSubscriptions = (): Subscription[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("subscriptions")
  return stored ? JSON.parse(stored) : []
}

const getStoredPaymentMethods = (): PaymentMethod[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("payment_methods")
  return stored ? JSON.parse(stored) : []
}

const getStoredInvoices = (): Invoice[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("invoices")
  return stored ? JSON.parse(stored) : []
}

const getStoredTransactions = (): CreditTransaction[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("credit_transactions")
  return stored ? JSON.parse(stored) : []
}

// Initialize some mock data
export const initializeMockBillingData = (userId: string) => {
  // Create some sample transactions
  const sampleTransactions: CreditTransaction[] = [
    {
      id: "txn_1",
      userId,
      type: "purchase",
      amount: 500,
      description: "Pro plan subscription credits",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "txn_2",
      userId,
      type: "usage",
      amount: -10,
      description: "File analysis: Machine Learning in Healthcare.pdf",
      relatedId: "file_123",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "txn_3",
      userId,
      type: "usage",
      amount: -15,
      description: "Paper outline generation",
      relatedId: "outline_456",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  // Sample invoices
  const sampleInvoices: Invoice[] = [
    {
      id: "inv_1",
      userId,
      amount: 29.0,
      currency: "USD",
      status: "paid",
      description: "Pro Plan - Monthly Subscription",
      invoiceDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      downloadUrl: "#",
    },
  ]

  // Store if not exists
  if (!localStorage.getItem("credit_transactions")) {
    localStorage.setItem("credit_transactions", JSON.stringify(sampleTransactions))
  }
  if (!localStorage.getItem("invoices")) {
    localStorage.setItem("invoices", JSON.stringify(sampleInvoices))
  }
}
