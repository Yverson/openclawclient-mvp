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
  upsertMessage: (message: ChatMessage) => void
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

    const compacted = unique.reduce<ChatMessage[]>((acc, current) => {
      const last = acc[acc.length - 1]
      if (
        last &&
        last.sender === "assistant" &&
        current.sender === "assistant" &&
        typeof last.content === "string" &&
        typeof current.content === "string"
      ) {
        const lastTrimmed = last.content.trim()
        const currentTrimmed = current.content.trim()
        const looksLikeContinuation =
          (currentTrimmed.length >= lastTrimmed.length &&
            currentTrimmed.startsWith(lastTrimmed)) ||
          (lastTrimmed.length >= currentTrimmed.length &&
            lastTrimmed.startsWith(currentTrimmed))

        if (looksLikeContinuation) {
          acc[acc.length - 1] = {
            ...last,
            ...current,
            content: current.content,
          }
          return acc
        }
      }

      acc.push(current)
      return acc
    }, [])

    set({ messages: compacted })
  },
  addMessage: (message) =>
    set((state) => {
      // Deduplicate: skip if a message with the same id already exists
      if (state.messages.some((m) => m.id === message.id)) {
        return state
      }
      return { messages: [...state.messages, message] }
    }),
  upsertMessage: (message) =>
    set((state) => {
      const existingIndex = state.messages.findIndex((m) => m.id === message.id)
      if (existingIndex >= 0) {
        const next = state.messages.slice()
        next[existingIndex] = { ...next[existingIndex], ...message }
        return { messages: next }
      }

      const lastIndex = state.messages.length - 1
      const last = lastIndex >= 0 ? state.messages[lastIndex] : null
      if (
        last &&
        last.sender === "assistant" &&
        message.sender === "assistant" &&
        typeof last.content === "string" &&
        typeof message.content === "string"
      ) {
        const lastTrimmed = last.content.trim()
        const nextTrimmed = message.content.trim()

        const looksLikeContinuation =
          (nextTrimmed.length >= lastTrimmed.length && nextTrimmed.startsWith(lastTrimmed)) ||
          (lastTrimmed.length >= nextTrimmed.length && lastTrimmed.startsWith(nextTrimmed))

        if (looksLikeContinuation) {
          const next = state.messages.slice()
          next[lastIndex] = {
            ...last,
            content: message.content,
            timestamp: message.timestamp || last.timestamp,
            read: message.read ?? last.read,
          }
          return { messages: next }
        }
      }

      return { messages: [...state.messages, message] }
    }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setConnected: (connected) => set({ isConnected: connected }),
  setTypingIndicator: (typing) => set({ typingIndicator: typing }),
  clearMessages: () => set({ messages: [] }),
}))
