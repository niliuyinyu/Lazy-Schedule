<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { storageService } from '@/services/storage'

const router = useRouter()
const settingsStore = useSettingsStore()

const activeTab = ref('general')
const apiKeyInput = ref('')
const nasUrl = ref('')
const nasUser = ref('')
const nasPass = ref('')

const scanIntervalOptions = [
  { value: 1, label: '每小时' },
  { value: 2, label: '每2小时' },
  { value: 6, label: '每6小时' },
  { value: 12, label: '每12小时' }
]

const reminderOptions = [
  { value: 5, label: '提前5分钟' },
  { value: 15, label: '提前15分钟' },
  { value: 60, label: '提前1小时' },
  { value: 1440, label: '提前1天' }
]

const archiveDaysOptions = [
  { value: 15, label: '15天' },
  { value: 30, label: '30天' },
  { value: 60, label: '60天' },
  { value: 90, label: '90天' }
]

onMounted(() => {
  apiKeyInput.value = localStorage.getItem('llm-api-key') || ''
})

function goBack() {
  router.back()
}

async function updateSetting(key: string, value: any) {
  await settingsStore.updateSettings({ [key]: value })
}

async function saveApiKey() {
  if (apiKeyInput.value.trim()) {
    await settingsStore.saveLLMApiKey(apiKeyInput.value.trim())
    alert('API Key 保存成功')
  }
}

async function saveNasConfig() {
  if (nasUrl.value && nasUser.value && nasPass.value) {
    const config = {
      id: 'nas-webdav',
      providerType: 'webdav' as const,
      configJson: JSON.stringify({
        url: nasUrl.value,
        username: nasUser.value,
        password: nasPass.value
      }),
      isActive: true
    }
    await settingsStore.saveStorageConfig(config)
    alert('NAS 配置保存成功')
  }
}

async function testStorage() {
  if (!nasUrl.value || !nasUser.value || !nasPass.value) {
    alert('请先填写完整的 NAS 配置')
    return
  }

  let url = nasUrl.value.trim()
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }

  const config = {
    id: 'nas-webdav',
    providerType: 'webdav' as const,
    configJson: JSON.stringify({
      url: url,
      username: nasUser.value,
      password: nasPass.value
    }),
    isActive: true
  }

  const result = await storageService.testConnection(config)

  if (result.success) {
    alert('✅ NAS 连接成功！')
  } else {
    alert('❌ 连接失败：' + (result.error || '未知错误'))
  }
}
</script>

<template>
  <div class="settings-view">
    <header class="view-header">
      <button class="back-btn" @click="goBack">←</button>
      <h1>设置</h1>
    </header>

    <div class="settings-content">
      <nav class="settings-nav">
        <button
          class="nav-btn"
          :class="{ active: activeTab === 'general' }"
          @click="activeTab = 'general'"
        >
          通用
        </button>
        <button
          class="nav-btn"
          :class="{ active: activeTab === 'llm' }"
          @click="activeTab = 'llm'"
        >
          AI设置
        </button>
        <button
          class="nav-btn"
          :class="{ active: activeTab === 'storage' }"
          @click="activeTab = 'storage'"
        >
          存储
        </button>
      </nav>

      <div class="settings-panel" v-if="activeTab === 'general'">
        <div class="setting-group">
          <div class="setting-item">
            <div class="setting-label">
              <div class="label-title">扫描间隔</div>
              <div class="label-desc">自动扫描新截图的频率</div>
            </div>
            <select
              class="setting-select"
              :value="settingsStore.settings.scanInterval"
              @change="updateSetting('scanInterval', Number(($event.target as HTMLSelectElement).value))"
            >
              <option v-for="opt in scanIntervalOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <div class="setting-item">
            <div class="setting-label">
              <div class="label-title">自动归档</div>
              <div class="label-desc">超过指定天数后自动上传到云端</div>
            </div>
            <label class="switch">
              <input
                type="checkbox"
                :checked="settingsStore.settings.autoArchive"
                @change="updateSetting('autoArchive', ($event.target as HTMLInputElement).checked)"
              />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item" v-if="settingsStore.settings.autoArchive">
            <div class="setting-label">
              <div class="label-title">归档天数</div>
              <div class="label-desc">截图超过此天数后自动归档</div>
            </div>
            <select
              class="setting-select"
              :value="settingsStore.settings.archiveDays"
              @change="updateSetting('archiveDays', Number(($event.target as HTMLSelectElement).value))"
            >
              <option v-for="opt in archiveDaysOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <div class="setting-item">
            <div class="setting-label">
              <div class="label-title">日程提醒</div>
              <div class="label-desc">提前多久提醒</div>
            </div>
            <select
              class="setting-select"
              :value="settingsStore.settings.reminderMinutes"
              @change="updateSetting('reminderMinutes', Number(($event.target as HTMLSelectElement).value))"
            >
              <option v-for="opt in reminderOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <div class="setting-item">
            <div class="setting-label">
              <div class="label-title">每日日报</div>
              <div class="label-desc">21:00 发送今日截图摘要</div>
            </div>
            <label class="switch">
              <input
                type="checkbox"
                :checked="settingsStore.settings.dailyReport"
                @change="updateSetting('dailyReport', ($event.target as HTMLInputElement).checked)"
              />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-label">
              <div class="label-title">主题</div>
            </div>
            <select
              class="setting-select"
              :value="settingsStore.settings.theme"
              @change="updateSetting('theme', ($event.target as HTMLSelectElement).value)"
            >
              <option value="light">浅色</option>
              <option value="dark">深色</option>
              <option value="auto">跟随系统</option>
            </select>
          </div>
        </div>
      </div>

      <div class="settings-panel" v-if="activeTab === 'llm'">
        <div class="setting-group">
          <div class="setting-item full">
            <div class="setting-label">
              <div class="label-title">API Provider</div>
              <div class="label-desc">选择 AI 分析服务提供商</div>
            </div>
          </div>
          <div class="provider-cards">
            <div class="provider-card selected">
              <div class="provider-icon">🔥</div>
              <div class="provider-name">硅基流动</div>
              <div class="provider-desc">免费额度充足</div>
            </div>
            <div class="provider-card">
              <div class="provider-icon">☁️</div>
              <div class="provider-name">阿里云</div>
              <div class="provider-desc">通义千问</div>
            </div>
            <div class="provider-card">
              <div class="provider-icon">🤖</div>
              <div class="provider-name">自定义</div>
              <div class="provider-desc">API Key</div>
            </div>
          </div>

          <div class="setting-item full">
            <div class="setting-label">
              <div class="label-title">API Key</div>
            </div>
            <input
              type="password"
              class="setting-input"
              placeholder="输入 API Key"
              v-model="apiKeyInput"
            />
          </div>

          <div class="setting-hint">
            访问 <a href="https://siliconflow.cn" target="_blank">siliconflow.cn</a> 获取免费 API Key
          </div>

          <button class="save-btn" @click="saveApiKey">保存 API Key</button>
        </div>
      </div>

      <div class="settings-panel" v-if="activeTab === 'storage'">
        <div class="setting-group">
          <div class="setting-item full">
            <div class="setting-label">
              <div class="label-title">存储方式</div>
            </div>
          </div>
          <div class="storage-cards">
            <div class="storage-card selected">
              <div class="storage-icon">🖥️</div>
              <div class="storage-name">NAS (WebDAV)</div>
              <div class="storage-desc">群晖/飞牛/极空间</div>
            </div>
            <div class="storage-card">
              <div class="storage-icon">☁️</div>
              <div class="storage-name">阿里云盘</div>
              <div class="storage-desc">扫码登录</div>
            </div>
          </div>

          <div class="setting-item full">
            <div class="setting-label">
              <div class="label-title">NAS 地址</div>
              <div class="label-desc">例如: https://dav.wangeyan.fnos.net:443</div>
            </div>
            <input
              type="text"
              class="setting-input"
              placeholder="https://dav.wangeyan.fnos.net:443"
              v-model="nasUrl"
            />
          </div>

          <div class="setting-item">
            <div class="setting-label">
              <div class="label-title">用户名</div>
            </div>
            <input type="text" class="setting-input" placeholder="NAS 用户名" v-model="nasUser" />
          </div>

          <div class="setting-item">
            <div class="setting-label">
              <div class="label-title">密码</div>
            </div>
            <input type="password" class="setting-input" placeholder="NAS 密码" v-model="nasPass" />
          </div>

          <div class="storage-actions">
            <button class="test-btn" @click="testStorage">测试连接</button>
            <button class="save-btn" @click="saveNasConfig">保存配置</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-view {
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

.settings-nav {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
}

.nav-btn {
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  background: #f5f5f5;
  font-size: 14px;
  cursor: pointer;
}

.nav-btn.active {
  background: #667eea;
  color: white;
}

.settings-panel {
  padding: 16px;
}

.setting-group {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item.full {
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.label-title {
  font-size: 15px;
  color: #333;
}

.label-desc {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.setting-select {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #f9f9f9;
  font-size: 14px;
}

.switch {
  position: relative;
  width: 48px;
  height: 28px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ccc;
  border-radius: 28px;
  transition: 0.3s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: 0.3s;
}

.switch input:checked + .slider {
  background: #667eea;
}

.switch input:checked + .slider:before {
  transform: translateX(20px);
}

.provider-cards,
.storage-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 0 16px 16px;
}

.provider-card,
.storage-card {
  padding: 12px;
  border-radius: 8px;
  border: 2px solid #f0f0f0;
  text-align: center;
  cursor: pointer;
}

.provider-card.selected,
.storage-card.selected {
  border-color: #667eea;
  background: #f8f6ff;
}

.provider-icon,
.storage-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.provider-name,
.storage-name {
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

.provider-desc,
.storage-desc {
  font-size: 10px;
  color: #999;
}

.setting-input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 14px;
}

.setting-hint {
  padding: 12px 16px;
  font-size: 12px;
  color: #999;
}

.setting-hint a {
  color: #667eea;
}

.save-btn {
  width: calc(100% - 32px);
  margin: 0 16px 16px;
  padding: 12px;
  border-radius: 8px;
  border: none;
  background: #52c41a;
  color: white;
  font-size: 15px;
  cursor: pointer;
}

.storage-actions {
  display: flex;
  gap: 12px;
  padding: 16px;
}

.storage-actions .test-btn,
.storage-actions .save-btn {
  flex: 1;
  margin: 0;
  width: auto;
}

.test-btn {
  width: calc(100% - 32px);
  margin: 16px;
  padding: 12px;
  border-radius: 8px;
  border: none;
  background: #667eea;
  color: white;
  font-size: 15px;
  cursor: pointer;
}
</style>
