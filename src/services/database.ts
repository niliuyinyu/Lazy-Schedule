import type { Screenshot, Category, Tag, Analysis } from '@/types'

const DB_NAME = 'jieli-db'
const DB_VERSION = 1

class DatabaseService {
  private db: IDBDatabase | null = null

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        if (!db.objectStoreNames.contains('screenshots')) {
          const screenshotStore = db.createObjectStore('screenshots', { keyPath: 'id' })
          screenshotStore.createIndex('fileHash', 'fileHash', { unique: true })
          screenshotStore.createIndex('createdAt', 'createdAt', { unique: false })
          screenshotStore.createIndex('isDeleted', 'isDeleted', { unique: false })
        }

        if (!db.objectStoreNames.contains('analysis')) {
          db.createObjectStore('analysis', { keyPath: 'screenshotId' })
        }

        if (!db.objectStoreNames.contains('tags')) {
          const tagStore = db.createObjectStore('tags', { keyPath: 'id' })
          tagStore.createIndex('name', 'name', { unique: true })
        }

        if (!db.objectStoreNames.contains('categories')) {
          const categoryStore = db.createObjectStore('categories', { keyPath: 'id' })
          categoryStore.createIndex('name', 'name', { unique: true })
        }

        if (!db.objectStoreNames.contains('schedules')) {
          db.createObjectStore('schedules', { keyPath: 'id' })
        }

        if (!db.objectStoreNames.contains('screenshot_tags')) {
          db.createObjectStore('screenshot_tags', { keyPath: ['screenshotId', 'tagId'] })
        }

        this.initDefaultData(db)
      }
    })
  }

  private initDefaultData(db: IDBDatabase) {
    const categories: Category[] = [
      { id: 'chat', name: '聊天记录', icon: '💬', color: '#4CAF50', isDefault: true },
      { id: 'quote', name: '报价单', icon: '📋', color: '#2196F3', isDefault: true },
      { id: 'contract', name: '合同', icon: '📝', color: '#9C27B0', isDefault: true },
      { id: 'order', name: '订单', icon: '🛒', color: '#FF9800', isDefault: true },
      { id: 'transfer', name: '转账凭证', icon: '💰', color: '#E91E63', isDefault: true },
      { id: 'notification', name: '通知', icon: '🔔', color: '#00BCD4', isDefault: true },
      { id: 'schedule', name: '日程', icon: '📅', color: '#FF5722', isDefault: true },
      { id: 'other', name: '其他', icon: '📎', color: '#607D8B', isDefault: true }
    ]

    const catTx = db.transaction('categories', 'readwrite')
    const catStore = catTx.objectStore('categories')
    for (const cat of categories) {
      catStore.put(cat)
    }

    const testScreenshots: Screenshot[] = [
      {
        id: crypto.randomUUID(),
        filePath: '/test/chat1.png',
        fileHash: 'chat1_12345',
        fileSize: 102400,
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
        scannedAt: new Date(),
        isSensitive: false,
        isArchived: false,
        isDeleted: false,
        tags: [],
        category: { id: 'chat', name: '聊天记录', icon: '💬', color: '#4CAF50', isDefault: true },
        analysis: {
          screenshotId: '',
          tags: ['微信', '重要'],
          summary: '关于项目进度的讨论',
          category: 'chat',
          urgency: 'medium',
          provider: 'test',
          analyzedAt: new Date()
        }
      },
      {
        id: crypto.randomUUID(),
        filePath: '/test/schedule1.png',
        fileHash: 'schedule1_12346',
        fileSize: 153600,
        createdAt: new Date(Date.now() - 1000 * 60 * 60),
        scannedAt: new Date(),
        isSensitive: false,
        isArchived: false,
        isDeleted: false,
        tags: [],
        category: { id: 'schedule', name: '日程', icon: '📅', color: '#FF5722', isDefault: true },
        analysis: {
          screenshotId: '',
          tags: ['日程', '会议'],
          summary: '明天下午3点开会',
          category: 'schedule',
          urgency: 'high',
          provider: 'test',
          analyzedAt: new Date(),
          schedule: {
            id: crypto.randomUUID(),
            screenshotId: '',
            eventName: '项目周会',
            eventTime: new Date(Date.now() + 1000 * 60 * 60 * 21),
            location: '会议室A',
            reminderMinutes: 15,
            isExportedToCalendar: false,
            status: 'pending'
          }
        }
      },
      {
        id: crypto.randomUUID(),
        filePath: '/test/transfer1.png',
        fileHash: 'transfer1_12347',
        fileSize: 204800,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
        scannedAt: new Date(),
        isSensitive: false,
        isArchived: false,
        isDeleted: false,
        tags: [],
        category: { id: 'transfer', name: '转账凭证', icon: '💰', color: '#E91E63', isDefault: true },
        analysis: {
          screenshotId: '',
          tags: ['转账', '重要'],
          summary: '转账 500 元给供应商',
          category: 'transfer',
          urgency: 'medium',
          provider: 'test',
          analyzedAt: new Date()
        }
      }
    ]

    const shotTx = db.transaction('screenshots', 'readwrite')
    const shotStore = shotTx.objectStore('screenshots')
    for (const shot of testScreenshots) {
      if (shot.analysis) {
        shot.analysis.screenshotId = shot.id
        if (shot.analysis.schedule) {
          shot.analysis.schedule.screenshotId = shot.id
        }
      }
      shotStore.put(shot)
    }

    const testTags: Tag[] = [
      { id: crypto.randomUUID(), name: '重要', color: '#ff4d4f', type: 'user', createdAt: new Date(), isDefault: true },
      { id: crypto.randomUUID(), name: '微信', color: '#52c41a', type: 'user', createdAt: new Date(), isDefault: true },
      { id: crypto.randomUUID(), name: '会议', color: '#1890ff', type: 'user', createdAt: new Date(), isDefault: true },
      { id: crypto.randomUUID(), name: '转账', color: '#eb2f96', type: 'user', createdAt: new Date(), isDefault: true }
    ]

    const tagTx = db.transaction('tags', 'readwrite')
    const tagStore = tagTx.objectStore('tags')
    for (const tag of testTags) {
      tagStore.put(tag)
    }
  }

  async getScreenshots(): Promise<Screenshot[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve([])
        return
      }
      const tx = this.db.transaction('screenshots', 'readonly')
      const store = tx.objectStore('screenshots')
      const request = store.getAll()

      request.onsuccess = () => {
        const screenshots = request.result.filter((s: Screenshot) => !s.isDeleted)
        resolve(screenshots)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async getScreenshotById(id: string): Promise<Screenshot | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve(null)
        return
      }
      const tx = this.db.transaction('screenshots', 'readonly')
      const store = tx.objectStore('screenshots')
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async getScreenshotByHash(hash: string): Promise<Screenshot | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve(null)
        return
      }
      const tx = this.db.transaction('screenshots', 'readonly')
      const store = tx.objectStore('screenshots')
      const index = store.index('fileHash')
      const request = index.get(hash)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async insertScreenshot(screenshot: Screenshot): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve()
        return
      }
      const tx = this.db.transaction('screenshots', 'readwrite')
      const store = tx.objectStore('screenshots')
      const request = store.put(screenshot)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async updateScreenshot(id: string, data: Partial<Screenshot>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve()
        return
      }
      const tx = this.db.transaction('screenshots', 'readwrite')
      const store = tx.objectStore('screenshots')
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const screenshot = { ...getRequest.result, ...data }
        const putRequest = store.put(screenshot)
        putRequest.onsuccess = () => resolve()
        putRequest.onerror = () => reject(putRequest.error)
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  async getCategories(): Promise<Category[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve([])
        return
      }
      const tx = this.db.transaction('categories', 'readonly')
      const store = tx.objectStore('categories')
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getTags(): Promise<Tag[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve([])
        return
      }
      const tx = this.db.transaction('tags', 'readonly')
      const store = tx.objectStore('tags')
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async saveAnalysis(analysis: Analysis): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve()
        return
      }
      const tx = this.db.transaction('analysis', 'readwrite')
      const store = tx.objectStore('analysis')
      const request = store.put(analysis)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async addTagToScreenshot(screenshotId: string, tagId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve()
        return
      }
      const tx = this.db.transaction('screenshot_tags', 'readwrite')
      const store = tx.objectStore('screenshot_tags')
      const request = store.put({ screenshotId, tagId })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async removeTagFromScreenshot(screenshotId: string, tagId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve()
        return
      }
      const tx = this.db.transaction('screenshot_tags', 'readwrite')
      const store = tx.objectStore('screenshot_tags')
      const request = store.delete([screenshotId, tagId])

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

export { DatabaseService }
