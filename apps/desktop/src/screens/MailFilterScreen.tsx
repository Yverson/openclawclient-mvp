import React, { useState, useEffect } from "react"
import { Trash2, Flag, Mail, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Input } from "@/components/Input"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { Spinner, LoadingSkeleton } from "@/components/Spinner"
import { useMailStore } from "@/store/mailStore"
import { formatDate, formatRelativeTime } from "@/utils/formatting"

export const MailFilterScreen: React.FC = () => {
  const {
    emails,
    filter,
    isLoading,
    error,
    selectedEmail,
    searchEmails,
    markAsRead,
    deleteEmail,
    flagEmail,
    setSelectedEmail,
  } = useMailStore()

  const [senderFilter, setSenderFilter] = useState("")
  const [keywordFilter, setKeywordFilter] = useState("")
  const [unreadOnly, setUnreadOnly] = useState(false)

  useEffect(() => {
    searchEmails({
      sender: senderFilter,
      keyword: keywordFilter,
      unreadOnly,
    })
  }, [senderFilter, keywordFilter, unreadOnly, searchEmails])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchEmails({
      sender: senderFilter,
      keyword: keywordFilter,
      unreadOnly,
    })
  }

  if (isLoading && emails.length === 0) {
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

      {/* Filter Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Emails</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">
                  From
                </label>
                <Input
                  placeholder="sender@example.com"
                  value={senderFilter}
                  onChange={(e) => setSenderFilter(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">
                  Keyword
                </label>
                <Input
                  placeholder="Search term..."
                  value={keywordFilter}
                  onChange={(e) => setKeywordFilter(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={unreadOnly}
                    onChange={(e) => setUnreadOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 cursor-pointer"
                  />
                  <span className="text-sm text-slate-300">Unread only</span>
                </label>
              </div>
            </div>
            <Button type="submit" variant="primary">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Emails ({emails.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {emails.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                  <p className="text-slate-400">No emails found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {emails.map((email) => (
                    <div
                      key={email.id}
                      onClick={() => setSelectedEmail(email)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedEmail?.id === email.id
                          ? "border-primary-600 bg-primary-900/20"
                          : "border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm truncate">
                              {email.from}
                            </p>
                            {email.flagged && (
                              <Flag className="w-3 h-3 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm text-slate-300 truncate">
                            {email.subject}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {email.bodyPreview}
                          </p>
                        </div>
                        {!email.read && (
                          <Badge className="bg-primary-600 text-white flex-shrink-0">
                            New
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(email.date)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Email Detail */}
        <div className="lg:col-span-1">
          {selectedEmail ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Email Detail</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">From</p>
                  <p className="text-sm font-medium">{selectedEmail.from}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">To</p>
                  <p className="text-sm">{selectedEmail.to.join(", ")}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Date</p>
                  <p className="text-sm">{formatDate(selectedEmail.date)}</p>
                </div>
                <div className="border-t border-slate-700 pt-4 space-y-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => markAsRead(selectedEmail.id)}
                  >
                    Mark as Read
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      flagEmail(selectedEmail.id, !selectedEmail.flagged)
                    }
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    {selectedEmail.flagged ? "Unflag" : "Flag"}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full"
                    onClick={() => deleteEmail(selectedEmail.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Mail className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                <p className="text-slate-400">Select an email to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
