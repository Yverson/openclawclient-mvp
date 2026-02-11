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

  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setConnected: (connected) => set({ isConnected: connected }),
  setTypingIndicator: (typing) => set({ typingIndicator: typing }),
  clearMessages: () => set({ messages: [] }),
}))
