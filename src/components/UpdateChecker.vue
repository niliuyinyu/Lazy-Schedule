<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useUpdateStore } from '@/stores/update'

const updateStore = useUpdateStore()
const showDialog = ref(false)

onMounted(() => {
  updateStore.checkForUpdate()
})

async function handleCheckUpdate() {
  await updateStore.checkForUpdate()
  if (updateStore.updateAvailable) {
    showDialog.value = true
  }
}

async function handleDownloadUpdate() {
  await updateStore.downloadUpdate()
  showDialog.value = false
}

function handleOpenGitHub() {
  updateStore.openGitHubReleases()
  showDialog.value = false
}
</script>

<template>
  <div class="update-checker">
    <div class="update-item" @click="handleCheckUpdate">
      <div class="update-icon">🔄</div>
      <div class="update-info">
        <div class="update-title">检查更新</div>
        <div class="update-desc">
          {{ updateStore.isChecking ? '正在检查...' : (updateStore.updateAvailable ? '发现新版本 v' + updateStore.latestVersion : '当前版本 v' + updateStore.currentVersion) }}
        </div>
      </div>
      <div v-if="updateStore.updateAvailable" class="update-badge">NEW</div>
    </div>
  </div>

  <div v-if="showDialog" class="update-dialog-overlay" @click.self="showDialog = false">
    <div class="update-dialog">
      <div class="dialog-header">
        <div class="dialog-icon">🎉</div>
        <h3>发现新版本</h3>
      </div>
      <div class="dialog-content">
        <div class="version-info">
          <span class="current-version">v{{ updateStore.currentVersion }}</span>
          <span class="arrow">→</span>
          <span class="latest-version">v{{ updateStore.latestVersion }}</span>
        </div>
        <div v-if="updateStore.releaseNotes" class="release-notes">{{ updateStore.releaseNotes }}</div>
        <div v-if="updateStore.fileSize" class="file-size">文件大小：{{ updateStore.formatSize() }}</div>
      </div>
      <div class="dialog-actions">
        <button class="action-btn secondary" @click="showDialog = false">稍后</button>
        <button class="action-btn primary" @click="handleDownloadUpdate">立即下载</button>
      </div>
      <div class="dialog-footer">
        <a href="#" @click.prevent="handleOpenGitHub">查看 GitHub Releases</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.update-checker {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.update-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.update-item:hover {
  background: #f5f5f5;
}

.update-icon {
  font-size: 24px;
}

.update-info {
  flex: 1;
}

.update-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.update-desc {
  font-size: 14px;
  color: #666;
}

.update-badge {
  background: #ff4757;
  color: white;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.update-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.update-dialog {
  background: white;
  border-radius: 16px;
  max-width: 360px;
  width: 100%;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dialog-header {
  text-align: center;
  padding: 24px 20px 16px;
}

.dialog-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.dialog-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.dialog-content {
  padding: 0 20px 20px;
  text-align: center;
}

.version-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.current-version {
  color: #666;
  font-size: 14px;
}

.arrow {
  color: #999;
}

.latest-version {
  color: #ff4757;
  font-weight: 600;
  font-size: 16px;
}

.release-notes {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

.file-size {
  color: #999;
  font-size: 12px;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  padding: 0 20px 16px;
}

.action-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.action-btn:hover {
  opacity: 0.9;
}

.action-btn.secondary {
  background: #f5f5f5;
  color: #333;
}

.action-btn.primary {
  background: linear-gradient(135deg, #ff4757, #ff6b81);
  color: white;
}

.dialog-footer {
  text-align: center;
  padding: 0 20px 20px;
}

.dialog-footer a {
  color: #007aff;
  font-size: 14px;
  text-decoration: none;
}
</style>
