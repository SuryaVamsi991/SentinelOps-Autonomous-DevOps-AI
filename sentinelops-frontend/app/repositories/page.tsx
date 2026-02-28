"use client"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api"
import PageHeader from "@/components/layout/PageHeader"
import { getRiskColor, getRiskEmoji } from "@/lib/utils"
import { GitBranch } from "lucide-react"
import { Repository } from "@/types"

import { useSearchStore } from "@/hooks/useSearchStore"
import { useToastStore } from "@/components/ui/Toast"

export default function RepositoriesPage() {
  const [data, setData] = useState<{ repositories: Repository[] } | null>(null)
  const query = useSearchStore(state => state.query)
  const addToast = useToastStore(state => state.addToast)
  
  useEffect(() => {
    apiClient.get("/dashboard/risk-heatmap")
      .then(r => setData(r.data))
      .catch(() => addToast("Failed to fetch repository data", "error"))
  }, [addToast])

  const filteredRepos = data?.repositories?.filter(repo => 
    repo.name.toLowerCase().includes(query.toLowerCase())
  ) || []
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Repository Risk Heatmap"
        subtitle="All monitored repositories ranked by CI failure risk"
      />
      
      <div className="grid gap-4">
        {filteredRepos.length > 0 ? (
          filteredRepos.map((repo: Repository) => {
            const colors = getRiskColor(repo.risk_level as string)
            return (
              <div
                key={repo.id}
                className="bg-[#111827] border border-gray-800 rounded-xl p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.bg} ${colors.border} border`}>
                    <GitBranch className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{repo.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {getRiskEmoji(repo.risk_level)} {repo.risk_level.toUpperCase()} RISK
                    </div>
                  </div>
                </div>
                
                {/* Risk Progress Bar */}
                <div className="flex items-center gap-4 flex-1 mx-8">
                  <div className="flex-1 bg-gray-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        repo.risk_level === "high" ? "bg-red-500" :
                        repo.risk_level === "caution" ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${repo.risk_score * 100}%` }}
                    />
                  </div>
                  <span className={`text-sm font-mono font-bold ${colors.text} w-12 text-right`}>
                    {Math.round(repo.risk_score * 100)}%
                  </span>
                </div>
                
                <div className="flex gap-6 text-right">
                  <div>
                    <div className="text-xs text-gray-500">Failure Rate</div>
                    <div className="text-sm font-medium text-white">
                      {Math.round((repo.failure_rate || 0) * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-20 bg-[#111827] border border-gray-800 rounded-2xl">
            <p className="text-gray-500">{query ? `No repositories matching "${query}"` : "No repositories monitored yet."}</p>
          </div>
        )}
      </div>
    </div>
  )
}
