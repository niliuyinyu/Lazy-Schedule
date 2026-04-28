<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useScreenshotStore } from '@/stores/screenshot'

const router = useRouter()
const screenshotStore = useScreenshotStore()

const searchQuery = ref('')
const searchResults = ref<typeof screenshotStore.screenshots>([])
const isSearching = ref(false)

function goBack() {
  router.back()
}

function handleSearch() {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  isSearching.value = true
  const query = searchQuery.value.toLowerCase()
  searchResults.value = screenshotStore.screenshots.filter(shot => {
    const text = [
      shot.ocrText || '',
      shot.analysis?.summary || '',
      (shot.analysis?.tags || []).join(' ')
    ].join(' ').toLowerCase()
    return text.includes(query)
  })
  isSearching.value = false
}

function goToDetail(id: string) {
  router.push(`/screenshot/${id}`)
}
</script>

<template>
  <div class="search-view">
    <header class="view-header">
      <button class="back-btn" @click="goBack">←</button>
      <div class="search-input-wrapper">
        <input
          type="text"
          class="search-input"
          placeholder="搜索截图内容..."
          v-model="searchQuery"
          @input="handleSearch"
          autofocus
        />
        <button class="clear-btn" v-if="searchQuery" @click="searchQuery = ''; searchResults = []">✕</button>
      </div>
    </header>

    <div class="search-content" v-if="searchResults.length > 0">
      <div class="results-count">找到 {{ searchResults.length }} 条结果</div>
      <div class="results-list">
        <div
          v-for="shot in searchResults"
          :key="shot.id"
          class="result-item"
          @click="goToDetail(shot.id)"
        >
          <div class="result-thumb">
            {{ shot.analysis?.category ? screenshotStore.categories.find(c => c.id === shot.analysis?.category)?.icon : '📷' }}
          </div>
          <div class="result-content">
            <div class="result-summary">{{ shot.analysis?.summary || shot.ocrText?.slice(0, 60) }}</div>
            <div class="result-meta">
              <span>{{ new Date(shot.createdAt).toLocaleDateString() }}</span>
              <span v-if="shot.analysis?.tags?.length">{{ shot.analysis.tags.slice(0, 3).join(', ') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="search-tips" v-else-if="!searchQuery">
      <div class="tip-icon">🔍</div>
      <p>搜索提示</p>
      <ul class="tips-list">
        <li>输入文字内容搜索截图</li>
        <li>支持 OCR 识别的全文搜索</li>
        <li>AI 生成的摘要也会被搜索</li>
      </ul>
    </div>

    <div class="no-results" v-else>
      <p>未找到相关截图</p>
    </div>
  </div>
</template>

<style scoped>
.search-view {
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

.search-input-wrapper {
  flex: 1;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 10px 36px 10px 16px;
  border-radius: 20px;
  border: none;
  background: #f5f5f5;
  font-size: 15px;
}

.clear-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: #ddd;
  font-size: 12px;
  cursor: pointer;
}

.results-count {
  padding: 12px 16px;
  font-size: 13px;
  color: #666;
}

.results-list {
  background: white;
}

.result-item {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.result-thumb {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.result-content {
  flex: 1;
  overflow: hidden;
}

.result-summary {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.search-tips {
  padding: 40px;
  text-align: center;
  color: #999;
}

.tip-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.tips-list {
  text-align: left;
  margin-top: 16px;
  padding-left: 20px;
  font-size: 13px;
}

.tips-list li {
  margin-bottom: 8px;
}

.no-results {
  padding: 60px;
  text-align: center;
  color: #999;
}
</style>
