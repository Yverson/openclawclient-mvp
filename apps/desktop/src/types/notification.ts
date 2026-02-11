export type NotificationType = "critical" | "warning" | "info" | "success"

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
  serverId?: string
  actionUrl?: string
}

export interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isVisible: boolean
}
