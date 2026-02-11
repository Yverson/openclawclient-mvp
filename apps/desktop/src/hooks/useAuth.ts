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

  useEffect(() => {
    hydrate()
  }, [])

  const isAdmin = user?.role === "admin"
  const isAuthenticated = !!token && !!user

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
