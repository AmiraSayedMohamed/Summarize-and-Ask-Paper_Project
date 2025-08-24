"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Coins, Zap, Loader2 } from "lucide-react"
import { purchaseCredits } from "@/lib/billing"
import type { PaymentMethod } from "@/lib/billing"

interface CreditPurchaseProps {
  currentCredits: number
  paymentMethods: PaymentMethod[]
  onCreditsPurchased?: (amount: number) => void
}

const CREDIT_PACKAGES = [
  {
    credits: 100,
    price: 10,
    bonus: 0,
    popular: false,
  },
  {
    credits: 500,
    price: 45,
    bonus: 50,
    popular: true,
  },
  {
    credits: 1000,
    price: 80,
    bonus: 200,
    popular: false,
  },
  {
    credits: 2500,
    price: 180,
    bonus: 750,
    popular: false,
  },
]

export function CreditPurchase({ currentCredits, paymentMethods, onCreditsPurchased }: CreditPurchaseProps) {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const defaultPaymentMethod = paymentMethods.find((pm) => pm.isDefault)

  const handlePurchase = async (packageIndex: number) => {
    if (!defaultPaymentMethod) {
      setError("Please add a payment method first")
      return
    }

    const creditPackage = CREDIT_PACKAGES[packageIndex]
    setSelectedPackage(packageIndex)
    setIsLoading(true)
    setError("")

    try {
      await purchaseCredits("current_user", creditPackage.credits + creditPackage.bonus, defaultPaymentMethod.id)

      if (onCreditsPurchased) {
        onCreditsPurchased(creditPackage.credits + creditPackage.bonus)
      }
    } catch (err: any) {
      setError(err.message || "Failed to purchase credits")
    } finally {
      setIsLoading(false)
      setSelectedPackage(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center">
            <Coins className="mr-2 h-5 w-5 text-accent" />
            Current Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-accent">{currentCredits}</div>
          <p className="text-sm text-muted-foreground">analysis credits available</p>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Credit Packages */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif font-medium">Purchase Credits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CREDIT_PACKAGES.map((pkg, index) => (
            <Card key={index} className={`relative ${pkg.popular ? "border-primary" : ""}`}>
              {pkg.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Best Value</Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-serif">{pkg.credits} Credits</CardTitle>
                  {pkg.bonus > 0 && (
                    <Badge variant="secondary" className="flex items-center">
                      <Zap className="mr-1 h-3 w-3" />+{pkg.bonus} Bonus
                    </Badge>
                  )}
                </div>
                <CardDescription>Total: {pkg.credits + pkg.bonus} credits</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">${pkg.price}</div>
                  <div className="text-sm text-muted-foreground">
                    ${(pkg.price / (pkg.credits + pkg.bonus)).toFixed(3)} per credit
                  </div>
                </div>

                <Button
                  className="w-full"
                  variant={pkg.popular ? "default" : "outline"}
                  disabled={isLoading || !defaultPaymentMethod}
                  onClick={() => handlePurchase(index)}
                >
                  {isLoading && selectedPackage === index && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Purchase Credits
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {!defaultPaymentMethod && (
        <Alert>
          <AlertDescription>Add a payment method to purchase credits.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
