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
            email: response.user.email,
            role: "user"
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
    set({
      user: null,
      token: null,
      apiUrl: null,
      isLoading: false,
      error: null,
    })
  },

  hydrate: async () => {
    const token = localStorage.getItem("auth_token")
    const apiUrl = localStorage.getItem("api_url")

    if (token && apiUrl) {
      set({ token, apiUrl })
      apiClient.setBaseUrl(apiUrl)
      
      // Verify token is still valid by fetching user info
      try {
        const response = await apiClient.get("/auth/me")
        const user: User = {
          id: response.data.userId,
          email: response.data.email,
          role: "user"
        }
        set({ user })
      } catch (error) {
        // Token expired or invalid, clear it
        console.error("Token validation failed:", error)
        localStorage.removeItem("auth_token")
        localStorage.removeItem("api_url")
        set({ token: null, apiUrl: null, user: null })
      }
    }
  },
}))
