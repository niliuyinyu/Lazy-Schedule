import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Screenshot, ScreenshotGroup, Category, Tag } from '@/types'
import { screenshotService } from '@/services/screenshot'

export const useScreenshotStore = defineStore('screenshot', () => {
  const screenshots = ref<Screenshot[]>([])
  const groups = ref<ScreenshotGroup[]>([])
  const categories = ref<Category[]>([])
  const tags = ref<Tag[]>([])
  const isLoading = ref(false)
  const isScanning = ref(false)
  const lastScanTime = ref<Date | null>(null)
  const settings = ref<{ mapApp?: string }>({})

  const sortedScreenshots = computed(() => {
    return [...screenshots.value].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  })

  const groupedScreenshots = computed(() => {
    const grouped: Record<string, Screenshot[]> = {}
    for (const shot of screenshots.value) {
      const date = new Date(shot.createdAt).toDateString()
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(shot)
    }
    return grouped
  })

  async function initialize() {
    isLoading.value = true
    try {
      await screenshotService.initialize()
      await loadScreenshots()
      await loadCategories()
      await loadTags()
    } finally {
      isLoading.value = false
    }
  }

  async function loadScreenshots() {
    screenshots.value = await screenshotService.getAllScreenshots()
  }

  async function loadCategories() {
    categories.value = await screenshotService.getCategories()
  }

  async function loadTags() {
    tags.value = await screenshotService.getTags()
  }

  async function scanScreenshots() {
    isScanning.value = true
    try {
      await screenshotService.scanNewScreenshots()
      await loadScreenshots()
      lastScanTime.value = new Date()
    } finally {
      isScanning.value = false
    }
  }

  async function analyzeScreenshot(id: string) {
    await screenshotService.analyzeScreenshot(id)
    await loadScreenshots()
  }

  async function deleteScreenshot(id: string) {
    await screenshotService.deleteScreenshot(id)
    screenshots.value = screenshots.value.filter(s => s.id !== id)
  }

  async function updateScreenshot(id: string, data: Partial<Screenshot>) {
    await screenshotService.updateScreenshot(id, data)
    await loadScreenshots()
  }

  async function addTag(screenshotId: string, tagId: string) {
    await screenshotService.addTag(screenshotId, tagId)
    await loadScreenshots()
  }

  async function removeTag(screenshotId: string, tagId: string) {
    await screenshotService.removeTag(screenshotId, tagId)
    await loadScreenshots()
  }

  async function saveScreenshot(screenshot: Screenshot) {
    await screenshotService.updateScreenshot(screenshot.id, screenshot)
    await loadScreenshots()
  }

  return {
    screenshots,
    groups,
    categories,
    tags,
    isLoading,
    isScanning,
    lastScanTime,
    settings,
    sortedScreenshots,
    groupedScreenshots,
    initialize,
    loadScreenshots,
    loadCategories,
    loadTags,
    scanScreenshots,
    analyzeScreenshot,
    deleteScreenshot,
    updateScreenshot,
    addTag,
    removeTag,
    saveScreenshot
  }
})
