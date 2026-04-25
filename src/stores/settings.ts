import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Settings, LLMConfig, StorageConfig } from '@/types'
import { storageService } from '@/services/storage'

const DEFAULT_SETTINGS: Settings = {
  scanInterval: 2,
  autoArchive: true,
  archiveDays: 30,
  reminderMinutes: 15,
  dailyReport: true,
  dailyReportTime: '21:00',
  mapEnabled: false,
  mapApp: 'amap',
  llmProvider: 'siliconflow',
  theme: 'light',
  language: 'zh-CN'
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings>({ ...DEFAULT_SETTINGS })
  const llmConfig = ref<LLMConfig | null>(null)
  const storageConfig = ref<StorageConfig | null>(null)
  const isLoaded = ref(false)

  async function loadSettings() {
    try {
      const saved = localStorage.getItem('app-settings')
      if (saved) {
        settings.value = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
      }
      const savedLLM = localStorage.getItem('llm-config')
      if (savedLLM) {
        llmConfig.value = JSON.parse(savedLLM)
      }
      const savedStorage = localStorage.getItem('storage-config')
      if (savedStorage) {
        storageConfig.value = JSON.parse(savedStorage)
      }

      const apiKey = localStorage.getItem('llm-api-key')
      if (apiKey) {
        llmConfig.value = {
          id: 'siliconflow',
          providerName: '硅基流动',
          apiKey: apiKey,
          model: 'Qwen/Qwen2-VL-72B-Instruct',
          isActive: true
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
    isLoaded.value = true
  }

  async function saveSettings() {
    localStorage.setItem('app-settings', JSON.stringify(settings.value))
  }

  async function updateSettings(newSettings: Partial<Settings>) {
    settings.value = { ...settings.value, ...newSettings }
    await saveSettings()
  }

  async function saveLLMApiKey(apiKey: string) {
    localStorage.setItem('llm-api-key', apiKey)
    llmConfig.value = {
      id: 'siliconflow',
      providerName: '硅基流动',
      apiKey: apiKey,
      model: 'Qwen/Qwen2-VL-72B-Instruct',
      isActive: true
    }
  }

  async function saveStorageConfig(config: StorageConfig) {
    storageConfig.value = config
    localStorage.setItem('storage-config', JSON.stringify(config))
    if (config.isActive) {
      await storageService.configure(config)
    }
  }

  async function testStorageConnection(): Promise<boolean> {
    if (!storageConfig.value) return false
    return await storageService.testConnection(storageConfig.value)
  }

  return {
    settings,
    llmConfig,
    storageConfig,
    isLoaded,
    loadSettings,
    updateSettings,
    saveLLMApiKey,
    saveStorageConfig,
    testStorageConnection
  }
})
