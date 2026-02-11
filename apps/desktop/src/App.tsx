import React, { useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useUIStore } from "@/store/uiStore"
import { LoginScreen } from "@/screens/LoginScreen"
import { DashboardScreen } from "@/screens/DashboardScreen"
import { MailFilterScreen } from "@/screens/MailFilterScreen"
import { FileSearchScreen } from "@/screens/FileSearchScreen"
import { ChatScreen } from "@/screens/ChatScreen"
import { SettingsScreen } from "@/screens/SettingsScreen"
import { Sidebar } from "@/components/Sidebar"
import "@/styles/globals.css"

const App: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const { currentScreen } = useUIStore()

  useEffect(() => {
    // Ensure dark mode is applied
    document.documentElement.classList.add("dark")
  }, [])

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case "dashboard":
        return <DashboardScreen />
      case "mail":
        return <MailFilterScreen />
      case "files":
        return <FileSearchScreen />
      case "chat":
        return <ChatScreen />
      case "settings":
        return <SettingsScreen />
      default:
        return <DashboardScreen />
    }
  }

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {renderScreen()}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
