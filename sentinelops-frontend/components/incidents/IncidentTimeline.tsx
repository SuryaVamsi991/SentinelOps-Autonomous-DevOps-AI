"use client"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api"
import { Circle, Brain, CheckCircle2, Search, Wrench, Zap } from "lucide-react"

interface TimelineEvent {
  id: number
  event_type: string
  title: string
  description: string
  actor: string
  created_at: string
}

const eventIcons: Record<string, typeof Circle> = {
  created: Circle,
  analyzed: Brain,
  similar_found: Search,
  fix_suggested: Wrench,
  simulated: Zap,
  resolved: CheckCircle2,
}

const eventColors: Record<string, string> = {
  created: "text-gray-400 bg-gray-400/10 border-gray-400/30",
  analyzed: "text-indigo-400 bg-indigo-400/10 border-indigo-400/30",
  similar_found: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  fix_suggested: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  simulated: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
  resolved: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
}

const actorLabels: Record<string, string> = {
  system: "System",
  ai: "AI Engine",
  user: "User",
}

export default function IncidentTimeline({ incidentId }: { incidentId: string }) {
  const [events, setEvents] = useState<TimelineEvent[]>([])

  useEffect(() => {
    apiClient.get(`/incidents/${incidentId}/timeline`)
      .then(r => setEvents(r.data))
      .catch(() => {})
  }, [incidentId])

  if (events.length === 0) return null

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    } catch {
      return ""
    }
  }

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
      <h3 className="font-semibold text-white mb-5">Incident Timeline</h3>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-3 bottom-3 w-px bg-gray-700" />

        <div className="space-y-4">
          {events.map((event, i) => {
            const Icon = eventIcons[event.event_type] || Circle
            const colorClass = eventColors[event.event_type] || "text-gray-400 bg-gray-400/10 border-gray-400/30"

            return (
              <div key={event.id || i} className="flex items-start gap-4 pl-1 relative">
                {/* Dot/Icon */}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 z-10 ${colorClass}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">{event.title}</p>
                    <span className="text-[10px] text-gray-600 uppercase font-bold tracking-wider">
                      {actorLabels[event.actor] || event.actor}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{event.description}</p>
                  )}
                  <p className="text-[10px] text-gray-600 mt-1">{formatTime(event.created_at)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
