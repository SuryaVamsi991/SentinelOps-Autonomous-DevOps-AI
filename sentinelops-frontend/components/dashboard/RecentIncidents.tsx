"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { apiClient } from "@/lib/api"
import { AlertTriangle, Brain } from "lucide-react"
import { Incident } from "@/types"

export default function RecentIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  
  useEffect(() => {
    apiClient.get("/incidents/?limit=5").then(r => setIncidents(r.data))
  }, [])
  
  const categoryColors: Record<string, string> = {
    dependency: "text-orange-400",
    syntax: "text-red-400",
    test: "text-yellow-400",
    config: "text-blue-400",
    runtime: "text-purple-400",
    network: "text-cyan-400",
  }
  
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-indigo-400" />
          <h3 className="font-semibold text-white">Recent AI-Analyzed Incidents</h3>
        </div>
        <Link href="/incidents" className="text-xs text-indigo-400 hover:text-indigo-300">View all →</Link>
      </div>
      
      <div className="space-y-3">
        {incidents.length === 0 && (
          <p className="text-sm text-gray-600 py-4 text-center">No incidents detected — all systems healthy ✅</p>
        )}
        
        {incidents.map((inc) => (
          <Link
            key={inc.id}
            href={`/incidents/${inc.id}`}
            className="block p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-all group"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-200 line-clamp-1 group-hover:text-white transition-colors">{inc.root_cause}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${categoryColors[inc.error_category] || "text-gray-500"}`}>
                    {inc.error_category}
                  </span>
                  <span className="text-[10px] text-gray-600 font-medium">{inc.estimated_fix_time}</span>
                  <span className={`text-[10px] font-bold uppercase ml-auto ${inc.status === "open" ? "text-red-400" : "text-emerald-400"}`}>
                    {inc.status}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
