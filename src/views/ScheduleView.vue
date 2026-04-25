<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useScreenshotStore } from '@/stores/screenshot'
import { scheduleService } from '@/services/schedule'
import dayjs from 'dayjs'

const router = useRouter()
const screenshotStore = useScreenshotStore()

const schedules = computed(() => {
  return screenshotStore.screenshots
    .filter(s => s.analysis?.schedule)
    .map(s => ({
      ...s.analysis!.schedule!,
      screenshotId: s.id,
      screenshot: s
    }))
    .sort((a, b) => new Date(a.eventTime).getTime() - new Date(b.eventTime).getTime())
})

const pendingSchedules = computed(() =>
  schedules.value.filter(s => s.status === 'pending')
)

const completedSchedules = computed(() =>
  schedules.value.filter(s => s.status === 'completed')
)

function goBack() {
  router.back()
}

function goToDetail(screenshotId: string) {
  router.push(`/screenshot/${screenshotId}`)
}

function formatTime(date: Date) {
  const d = dayjs(date)
  const now = dayjs()
  const diff = d.diff(now, 'day')

  if (diff === 0) return '今天 ' + d.format('HH:mm')
  if (diff === 1) return '明天 ' + d.format('HH:mm')
  if (diff === -1) return '昨天 ' + d.format('HH:mm')
  return d.format('MM-DD HH:mm')
}

async function exportAllSchedules() {
  for (const schedule of pendingSchedules.value) {
    await scheduleService.addToLocalCalendar(schedule)
  }
  alert('已导出 ' + pendingSchedules.value.length + ' 个日程到日历')
}

async function exportSchedule(schedule: any, event: Event) {
  event.stopPropagation()
  const success = await scheduleService.addToLocalCalendar(schedule)
  if (success) {
    alert('已导出到日历')
  } else {
    alert('导出失败')
  }
}

async function setReminder(schedule: any, event: Event) {
  event.stopPropagation()
  await scheduleService.setReminder(schedule, 15)
  alert('已设置15分钟前提醒')
}

async function markComplete(schedule: any, event: Event) {
  event.stopPropagation()
  schedule.status = 'completed'
  await screenshotStore.saveScreenshot(schedule.screenshot)
  alert('已标记完成')
}
</script>

<template>
  <div class="schedule-view">
    <header class="view-header">
      <button class="back-btn" @click="goBack">←</button>
      <h1>日程</h1>
      <button class="export-btn" v-if="pendingSchedules.length > 0" @click="exportAllSchedules">📥 导出全部</button>
    </header>

    <div class="schedule-content" v-if="schedules.length > 0">
      <section class="schedule-section" v-if="pendingSchedules.length > 0">
        <h2>待办 ({{ pendingSchedules.length }})</h2>
        <div class="schedule-list">
          <div
            v-for="schedule in pendingSchedules"
            :key="schedule.id"
            class="schedule-item"
            @click="goToDetail(schedule.screenshotId)"
          >
            <div class="item-checkbox" @click="markComplete(schedule, $event)"></div>
            <div class="item-content">
              <div class="item-title">{{ schedule.eventName }}</div>
              <div class="item-meta">
                <span class="time">{{ formatTime(schedule.eventTime) }}</span>
                <span class="location" v-if="schedule.location">{{ schedule.location }}</span>
              </div>
            </div>
            <div class="item-actions">
              <button class="action-btn" @click="setReminder(schedule, $event)" title="设置提醒">🔔</button>
              <button class="action-btn" @click="exportSchedule(schedule, $event)" title="导出">📅</button>
            </div>
            <span class="urgency-dot" :class="schedule.screenshot.analysis?.urgency"></span>
          </div>
        </div>
      </section>

      <section class="schedule-section" v-if="completedSchedules.length > 0">
        <h2>已完成</h2>
        <div class="schedule-list completed">
          <div
            v-for="schedule in completedSchedules"
            :key="schedule.id"
            class="schedule-item"
            @click="goToDetail(schedule.screenshotId)"
          >
            <div class="item-checkbox checked">✓</div>
            <div class="item-content">
              <div class="item-title">{{ schedule.eventName }}</div>
              <div class="item-meta">
                <span class="time">{{ formatTime(schedule.eventTime) }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div class="empty-state" v-else>
      <div class="empty-icon">📅</div>
      <p>暂无日程</p>
      <p class="hint">从截图中提取的日程会显示在这里</p>
    </div>
  </div>
</template>

<style scoped>
.schedule-view {
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

.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #f5f5f5;
  font-size: 18px;
  cursor: pointer;
}

.view-header h1 {
  font-size: 18px;
  font-weight: 600;
}

.schedule-content {
  padding: 16px;
}

.schedule-section {
  margin-bottom: 24px;
}

.schedule-section h2 {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.schedule-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.schedule-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.schedule-item:last-child {
  border-bottom: none;
}

.item-checkbox {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: transparent;
}

.item-checkbox.checked {
  background: #52c41a;
  border-color: #52c41a;
  color: white;
}

.item-content {
  flex: 1;
}

.item-title {
  font-size: 15px;
  color: #333;
}

.schedule-list.completed .item-title {
  color: #999;
  text-decoration: line-through;
}

.item-meta {
  display: flex;
  gap: 12px;
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}

.urgency-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.urgency-dot.high {
  background: #ff4d4f;
}

.urgency-dot.medium {
  background: #faad14;
}

.urgency-dot.low {
  background: #52c41a;
}

.empty-state {
  padding: 60px;
  text-align: center;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.hint {
  font-size: 13px;
  margin-top: 8px;
}

.export-btn {
  padding: 6px 12px;
  border-radius: 8px;
  border: none;
  background: #667eea;
  color: white;
  font-size: 13px;
  cursor: pointer;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: #f5f5f5;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: #e5e5e5;
}
</style>
