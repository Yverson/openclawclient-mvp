import { create } from "zustand"
import type { User } from "@/types/auth"
import { apiClient } from "@/services/api"

interface AuthStore {
  user: User | null
  token: string | null
  apiUrl: string | null
  isLoading: boolean
  error: string | null

  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setApiUrl: (url: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  login: (apiUrl: string, token: string) => Promise<void>
  logout: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  apiUrl: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setApiUrl: (url) => set({ apiUrl: url }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  login: async (apiUrl, token) => {
    set({ isLoading: true, error: null })
    try {
      apiClient.setBaseUrl(apiUrl)
      
      // If token is a JWT-like string, just use it directly
      if (token.includes('.')) {
        // It's a token, verify it with /auth/token endpoint
        const response = await apiClient.login(apiUrl, token)
        
        localStorage.setItem("auth_token", response.token)
        localStorage.setItem("api_url", apiUrl)

        set({
          user: {
            id: response.user.id,
            name: response.user.name ?? (response.user.email?.split("@")[0] ?? "User"),
            email: response.user.email,
            role: "user",
            createdAt: response.user.createdAt ?? new Date().toISOString(),
          },
          token: response.token,
          apiUrl,
          isLoading: false,
        })
      } else {
        // Shouldn't happen with new email/password flow
        throw new Error("Invalid token format")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Login failed"
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("api_url")
    localStorage.removeItem("auth_user")
    set({
      user: null,
      token: null,
      apiUrl: null,
      isLoading: false,
      error: null,
    })
  },

  hydrate: () => {
    const token = localStorage.getItem("auth_token")
    const apiUrl = localStorage.getItem("api_url")
    const userStr = localStorage.getItem("auth_user")

    if (token && apiUrl && userStr) {
      try {
        const user = JSON.parse(userStr)
        console.log("✅ Hydrating from localStorage:", user.email)
        set({ token, apiUrl, user })
        apiClient.setBaseUrl(apiUrl)
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error)
        // Clear invalid data
        localStorage.removeItem("auth_token")
        localStorage.removeItem("api_url")
        localStorage.removeItem("auth_user")
      }
    }
  },
}))
