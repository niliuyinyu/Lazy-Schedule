export interface Screenshot {
  id: string
  filePath: string
  fileHash: string
  thumbnailPath?: string
  fileSize: number
  createdAt: Date
  scannedAt: Date
  ocrText?: string
  sourceApp?: string
  latitude?: number
  longitude?: number
  locationText?: string
  isSensitive: boolean
  isArchived: boolean
  isDeleted: boolean
  groupId?: string
  analysis?: Analysis
  tags: Tag[]
  category?: Category
}

export interface Analysis {
  screenshotId: string
  tags: string[]
  summary: string
  category: string
  urgency: 'low' | 'medium' | 'high'
  schedule?: Schedule
  provider: string
  analyzedAt: Date
}

export interface Tag {
  id: string
  name: string
  type: 'ai' | 'user'
  color: string
  createdAt?: Date
  isDefault?: boolean
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  isDefault: boolean
}

export interface Schedule {
  id: string
  screenshotId: string
  eventName: string
  eventTime: Date
  location?: string
  reminderMinutes: number
  isExportedToCalendar: boolean
  status: 'pending' | 'completed' | 'cancelled'
}

export interface ScreenshotGroup {
  id: string
  name: string
  contactName?: string
  screenshots: Screenshot[]
  createdAt: Date
}

export interface Settings {
  scanInterval: number
  autoArchive: boolean
  archiveDays: number
  reminderMinutes: number
  dailyReport: boolean
  dailyReportTime: string
  mapEnabled: boolean
  mapApp: 'amap' | 'baidumap' | 'tencentmap'
  llmProvider: string
  theme: 'light' | 'dark' | 'auto'
  language: string
}

export interface LLMConfig {
  id: string
  providerName: string
  apiKey: string
  endpoint?: string
  model: string
  isActive: boolean
}

export interface StorageConfig {
  id: string
  providerType: 'webdav' | 'aliyun' | 'local'
  configJson: string
  isActive: boolean
}

export interface UploadResult {
  success: boolean
  remotePath?: string
  error?: string
}

export interface FileEntry {
  name: string
  path: string
  isDirectory: boolean
  size?: number
  modifiedAt?: Date
}

export interface AlbumPath {
  id: string
  name: string
  path: string
  isEnabled: boolean
  isDefault?: boolean
}
