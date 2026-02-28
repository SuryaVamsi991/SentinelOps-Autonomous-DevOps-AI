"use client"
import { Inter } from "next/font/google"
import "./globals.css"
import Sidebar from "@/components/layout/Sidebar"
import TopBar from "@/components/layout/TopBar"
import { usePathname } from "next/navigation"
import { ToastContainer } from "@/components/ui/Toast"
import type { Metadata } from "next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SentinelOps | DevOps AI Co-Pilot by Arsh Verma",
  description: "Autonomous Engineering Decision Intelligence",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLanding = pathname === "/"

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body className={`${inter.className} bg-[#0a0f1e] text-white min-h-screen`}>
        {isLanding ? (
          children
        ) : (
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <TopBar />
              <main className="flex-1 overflow-y-auto p-6">
                {children}
              </main>
            </div>
          </div>
        )}
        <ToastContainer />
      </body>
    </html>
  )
}
