import { Capacitor } from '@capacitor/core'

class OcrService {
  private isInitialized = false

  async initialize() {
    if (this.isInitialized) return
    if (!Capacitor.isNativePlatform()) {
      console.log('OCR only available on native platform')
      return
    }
    this.isInitialized = true
  }

  async recognize(filePath: string): Promise<string | null> {
    try {
      if (Capacitor.isNativePlatform()) {
        return await this.recognizeNative(filePath)
      }
      return await this.recognizeBrowser(filePath)
    } catch (error) {
      console.error('OCR recognition failed:', error)
      return null
    }
  }

  private async recognizeNative(filePath: string): Promise<string | null> {
    const { Filesystem } = await import('@capacitor/filesystem')
    const file = await Filesystem.readFile({ path: filePath })
    const base64 = file.data

    const apiKey = localStorage.getItem('ocr-api-key') || 'demo'
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': apiKey
      },
      body: new URLSearchParams({
        base64Image: `data:image/png;base64,${base64}`,
        language: 'chs',
        isOverlayRequired: 'false'
      })
    })

    const result = await response.json()
    if (result.ParsedResults?.[0]?.ParsedText) {
      return result.ParsedResults[0].ParsedText
    }
    return null
  }

  private async recognizeBrowser(filePath: string): Promise<string | null> {
    const { Filesystem } = await import('@capacitor/filesystem')
    try {
      const file = await Filesystem.readFile({ path: filePath })
      const base64 = file.data

      const img = new Image()
      img.src = `data:image/png;base64,${base64}`

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })

      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return null
      ctx.drawImage(img, 0, 0)

      return await this.extractTextFromCanvas(canvas)
    } catch (error) {
      console.error('Browser OCR failed:', error)
      return null
    }
  }

  private async extractTextFromCanvas(canvas: HTMLCanvasElement): Promise<string | null> {
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const text = this.simpleTextDetection(imageData)

    return text || null
  }

  private simpleTextDetection(imageData: ImageData): string | null {
    return null
  }
}

export { OcrService }
