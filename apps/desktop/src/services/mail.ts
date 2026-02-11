import type { Email, MailFilter } from "@/types/mail"

// Mock implementation for local mail filtering
// In production, this would use Electron IPC to access native mail APIs
export class MailService {
  private mockEmails: Email[] = [
    {
      id: "1",
      from: "support@openclaw.dev",
      to: ["user@example.com"],
      subject: "Welcome to OpenClaw Client",
      body: "Thank you for using OpenClaw Client. Here are some getting started tips...",
      bodyPreview: "Thank you for using OpenClaw Client...",
      date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      read: false,
      flagged: false,
      attachments: [],
    },
    {
      id: "2",
      from: "notifications@server.com",
      to: ["user@example.com"],
      subject: "Server Health Check - All Systems Operational",
      body: "Your server health check has completed. All systems are operational.",
      bodyPreview: "Your server health check has completed...",
      date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      read: true,
      flagged: false,
      attachments: [],
    },
    {
      id: "3",
      from: "team@example.com",
      to: ["user@example.com"],
      subject: "Project Update - Phase 3b Complete",
      body: "Phase 3b code generation is complete. All screens have been implemented.",
      bodyPreview: "Phase 3b code generation is complete...",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      read: false,
      flagged: true,
      attachments: [],
    },
  ]

  async listEmails(filter?: MailFilter): Promise<Email[]> {
    let results = [...this.mockEmails]

    if (filter?.sender) {
      results = results.filter((e) =>
        e.from.toLowerCase().includes(filter.sender!.toLowerCase())
      )
    }

    if (filter?.keyword) {
      results = results.filter(
        (e) =>
          e.subject.toLowerCase().includes(filter.keyword!.toLowerCase()) ||
          e.bodyPreview.toLowerCase().includes(filter.keyword!.toLowerCase())
      )
    }

    if (filter?.unreadOnly) {
      results = results.filter((e) => !e.read)
    }

    if (filter?.dateFrom) {
      const from = new Date(filter.dateFrom)
      results = results.filter((e) => new Date(e.date) >= from)
    }

    if (filter?.dateTo) {
      const to = new Date(filter.dateTo)
      results = results.filter((e) => new Date(e.date) <= to)
    }

    return results
  }

  async markAsRead(emailId: string): Promise<void> {
    const email = this.mockEmails.find((e) => e.id === emailId)
    if (email) {
      email.read = true
    }
  }

  async deleteEmail(emailId: string): Promise<void> {
    const index = this.mockEmails.findIndex((e) => e.id === emailId)
    if (index > -1) {
      this.mockEmails.splice(index, 1)
    }
  }

  async flagEmail(emailId: string, flagged: boolean): Promise<void> {
    const email = this.mockEmails.find((e) => e.id === emailId)
    if (email) {
      email.flagged = flagged
    }
  }

  async searchEmails(query: string): Promise<Email[]> {
    return this.listEmails({
      keyword: query,
    })
  }
}

export const mailService = new MailService()
