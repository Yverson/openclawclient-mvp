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
      const response = await apiClient.login(apiUrl, token)

      localStorage.setItem("auth_token", response.token)
      localStorage.setItem("api_url", apiUrl)

      set({
        user: response.user,
        token: response.token,
        apiUrl,
        isLoading: false,
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Login failed"
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

  hydrate: () => {
    const token = localStorage.getItem("auth_token")
    const apiUrl = localStorage.getItem("api_url")

    if (token && apiUrl) {
      set({ token, apiUrl })
      apiClient.setBaseUrl(apiUrl)
    }
  },
}))
