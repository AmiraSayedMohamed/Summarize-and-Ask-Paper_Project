"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CreditCard, Plus, Trash2, Loader2 } from "lucide-react"
import { addPaymentMethod } from "@/lib/billing"
import type { PaymentMethod } from "@/lib/billing"

interface PaymentMethodsProps {
  paymentMethods: PaymentMethod[]
  onPaymentMethodAdded?: (paymentMethod: PaymentMethod) => void
  onPaymentMethodDeleted?: (paymentMethodId: string) => void
}

export function PaymentMethods({ paymentMethods, onPaymentMethodAdded, onPaymentMethodDeleted }: PaymentMethodsProps) {
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [cardForm, setCardForm] = useState({
    number: "",
    expiryMonth: "",
    expiryYear: "",
    cvc: "",
    name: "",
  })

  const handleAddCard = async () => {
    setError("")
    setIsLoading(true)

    try {
      // Basic validation
      if (!cardForm.number || !cardForm.expiryMonth || !cardForm.expiryYear || !cardForm.cvc) {
        throw new Error("Please fill in all card details")
      }

      const paymentMethod = await addPaymentMethod("current_user", {
        number: cardForm.number,
        expiryMonth: Number.parseInt(cardForm.expiryMonth),
        expiryYear: Number.parseInt(cardForm.expiryYear),
        cvc: cardForm.cvc,
        name: cardForm.name,
        brand: getCardBrand(cardForm.number),
      })

      if (onPaymentMethodAdded) {
        onPaymentMethodAdded(paymentMethod)
      }

      setIsAddingCard(false)
      setCardForm({
        number: "",
        expiryMonth: "",
        expiryYear: "",
        cvc: "",
        name: "",
      })
    } catch (err: any) {
      setError(err.message || "Failed to add payment method")
    } finally {
      setIsLoading(false)
    }
  }

  const getCardBrand = (number: string): string => {
    const firstDigit = number.charAt(0)
    if (firstDigit === "4") return "visa"
    if (firstDigit === "5") return "mastercard"
    if (firstDigit === "3") return "amex"
    return "visa"
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    setCardForm({ ...cardForm, number: formatted.replace(/\s/g, "") })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-serif font-medium">Payment Methods</h3>
        <Dialog open={isAddingCard} onOpenChange={setIsAddingCard}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Card
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-serif">Add Payment Method</DialogTitle>
              <DialogDescription>Add a new credit or debit card for payments.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={formatCardNumber(cardForm.number)}
                  onChange={handleCardNumberChange}
                  maxLength={19}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryMonth">Expiry Month</Label>
                  <Input
                    id="expiryMonth"
                    placeholder="MM"
                    value={cardForm.expiryMonth}
                    onChange={(e) => setCardForm({ ...cardForm, expiryMonth: e.target.value })}
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryYear">Expiry Year</Label>
                  <Input
                    id="expiryYear"
                    placeholder="YYYY"
                    value={cardForm.expiryYear}
                    onChange={(e) => setCardForm({ ...cardForm, expiryYear: e.target.value })}
                    maxLength={4}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  placeholder="123"
                  value={cardForm.cvc}
                  onChange={(e) => setCardForm({ ...cardForm, cvc: e.target.value })}
                  maxLength={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  id="cardName"
                  placeholder="John Doe"
                  value={cardForm.name}
                  onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingCard(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCard} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Card
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {paymentMethods.length > 0 ? (
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <Card key={method.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium capitalize">{method.brand}</span>
                      <span className="text-muted-foreground">•••• {method.last4}</span>
                      {method.isDefault && <Badge variant="secondary">Default</Badge>}
                    </div>
                    {method.expiryMonth && method.expiryYear && (
                      <div className="text-sm text-muted-foreground">
                        Expires {method.expiryMonth.toString().padStart(2, "0")}/{method.expiryYear}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPaymentMethodDeleted?.(method.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Payment Methods</h3>
            <p className="text-muted-foreground mb-4">
              Add a payment method to manage your subscription and purchase credits.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
