"use client"
import { useState } from "react"
import { apiClient } from "@/lib/api"
import { X, CheckCircle } from "lucide-react"
import { useToastStore } from "@/components/ui/Toast"

export default function ResolveModal({
  incidentId,
  onClose,
  onResolved,
}: {
  incidentId: string
  onClose: () => void
  onResolved?: () => void
}) {
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const addToast = useToastStore(state => state.addToast)

  const handleResolve = async () => {
    setLoading(true)
    try {
      await apiClient.patch(`/incidents/${incidentId}/resolve`, {
        resolution_notes: notes,
      })
      addToast("Incident resolved successfully", "success")
      onResolved?.()
      onClose()
    } catch {
      addToast("Failed to resolve incident", "error")
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#111827] border border-gray-700 rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white">Resolve Incident</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-5">
          <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">
            Resolution Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe how this incident was resolved..."
            rows={4}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500 transition-colors resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-800 text-gray-400 rounded-xl text-sm font-medium hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleResolve}
            disabled={loading}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-4 h-4" /> Resolve
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
