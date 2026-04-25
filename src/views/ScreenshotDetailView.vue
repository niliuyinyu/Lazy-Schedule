<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { useScreenshotStore } from '@/stores/screenshot'
import { scheduleService } from '@/services/schedule'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const screenshotStore = useScreenshotStore()

const screenshot = computed(() => {
  return screenshotStore.screenshots.find(s => s.id === route.params.id)
})

const category = computed(() => {
  if (!screenshot.value?.analysis?.category) return null
  return screenshotStore.categories.find(c => c.id === screenshot.value?.analysis?.category)
})

function goBack() {
  router.back()
}

async function exportToCalendar() {
  if (!screenshot.value?.analysis?.schedule) return

  const icsContent = await scheduleService.exportToCalendar(screenshot.value.analysis.schedule)

  const blob = new Blob([icsContent], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'jieli-event.ics'
  a.click()
  URL.revokeObjectURL(url)
}

async function openNavigation() {
  if (!screenshot.value?.analysis?.schedule?.location) return

  const mapApp = screenshotStore.settings?.mapApp || 'amap'
  await scheduleService.openMapApp(screenshot.value.analysis.schedule.location, mapApp)
}

async function deleteScreenshot() {
  if (!screenshot.value) return
  if (confirm('确定删除此截图？')) {
    await screenshotStore.deleteScreenshot(screenshot.value.id)
    router.back()
  }
}
</script>

<template>
  <div class="detail-view" v-if="screenshot">
    <header class="view-header">
      <button class="back-btn" @click="goBack">←</button>
      <h1>截图详情</h1>
      <button class="icon-btn" @click="deleteScreenshot">🗑️</button>
    </header>

    <div class="detail-content">
      <div class="screenshot-display">
        <div class="category-badge" v-if="category">
          {{ category.icon }} {{ category.name }}
        </div>
        <div class="screenshot-placeholder">
          {{ category?.icon || '📷' }}
        </div>
      </div>

      <div class="info-section">
        <div class="info-row">
          <span class="info-label">截图时间</span>
          <span class="info-value">{{ dayjs(screenshot.createdAt).format('YYYY-MM-DD HH:mm:ss') }}</span>
        </div>
        <div class="info-row" v-if="screenshot.ocrText">
          <span class="info-label">文字内容</span>
          <span class="info-value ocr-text">{{ screenshot.ocrText.slice(0, 200) }}</span>
        </div>
      </div>

      <div class="analysis-section" v-if="screenshot.analysis">
        <h3>📊 AI 分析结果</h3>

        <div class="analysis-item">
          <span class="analysis-label">摘要</span>
          <span class="analysis-value">{{ screenshot.analysis.summary }}</span>
        </div>

        <div class="analysis-item">
          <span class="analysis-label">紧急程度</span>
          <span class="urgency-tag" :class="screenshot.analysis.urgency">
            {{ screenshot.analysis.urgency === 'high' ? '🔴 紧急' : screenshot.analysis.urgency === 'medium' ? '🟡 一般' : '🟢 低' }}
          </span>
        </div>

        <div class="analysis-tags" v-if="screenshot.analysis.tags?.length">
          <span class="analysis-label">标签</span>
          <div class="tags-list">
            <span v-for="tag in screenshot.analysis.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>

        <div class="schedule-card" v-if="screenshot.analysis.schedule">
          <div class="schedule-header">
            <span>📅 日程</span>
            <span class="schedule-status">{{ screenshot.analysis.schedule.status }}</span>
          </div>
          <div class="schedule-content">
            <div class="event-name">{{ screenshot.analysis.schedule.eventName }}</div>
            <div class="event-time">🕐 {{ dayjs(screenshot.analysis.schedule.eventTime).format('YYYY-MM-DD HH:mm') }}</div>
            <div class="event-location" v-if="screenshot.analysis.schedule.location">
              📍 {{ screenshot.analysis.schedule.location }}
            </div>
          </div>
          <div class="schedule-actions">
            <button class="action-btn" @click="exportToCalendar">导出日历</button>
            <button class="action-btn" @click="openNavigation" v-if="screenshot.analysis.schedule.location">
              导航
            </button>
          </div>
        </div>
      </div>

      <div class="empty-analysis" v-else>
        <p>暂无 AI 分析结果</p>
        <button class="analyze-btn" @click="screenshotStore.analyzeScreenshot(screenshot.id)">
          立即分析
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-view {
  min-height: 100vh;
  background: #f5f5f5;
}

.view-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
}

.back-btn, .icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #f5f5f5;
  font-size: 16px;
  cursor: pointer;
}

.view-header h1 {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
}

.screenshot-display {
  background: #1a1a1a;
  min-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.category-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 12px;
  font-size: 12px;
}

.screenshot-placeholder {
  font-size: 80px;
}

.info-section {
  background: white;
  margin: 12px;
  border-radius: 12px;
  overflow: hidden;
}

.info-row {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 12px;
  color: #999;
  display: block;
  margin-bottom: 4px;
}

.info-value {
  font-size: 14px;
  color: #333;
}

.ocr-text {
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.analysis-section {
  background: white;
  margin: 12px;
  padding: 16px;
  border-radius: 12px;
}

.analysis-section h3 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
}

.analysis-item {
  margin-bottom: 12px;
}

.analysis-label {
  font-size: 12px;
  color: #999;
  display: block;
  margin-bottom: 4px;
}

.analysis-value {
  font-size: 14px;
  color: #333;
}

.urgency-tag {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.urgency-tag.high {
  background: #fff1f0;
  color: #cf1322;
}

.urgency-tag.medium {
  background: #fffbe6;
  color: #d46b08;
}

.urgency-tag.low {
  background: #f6ffed;
  color: #389e0d;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  padding: 4px 10px;
  background: #f0f5ff;
  color: #667eea;
  border-radius: 12px;
  font-size: 12px;
}

.schedule-card {
  margin-top: 16px;
  padding: 14px;
  background: #f9f9f9;
  border-radius: 10px;
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
}

.schedule-status {
  color: #52c41a;
}

.event-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.event-time, .event-location {
  font-size: 13px;
  color: #666;
  margin-top: 4px;
}

.schedule-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.action-btn {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  border: none;
  background: #667eea;
  color: white;
  font-size: 13px;
  cursor: pointer;
}

.empty-analysis {
  background: white;
  margin: 12px;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  color: #999;
}

.analyze-btn {
  margin-top: 12px;
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  background: #667eea;
  color: white;
  font-size: 14px;
  cursor: pointer;
}
</style>
