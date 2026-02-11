export interface ChatMessage {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: string
  read: boolean
  attachments?: ChatAttachment[]
  codeBlock?: CodeBlock
}

export interface ChatAttachment {
  filename: string
  url: string
  type: string
  size: number
}

export interface CodeBlock {
  language: string
  code: string
}

export interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  isConnected: boolean
  typingIndicator: boolean
}
