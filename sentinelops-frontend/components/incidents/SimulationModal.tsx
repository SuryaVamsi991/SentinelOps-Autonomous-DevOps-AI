"use client"
import { useState } from "react"
import { apiClient } from "@/lib/api"
import { CheckCircle, XCircle, Loader, X } from "lucide-react"

interface SimStep {
  step: string
  status: "success" | "failure" | "skipped" | "running"
  duration_ms: number
}

interface SimResult {
  success: boolean
  predicted_outcome: string
  tests_passed: number
  tests_failed: number
  confidence: string
  steps: SimStep[]
  is_mock?: boolean
}

export default function SimulationModal({ incidentId, onClose }: { incidentId: string; onClose: () => void }) {
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<SimResult | null>(null)
  const [steps, setSteps] = useState<SimStep[]>([])
  
  const runSimulation = async () => {
    setRunning(true)
    setSteps([{ step: "Initializing sandbox environment...", status: "running", duration_ms: 0 }])
    
    try {
      const response = await apiClient.post(`/simulation/${incidentId}/apply-fix`)
      const finalData = response.data
      
      // Simulate real-time stepping based on backend durations
      setSteps([])
      for (const step of finalData.steps) {
        setSteps(prev => [...prev, { ...step, status: "running", duration_ms: 0 }])
        // Wait relative to real duration (capped for UX)
        await new Promise(r => setTimeout(r, Math.min(step.duration_ms / 5, 1000)))
        setSteps(prev => prev.map((p, i) => i === prev.length - 1 ? step : p))
        if (step.status === "failure") break
      }
      
      setResult(finalData)
    } catch {
      setResult({ success: false, predicted_outcome: "Simulation failed", tests_passed: 0, tests_failed: 0, confidence: "0%", steps: [] })
    }
    setRunning(false)
  }
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#111827] border border-gray-700 rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white">⚡ Self-Healing Simulation</h3>
              {result?.is_mock && (
                <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                  Demo Mode
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Apply AI patch in sandbox environment</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {!running && !result && (
          <button
            onClick={runSimulation}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all"
          >
            Run Simulation
          </button>
        )}
        
        {(running || result) && (
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                {step.status === "running" ? (
                  <Loader className="w-4 h-4 text-indigo-400 animate-spin" />
                ) : step.status === "success" ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : step.status === "failure" ? (
                  <XCircle className="w-4 h-4 text-red-400" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-gray-600" />
                )}
                <span className="text-sm text-gray-300">{step.step}</span>
                {step.duration_ms > 0 && (
                  <span className="ml-auto text-xs text-gray-600 font-mono">
                    {(step.duration_ms / 1000).toFixed(1)}s
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        
        {result && (
          <div className={`mt-5 p-4 rounded-xl border ${
            result.success
              ? "bg-emerald-400/10 border-emerald-400/30"
              : "bg-red-400/10 border-red-400/30"
          }`}>
            <p className={`font-semibold text-sm ${result.success ? "text-emerald-400" : "text-red-400"}`}>
              {result.predicted_outcome}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {result.tests_passed} tests passed · {result.tests_failed} failed · {result.confidence} confidence
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
