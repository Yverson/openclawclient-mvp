import React from "react"
import { createBrowserRouter, Navigate } from "react-router-dom"
import { LoginScreen } from "@/screens/LoginScreen"
import { DashboardScreen } from "@/screens/DashboardScreen"
import { MailFilterScreen } from "@/screens/MailFilterScreen"
import { FileSearchScreen } from "@/screens/FileSearchScreen"
import { ChatScreen } from "@/screens/ChatScreen"
import { SettingsScreen } from "@/screens/SettingsScreen"
import { ProtectedLayout } from "@/layouts/ProtectedLayout"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/login",
    element: <LoginScreen />,
  },
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      {
        path: "dashboard",
        element: <DashboardScreen />,
      },
      {
        path: "mail",
        element: <MailFilterScreen />,
      },
      {
        path: "files",
        element: <FileSearchScreen />,
      },
      {
        path: "chat",
        element: <ChatScreen />,
      },
      {
        path: "settings",
        element: <SettingsScreen />,
      },
      {
        path: "*",
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
])
