<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useScreenshotStore } from '@/stores/screenshot'

const router = useRouter()
const screenshotStore = useScreenshotStore()

const categoriesWithCount = computed(() => {
  return screenshotStore.categories.map(cat => {
    const count = screenshotStore.screenshots.filter(s =>
      s.analysis?.category === cat.id
    ).length
    return { ...cat, count }
  })
})

function goBack() {
  router.back()
}

function goToCategory(id: string) {
  router.push({ path: '/screenshots', query: { category: id } })
}
</script>

<template>
  <div class="categories-view">
    <header class="view-header">
      <button class="back-btn" @click="goBack">←</button>
      <h1>分类</h1>
    </header>

    <div class="categories-content">
      <div class="category-grid">
        <div
          v-for="cat in categoriesWithCount"
          :key="cat.id"
          class="category-card"
          @click="goToCategory(cat.id)"
        >
          <div class="category-icon">{{ cat.icon }}</div>
          <div class="category-name">{{ cat.name }}</div>
          <div class="category-count">{{ cat.count }} 张</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.categories-view {
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

.categories-content {
  padding: 16px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.category-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.category-card:active {
  transform: scale(0.98);
}

.category-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.category-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.category-count {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
</style>
