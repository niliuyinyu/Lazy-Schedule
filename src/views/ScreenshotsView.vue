<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useScreenshotStore } from '@/stores/screenshot'
import dayjs from 'dayjs'

const router = useRouter()
const screenshotStore = useScreenshotStore()

const selectedCategory = ref<string | null>(null)
const viewMode = ref<'grid' | 'list'>('grid')

const filteredScreenshots = computed(() => {
  let list = screenshotStore.sortedScreenshots
  if (selectedCategory.value) {
    list = list.filter(s => s.analysis?.category === selectedCategory.value)
  }
  return list
})

const groupedByDate = computed(() => {
  const groups: Record<string, typeof filteredScreenshots.value> = {}
  for (const shot of filteredScreenshots.value) {
    const date = dayjs(shot.createdAt).format('YYYY-MM-DD')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(shot)
  }
  return groups
})

function selectCategory(id: string | null) {
  selectedCategory.value = id
}

function goToDetail(id: string) {
  router.push(`/screenshot/${id}`)
}

function goBack() {
  router.back()
}

function goToSearch() {
  router.push('/search')
}
</script>

<template>
  <div class="screenshots-view">
    <header class="view-header">
      <button class="back-btn" @click="goBack">←</button>
      <h1>截图列表</h1>
      <button class="icon-btn" @click="goToSearch">🔎</button>
    </header>

    <div class="category-tabs">
      <button
        class="category-tab"
        :class="{ active: selectedCategory === null }"
        @click="selectCategory(null)"
      >
        全部
      </button>
      <button
        v-for="cat in screenshotStore.categories"
        :key="cat.id"
        class="category-tab"
        :class="{ active: selectedCategory === cat.id }"
        @click="selectCategory(cat.id)"
      >
        {{ cat.icon }} {{ cat.name }}
      </button>
    </div>

    <div class="view-mode-toggle">
      <button :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">▦</button>
      <button :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">☰</button>
    </div>

    <div class="screenshot-content" v-if="filteredScreenshots.length > 0">
      <template v-if="viewMode === 'grid'">
        <div class="date-group" v-for="(shots, date) in groupedByDate" :key="date">
          <div class="date-label">{{ dayjs(date).format('MM月DD日') }}</div>
          <div class="screenshot-grid">
            <div
              v-for="shot in shots"
              :key="shot.id"
              class="screenshot-card"
              @click="goToDetail(shot.id)"
            >
              <div class="card-thumb">
                <span class="category-icon">{{ shot.analysis?.category ? screenshotStore.categories.find(c => c.id === shot.analysis?.category)?.icon : '📷' }}</span>
              </div>
              <div class="card-info">
                <div class="card-time">{{ dayjs(shot.createdAt).format('HH:mm') }}</div>
                <div class="card-summary">{{ shot.analysis?.summary?.slice(0, 30) || '无摘要' }}</div>
              </div>
              <div class="card-tags" v-if="shot.analysis?.tags?.length">
                <span v-for="tag in shot.analysis.tags.slice(0, 2)" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="screenshot-list">
          <div
            v-for="shot in filteredScreenshots"
            :key="shot.id"
            class="list-item"
            @click="goToDetail(shot.id)"
          >
            <div class="list-thumb">{{ shot.analysis?.category ? screenshotStore.categories.find(c => c.id === shot.analysis?.category)?.icon : '📷' }}</div>
            <div class="list-info">
              <div class="list-summary">{{ shot.analysis?.summary?.slice(0, 40) || '无摘要' }}</div>
              <div class="list-meta">
                <span>{{ dayjs(shot.createdAt).format('MM-DD HH:mm') }}</span>
                <span v-if="shot.analysis?.tags?.length">{{ shot.analysis.tags.slice(0, 2).join(', ') }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div class="empty-state" v-else>
      <p>暂无截图</p>
      <p class="hint">首页点击"扫描截图"开始</p>
    </div>
  </div>
</template>

<style scoped>
.screenshots-view {
  min-height: 100vh;
  background: #f5f5f5;
}

.view-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
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
  flex: 1;
  font-size: 18px;
  font-weight: 600;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #f5f5f5;
  font-size: 16px;
  cursor: pointer;
}

.category-tabs {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  overflow-x: auto;
  background: white;
  border-bottom: 1px solid #f0f0f0;
}

.category-tab {
  padding: 6px 12px;
  border-radius: 16px;
  border: none;
  background: #f5f5f5;
  font-size: 13px;
  white-space: nowrap;
  cursor: pointer;
}

.category-tab.active {
  background: #667eea;
  color: white;
}

.view-mode-toggle {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 8px 16px;
}

.view-mode-toggle button {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: white;
  cursor: pointer;
}

.view-mode-toggle button.active {
  background: #667eea;
  color: white;
}

.date-group {
  margin-bottom: 16px;
}

.date-label {
  padding: 8px 16px;
  font-size: 13px;
  color: #666;
  background: #f5f5f5;
}

.screenshot-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 12px 16px;
}

.screenshot-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
}

.card-thumb {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
}

.category-icon {
  font-size: 40px;
}

.card-info {
  padding: 10px;
}

.card-time {
  font-size: 12px;
  color: #999;
}

.card-summary {
  font-size: 13px;
  color: #333;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-tags {
  display: flex;
  gap: 4px;
  padding: 0 10px 10px;
  flex-wrap: wrap;
}

.tag {
  padding: 2px 6px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 11px;
  color: #666;
}

.screenshot-list {
  background: white;
}

.list-item {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.list-thumb {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.list-info {
  flex: 1;
  overflow: hidden;
}

.list-summary {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.empty-state {
  padding: 60px;
  text-align: center;
  color: #999;
}

.hint {
  font-size: 13px;
  margin-top: 8px;
}
</style>
