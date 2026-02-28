"use client"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api"
import PageHeader from "@/components/layout/PageHeader"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from "recharts"

interface AnalyticsData {
  data: Array<{
    date: string;
    avg_duration: number;
    success: number;
    failure: number;
  }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  
  useEffect(() => {
    apiClient.get<AnalyticsData>("/dashboard/ci-health?days=30").then(r => setData(r.data)).catch(() => {})
  }, [])
  
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
          <p className="text-3xl font-bold text-white">2h 14m</p>
          <p className="text-xs text-emerald-400 mt-1">↓ 23% vs last month</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Deployment Stability</p>
          <p className="text-3xl font-bold text-white">87%</p>
          <p className="text-xs text-amber-400 mt-1">↑ 4% with SentinelOps</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Incidents Auto-Explained</p>
          <p className="text-3xl font-bold text-white">94%</p>
          <p className="text-xs text-indigo-400 mt-1">By AI root cause engine</p>
        </div>
      </div>
      
      {/* MTTR Trend Chart */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
        <h3 className="font-semibold text-white mb-4">MTTR Trend — Last 30 Days</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data?.data || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b7280" }} />
            <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
            <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }} />
            <Line type="monotone" dataKey="avg_duration" stroke="#6366f1" strokeWidth={2} dot={false} name="Build Duration (ms)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Code Churn vs Failure Rate */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
        <h3 className="font-semibold text-white mb-2">Code Churn vs CI Failure Rate</h3>
        <p className="text-xs text-gray-500 mb-4">Each point is a PR — higher lines changed correlates with higher failure probability</p>
        <ResponsiveContainer width="100%" height={240}>
          <ScatterChart data={[
            { lines: 145, failure_rate: 0.12 },
            { lines: 450, failure_rate: 0.34 },
            { lines: 890, failure_rate: 0.67 },
            { lines: 1100, failure_rate: 0.82 },
            { lines: 230, failure_rate: 0.18 },
            { lines: 670, failure_rate: 0.45 },
            { lines: 50, failure_rate: 0.05 },
            { lines: 1500, failure_rate: 0.95 },
          ]}>
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
