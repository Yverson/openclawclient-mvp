import { useEffect, useRef } from "react"
import { useChatStore } from "@/store/chatStore"
import { matrixWebSocket } from "@/services/websocket"
import { useAuth } from "@/hooks/useAuth"
import { apiClient } from "@/services/api"

const POLL_AFTER_SEND_MS = 2500
const POLL_INTERVAL_MS = 2000
const MAX_POLL_ATTEMPTS = 5

export const useChat = () => {
  const {
    messages,
    isLoading,
    error,
    isConnected,
    typingIndicator,
    addMessage,
    setError,
    setMessages,
  } = useChatStore()
  const { apiUrl, token } = useAuth()
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const refreshHistory = async () => {
    if (!apiUrl || !token) return
    try {
      apiClient.setBaseUrl(apiUrl)
      const response = await apiClient.get("/api/chat/history")
      if (response.data.messages?.length) {
        setMessages(response.data.messages)
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current)
    }
  }, [])

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

    // Fallback: poll history in case WebSocket misses the response
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current)
    let attempts = 0
    const schedulePoll = () => {
      pollTimerRef.current = setTimeout(async () => {
        await refreshHistory()
        attempts++
        if (attempts < MAX_POLL_ATTEMPTS) {
          schedulePoll()
        }
      }, attempts === 0 ? POLL_AFTER_SEND_MS : POLL_INTERVAL_MS)
    }
    schedulePoll()
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
