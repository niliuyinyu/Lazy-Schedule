import { Capacitor } from '@capacitor/core'

export function useUpdater() {
  async function checkForUpdates() {
    if (!Capacitor.isNativePlatform()) {
      return { hasUpdate: false }
    }
    return { hasUpdate: false }
  }

  async function downloadUpdate() {
    console.log('Auto-update not configured')
  }

  async function installUpdate() {
    console.log('Auto-update not configured')
  }

  async function checkAndInstall() {
    return { updated: false }
  }

  return {
    checkForUpdates,
    downloadUpdate,
    installUpdate,
    checkAndInstall
  }
}
