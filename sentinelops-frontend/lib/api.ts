import axios from "axios"

import { useToastStore } from "@/components/ui/Toast"

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || "An unexpected error occurred"
    console.error("API Error:", message)
    
    // Trigger toast notification
    if (typeof window !== "undefined") {
      useToastStore.getState().addToast(message, "error")
    }
    
    return Promise.reject(error)
  }
)
