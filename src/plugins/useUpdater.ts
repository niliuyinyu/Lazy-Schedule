import { Capacitor } from '@capacitor/core'
import { updateService } from '@/services/update'

export function useUpdater() {
  async function checkForUpdates() {
    if (!Capacitor.isNativePlatform()) {
      return { hasUpdate: false }
    }

    const result = await updateService.checkForUpdate()
    return { hasUpdate: result.available, ...result }
  }

  async function downloadUpdate() {
    const result = await updateService.checkForUpdate()
    if (result.available && result.downloadUrl) {
      return await updateService.downloadUpdate(result.downloadUrl)
    }
    return { success: false, error: '没有可用的更新' }
  }

  async function installUpdate() {
    return await updateService.openGitHubReleases()
  }

  async function checkAndInstall() {
    const updateInfo = await checkForUpdates()
    if (updateInfo.hasUpdate) {
      return { updated: false, hasUpdate: true, updateInfo }
    }
    return { updated: false, hasUpdate: false }
  }

  return {
    checkForUpdates,
    downloadUpdate,
    installUpdate,
    checkAndInstall
  }
}
