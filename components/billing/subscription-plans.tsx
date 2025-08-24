"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Zap, Star } from "lucide-react"
import { SUBSCRIPTION_PLANS } from "@/lib/billing"
import type { SubscriptionPlan } from "@/lib/billing"

interface SubscriptionPlansProps {
  currentPlanId?: string
  onSelectPlan?: (plan: SubscriptionPlan) => void
}

export function SubscriptionPlans({ currentPlanId, onSelectPlan }: SubscriptionPlansProps) {
  const [selectedInterval, setSelectedInterval] = useState<"month" | "year">("month")

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "free":
        return <Star className="h-6 w-6" />
      case "pro":
        return <Zap className="h-6 w-6" />
      case "enterprise":
        return <Crown className="h-6 w-6" />
      default:
        return <Star className="h-6 w-6" />
    }
  }

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case "free":
        return "text-muted-foreground"
      case "pro":
        return "text-primary"
      case "enterprise":
        return "text-accent"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      {/* Interval Toggle */}
      <div className="flex justify-center">
        <div className="bg-muted p-1 rounded-lg">
          <Button
            variant={selectedInterval === "month" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedInterval("month")}
          >
            Monthly
          </Button>
          <Button
            variant={selectedInterval === "year" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedInterval("year")}
          >
            Yearly
            <Badge variant="secondary" className="ml-2">
              Save 20%
            </Badge>
          </Button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrentPlan = currentPlanId === plan.id
          const yearlyPrice = selectedInterval === "year" ? Math.round(plan.price * 12 * 0.8) : plan.price * 12

          return (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular ? "border-primary shadow-lg scale-105" : ""
              } ${isCurrentPlan ? "ring-2 ring-primary" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className={`mx-auto mb-4 ${getPlanColor(plan.id)}`}>{getPlanIcon(plan.id)}</div>
                <CardTitle className="font-serif text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>

                <div className="mt-4">
                  {plan.price === 0 ? (
                    <div className="text-3xl font-bold">Free</div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-3xl font-bold">
                        ${selectedInterval === "month" ? plan.price : Math.round(yearlyPrice / 12)}
                        <span className="text-lg font-normal text-muted-foreground">
                          /{selectedInterval === "month" ? "mo" : "mo"}
                        </span>
                      </div>
                      {selectedInterval === "year" && (
                        <div className="text-sm text-muted-foreground">${yearlyPrice} billed annually</div>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-primary">{plan.credits}</span>
                    <span className="text-sm text-muted-foreground ml-1">credits/month</span>
                  </div>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  disabled={isCurrentPlan}
                  onClick={() => onSelectPlan?.(plan)}
                >
                  {isCurrentPlan ? "Current Plan" : `Choose ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
