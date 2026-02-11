import React from "react"
import { LogOut, Moon, Sun, Bell } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { useAuth } from "@/hooks/useAuth"
import { useUIStore } from "@/store/uiStore"

export const SettingsScreen: React.FC = () => {
  const { user, logout, apiUrl } = useAuth()
  const { darkMode, toggleDarkMode } = useUIStore()

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout()
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* User Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <>
              <div>
                <p className="text-sm text-slate-400 mb-1">Name</p>
                <p className="text-base font-medium">{user.name}</p>
              </div>
              {user.email && (
                <div>
                  <p className="text-sm text-slate-400 mb-1">Email</p>
                  <p className="text-base">{user.email}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-slate-400 mb-1">Role</p>
                <Badge
                  className={
                    user.role === "admin"
                      ? "bg-purple-900 text-purple-200"
                      : "bg-blue-900 text-blue-200"
                  }
                >
                  {user.role}
                </Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Server Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Server</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-slate-400 mb-1">OpenClaw API URL</p>
            <p className="text-sm bg-slate-900 p-3 rounded border border-slate-700 font-mono break-all">
              {apiUrl || "Not connected"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-700">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="w-5 h-5 text-slate-400" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
              )}
              <div>
                <p className="text-sm font-medium">Dark Mode</p>
                <p className="text-xs text-slate-400">
                  {darkMode ? "Enabled" : "Disabled"}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleDarkMode}
            >
              {darkMode ? "Disable" : "Enable"}
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-700">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium">Notifications</p>
                <p className="text-xs text-slate-400">
                  System notifications enabled
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 rounded border-slate-600 bg-slate-700 cursor-pointer"
            />
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-slate-400 mb-1">Version</p>
            <p className="text-base">0.1.0</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Status</p>
            <p className="text-base">Alpha</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Build Date</p>
            <p className="text-base">{new Date().toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-900 bg-red-950/20">
        <CardHeader>
          <CardTitle className="text-lg text-red-200">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="danger"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
