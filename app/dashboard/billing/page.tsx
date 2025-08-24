"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SubscriptionPlans } from "@/components/billing/subscription-plans"
import { PaymentMethods } from "@/components/billing/payment-methods"
import { CreditPurchase } from "@/components/billing/credit-purchase"
import { UsageStatsComponent } from "@/components/billing/usage-stats"
import { useAuth } from "@/contexts/auth-context"
import {
  getUserSubscription,
  getUserPaymentMethods,
  getUserInvoices,
  getUserCreditBalance,
  getUserUsageStats,
  initializeMockBillingData,
  SUBSCRIPTION_PLANS,
} from "@/lib/billing"
import type { Subscription, PaymentMethod, Invoice, UsageStats, SubscriptionPlan } from "@/lib/billing"
import { FileText, Download, Calendar } from "lucide-react"

export default function BillingPage() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [creditBalance, setCreditBalance] = useState(0)
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadBillingData = async () => {
      if (!user) return

      try {
        // Initialize mock data
        initializeMockBillingData(user.id)

        const [subData, paymentData, invoiceData, creditData, statsData] = await Promise.all([
          getUserSubscription(user.id),
          getUserPaymentMethods(user.id),
          getUserInvoices(user.id),
          getUserCreditBalance(user.id),
          getUserUsageStats(user.id),
        ])

        setSubscription(subData)
        setPaymentMethods(paymentData)
        setInvoices(invoiceData)
        setCreditBalance(creditData)
        setUsageStats(statsData)
      } catch (error) {
        console.error("Failed to load billing data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadBillingData()
  }, [user])

  const currentPlan = subscription
    ? SUBSCRIPTION_PLANS.find((p) => p.id === subscription.planId)
    : SUBSCRIPTION_PLANS[0]

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    // In real app, this would open a checkout flow
    console.log("Selected plan:", plan)
  }

  const handlePaymentMethodAdded = (paymentMethod: PaymentMethod) => {
    setPaymentMethods((prev) => [paymentMethod, ...prev.map((pm) => ({ ...pm, isDefault: false }))])
  }

  const handlePaymentMethodDeleted = (paymentMethodId: string) => {
    setPaymentMethods((prev) => prev.filter((pm) => pm.id !== paymentMethodId))
  }

  const handleCreditsPurchased = (amount: number) => {
    setCreditBalance((prev) => prev + amount)
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription, payment methods, and usage.</p>
      </div>

      {/* Current Plan Overview */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-serif">Current Plan</CardTitle>
              <CardDescription>Your active subscription and usage</CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {currentPlan?.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{creditBalance}</div>
              <p className="text-sm text-muted-foreground">Credits Available</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{currentPlan?.credits || 0}</div>
              <p className="text-sm text-muted-foreground">Monthly Allowance</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">${currentPlan?.price || 0}</div>
              <p className="text-sm text-muted-foreground">Monthly Cost</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Tabs */}
      <Tabs defaultValue="usage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="credits">Credits</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="usage">
          {usageStats && <UsageStatsComponent stats={usageStats} creditLimit={currentPlan?.credits || 0} />}
        </TabsContent>

        <TabsContent value="plans">
          <SubscriptionPlans currentPlanId={currentPlan?.id} onSelectPlan={handleSelectPlan} />
        </TabsContent>

        <TabsContent value="credits">
          <CreditPurchase
            currentCredits={creditBalance}
            paymentMethods={paymentMethods}
            onCreditsPurchased={handleCreditsPurchased}
          />
        </TabsContent>

        <TabsContent value="payment">
          <PaymentMethods
            paymentMethods={paymentMethods}
            onPaymentMethodAdded={handlePaymentMethodAdded}
            onPaymentMethodDeleted={handlePaymentMethodDeleted}
          />
        </TabsContent>

        <TabsContent value="invoices">
          <div className="space-y-4">
            <h3 className="text-lg font-serif font-medium">Invoice History</h3>
            {invoices.length > 0 ? (
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <Card key={invoice.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center space-x-4">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{invoice.description}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(invoice.invoiceDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-medium">${invoice.amount.toFixed(2)}</div>
                          <Badge variant={invoice.status === "paid" ? "secondary" : "destructive"} className="text-xs">
                            {invoice.status}
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Invoices</h3>
                  <p className="text-muted-foreground">Your invoice history will appear here.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
