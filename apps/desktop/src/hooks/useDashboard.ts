import { useEffect, useRef } from "react"
import { useDashboardStore } from "@/store/dashboardStore"

export const useDashboard = () => {
  const {
    servers,
    containers,
    deployments,
    isLoading,
    error,
    fetchStatus,
    startAutoRefresh,
    stopAutoRefresh,
  } = useDashboardStore()

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchStatus()
    intervalRef.current = startAutoRefresh()

    return () => {
      if (intervalRef.current) {
        stopAutoRefresh(intervalRef.current)
      }
    }
  }, [fetchStatus, startAutoRefresh, stopAutoRefresh])

  return {
    servers,
    containers,
    deployments,
    isLoading,
    error,
    refetch: fetchStatus,
  }
}
