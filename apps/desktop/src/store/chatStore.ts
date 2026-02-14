import { create } from "zustand"
import type { ChatMessage } from "@/types/chat"

interface ChatStore {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  isConnected: boolean
  typingIndicator: boolean

  setMessages: (messages: ChatMessage[]) => void
  addMessage: (message: ChatMessage) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setConnected: (connected: boolean) => void
  setTypingIndicator: (typing: boolean) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isLoading: false,
  error: null,
  isConnected: false,
  typingIndicator: false,

  setMessages: (messages) => {
    // Deduplicate by id, keeping the first occurrence
    const seen = new Set<string>()
    const unique = messages.filter((m) => {
      if (seen.has(m.id)) return false
      seen.add(m.id)
      return true
    })
    set({ messages: unique })
  },
  addMessage: (message) =>
    set((state) => {
      // Deduplicate: skip if a message with the same id already exists
      if (state.messages.some((m) => m.id === message.id)) {
        return state
      }
      return { messages: [...state.messages, message] }
    }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setConnected: (connected) => set({ isConnected: connected }),
  setTypingIndicator: (typing) => set({ typingIndicator: typing }),
  clearMessages: () => set({ messages: [] }),
}))
