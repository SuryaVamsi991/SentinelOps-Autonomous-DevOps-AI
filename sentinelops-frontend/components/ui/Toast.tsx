"use client"
import { create } from "zustand"

interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info"
}

interface ToastStore {
  toasts: Toast[]
  addToast: (message: string, type: "success" | "error" | "info") => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type) => {
    const id = Math.random().toString(36).substring(7)
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 5000)
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          className={`px-4 py-3 rounded-xl border shadow-xl cursor-pointer transition-all animate-in slide-in-from-right-10 flex items-center gap-3 min-w-[300px] ${
            toast.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : toast.type === "error"
              ? "bg-red-500/10 border-red-500/20 text-red-400"
              : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
          }`}
        >
          <div className={`w-2 h-2 rounded-full shrink-0 ${
            toast.type === "success" ? "bg-emerald-400" : toast.type === "error" ? "bg-red-400" : "bg-indigo-400"
          }`} />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      ))}
    </div>
  )
}
