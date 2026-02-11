import React, { useState, useEffect } from "react"
import { FileText, Folder, Image, File, FolderOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Input } from "@/components/Input"
import { Button } from "@/components/Button"
import { Spinner, LoadingSkeleton } from "@/components/Spinner"
import { useFileStore } from "@/store/fileStore"
import { formatFileSize, formatRelativeTime } from "@/utils/formatting"

const getFileIcon = (mimeType?: string, type?: string) => {
  if (type === "directory") return <Folder className="w-5 h-5 text-blue-400" />
  if (!mimeType) return <File className="w-5 h-5 text-slate-400" />

  if (mimeType.startsWith("image/")) return <Image className="w-5 h-5 text-purple-400" />
  if (mimeType.startsWith("text/")) return <FileText className="w-5 h-5 text-slate-300" />
  return <File className="w-5 h-5 text-slate-400" />
}

export const FileSearchScreen: React.FC = () => {
  const {
    results,
    query,
    isLoading,
    error,
    selectedFile,
    searchFiles,
    openFile,
    openInExplorer,
    setSelectedFile,
  } = useFileStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [fileType, setFileType] = useState("")

  useEffect(() => {
    if (searchQuery) {
      searchFiles({
        query: searchQuery,
        type: fileType,
      })
    }
  }, [searchQuery, fileType, searchFiles])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery) {
      searchFiles({
        query: searchQuery,
        type: fileType,
      })
    }
  }

  if (isLoading && results.length === 0) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-12" />
        <LoadingSkeleton className="h-40" />
        <LoadingSkeleton className="h-40" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg bg-red-900/20 border border-red-800 text-red-200">
          {error}
        </div>
      )}

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search Files</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-300 block mb-2">
                  File Name
                </label>
                <Input
                  placeholder="Search by filename..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">
                  File Type
                </label>
                <Input
                  placeholder=".pdf, .xlsx, etc..."
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" variant="primary">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* File List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Results ({results.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                  <p className="text-slate-400">
                    {searchQuery ? "No files found" : "Enter a search term"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {results.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => setSelectedFile(file)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedFile?.id === file.id
                          ? "border-primary-600 bg-primary-900/20"
                          : "border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {getFileIcon(file.mimeType, file.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {file.path}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-slate-400">
                              {formatFileSize(file.size)}
                            </span>
                            <span className="text-xs text-slate-500">
                              {formatRelativeTime(file.modifiedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* File Detail */}
        <div className="lg:col-span-1">
          {selectedFile ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">File Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-lg bg-slate-700">
                    {getFileIcon(selectedFile.mimeType, selectedFile.type)}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Name</p>
                  <p className="text-sm font-medium break-all">
                    {selectedFile.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Type</p>
                  <p className="text-sm">
                    {selectedFile.type === "directory" ? "Folder" : "File"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Size</p>
                  <p className="text-sm">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Modified</p>
                  <p className="text-sm">
                    {formatRelativeTime(selectedFile.modifiedAt)}
                  </p>
                </div>
                <div className="border-t border-slate-700 pt-4 space-y-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => openFile(selectedFile.path)}
                  >
                    Open File
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => openInExplorer(selectedFile.path)}
                  >
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Show in Folder
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                <p className="text-slate-400">Select a file to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
