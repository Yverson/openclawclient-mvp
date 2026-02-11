import { create } from "zustand"

type CurrentScreen = "dashboard" | "mail" | "files" | "chat" | "settings"

interface UIStore {
  currentScreen: CurrentScreen
  sidebarOpen: boolean
  notificationsOpen: boolean
  darkMode: boolean

  setCurrentScreen: (screen: CurrentScreen) => void
  setSidebarOpen: (open: boolean) => void
  setNotificationsOpen: (open: boolean) => void
  setDarkMode: (dark: boolean) => void
  toggleSidebar: () => void
  toggleNotifications: () => void
  toggleDarkMode: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  currentScreen: "dashboard",
  sidebarOpen: true,
  notificationsOpen: false,
  darkMode: true,

  setCurrentScreen: (screen) => set({ currentScreen: screen }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setNotificationsOpen: (open) => set({ notificationsOpen: open }),
  setDarkMode: (dark) => set({ darkMode: dark }),
  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleNotifications: () =>
    set((state) => ({ notificationsOpen: !state.notificationsOpen })),
  toggleDarkMode: () =>
    set((state) => ({ darkMode: !state.darkMode })),
}))
