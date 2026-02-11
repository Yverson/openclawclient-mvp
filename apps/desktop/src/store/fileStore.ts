import { create } from "zustand"
import type { FileResult, FileSearchQuery } from "@/types/file"
import { fileService } from "@/services/files"

interface FileStore {
  results: FileResult[]
  query: FileSearchQuery
  isLoading: boolean
  error: string | null
  selectedFile: FileResult | null

  setResults: (results: FileResult[]) => void
  setQuery: (query: FileSearchQuery) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSelectedFile: (file: FileResult | null) => void

  searchFiles: (query: FileSearchQuery) => Promise<void>
  openFile: (filePath: string) => Promise<void>
  openInExplorer: (filePath: string) => Promise<void>
}

export const useFileStore = create<FileStore>((set) => ({
  results: [],
  query: { query: "" },
  isLoading: false,
  error: null,
  selectedFile: null,

  setResults: (results) => set({ results }),
  setQuery: (query) => set({ query }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setSelectedFile: (file) => set({ selectedFile: file }),

  searchFiles: async (query) => {
    set({ isLoading: true, error: null })
    try {
      const results = await fileService.search(query)
      set({ results, query, isLoading: false })
    } catch (error: any) {
      set({ error: "Failed to search files", isLoading: false })
    }
  },

  openFile: async (filePath) => {
    try {
      await fileService.openFile(filePath)
    } catch (error) {
      set({ error: "Failed to open file" })
    }
  },

  openInExplorer: async (filePath) => {
    try {
      await fileService.openInExplorer(filePath)
    } catch (error) {
      set({ error: "Failed to open in explorer" })
    }
  },
}))
