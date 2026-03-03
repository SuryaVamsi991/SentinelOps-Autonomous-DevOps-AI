import { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"

interface MetricCardProps {
  label: string
  value: string | number
  change: string
  changeType: "positive" | "negative" | "neutral"
  icon: LucideIcon
  color: "emerald" | "red" | "amber" | "indigo"
}

const colorMap = {
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", glow: "shadow-emerald-500/20" },
  red: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", glow: "shadow-red-500/20" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", glow: "shadow-amber-500/20" },
  indigo: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20", glow: "shadow-indigo-500/20" },
}

export default function MetricCard({ label, value, change, changeType, icon: Icon, color }: MetricCardProps) {
  const colors = colorMap[color]
  const changeColor = changeType === "positive" ? "text-emerald-400" : changeType === "negative" ? "text-red-400" : "text-gray-400"
  
  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="glass-card rounded-2xl p-6 relative overflow-hidden group"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 ${colors.bg} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1.5">{label}</p>
          <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${changeType === 'positive' ? 'bg-emerald-500/10' : changeType === 'negative' ? 'bg-red-500/10' : 'bg-gray-500/10'} ${changeColor}`}>
              {change}
            </span>
          </div>
        </div>
        <div className={`w-12 h-12 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center shadow-lg ${colors.glow} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
      </div>
    </motion.div>
  )
}
