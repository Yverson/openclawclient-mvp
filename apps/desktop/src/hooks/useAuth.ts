import { useEffect } from "react"
import { useAuthStore } from "@/store/authStore"

export const useAuth = () => {
  const {
    user,
    token,
    apiUrl,
    isLoading,
    error,
    login,
    logout,
    hydrate,
    setUser,
    setToken,
    setApiUrl,
  } = useAuthStore()

  // Hydrate on mount
  useEffect(() => {
    hydrate()
  }, [hydrate])

  // Compute derived state
  const isAdmin = user?.role === "admin"
  const isAuthenticated = !!token && !!user

  // Log for debugging
  useEffect(() => {
    console.log("🔐 Auth state:", { 
      authenticated: isAuthenticated, 
      token: token ? token.substring(0, 20) + "..." : null,
      user: user?.email 
    })
  }, [isAuthenticated, token, user])

  return {
    user,
    token,
    apiUrl,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    setUser,
    setToken,
    setApiUrl,
  }
}
