"use client"

import { Suspense } from "react"
import { DashboardContent } from "./components/DashboardContent"
import { Loader2 } from "lucide-react"

function DashboardLoading() {
  return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Dashboard</h1>
      <Suspense fallback={<DashboardLoading />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}
