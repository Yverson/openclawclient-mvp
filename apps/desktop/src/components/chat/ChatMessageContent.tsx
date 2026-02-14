import React from "react"
import { MarkdownMessage } from "@/components/chat/MarkdownMessage"
import type { ChatMessage } from "@/types/chat"

const REPLY_TO_REGEX = /^\[\[reply_to:\s*([^\]]+)\]\]\s*\n?/i

interface ChatMessageContentProps {
  content: string
  messages: ChatMessage[]
  sender: "user" | "assistant"
}

/**
 * Parse [[reply_to: chat-xxx]] and render as a quoted reply block.
 * The rest of the content is rendered as the main message.
 */
export const ChatMessageContent: React.FC<ChatMessageContentProps> = ({
  content,
  messages,
  sender,
}) => {
  const match = content.match(REPLY_TO_REGEX)
  let replyToId: string | null = null
  let mainContent = content

  if (match) {
    replyToId = match[1].trim()
    mainContent = content.slice(match[0].length).trim()
  }

  const repliedMessage = replyToId
    ? messages.find(
        (m) =>
          m.id === replyToId ||
          m.id?.includes?.(replyToId) ||
          replyToId?.includes?.(m.id ?? "")
      )
    : null

  return (
    <div className="flex flex-col gap-2">
      {replyToId && sender === "assistant" && (
        <div className="rounded-md border border-slate-600 bg-slate-800/60 px-3 py-2 text-xs text-slate-400">
          <span className="font-medium text-slate-500">Réponse à :</span>
          <p className="mt-1 line-clamp-2 text-slate-300">
            {repliedMessage?.content ?? "Message précédent"}
          </p>
        </div>
      )}
      {mainContent ? (
        <MarkdownMessage content={mainContent} />
      ) : repliedMessage ? null : (
        <span className="text-slate-400">—</span>
      )}
    </div>
  )
}
