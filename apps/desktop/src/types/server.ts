export interface Server {
  id: string
  name: string
  status: "up" | "down" | "unknown"
  uptime: string
  cpu: number
  ram: {
    used: number
    total: number
  }
  disk: {
    used: number
    total: number
  }
  lastChecked: string
}

export interface Container {
  id: string
  name: string
  status: "running" | "stopped" | "failed"
  cpu: number
  memory: number
  uptime: string
  serverId: string
}

export interface Deployment {
  id: string
  name: string
  status: "success" | "failed" | "in-progress"
  timestamp: string
  logs: string
  serverId: string
}

export interface DashboardState {
  servers: Server[]
  containers: Container[]
  deployments: Deployment[]
  isLoading: boolean
  error: string | null
  lastUpdate: string | null
}
