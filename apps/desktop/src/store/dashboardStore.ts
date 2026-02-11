import { create } from "zustand"
import type { Server, Container, Deployment } from "@/types/server"
import { apiClient } from "@/services/api"

interface DashboardStore {
  servers: Server[]
  containers: Container[]
  deployments: Deployment[]
  isLoading: boolean
  error: string | null
  lastUpdate: string | null

  setServers: (servers: Server[]) => void
  setContainers: (containers: Container[]) => void
  setDeployments: (deployments: Deployment[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  fetchStatus: () => Promise<void>
  startAutoRefresh: () => NodeJS.Timeout
  stopAutoRefresh: (interval: NodeJS.Timeout) => void
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  servers: [],
  containers: [],
  deployments: [],
  isLoading: false,
  error: null,
  lastUpdate: null,

  setServers: (servers) => set({ servers }),
  setContainers: (containers) => set({ containers }),
  setDeployments: (deployments) => set({ deployments }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  fetchStatus: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await apiClient.getStatus()
      set({
        servers: data.servers || [],
        containers: data.containers || [],
        deployments: data.deployments || [],
        isLoading: false,
        lastUpdate: new Date().toISOString(),
      })
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Failed to fetch status"
      set({ error: errorMessage, isLoading: false })
    }
  },

  startAutoRefresh: () => {
    const interval = setInterval(() => {
      // Get the current state's fetchStatus
      useAuthStore.getState().token && // Check if user is still authenticated
        set((state) => {
          // Refresh status
          apiClient
            .getStatus()
            .then((data) => {
              set({
                servers: data.servers || [],
                containers: data.containers || [],
                deployments: data.deployments || [],
                lastUpdate: new Date().toISOString(),
              })
            })
            .catch((error) => {
              console.error("Auto-refresh failed:", error)
            })
          return state
        })
    }, 30000) // Refresh every 30 seconds

    return interval
  },

  stopAutoRefresh: (interval) => {
    clearInterval(interval)
  },
}))

// Import for type safety
import { useAuthStore } from "./authStore"
