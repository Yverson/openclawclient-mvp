import { useEffect } from "react"
import { useChatStore } from "@/store/chatStore"
import { matrixWebSocket } from "@/services/websocket"
import { useAuth } from "./useAuth"

export const useChat = () => {
  const {
    messages,
    isLoading,
    error,
    isConnected,
    typingIndicator,
    addMessage,
    setError,
    setConnected,
    setTypingIndicator,
  } = useChatStore()

  const { token, apiUrl } = useAuth()

  useEffect(() => {
    if (!token || !apiUrl) return

    matrixWebSocket
      .connect(apiUrl, token, (message) => {
        if (message.type === "message" && message.data) {
          addMessage(message.data)
        } else if (message.type === "typing") {
          setTypingIndicator(true)
          setTimeout(() => setTypingIndicator(false), 3000)
        } else if (message.type === "connected") {
          setConnected(true)
        } else if (message.type === "disconnected") {
          setConnected(false)
        } else if (message.type === "error") {
          setError(message.error || "WebSocket error")
        }
      })
      .catch((error) => {
        console.error("Failed to connect to chat:", error)
        setError("Failed to connect to chat")
      })

    return () => {
      matrixWebSocket.disconnect()
      setConnected(false)
    }
  }, [token, apiUrl, addMessage, setError, setConnected, setTypingIndicator])

  const sendMessage = (content: string) => {
    if (!matrixWebSocket.isConnected()) {
      setError("Chat is not connected")
      return
    }
    matrixWebSocket.sendMessage(content)
  }

  return {
    messages,
    isLoading,
    error,
    isConnected,
    typingIndicator,
    sendMessage,
  }
}
