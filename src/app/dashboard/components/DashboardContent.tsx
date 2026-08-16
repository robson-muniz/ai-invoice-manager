"use client"

import { useEffect, useState } from "react"
import { useInvoices, useCustomers, useOrganization } from "@/lib/hooks"
import { centsToDollars } from "@/lib/money"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InvoiceList } from "@/components/invoices/InvoiceList"
import { CustomerList } from "@/components/customers/CustomerList"
import { Loader2, TrendingUp, DollarSign, Clock, Users } from "lucide-react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface MetricsData {
  totalRevenue: number
  outstanding: number
  overdue: number
  customerCount: number
}

interface DashboardInvoice {
  totalAmount?: number
  total?: number
  paidAmount?: number
  status: string
}

export function DashboardContent() {
  const { organizationId } = useOrganization()
  const [metrics, setMetrics] = useState<MetricsData>({
    totalRevenue: 0,
    outstanding: 0,
    overdue: 0,
    customerCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { list: listInvoices } = useInvoices(organizationId || "")
  const { list: listCustomers } = useCustomers(organizationId || "")

  // Load metrics
  useEffect(() => {
    if (!organizationId) return

    const loadMetrics = async () => {
      try {
        setLoading(true)
        setError(null)

        const [invoices, customers] = await Promise.all([
          listInvoices(),
          listCustomers(),
        ])

        // Calculate metrics
        let totalRevenue = 0
        let outstanding = 0
        let overdue = 0

        if (invoices && Array.isArray(invoices)) {
          invoices.forEach((invoice: DashboardInvoice) => {
            const amount = invoice.totalAmount ?? invoice.total ?? 0
            const paid = invoice.paidAmount || 0

            if (invoice.status === "PAID") {
              totalRevenue += amount
            }
            if (["SENT", "VIEWED", "PARTIALLY_PAID"].includes(invoice.status)) {
              outstanding += amount - paid
            }
            if (invoice.status === "OVERDUE") {
              overdue += amount - paid
            }
          })
        }

        setMetrics({
          totalRevenue,
          outstanding,
          overdue,
          customerCount: customers?.length || 0,
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load metrics"
        setError(message)
        console.error("Failed to load metrics:", err)
      } finally {
        setLoading(false)
      }
    }

    loadMetrics()
  }, [organizationId, listInvoices, listCustomers])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${centsToDollars(metrics.totalRevenue).toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">From paid invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <Clock className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${centsToDollars(metrics.outstanding).toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${centsToDollars(metrics.overdue).toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Past due date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.customerCount}</div>
            <p className="text-xs text-gray-500 mt-1">Total customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Lists */}
      <div>
        <Tabs defaultValue="invoices" className="w-full">
          <TabsList>
            <TabsTrigger value="invoices">Recent Invoices</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <InvoiceList organizationId={organizationId || ""} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Directory</CardTitle>
              </CardHeader>
              <CardContent>
                <CustomerList organizationId={organizationId || ""} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
