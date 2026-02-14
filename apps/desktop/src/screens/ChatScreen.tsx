import React, { useState, useRef, useEffect } from "react"
import { Send, AlertCircle, Wifi, WifiOff, Wrench } from "lucide-react"
import { Card, CardContent } from "@/components/Card"
import { Input } from "@/components/Input"
import { Button } from "@/components/Button"
import { Spinner } from "@/components/Spinner"
import { useChat } from "@/hooks/useChat"
import { useAuth } from "@/hooks/useAuth"
import { formatTime } from "@/utils/formatting"
import { ChatMessageContent } from "@/components/chat/ChatMessageContent"

export const ChatScreen: React.FC = () => {
  const {
    messages,
    isLoading,
    error,
    isConnected,
    typingIndicator,
    sendMessage,
  } = useChat()
  const { user } = useAuth()

  const [inputValue, setInputValue] = useState("")
  const assistantLabel = user?.name ? `${user.name}'s Technical Assistant` : "Technical Assistant"
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      sendMessage(inputValue)
      setInputValue("")
    }
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Connection Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-emerald-200">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-200">Disconnected</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 rounded-lg bg-red-900/20 border border-red-800 flex gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {/* Messages Container */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-slate-400">No messages yet. Start a conversation!</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.sender === "assistant" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-600 flex items-center justify-center">
                      <Wrench className="w-4 h-4 text-slate-300" />
                    </div>
                  )}
                  <div
                    className={`flex flex-col max-w-xs lg:max-w-md ${
                      message.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <p className="text-xs font-medium text-slate-400 mb-1">
                      {message.sender === "user" ? "You" : assistantLabel}
                    </p>
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        message.sender === "user"
                          ? "bg-red-700/90 text-white rounded-br-none"
                          : "bg-slate-700 text-slate-100 rounded-bl-none"
                      }`}
                    >
                      <div className="text-sm break-words">
                        <ChatMessageContent
                          content={message.content}
                          messages={messages}
                          sender={message.sender}
                        />
                      </div>
                      <p className="text-xs opacity-70 mt-1">
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                  {message.sender === "user" && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-semibold">
                      {user?.name?.charAt(0) ?? "U"}
                    </div>
                  )}
                </div>
              ))}

              {typingIndicator && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-600 flex items-center justify-center">
                    <Wrench className="w-4 h-4 text-slate-300" />
                  </div>
                  <div className="flex flex-col items-start">
                    <p className="text-xs font-medium text-slate-400 mb-1">
                      {assistantLabel}
                    </p>
                    <div className="bg-slate-700 text-slate-100 px-4 py-2 rounded-lg rounded-bl-none">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex justify-center">
                  <Spinner size="sm" />
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          placeholder="Type your message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={!isConnected || isLoading}
          className="flex-1"
          title="Saisir votre message"
        />
        <Button
          type="submit"
          variant="primary"
          disabled={!isConnected || isLoading || !inputValue.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}
