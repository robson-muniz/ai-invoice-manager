"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useInvoices, useCustomers, useOrganization } from "@/lib/hooks"
import { centsToDollars } from "@/lib/money"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InvoiceList } from "@/components/invoices/InvoiceList"
import { CustomerList } from "@/components/customers/CustomerList"
import { AlertCircle, ArrowUpRight, CircleDollarSign, Clock3, FilePlus2, Loader2, TrendingUp, Users } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface MetricsData { totalRevenue: number; outstanding: number; overdue: number; customerCount: number }
interface DashboardInvoice { totalAmount?: number; total?: number; paidAmount?: number; status: string }

const formatMoney = (cents: number) => `$${centsToDollars(cents).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export function DashboardContent() {
  const { organizationId } = useOrganization()
  const [metrics, setMetrics] = useState<MetricsData>({ totalRevenue: 0, outstanding: 0, overdue: 0, customerCount: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { list: listInvoices } = useInvoices(organizationId || "")
  const { list: listCustomers } = useCustomers(organizationId || "")

  useEffect(() => {
    if (!organizationId) return
    const loadMetrics = async () => {
      try {
        setLoading(true); setError(null)
        const [invoices, customers] = await Promise.all([listInvoices(), listCustomers()])
        let totalRevenue = 0; let outstanding = 0; let overdue = 0
        if (Array.isArray(invoices)) invoices.forEach((invoice: DashboardInvoice) => {
          const amount = invoice.totalAmount ?? invoice.total ?? 0
          const paid = invoice.paidAmount || 0
          if (invoice.status === "PAID") totalRevenue += amount
          if (["SENT", "VIEWED", "PARTIALLY_PAID"].includes(invoice.status)) outstanding += amount - paid
          if (invoice.status === "OVERDUE") overdue += amount - paid
        })
        setMetrics({ totalRevenue, outstanding, overdue, customerCount: customers?.length || 0 })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load metrics"
        setError(message); console.error("Failed to load metrics:", err)
      } finally { setLoading(false) }
    }
    loadMetrics()
  }, [organizationId, listInvoices, listCustomers])

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-indigo-500" /></div>

  const collectionRate = metrics.totalRevenue + metrics.outstanding > 0 ? Math.round((metrics.totalRevenue / (metrics.totalRevenue + metrics.outstanding)) * 100) : 0
  const cards = [
    { label: "Collected revenue", value: formatMoney(metrics.totalRevenue), note: "Paid invoices", icon: CircleDollarSign, tone: "indigo", accent: "bg-indigo-500" },
    { label: "Awaiting payment", value: formatMoney(metrics.outstanding), note: "Across open invoices", icon: Clock3, tone: "sky", accent: "bg-sky-500" },
    { label: "Needs attention", value: formatMoney(metrics.overdue), note: metrics.overdue > 0 ? "Past due invoices" : "Nothing past due", icon: TrendingUp, tone: "rose", accent: "bg-rose-500" },
    { label: "Active customers", value: metrics.customerCount.toLocaleString(), note: "In your directory", icon: Users, tone: "violet", accent: "bg-violet-500" },
  ]

  return (
    <div className="space-y-8 lg:space-y-10">
      <header className="dashboard-enter flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Finance overview</p><h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-[2.15rem]">Your business, at a glance.</h1><p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">Stay ahead of your invoices, cash flow, and customer relationships.</p></div>
        <Link href="/dashboard/invoices" className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-indigo-500/20"><FilePlus2 className="h-4 w-4" />Create invoice<ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link>
      </header>

      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, note, icon: Icon, tone, accent }, index) => (
          <article key={label} className="metric-card dashboard-enter relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_3px_14px_rgba(15,23,42,0.035)]" style={{ animationDelay: `${index * 70}ms` }}>
            <div className={`absolute inset-x-0 top-0 h-0.5 ${accent}`} />
            <div className="flex items-start justify-between"><p className="text-sm font-medium text-slate-500">{label}</p><div className={`metric-icon metric-icon-${tone} flex h-9 w-9 items-center justify-center rounded-xl`}><Icon className="h-[18px] w-[18px]" /></div></div>
            <p className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-slate-950">{value}</p><p className="mt-1.5 text-xs text-slate-400">{note}</p>
          </article>
        ))}
      </section>

      <section className="dashboard-enter grid gap-5 xl:grid-cols-[1.65fr_0.85fr]" style={{ animationDelay: "280ms" }}>
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_3px_14px_rgba(15,23,42,0.035)]">
          <div className="flex items-start justify-between px-5 pb-2 pt-5 sm:px-6"><div><p className="text-base font-semibold tracking-[-0.02em] text-slate-900">Cash flow snapshot</p><p className="mt-1 text-xs text-slate-500">Your current invoice balance</p></div><span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">Live data</span></div>
          <div className="relative mx-5 mt-5 h-40 overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 via-white to-violet-50 sm:mx-6"><div className="absolute inset-x-0 bottom-7 border-t border-dashed border-indigo-100" /><div className="absolute inset-x-0 bottom-16 border-t border-dashed border-indigo-100/70" /><svg className="absolute inset-0 h-full w-full" viewBox="0 0 720 160" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#818cf8" stopOpacity=".26"/><stop offset="100%" stopColor="#818cf8" stopOpacity="0"/></linearGradient></defs><path d="M0 125 C45 112 65 122 110 100 S177 105 215 78 S288 91 331 63 S414 78 462 47 S535 68 576 31 S661 36 720 13 L720 160 L0 160Z" fill="url(#area)"/><path d="M0 125 C45 112 65 122 110 100 S177 105 215 78 S288 91 331 63 S414 78 462 47 S535 68 576 31 S661 36 720 13" fill="none" stroke="#6366f1" strokeWidth="2.5" vectorEffect="non-scaling-stroke"/></svg><div className="absolute bottom-2 left-3 right-3 flex justify-between text-[10px] font-medium text-slate-400"><span>Earlier</span><span>Today</span></div></div>
          <div className="grid grid-cols-3 divide-x divide-slate-100 px-3 py-5 sm:px-4"><div className="px-2 sm:px-3"><p className="text-[11px] font-medium text-slate-400">Collected</p><p className="mt-1 text-sm font-semibold text-slate-800">{formatMoney(metrics.totalRevenue)}</p></div><div className="px-2 sm:px-3"><p className="text-[11px] font-medium text-slate-400">In flight</p><p className="mt-1 text-sm font-semibold text-slate-800">{formatMoney(metrics.outstanding)}</p></div><div className="px-2 sm:px-3"><p className="text-[11px] font-medium text-slate-400">Overdue</p><p className="mt-1 text-sm font-semibold text-rose-600">{formatMoney(metrics.overdue)}</p></div></div>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-[#171b31] p-6 text-white shadow-[0_12px_28px_rgba(30,41,59,0.16)]"><div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-400/15 blur-2xl" /><p className="relative text-sm font-medium text-indigo-200">Collection rate</p><div className="relative mt-4 flex items-end justify-between"><p className="text-4xl font-semibold tracking-[-0.05em]">{collectionRate}%</p><div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"><TrendingUp className="h-5 w-5 text-indigo-300" /></div></div><p className="relative mt-3 text-xs leading-relaxed text-slate-400">Share of invoice value already collected from paid and open invoices.</p><div className="relative mt-6 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-300 transition-all duration-1000" style={{ width: `${collectionRate}%` }} /></div><p className="relative mt-3 text-[11px] font-medium text-indigo-200">Keep the momentum going</p></div>
      </section>

      <section className="dashboard-enter" style={{ animationDelay: "360ms" }}>
        <Tabs defaultValue="invoices" className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_3px_14px_rgba(15,23,42,0.035)]">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 pt-4 sm:flex-row sm:items-center sm:px-6 sm:pt-5"><div><p className="text-base font-semibold tracking-[-0.02em] text-slate-900">Activity</p><p className="mt-1 text-xs text-slate-500">The details behind your balance</p></div><TabsList className="dashboard-tabs"><TabsTrigger value="invoices">Recent invoices</TabsTrigger><TabsTrigger value="customers">Customers</TabsTrigger></TabsList></div>
          <TabsContent value="invoices" className="dashboard-tab-panel"><InvoiceList organizationId={organizationId || ""} /></TabsContent>
          <TabsContent value="customers" className="dashboard-tab-panel"><CustomerList organizationId={organizationId || ""} /></TabsContent>
        </Tabs>
      </section>
    </div>
  )
}
