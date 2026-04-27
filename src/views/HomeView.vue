<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useScreenshotStore } from '@/stores/screenshot'
import dayjs from 'dayjs'

const router = useRouter()
const screenshotStore = useScreenshotStore()

const todayCount = computed(() => {
  const today = dayjs().startOf('day')
  return screenshotStore.screenshots.filter(s =>
    dayjs(s.createdAt).isAfter(today)
  ).length
})

const pendingSchedules = computed(() => {
  return screenshotStore.screenshots
    .filter(s => s.analysis?.schedule?.status === 'pending')
    .slice(0, 3)
})

onMounted(() => {
  screenshotStore.loadScreenshots()
})

function goToScreenshots() {
  router.push('/screenshots')
}

function goToSchedule() {
  router.push('/schedule')
}

function goToSearch() {
  router.push('/search')
}

function goToSettings() {
  router.push('/settings')
}

async function handleScan() {
  await screenshotStore.scanScreenshots()
}
</script>

<template>
  <div class="home-view">
    <header class="home-header">
      <h1>截历</h1>
      <button class="icon-btn" @click="goToSettings">
        <span>⚙️</span>
      </button>
    </header>

    <div class="stats-cards">
      <div class="stat-card" @click="goToScreenshots">
        <div class="stat-value">{{ screenshotStore.screenshots.length }}</div>
        <div class="stat-label">截图总数</div>
      </div>
      <div class="stat-card highlight" @click="goToScreenshots">
        <div class="stat-value">{{ todayCount }}</div>
        <div class="stat-label">今日新增</div>
      </div>
    </div>

    <section class="quick-actions">
      <button class="action-btn primary" @click="handleScan" :disabled="screenshotStore.isScanning">
        <span v-if="screenshotStore.isScanning">扫描中...</span>
        <span v-else>🔍 扫描截图</span>
      </button>
      <button class="action-btn" @click="goToSearch">
        <span>🔎 搜索</span>
      </button>
    </section>

    <section class="recent-section" v-if="pendingSchedules.length > 0">
      <div class="section-header">
        <h2>📅 待办日程</h2>
        <button class="text-btn" @click="goToSchedule">查看全部</button>
      </div>
      <div class="schedule-list">
        <div
          v-for="screenshot in pendingSchedules"
          :key="screenshot.id"
          class="schedule-item"
          @click="router.push(`/screenshot/${screenshot.id}`)"
        >
          <div class="schedule-info">
            <div class="schedule-title">{{ screenshot.analysis?.schedule?.eventName }}</div>
            <div class="schedule-time">
              {{ dayjs(screenshot.analysis?.schedule?.eventTime).format('MM月DD日 HH:mm') }}
            </div>
          </div>
          <span class="urgency-badge" :class="screenshot.analysis?.urgency">
            {{ screenshot.analysis?.urgency === 'high' ? '紧急' : '' }}
          </span>
        </div>
      </div>
    </section>

    <section class="recent-section">
      <div class="section-header">
        <h2>📸 最近截图</h2>
        <button class="text-btn" @click="goToScreenshots">查看全部</button>
      </div>
      <div class="screenshot-grid" v-if="screenshotStore.sortedScreenshots.length > 0">
        <div
          v-for="screenshot in screenshotStore.sortedScreenshots.slice(0, 6)"
          :key="screenshot.id"
          class="screenshot-thumb"
          @click="router.push(`/screenshot/${screenshot.id}`)"
        >
          <div class="thumb-placeholder">{{ screenshot.category?.icon || '📷' }}</div>
          <div class="thumb-date">{{ dayjs(screenshot.createdAt).format('HH:mm') }}</div>
        </div>
      </div>
      <div class="empty-state" v-else>
        <p>暂无截图</p>
        <p class="hint">点击"扫描截图"开始</p>
      </div>
    </section>

    <nav class="bottom-nav">
      <button class="nav-item active">
        <span>🏠</span>
        <span>首页</span>
      </button>
      <button class="nav-item" @click="goToScreenshots">
        <span>📷</span>
        <span>截图</span>
      </button>
      <button class="nav-item" @click="goToSchedule">
        <span>📅</span>
        <span>日程</span>
      </button>
      <button class="nav-item" @click="goToSettings">
        <span>⚙️</span>
        <span>设置</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.home-view {
  min-height: 100vh;
  padding: 16px;
  padding-bottom: 80px;
  background: #f5f5f5;
}

.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.home-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: white;
  font-size: 18px;
  cursor: pointer;
}

.stats-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  padding: 16px;
  border-radius: 12px;
  text-align: center;
}

.stat-card.highlight {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.highlight .stat-label {
  color: rgba(255, 255, 255, 0.8);
}

.quick-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.action-btn {
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  border: none;
  font-size: 16px;
  cursor: pointer;
  background: white;
}

.action-btn.primary {
  background: #667eea;
  color: white;
}

.action-btn:disabled {
  opacity: 0.6;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h2 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.text-btn {
  background: none;
  border: none;
  color: #667eea;
  font-size: 14px;
  cursor: pointer;
}

.schedule-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.schedule-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.schedule-item:last-child {
  border-bottom: none;
}

.schedule-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.schedule-time {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}

.urgency-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.urgency-badge.high {
  background: #ff4d4f;
  color: white;
}

.screenshot-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.screenshot-thumb {
  aspect-ratio: 1;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
}

.thumb-placeholder {
  font-size: 32px;
}

.thumb-date {
  position: absolute;
  bottom: 4px;
  right: 4px;
  font-size: 11px;
  color: #999;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 4px;
  border-radius: 2px;
}

.empty-state {
  background: white;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  color: #999;
}

.hint {
  font-size: 13px;
  margin-top: 8px;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: white;
  border-top: 1px solid #eee;
  padding: 8px 0;
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  background: none;
  border: none;
  font-size: 12px;
  color: #999;
  cursor: pointer;
}

.nav-item.active {
  color: #667eea;
}
</style>
