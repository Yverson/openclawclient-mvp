import axios, { AxiosInstance } from "axios"
import type { LoginResponse, User } from "@/types/auth"
import type { Server, Container, Deployment } from "@/types/server"

class ApiClient {
  private client: AxiosInstance
  private baseUrl: string = ""

  constructor() {
    this.client = axios.create({
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    })

    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem("auth_token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    const persistedApiUrl = localStorage.getItem("api_url")
    if (persistedApiUrl) {
      this.setBaseUrl(persistedApiUrl)
    }

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("auth_token")
          localStorage.removeItem("api_url")
          window.location.href = "/login"
        }
        return Promise.reject(error)
      }
    )
  }

  setBaseUrl(url: string) {
    const normalized = url.replace(/\/+$/, "")
    this.baseUrl = normalized
    this.client.defaults.baseURL = normalized
  }

  private getAlternatePortBaseUrl(): string | null {
    if (!this.baseUrl) return null

    if (this.baseUrl.includes(":18790")) {
      return this.baseUrl.replace(":18790", ":18789")
    }
    if (this.baseUrl.includes(":18789")) {
      return this.baseUrl.replace(":18789", ":18790")
    }

    return null
  }

  private async withNetworkFallback<T>(request: () => Promise<T>): Promise<T> {
    try {
      return await request()
    } catch (error: any) {
      const isNetworkError = !!error && !error.response
      const alternateBaseUrl = this.getAlternatePortBaseUrl()

      if (!isNetworkError || !alternateBaseUrl) {
        throw error
      }

      console.warn(
        `Primary API URL unreachable (${this.baseUrl}), retrying with ${alternateBaseUrl}`
      )

      this.setBaseUrl(alternateBaseUrl)
      localStorage.setItem("api_url", alternateBaseUrl)

      return request()
    }
  }

  async login(apiUrl: string, token: string): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>("/auth/token", {
      token,
    })
    return response.data
  }

  async getStatus(): Promise<{
    servers: Server[]
    containers: Container[]
    deployments: Deployment[]
  }> {
    return this.withNetworkFallback(async () => {
      const response = await this.client.get("/api/status")
      return response.data
    })
  }

  async getServers(): Promise<Server[]> {
    return this.withNetworkFallback(async () => {
      const response = await this.client.get<{ servers: Server[] }>(
        "/api/servers"
      )
      return response.data.servers || []
    })
  }

  async getContainers(): Promise<Container[]> {
    return this.withNetworkFallback(async () => {
      const response = await this.client.get<{ containers: Container[] }>(
        "/api/containers"
      )
      return response.data.containers || []
    })
  }

  async getDeployments(): Promise<Deployment[]> {
    return this.withNetworkFallback(async () => {
      const response = await this.client.get<{ deployments: Deployment[] }>(
        "/api/deployments"
      )
      return response.data.deployments || []
    })
  }

  async getUser(): Promise<User> {
    return this.withNetworkFallback(async () => {
      const response = await this.client.get<User>("/api/user")
      return response.data
    })
  }
}

export const apiClient = new ApiClient()
