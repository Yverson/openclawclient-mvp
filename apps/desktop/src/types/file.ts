export interface FileResult {
  id: string
  name: string
  path: string
  type: "file" | "directory"
  size: number
  mimeType?: string
  modifiedAt: string
  preview?: string
}

export interface FileSearchQuery {
  query: string
  type?: string
  from?: string
  to?: string
}

export interface FileState {
  results: FileResult[]
  query: FileSearchQuery
  isLoading: boolean
  error: string | null
  selectedFile: FileResult | null
}
