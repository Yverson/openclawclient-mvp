import { useEffect } from "react"
import { useChatStore } from "@/store/chatStore"
import { matrixWebSocket } from "@/services/websocket"
import { useAuth } from "@/hooks/useAuth"
import { apiClient } from "@/services/api"

/**
 * Maintains the WebSocket connection as long as the user is authenticated.
 * Mounted in ProtectedLayout so messages are received in real-time even when
 * the user is on Dashboard, Mail, etc. — not just on the Chat page.
 */
export const ChatConnectionManager: React.FC = () => {
  const { token, apiUrl } = useAuth()
  const {
    addMessage,
    setMessages,
    setError,
    setConnected,
    setTypingIndicator,
  } = useChatStore()

  useEffect(() => {
    if (!token || !apiUrl) return

    apiClient.setBaseUrl(apiUrl)

    const loadHistory = async () => {
      try {
        const response = await apiClient.get("/api/chat/history")
        if (response.data.messages) {
          setMessages(response.data.messages)
        }
      } catch (err) {
        console.error("Failed to load chat history:", err)
      }
    }

    loadHistory()

    matrixWebSocket
      .connect(apiUrl, token, (message) => {
        if (message.type === "message" && message.data) {
          addMessage(message.data)
        } else if (message.type === "history" && message.messages) {
          setMessages(message.messages)
        } else if (message.type === "typing") {
          setTypingIndicator(true)
          setTimeout(() => setTypingIndicator(false), 3000)
        } else if (message.type === "connected") {
          setError(null)
          setConnected(true)
          if (message.agentId) {
            console.log(`🤖 Connected to agent: ${message.agentId}`)
          }
        } else if (message.type === "disconnected") {
          setConnected(false)
        } else if (message.type === "error") {
          setError(message.error || "WebSocket error")
        }
      })
      .catch((err) => {
        console.error("Failed to connect to chat:", err)
        setError("Failed to connect to chat")
      })

    return () => {
      matrixWebSocket.disconnect()
      setConnected(false)
    }
  }, [token, apiUrl, addMessage, setMessages, setError, setConnected, setTypingIndicator])

  return null
}
