import { useEffect } from "react"
import { useChatStore } from "@/store/chatStore"
import { matrixWebSocket } from "@/services/websocket"
import { useAuth } from "./useAuth"
import { apiClient } from "@/services/api"

export const useChat = () => {
  const {
    messages,
    isLoading,
    error,
    isConnected,
    typingIndicator,
    addMessage,
    setMessages,
    setError,
    setConnected,
    setTypingIndicator,
  } = useChatStore()

  const { token, apiUrl } = useAuth()

  // Load chat history on mount
  const loadHistory = async () => {
    try {
      if (!apiUrl || !token) return
      
      apiClient.setBaseUrl(apiUrl)
      const response = await apiClient.get("/api/chat/history")
      if (response.data.messages) {
        setMessages(response.data.messages)
      }
    } catch (error) {
      console.error("Failed to load chat history:", error)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [apiUrl, token])

  useEffect(() => {
    if (!token || !apiUrl) return

    matrixWebSocket
      .connect(apiUrl, token, (message) => {
        if (message.type === "message" && message.data) {
          addMessage(message.data)
        } else if (message.type === "history" && message.messages) {
          // Load chat history from gateway
          setMessages(message.messages)
        } else if (message.type === "typing") {
          setTypingIndicator(true)
          setTimeout(() => setTypingIndicator(false), 3000)
        } else if (message.type === "connected") {
          // Clear any previous connection error once the socket is up
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
    
    // Add user message to chat
    const userMessage = {
      id: `msg-${Date.now()}`,
      content,
      sender: "user" as const,
      timestamp: new Date().toISOString(),
      read: true,
    }
    addMessage(userMessage)
    
    // Send to backend
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
