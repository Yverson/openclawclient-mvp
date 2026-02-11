import React from "react"
import {
  LayoutDashboard,
  Mail,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useUIStore } from "@/store/uiStore"
import { cn } from "@/utils/cn"

type Screen = "dashboard" | "mail" | "files" | "chat" | "settings"

interface NavItem {
  id: Screen
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: "mail", label: "Mail", icon: <Mail className="w-5 h-5" /> },
  { id: "files", label: "Files", icon: <FileText className="w-5 h-5" /> },
  { id: "chat", label: "Chat", icon: <MessageSquare className="w-5 h-5" /> },
  { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
]

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth()
  const { currentScreen, setCurrentScreen, sidebarOpen, toggleSidebar } =
    useUIStore()

  const handleLogout = () => {
    logout()
  }

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
      >
        {sidebarOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-800 border-r border-slate-700 flex flex-col transition-transform duration-200 md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">OpenClaw</h1>
              <p className="text-xs text-slate-400">Client v0.1.0</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentScreen(item.id)
                if (window.innerWidth < 768) {
                  toggleSidebar()
                }
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200",
                currentScreen === item.id
                  ? "bg-primary-600 text-white"
                  : "text-slate-300 hover:bg-slate-700 active:bg-slate-600"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Info */}
        {user && (
          <div className="p-4 border-t border-slate-700 space-y-3">
            <div className="px-4 py-3 rounded-lg bg-slate-700/50">
              <p className="text-sm font-medium text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-slate-400 capitalize">{user.role}</p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
