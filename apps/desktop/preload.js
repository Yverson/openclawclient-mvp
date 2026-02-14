/**
 * Preload script for Electron - minimal bridge when contextIsolation is true.
 * Expose APIs to renderer via contextBridge if needed.
 */
const { contextBridge } = require("electron")

contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
})
