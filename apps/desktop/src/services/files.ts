import type { FileResult, FileSearchQuery } from "@/types/file"

// Mock implementation for file search
// In production, this would use Electron IPC to access the file system
export class FileService {
  private mockFiles: FileResult[] = [
    {
      id: "1",
      name: "project-proposal.pdf",
      path: "/home/user/Documents/project-proposal.pdf",
      type: "file",
      size: 2048000,
      mimeType: "application/pdf",
      modifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: "2",
      name: "quarterly-report.xlsx",
      path: "/home/user/Documents/quarterly-report.xlsx",
      type: "file",
      size: 512000,
      mimeType: "application/vnd.ms-excel",
      modifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
    {
      id: "3",
      name: "meeting-notes.md",
      path: "/home/user/Documents/meeting-notes.md",
      type: "file",
      size: 45000,
      mimeType: "text/markdown",
      modifiedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: "4",
      name: "code-backup",
      path: "/home/user/Documents/code-backup",
      type: "directory",
      size: 0,
      modifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    },
    {
      id: "5",
      name: "screenshot-2026-02-11.png",
      path: "/home/user/Pictures/screenshot-2026-02-11.png",
      type: "file",
      size: 3456000,
      mimeType: "image/png",
      modifiedAt: new Date(Date.now() - 1000 * 60).toISOString(),
    },
  ]

  async search(query: FileSearchQuery): Promise<FileResult[]> {
    let results = [...this.mockFiles]

    if (query.query) {
      results = results.filter((f) =>
        f.name.toLowerCase().includes(query.query.toLowerCase())
      )
    }

    if (query.type) {
      results = results.filter((f) =>
        f.mimeType?.includes(query.type!) ||
        f.name.endsWith(query.type!)
      )
    }

    if (query.from) {
      const fromDate = new Date(query.from)
      results = results.filter((f) => new Date(f.modifiedAt) >= fromDate)
    }

    if (query.to) {
      const toDate = new Date(query.to)
      results = results.filter((f) => new Date(f.modifiedAt) <= toDate)
    }

    return results
  }

  async openFile(filePath: string): Promise<void> {
    console.log("Opening file:", filePath)
    // In production, this would use Electron IPC to open the file
  }

  async openInExplorer(filePath: string): Promise<void> {
    console.log("Opening in explorer:", filePath)
    // In production, this would use Electron IPC to open the file explorer
  }

  async getFilePreview(filePath: string): Promise<string | null> {
    // In production, this would load a preview of the file
    return null
  }
}

export const fileService = new FileService()
