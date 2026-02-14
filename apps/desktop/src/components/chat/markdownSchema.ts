import { defaultSchema } from "hast-util-sanitize"
import type { Schema } from "hast-util-sanitize"

// Allowlist schema for chat Markdown rendering.
// Goal: support common Markdown/GFM features while preventing XSS.
export const markdownSchema: Schema = {
  ...defaultSchema,
  tagNames: Array.from(
    new Set([
      ...(defaultSchema.tagNames ?? []),
      // GFM / Markdown
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "del",
      "input",
      // Syntax highlighting wrappers (highlight.js)
      "span",
    ])
  ),
  attributes: {
    ...(defaultSchema.attributes ?? {}),

    // Links
    a: [
      ...(defaultSchema.attributes?.a ?? []),
      "href",
      "title",
      "target",
      "rel",
    ],

    // Images disabled by default (can be enabled later if needed)

    // Tables
    table: ["className"],
    thead: ["className"],
    tbody: ["className"],
    tr: ["className"],
    th: ["className", "align"],
    td: ["className", "align"],

    // Task lists (GFM)
    input: ["type", "checked", "disabled"],

    // highlight.js
    span: ["className"],
    code: ["className"],
    pre: ["className"],
  },
  protocols: {
    ...(defaultSchema.protocols ?? {}),
    href: ["http", "https", "mailto"],
  },
}
