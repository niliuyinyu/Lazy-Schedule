import type { Screenshot } from '@/types'
import { DatabaseService } from './database'
import { Capacitor } from '@capacitor/core'

class ScreenshotService {
  private db: DatabaseService

  constructor() {
    this.db = new DatabaseService()
  }

  async initialize() {
    await this.db.initialize()
  }

  async getAllScreenshots(): Promise<Screenshot[]> {
    return await this.db.getScreenshots()
  }

  async getCategories() {
    return await this.db.getCategories()
  }

  async getTags() {
    return await this.db.getTags()
  }

  async scanNewScreenshots() {
    if (!Capacitor.isNativePlatform()) {
      console.log('Running in browser, skipping native scan')
      return []
    }

    const { Filesystem } = await import('@capacitor/filesystem')
    const screenshots: Screenshot[] = []

    const paths = [
      'Screenshots',
      'DCIM/Screenshots',
      'Pictures/Screenshots'
    ]

    for (const path of paths) {
      try {
        const files = await Filesystem.readdir({ path })
        for (const file of files) {
          if (file.name.endsWith('.png') || file.name.endsWith('.jpg') || file.name.endsWith('.jpeg')) {
            const fileHash = `${file.name}_${file.modifiedTime}`
            const existing = await this.db.getScreenshotByHash(fileHash)
            if (!existing) {
              const screenshot = await this.createScreenshot(file, path)
              if (screenshot) {
                screenshots.push(screenshot)
              }
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to scan ${path}:`, error)
      }
    }

    return screenshots
  }

  private async createScreenshot(file: any, basePath: string): Promise<Screenshot | null> {
    const id = crypto.randomUUID()
    const filePath = `${basePath}/${file.name}`
    const fileHash = `${file.name}_${file.modifiedTime}`
    const fileSize = file.size || 0
    const createdAt = new Date(file.modifiedTime || Date.now())

    const screenshot: Screenshot = {
      id,
      filePath,
      fileHash,
      fileSize,
      createdAt,
      scannedAt: new Date(),
      isSensitive: false,
      isArchived: false,
      isDeleted: false,
      tags: []
    }

    await this.db.insertScreenshot(screenshot)
    return screenshot
  }

  async analyzeScreenshot(id: string): Promise<void> {
    const screenshot = await this.db.getScreenshotById(id)
    if (!screenshot) return

    try {
      const imageBase64 = await this.getImageBase64(screenshot.filePath)
      if (!imageBase64) {
        console.error('Failed to read image file')
        return
      }

      const { llmService } = await import('./llm')
      const apiKey = localStorage.getItem('llm-api-key')
      if (!apiKey) {
        console.log('LLM API key not configured')
        return
      }

      llmService.initialize(apiKey)
      const analysis = await llmService.analyze(imageBase64)

      if (analysis) {
        analysis.screenshotId = id
        screenshot.analysis = analysis
        screenshot.category = analysis.category as any
        await this.db.saveAnalysis(analysis)
        await this.db.updateScreenshot(id, {
          analysis: analysis,
          category: analysis.category as any
        })
      }
    } catch (error) {
      console.error(`Failed to analyze screenshot ${id}:`, error)
    }
  }

  private async getImageBase64(filePath: string): Promise<string | null> {
    try {
      const { Filesystem } = await import('@capacitor/filesystem')
      const file = await Filesystem.readFile({ path: filePath })
      if (typeof file.data === 'string') {
        const base64 = file.data.includes(',')
          ? file.data.split(',')[1]
          : file.data
        return base64
      }
      return file.data as unknown as string
    } catch (error) {
      console.error('Failed to read image:', error)
      return null
    }
  }

  async deleteScreenshot(id: string) {
    await this.db.updateScreenshot(id, { isDeleted: true })
  }

  async updateScreenshot(id: string, data: Partial<Screenshot>) {
    await this.db.updateScreenshot(id, data)
  }

  async addTag(screenshotId: string, tagId: string) {
    await this.db.addTagToScreenshot(screenshotId, tagId)
  }

  async removeTag(screenshotId: string, tagId: string) {
    await this.db.removeTagFromScreenshot(screenshotId, tagId)
  }
}

export const screenshotService = new ScreenshotService()
