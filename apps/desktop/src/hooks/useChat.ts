import { useChatStore } from "@/store/chatStore"
import { matrixWebSocket } from "@/services/websocket"

export const useChat = () => {
  const {
    messages,
    isLoading,
    error,
    isConnected,
    typingIndicator,
    addMessage,
    setError,
  } = useChatStore()

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
