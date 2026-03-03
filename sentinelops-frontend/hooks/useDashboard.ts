import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api"

interface DashboardData {
  repos: {
    total: number
    high_risk: number
    avg_risk_score: number
  }
  ci: {
    total_runs_30d: number
    failed_runs_30d: number
    success_rate: number
    avg_build_time_ms: number
  }
  incidents: {
    open: number
    total_30d: number
  }
  repos_list: Array<{
    id: number
    name: string
    risk_score: number
    failure_rate: number
    risk_drivers?: Array<{ feature: string; impact: number }>
  }>
  pulse?: {
    pulse_score: number
    status: string
    metrics: {
      stability: number
      recovery: number
      risk_control: number
    }
  }
}

import { useToastStore } from "@/components/ui/Toast"

export function useDashboard() {
  const [summary, setSummary] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const addToast = useToastStore((state: { addToast: (msg: string, type: "success" | "error" | "info") => void }) => state.addToast)
  
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const r = await apiClient.get("/dashboard/summary")
        setSummary(r.data)
      } catch {
        addToast("Failed to fetch dashboard summary", "error")
      } finally {
        setLoading(false)
      }
    }
    
    fetchSummary()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchSummary, 30000)
    return () => clearInterval(interval)
  }, [addToast])
  
  return { data: summary, loading }
}
