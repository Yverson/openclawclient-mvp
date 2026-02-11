import { create } from "zustand"
import type { Email, MailFilter } from "@/types/mail"
import { mailService } from "@/services/mail"

interface MailStore {
  emails: Email[]
  filter: MailFilter
  isLoading: boolean
  error: string | null
  selectedEmail: Email | null

  setEmails: (emails: Email[]) => void
  setFilter: (filter: MailFilter) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSelectedEmail: (email: Email | null) => void

  searchEmails: (filter: MailFilter) => Promise<void>
  markAsRead: (emailId: string) => Promise<void>
  deleteEmail: (emailId: string) => Promise<void>
  flagEmail: (emailId: string, flagged: boolean) => Promise<void>
}

export const useMailStore = create<MailStore>((set) => ({
  emails: [],
  filter: {},
  isLoading: false,
  error: null,
  selectedEmail: null,

  setEmails: (emails) => set({ emails }),
  setFilter: (filter) => set({ filter }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setSelectedEmail: (email) => set({ selectedEmail: email }),

  searchEmails: async (filter) => {
    set({ isLoading: true, error: null })
    try {
      const emails = await mailService.listEmails(filter)
      set({ emails, filter, isLoading: false })
    } catch (error: any) {
      set({ error: "Failed to search emails", isLoading: false })
    }
  },

  markAsRead: async (emailId) => {
    try {
      await mailService.markAsRead(emailId)
      set((state) => ({
        emails: state.emails.map((e) =>
          e.id === emailId ? { ...e, read: true } : e
        ),
      }))
    } catch (error) {
      set({ error: "Failed to mark email as read" })
    }
  },

  deleteEmail: async (emailId) => {
    try {
      await mailService.deleteEmail(emailId)
      set((state) => ({
        emails: state.emails.filter((e) => e.id !== emailId),
      }))
    } catch (error) {
      set({ error: "Failed to delete email" })
    }
  },

  flagEmail: async (emailId, flagged) => {
    try {
      await mailService.flagEmail(emailId, flagged)
      set((state) => ({
        emails: state.emails.map((e) =>
          e.id === emailId ? { ...e, flagged } : e
        ),
      }))
    } catch (error) {
      set({ error: "Failed to flag email" })
    }
  },
}))
