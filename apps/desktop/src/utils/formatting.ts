import { formatDistanceToNow, format, parseISO } from "date-fns"

export const formatDate = (date: string | Date): string => {
  try {
    const d = typeof date === "string" ? parseISO(date) : date
    return format(d, "MMM d, yyyy")
  } catch {
    return "Invalid date"
  }
}

export const formatTime = (date: string | Date): string => {
  try {
    const d = typeof date === "string" ? parseISO(date) : date
    return format(d, "HH:mm")
  } catch {
    return "Invalid time"
  }
}

export const formatDatetime = (date: string | Date): string => {
  try {
    const d = typeof date === "string" ? parseISO(date) : date
    return format(d, "MMM d, yyyy HH:mm")
  } catch {
    return "Invalid datetime"
  }
}

export const formatRelativeTime = (date: string | Date): string => {
  try {
    const d = typeof date === "string" ? parseISO(date) : date
    return formatDistanceToNow(d, { addSuffix: true })
  } catch {
    return "Unknown time"
  }
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B"

  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

export const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) {
    return `${days}d ${hours}h`
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export const truncateText = (text: string, length: number): string => {
  if (text.length <= length) return text
  return text.slice(0, length) + "..."
}

export const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toFixed(decimals)
}

export const formatPercent = (value: number, total: number): string => {
  const percent = total > 0 ? (value / total) * 100 : 0
  return `${formatNumber(percent, 1)}%`
}
