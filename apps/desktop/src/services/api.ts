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
    this.baseUrl = url
    this.client.defaults.baseURL = url
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
    const response = await this.client.get("/api/status")
    return response.data
  }

  async getServers(): Promise<Server[]> {
    const response = await this.client.get<{ servers: Server[] }>(
      "/api/servers"
    )
    return response.data.servers || []
  }

  async getContainers(): Promise<Container[]> {
    const response = await this.client.get<{ containers: Container[] }>(
      "/api/containers"
    )
    return response.data.containers || []
  }

  async getDeployments(): Promise<Deployment[]> {
    const response = await this.client.get<{ deployments: Deployment[] }>(
      "/api/deployments"
    )
    return response.data.deployments || []
  }

  async getUser(): Promise<User> {
    const response = await this.client.get<User>("/api/user")
    return response.data
  }
}

export const apiClient = new ApiClient()
