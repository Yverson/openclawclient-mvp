import React, { useState, useEffect } from "react"
import { Settings, AlertCircle } from "lucide-react"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Spinner } from "@/components/Spinner"
import { useAuth } from "@/hooks/useAuth"

export const LoginScreen: React.FC = () => {
  const [apiUrl, setApiUrl] = useState("http://37.60.228.219:18790")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isChecking, setIsChecking] = useState(true)
  const { login, isLoading, error } = useAuth()

  // Auto-login if token exists in localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token")
    const savedApiUrl = localStorage.getItem("api_url")
    
    if (savedToken && savedApiUrl) {
      console.log("✅ Already authenticated, skipping login screen")
      setIsChecking(false)
    } else {
      setIsChecking(false)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!apiUrl || !email || !password) {
      return
    }
    
    try {
      // Call backend auth/login endpoint
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Login failed')
      }

      const data = await response.json()
      
      // Login with the returned token
      await login(apiUrl, data.token)
    } catch (err: any) {
      console.error("Login failed:", err)
    }
  }

  // If already authenticated, don't show login form
  if (isChecking) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-slate-300 mt-4">Vérification de la session...</p>
        </div>
      </div>
    )
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

            <div className="space-y-2">
              <label htmlFor="apiUrl" className="text-sm font-medium text-slate-300">
                OpenClaw API URL
              </label>
              <Input
                id="apiUrl"
                type="url"
                placeholder="http://localhost:18789"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

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
              disabled={isLoading || !apiUrl || !email || !password}
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
            <p className="text-xs text-slate-500 text-center">
              Don't have an account?{" "}
              <a href="#" className="text-primary-400 hover:text-primary-300">
                Contact your administrator
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
