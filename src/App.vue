<script setup lang="ts">
import { onMounted } from 'vue'
import { useScreenshotStore } from '@/stores/screenshot'
import { useSettingsStore } from '@/stores/settings'
import { useUpdater } from '@/plugins/useUpdater'

const screenshotStore = useScreenshotStore()
const settingsStore = useSettingsStore()
const { checkForUpdates } = useUpdater()

onMounted(async () => {
  await settingsStore.loadSettings()
  await screenshotStore.initialize()
  checkForUpdates()
})
</script>

<template>
  <div class="app-container">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style>
.app-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
