import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api"

interface RiskHeatmapData {
  repositories: Array<{
    id: number
    name: string
    risk_score: number
    risk_level: "high" | "caution" | "safe"
  }>
  pull_requests: Array<{
    id: number
    title: string
    author: string
    risk_probability: number
    risk_level: "high" | "caution" | "safe"
  }>
}

import { useToastStore } from "@/components/ui/Toast"

export function useRiskHeatmap() {
  const [data, setData] = useState<RiskHeatmapData | null>(null)
  const [loading, setLoading] = useState(true)
  const addToast = useToastStore(state => state.addToast)
  
  useEffect(() => {
    apiClient.get("/dashboard/risk-heatmap")
      .then(r => setData(r.data))
      .catch(() => addToast("Failed to fetch risk heatmap", "error"))
      .finally(() => setLoading(false))
  }, [addToast])
  
  return { data, loading }
}
