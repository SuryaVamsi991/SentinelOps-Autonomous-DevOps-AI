"use client"
import { useState } from "react"
import { Bell, Search } from "lucide-react"
import { useWebSocket } from "@/hooks/useWebSocket"
import { useSearchStore } from "@/hooks/useSearchStore"

export default function TopBar() {
  const [connected, setConnected] = useState(false)
  const [notifications, setNotifications] = useState<string[]>([])
  const { query, setQuery } = useSearchStore()
  
  useWebSocket((data) => {
    if (data.type === "new_incident") {
      setNotifications(prev => [data.message as string, ...prev.slice(0, 4)])
    }
    setConnected(true)
  })
  
  return (
    <header className="h-14 bg-[#111827] border-b border-gray-800 flex items-center px-6 justify-between shrink-0">
      {/* Search */}
      <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 w-72">
        <Search className="w-4 h-4 text-gray-500" />
        <input
          className="bg-transparent text-sm text-gray-400 placeholder-gray-600 outline-none flex-1"
          placeholder="Search incidents, repos, PRs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <kbd className="text-xs text-gray-600 border border-gray-700 rounded px-1">⌘K</kbd>
      </div>
      
      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Live indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-gray-600"}`} />
          <span className="text-xs text-gray-500">{connected ? "Live monitoring" : "Connecting..."}</span>
        </div>
        
        {/* Notifications */}
        <div className="relative">
          <button className="relative p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-all">
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
