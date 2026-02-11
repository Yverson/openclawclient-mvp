export interface Email {
  id: string
  from: string
  to: string[]
  subject: string
  body: string
  bodyPreview: string
  date: string
  read: boolean
  flagged: boolean
  attachments: Attachment[]
}

export interface Attachment {
  filename: string
  size: number
  mimeType: string
}

export interface MailFilter {
  sender?: string
  keyword?: string
  dateFrom?: string
  dateTo?: string
  unreadOnly?: boolean
}

export interface MailState {
  emails: Email[]
  filter: MailFilter
  isLoading: boolean
  error: string | null
  totalCount: number
  selectedEmail: Email | null
}
