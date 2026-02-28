import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api"
import { Incident } from "@/types"
import { useToastStore } from "@/components/ui/Toast"

export function useIncidents(limit = 20) {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const addToast = useToastStore(state => state.addToast)

  useEffect(() => {
    apiClient.get(`/incidents/?limit=${limit}`)
      .then(r => setIncidents(r.data))
      .catch(() => addToast("Failed to fetch incidents", "error"))
      .finally(() => setLoading(false))
  }, [limit, addToast])
  
  return { incidents, loading }
}
