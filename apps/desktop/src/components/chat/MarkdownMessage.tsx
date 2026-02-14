import React, { useMemo, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"
import rehypeHighlight from "rehype-highlight"
import rehypeSanitize from "rehype-sanitize"

import { markdownSchema } from "@/components/chat/markdownSchema"
import { MermaidBlock } from "@/components/chat/MermaidBlock"

type MarkdownMessageProps = {
  content: string
}

function isCodeFence(
  inline: boolean,
  className: string | undefined
): { isFence: boolean; language?: string } {
  if (inline) return { isFence: false }
  if (!className) return { isFence: true }
  const match = /language-([\w-]+)/.exec(className)
  return { isFence: true, language: match?.[1] }
}

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content }) => {
  // Normalize nullish content
  const safeContent = content ?? ""

  // Keep remark/rehype arrays stable
  const remarkPlugins = useMemo(() => [remarkGfm, remarkBreaks], [])
  const rehypePlugins = useMemo(
    () => [rehypeHighlight, [rehypeSanitize, markdownSchema] as any],
    []
  )

  return (
    <div className="chat-markdown">
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        // Prevent link target=_blank without rel
        components={{
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          ),

          pre: ({ children }) => <>{children}</>,

          // react-markdown passes extra props (incl. `inline`) that are not in the DOM typings.
          // We keep this loosely typed to avoid TS friction.
          code: ({ inline, className, children }: any) => {
            const text = String(children ?? "")

            // Inline code
            if (inline) {
              return (
                <code className="chat-inline-code">{text.replace(/\n$/, "")}</code>
              )
            }

            const { language } = isCodeFence(false, className)
            const code = text.replace(/\n$/, "")

            // Mermaid fenced block
            if (language === "mermaid") {
              return <MermaidBlock code={code} />
            }

            return <CodeBlock code={code} language={language} className={className} />
          },

          table: ({ children }) => (
            <div className="chat-table-wrapper">{children}</div>
          ),
        }}
      >
        {safeContent}
      </ReactMarkdown>
    </div>
  )
}

const CodeBlock: React.FC<{
  code: string
  language?: string
  className?: string
}> = ({ code, language, className }) => {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      // ignore
    }
  }

  return (
    <div className="chat-codeblock">
      <div className="chat-codeblock__header">
        <span className="chat-codeblock__lang">{language ?? "code"}</span>
        <button
          type="button"
          className="chat-codeblock__copy"
          onClick={onCopy}
          aria-label="Copy code"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="chat-codeblock__pre">
        <code className={className}>{code}</code>
      </pre>
    </div>
  )
}
