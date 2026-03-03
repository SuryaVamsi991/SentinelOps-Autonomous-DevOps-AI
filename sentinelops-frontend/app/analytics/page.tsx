"use client"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api"
import PageHeader from "@/components/layout/PageHeader"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from "recharts"
import { useToastStore } from "@/components/ui/Toast"

interface ChurnPoint {
  id: number
  title: string
  lines: number
  failure_rate: number
  risk_level: string
  author: string
}

interface MTTRData {
  overall_mttr: string
  overall_mttr_minutes: number
  total_incidents: number
  resolved_count: number
  trend: Array<{
    date: string
    mttr_minutes: number
    incidents: number
  }>
}

export default function AnalyticsPage() {
  const [ciHealth, setCiHealth] = useState<{ data: Array<{ date: string; avg_duration: number; success: number; failure: number }> } | null>(null)
  const [mttr, setMttr] = useState<MTTRData | null>(null)
  const [churnData, setChurnData] = useState<ChurnPoint[]>([])
  const [stability, setStability] = useState<{ overall_stability: number } | null>(null)
  const [explained, setExplained] = useState<{ ratio: number } | null>(null)
  const addToast = useToastStore(state => state.addToast)

  useEffect(() => {
    // Fetch all analytics data in parallel
    Promise.allSettled([
      apiClient.get("/dashboard/ci-health?days=30"),
      apiClient.get("/analytics/mttr"),
      apiClient.get("/analytics/churn-correlation"),
      apiClient.get("/analytics/deployment-stability"),
      apiClient.get("/analytics/incidents-explained"),
    ]).then(([ciRes, mttrRes, churnRes, stabRes, explRes]) => {
      if (ciRes.status === "fulfilled") setCiHealth(ciRes.value.data)
      if (mttrRes.status === "fulfilled") setMttr(mttrRes.value.data)
      if (churnRes.status === "fulfilled") setChurnData(churnRes.value.data.data)
      if (stabRes.status === "fulfilled") setStability(stabRes.value.data)
      if (explRes.status === "fulfilled") setExplained(explRes.value.data)
    }).catch(() => addToast("Failed to fetch analytics data", "error"))
  }, [addToast])
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Engineering Performance Insights"
        subtitle="Mean Time to Recovery, code churn vs failure correlation, deployment stability"
      />
      
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Mean Time to Recovery</p>
          <p className="text-3xl font-bold text-white">{mttr?.overall_mttr ?? "—"}</p>
          <p className="text-xs text-emerald-400 mt-1">
            {mttr ? `${mttr.total_incidents} incidents analyzed` : "Loading..."}
          </p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Deployment Stability</p>
          <p className="text-3xl font-bold text-white">{stability ? `${stability.overall_stability}%` : "—"}</p>
          <p className="text-xs text-amber-400 mt-1">Across all repositories</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Incidents Auto-Explained</p>
          <p className="text-3xl font-bold text-white">{explained ? `${explained.ratio}%` : "—"}</p>
          <p className="text-xs text-indigo-400 mt-1">By AI root cause engine</p>
        </div>
      </div>
      
      {/* MTTR Trend Chart */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
        <h3 className="font-semibold text-white mb-4">Build Duration Trend — Last 30 Days</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={ciHealth?.data || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b7280" }} />
            <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
            <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }} />
            <Line type="monotone" dataKey="avg_duration" stroke="#6366f1" strokeWidth={2} dot={false} name="Build Duration (ms)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Code Churn vs Failure Rate — now using real API data */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
        <h3 className="font-semibold text-white mb-2">Code Churn vs CI Failure Rate</h3>
        <p className="text-xs text-gray-500 mb-4">Each point is a PR — higher lines changed correlates with higher failure probability</p>
        <ResponsiveContainer width="100%" height={240}>
          <ScatterChart data={churnData}>
            <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
            <XAxis type="number" dataKey="lines" name="Lines Changed" tick={{ fontSize: 11, fill: "#6b7280" }} />
            <YAxis type="number" dataKey="failure_rate" name="Failure Rate" tick={{ fontSize: 11, fill: "#6b7280" }} />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }} 
              contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }}
            />
            <Scatter name="PRs" fill="#6366f1" opacity={0.7} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
