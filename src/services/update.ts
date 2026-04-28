import { Capacitor } from '@capacitor/core'

const GITHUB_REPO = 'niliuyinyu/Lazy-Schedule'
const CURRENT_VERSION = '1.0.1'

interface ReleaseInfo {
  tag_name: string
  name: string
  html_url: string
  assets: Array<{
    name: string
    browser_download_url: string
    size: number
  }>
}

interface UpdateInfo {
  available: boolean
  currentVersion: string
  latestVersion: string
  downloadUrl: string
  releaseNotes: string
  size: number
}

class UpdateService {
  async getCurrentVersion(): Promise<string> {
    if (Capacitor.isNativePlatform()) {
      try {
        const { App } = await import('@capacitor/app')
        const info = await App.getInfo()
        return info.version || CURRENT_VERSION
      } catch {
        return CURRENT_VERSION
      }
    }
    return CURRENT_VERSION
  }

  async checkForUpdate(): Promise<UpdateInfo> {
    try {
      const currentVer = await this.getCurrentVersion()
      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      )

      if (!response.ok) {
        return {
          available: false,
          currentVersion: currentVer,
          latestVersion: currentVer,
          downloadUrl: '',
          releaseNotes: '',
          size: 0
        }
      }

      const release: ReleaseInfo = await response.json()
      const latestVersion = release.tag_name.replace('v', '')
      const apkAsset = release.assets.find(asset =>
        asset.name.endsWith('.apk')
      )

      const available = this.compareVersions(latestVersion, currentVer) > 0

      return {
        available,
        currentVersion: currentVer,
        latestVersion,
        downloadUrl: apkAsset?.browser_download_url || '',
        releaseNotes: release.name || '',
        size: apkAsset?.size || 0
      }
    } catch (error) {
      console.error('Failed to check for updates:', error)
      return {
        available: false,
        currentVersion: CURRENT_VERSION,
        latestVersion: CURRENT_VERSION,
        downloadUrl: '',
        releaseNotes: '',
        size: 0
      }
    }
  }

  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number)
    const parts2 = v2.split('.').map(Number)

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0
      const p2 = parts2[i] || 0
      if (p1 > p2) return 1
      if (p1 < p2) return -1
    }
    return 0
  }

  async downloadUpdate(downloadUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!Capacitor.isNativePlatform()) {
        return { success: false, error: '只能在App中使用此功能' }
      }

      window.open(downloadUrl, '_blank')

      return { success: true }
    } catch (error) {
      console.error('Failed to download update:', error)
      return { success: false, error: String(error) }
    }
  }

  async openGitHubReleases(): Promise<void> {
    const url = `https://github.com/${GITHUB_REPO}/releases/latest`
    window.open(url, '_blank')
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

export const updateService = new UpdateService()
