import type { ChatMessage } from "@/types/chat"

export interface WebSocketMessage {
  type: "message" | "typing" | "connected" | "disconnected" | "error" | "history"

  // Common payload shapes
  data?: ChatMessage | any
  messages?: ChatMessage[]
  agentId?: string

  error?: string
}

export class MatrixWebSocket {
  private ws: WebSocket | null = null
  private url: string = ""
  private token: string = ""
  private wsUrl: string = ""
  private onMessageCallback: ((..._args: [WebSocketMessage]) => void) | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private intentionalDisconnect = false
  private callbacks: Map<string, (..._args: [WebSocketMessage]) => void> = new Map()

  constructor() {}

  connect(
    apiUrl: string,
    token: string,
    onMessage?: (..._args: [WebSocketMessage]) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.intentionalDisconnect = false
      this.url = apiUrl.replace(/^http/, "ws")
      this.token = token
      this.onMessageCallback = onMessage ?? null

      const wsUrl = `${this.url}/ws/matrix?token=${token}`
      const previousWsUrl = this.wsUrl

      if (
        this.ws &&
        (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)
      ) {
        if (previousWsUrl === wsUrl) {
          this.wsUrl = wsUrl
          resolve()
          return
        }
        this.disconnect()
      }

      this.wsUrl = wsUrl

      try {
        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          console.log("WebSocket connected")
          this.reconnectAttempts = 0
          this.emitCallback("connected", { type: "connected" })
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.emitCallback("message", message)
            if (this.onMessageCallback) {
              this.onMessageCallback(message)
            }
          } catch (e) {
            console.error("Failed to parse WebSocket message:", e)
          }
        }

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error)
          this.emitCallback("error", {
            type: "error",
            error: "WebSocket connection error",
          })
          reject(error)
        }

        this.ws.onclose = () => {
          console.log("WebSocket disconnected")
          this.ws = null
          this.emitCallback("disconnected", { type: "disconnected" })
          if (!this.intentionalDisconnect) {
            this.attemptReconnect()
          }
        }
      } catch (error) {
        console.error("Failed to create WebSocket:", error)
        reject(error)
      }
    })
  }

  sendMessage(content: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected")
      return
    }

    this.ws.send(
      JSON.stringify({
        type: "message",
        content,
        timestamp: new Date().toISOString(),
      })
    )
  }

  sendTyping(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return
    }

    this.ws.send(
      JSON.stringify({
        type: "typing",
      })
    )
  }

  disconnect(): void {
    this.intentionalDisconnect = true
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }

  on(event: string, callback: (..._args: [WebSocketMessage]) => void): void {
    this.callbacks.set(event, callback)
  }

  private emitCallback(event: string, data: WebSocketMessage): void {
    const callback = this.callbacks.get(event)
    if (callback) {
      callback(data)
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.url && this.token) {
      this.reconnectAttempts++
      console.log(
        `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      )
      const callback = this.onMessageCallback
      setTimeout(() => {
        this.connect(this.url, this.token, callback ?? undefined).catch((error) => {
          console.error("Reconnection failed:", error)
        })
      }, this.reconnectDelay)
    }
  }
}

export const matrixWebSocket = new MatrixWebSocket()
