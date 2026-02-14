import React, { useEffect, useMemo, useState } from "react"
import mermaid from "mermaid"
import DOMPurify from "dompurify"

type MermaidBlockProps = {
  code: string
}

let mermaidInitialized = false

export const MermaidBlock: React.FC<MermaidBlockProps> = ({ code }) => {
  const [svg, setSvg] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  const id = useMemo(
    () => `mermaid-${Math.random().toString(36).slice(2)}-${Date.now()}`,
    []
  )

  useEffect(() => {
    let cancelled = false

    const render = async () => {
      try {
        if (!mermaidInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            theme: "dark",
            securityLevel: "strict",
          })
          mermaidInitialized = true
        }

        const { svg } = await mermaid.render(id, code)

        const sanitized = DOMPurify.sanitize(svg, {
          USE_PROFILES: { svg: true, svgFilters: true },
        })

        if (!cancelled) {
          setSvg(sanitized)
          setError(null)
        }
      } catch (e) {
        if (!cancelled) {
          setSvg("")
          setError(e instanceof Error ? e.message : "Mermaid render error")
        }
      }
    }

    render()

    return () => {
      cancelled = true
    }
  }, [code, id])

  if (error) {
    return (
      <div className="chat-codeblock border border-red-800 bg-red-900/20 rounded-md p-3 text-xs text-red-200">
        <div className="font-semibold mb-1">Mermaid error</div>
        <div className="whitespace-pre-wrap">{error}</div>
      </div>
    )
  }

  if (!svg) {
    return (
      <div className="chat-codeblock rounded-md p-3 text-xs text-slate-300 opacity-70">
        Rendering diagram…
      </div>
    )
  }

  // SVG has been sanitized; safe to inject.
  return (
    <div
      className="chat-mermaid"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
