import React, { useEffect } from "react"
import { Outlet, Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Sidebar } from "@/components/Sidebar"

export const ProtectedLayout: React.FC = () => {
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    // Ensure dark mode is applied
    document.documentElement.classList.add("dark")
  }, [])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
