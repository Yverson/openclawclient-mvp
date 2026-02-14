import React, { useMemo, useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { Settings, AlertCircle } from "lucide-react"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Spinner } from "@/components/Spinner"
import { useAuthStore } from "@/store/authStore"
import { useAuth } from "@/hooks/useAuth"
import { apiClient } from "@/services/api"

const getDefaultApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, "")
  }

  if (typeof window !== "undefined") {
    return "https://openclawsapi.dockploydatabase.gaddielcloud.online"
  }

  return "https://openclawsapi.dockploydatabase.gaddielcloud.online"
}

export const LoginScreen: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const defaultApiUrl = useMemo(() => getDefaultApiUrl(), [])
  const [apiUrl] = useState(defaultApiUrl)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { setToken, setApiUrl: storeSetApiUrl, setUser } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!apiUrl || !email || !password) {
      setError("All fields required")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Login failed")
      }

      const data = await response.json()

      localStorage.setItem("auth_token", data.token)
      localStorage.setItem("api_url", apiUrl)
      apiClient.setBaseUrl(apiUrl)
      const user = {
        id: data.user.id,
        name: data.user.name ?? (data.user.email?.split("@")[0] ?? "User"),
        email: data.user.email,
        role: "user" as const,
        createdAt: data.user.createdAt ?? new Date().toISOString(),
      }

      localStorage.setItem("auth_user", JSON.stringify(user))

      setToken(data.token)
      storeSetApiUrl(apiUrl)
      setUser(user)

      await new Promise((resolve) => setTimeout(resolve, 50))

      // Hard redirect inside SPA after successful login
      navigate("/dashboard", { replace: true })

      setIsLoading(false)
    } catch (err: any) {
      console.error("Login failed:", err)
      setError(err.message || "Login failed")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-primary-600">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <CardTitle>OpenClaw Client</CardTitle>
          </div>
          <p className="text-sm text-slate-400 text-center">
            Sign in to your account
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-900/30 border border-red-700 flex gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            {/* API URL is fixed in this deployment */}
            <input type="hidden" name="apiUrl" value={apiUrl} />
            <p className="text-xs text-slate-500 text-center">
              API: <span className="text-slate-400">{defaultApiUrl}</span>
            </p>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-300">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-300">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-xs text-slate-500 text-center">Demo credentials:</p>
            <p className="text-xs text-slate-400 text-center mt-2">
              Email: demo@example.com
              <br />
              Password: demo123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
