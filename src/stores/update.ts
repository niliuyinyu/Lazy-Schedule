import { defineStore } from 'pinia'
import { ref } from 'vue'
import { updateService } from '@/services/update'

export const useUpdateStore = defineStore('update', () => {
  const isChecking = ref(false)
  const updateAvailable = ref(false)
  const currentVersion = ref('')
  const latestVersion = ref('')
  const downloadUrl = ref('')
  const releaseNotes = ref('')
  const fileSize = ref(0)
  const lastCheckTime = ref<Date | null>(null)
  const error = ref<string | null>(null)

  async function checkForUpdate() {
    isChecking.value = true
    error.value = null

    try {
      const result = await updateService.checkForUpdate()
      updateAvailable.value = result.available
      currentVersion.value = result.currentVersion
      latestVersion.value = result.latestVersion
      downloadUrl.value = result.downloadUrl
      releaseNotes.value = result.releaseNotes
      fileSize.value = result.size
      lastCheckTime.value = new Date()
    } catch (e) {
      error.value = String(e)
    } finally {
      isChecking.value = false
    }
  }

  async function downloadUpdate() {
    if (!downloadUrl.value) return { success: false, error: '没有可用的更新' }
    return await updateService.downloadUpdate(downloadUrl.value)
  }

  function openGitHubReleases() {
    updateService.openGitHubReleases()
  }

  function formatSize() {
    return updateService.formatSize(fileSize.value)
  }

  return {
    isChecking,
    updateAvailable,
    currentVersion,
    latestVersion,
    downloadUrl,
    releaseNotes,
    fileSize,
    lastCheckTime,
    error,
    checkForUpdate,
    downloadUpdate,
    openGitHubReleases,
    formatSize
  }
})
