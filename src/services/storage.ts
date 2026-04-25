import type { StorageConfig, UploadResult, FileEntry } from '@/types'

interface StorageProvider {
  name: string
  type: 'webdav' | 'aliyun' | 'local'
  upload(localPath: string, remotePath: string): Promise<UploadResult>
  download(remotePath: string, localPath: string): Promise<void>
  exists(remotePath: string): Promise<boolean>
  delete(remotePath: string): Promise<void>
  list(remoteDir: string): Promise<FileEntry[]>
  testConnection?(): Promise<{ success: boolean; error?: string }>
}

class WebDAVProvider implements StorageProvider {
  name = 'WebDAV NAS'
  type: 'webdav' = 'webdav'
  private url: string
  private username: string
  private password: string

  constructor(config: { url: string; username: string; password: string }) {
    this.url = config.url.replace(/\/$/, '')
    this.username = config.username
    this.password = config.password
  }

  private getAuth(): string {
    return 'Basic ' + btoa(`${this.username}:${this.password}`)
  }

  async upload(localPath: string, remotePath: string): Promise<UploadResult> {
    try {
      const file = await this.readFile(localPath)
      const response = await fetch(`${this.url}${remotePath}`, {
        method: 'PUT',
        headers: {
          'Authorization': this.getAuth(),
          'Content-Type': 'application/octet-stream'
        },
        body: file
      })

      if (response.ok || response.status === 201) {
        return { success: true, remotePath }
      }
      return { success: false, error: `Upload failed: ${response.status}` }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async download(remotePath: string, localPath: string): Promise<void> {
    const response = await fetch(`${this.url}${remotePath}`, {
      method: 'GET',
      headers: { 'Authorization': this.getAuth() }
    })

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`)
    }

    const blob = await response.blob()
    await this.writeFile(localPath, blob)
  }

  async exists(remotePath: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.url}${remotePath}`, {
        method: 'HEAD',
        headers: { 'Authorization': this.getAuth() }
      })
      return response.ok
    } catch {
      return false
    }
  }

  async delete(remotePath: string): Promise<void> {
    await fetch(`${this.url}${remotePath}`, {
      method: 'DELETE',
      headers: { 'Authorization': this.getAuth() }
    })
  }

  async list(remoteDir: string): Promise<FileEntry[]> {
    const response = await fetch(`${this.url}${remoteDir}`, {
      method: 'PROPFIND',
      headers: {
        'Authorization': this.getAuth(),
        'Depth': '1'
      }
    })

    if (!response.ok) {
      return []
    }

    const text = await response.text()
    return this.parseWebDAVResponse(text)
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    const testPaths = ['', '/', '/dav', '/webdav', '/dav/']

    for (const testPath of testPaths) {
      try {
        const response = await fetch(`${this.url}${testPath}`, {
          method: 'PROPFIND',
          headers: {
            'Authorization': this.getAuth(),
            'Depth': '0'
          }
        })
        if (response.ok || response.status === 207) {
          return { success: true }
        }
      } catch (error: any) {
        if (error.name === 'TypeError' && (error.message.includes('CORS') || error.message.includes('NetworkError'))) {
          return { 
            success: false, 
            error: '浏览器测试可能会失败（CORS跨域限制），但在App中会正常工作' 
          }
        }
        continue
      }
    }

    for (const testPath of testPaths) {
      try {
        const response = await fetch(`${this.url}${testPath}`, {
          method: 'HEAD',
          headers: { 'Authorization': this.getAuth() }
        })
        if (response.ok) {
          return { success: true }
        }
      } catch (error: any) {
        if (error.name === 'TypeError' && (error.message.includes('CORS') || error.message.includes('NetworkError'))) {
          return { 
            success: false, 
            error: '浏览器测试可能会失败（CORS跨域限制），但在App中会正常工作' 
          }
        }
        continue
      }
    }

    return { success: false, error: '无法连接到服务器，请检查地址、端口和账号密码' }
  }

  private parseWebDAVResponse(xml: string): FileEntry[] {
    const entries: FileEntry[] = []
    const parser = new DOMParser()
    const doc = parser.parseFromString(xml, 'text/xml')

    const responses = doc.getElementsByTagName('response') || doc.getElementsByTagName('d:response')
    for (let i = 0; i < responses.length; i++) {
      const resp = responses[i]
      const hrefElem = resp.getElementsByTagName('href')[0] || resp.getElementsByTagName('d:href')[0]
      const href = hrefElem?.textContent || ''
      const isDir = resp.getElementsByTagName('collection').length > 0 || resp.getElementsByTagName('d:collection').length > 0

      if (!href) continue

      let name = decodeURIComponent(href.split('/').pop() || '')
      if (!name) continue

      entries.push({
        name,
        path: decodeURIComponent(href),
        isDirectory: isDir
      })
    }

    return entries
  }

  private async readFile(path: string): Promise<Blob> {
    const { Filesystem } = await import('@capacitor/filesystem')
    const file = await Filesystem.readFile({ path: path })
    const base64 = file.data
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return new Blob([bytes])
  }

  private async writeFile(path: string, blob: Blob): Promise<void> {
    const { Filesystem } = await import('@capacitor/filesystem')
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1]
      await Filesystem.writeFile({
        path,
        data: base64,
        directory: undefined
      })
    }
    reader.readAsDataURL(blob)
  }
}

class AliyunProvider implements StorageProvider {
  name = '阿里云盘'
  type: 'aliyun' = 'aliyun'
  private token: string = ''

  constructor(config: { token?: string }) {
    this.token = config.token || ''
  }

  setToken(token: string) {
    this.token = token
  }

  async upload(localPath: string, remotePath: string): Promise<UploadResult> {
    if (!this.token) {
      return { success: false, error: 'Not authenticated with Aliyun' }
    }

    try {
      const file = await this.readFile(localPath)
      const fileName = remotePath.split('/').pop() || 'file'

      const response = await fetch('https://api.aliyundrive.com/v2/file/create', {
        method: 'POST',
        headers: {
          'Authorization': this.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: fileName,
          size: file.size,
          parent_file_id: 'root',
          content_hash: await this.getFileHash(file)
        })
      })

      const result = await response.json()
      if (result.file_id) {
        return { success: true, remotePath }
      }
      return { success: false, error: 'Upload failed' }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async download(remotePath: string, localPath: string): Promise<void> {
    throw new Error('Download not implemented')
  }

  async exists(remotePath: string): Promise<boolean> {
    return false
  }

  async delete(remotePath: string): Promise<void> {
    throw new Error('Delete not implemented')
  }

  async list(remoteDir: string): Promise<FileEntry[]> {
    return []
  }

  private async readFile(path: string): Promise<Blob> {
    const { Filesystem } = await import('@capacitor/filesystem')
    const file = await Filesystem.readFile({ path: path })
    const base64 = file.data
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return new Blob([bytes])
  }

  private async getFileHash(file: Blob): Promise<string> {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA1', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
}

class StorageService {
  private provider: StorageProvider | null = null

  configure(config: StorageConfig) {
    const configData = JSON.parse(config.configJson)

    switch (config.providerType) {
      case 'webdav':
        this.provider = new WebDAVProvider(configData)
        break
      case 'aliyun':
        this.provider = new AliyunProvider(configData)
        break
      default:
        throw new Error(`Unknown provider type: ${config.providerType}`)
    }
  }

  async testConnection(config: StorageConfig): Promise<{ success: boolean; error?: string }> {
    try {
      const testProvider = config.providerType === 'webdav'
        ? new WebDAVProvider(JSON.parse(config.configJson))
        : new AliyunProvider(JSON.parse(config.configJson))

      if ('testConnection' in testProvider && typeof testProvider.testConnection === 'function') {
        return await testProvider.testConnection()
      }

      const exists = await testProvider.exists('/')
      return { success: exists }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async upload(localPath: string, remotePath: string): Promise<UploadResult> {
    if (!this.provider) {
      return { success: false, error: 'Storage not configured' }
    }
    return await this.provider.upload(localPath, remotePath)
  }

  async download(remotePath: string, localPath: string): Promise<void> {
    if (!this.provider) {
      throw new Error('Storage not configured')
    }
    await this.provider.download(remotePath, localPath)
  }

  async exists(remotePath: string): Promise<boolean> {
    if (!this.provider) {
      return false
    }
    return await this.provider.exists(remotePath)
  }

  async delete(remotePath: string): Promise<void> {
    if (!this.provider) {
      throw new Error('Storage not configured')
    }
    await this.provider.delete(remotePath)
  }

  async list(remoteDir: string): Promise<FileEntry[]> {
    if (!this.provider) {
      return []
    }
    return await this.provider.list(remoteDir)
  }
}

export const storageService = new StorageService()
