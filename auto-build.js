#!/usr/bin/env node
import { execSync, spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🚀 截历 - APK 自动化构建工具')
console.log('='.repeat(50))

async function checkRequirements() {
  console.log('\n📋 检查环境...')

  const checks = {
    node: false,
    git: false,
    java: false
  }

  // 检查 Node.js
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8', stdio: 'pipe' })
    console.log('✅ Node.js:', nodeVersion.trim())
    checks.node = true
  } catch (e) {
    console.log('❌ Node.js 未找到')
  }

  // 检查 Git
  try {
    const gitVersion = execSync('git --version', { encoding: 'utf8', stdio: 'pipe' })
    console.log('✅ Git:', gitVersion.trim())
    checks.git = true
  } catch (e) {
    console.log('⚠️ Git 未找到（可以使用 GitHub 网页上传）')
  }

  // 检查 Java
  try {
    const javaVersion = execSync('java -version 2>&1', { encoding: 'utf8', stdio: 'pipe' })
    console.log('✅ Java:', javaVersion.split('\n')[0].trim())
    checks.java = true
  } catch (e) {
    console.log('⚠️ Java 未找到（GitHub Actions 不需要本地 Java）')
  }

  return checks
}

function showGitHubGuide() {
  console.log('\n' + '='.repeat(50))
  console.log('🎯 推荐方案：GitHub Actions（完全自动化！）')
  console.log('='.repeat(50))
  console.log('\n📝 步骤：')
  console.log('1. 访问：https://github.com/new')
  console.log('2. 创建仓库（例如：jieli-screenshot-manager）')
  console.log('3. 点击 "uploading an existing file"')
  console.log('4. 拖拽所有文件到 GitHub 页面')
  console.log('5. 提交后，GitHub 自动构建 APK！')
  console.log('\n📥 APK 下载位置：')
  console.log('仓库 -> Actions -> 最新构建 -> Artifacts')
}

function createQuickUploadGuide() {
  const guide = `
# 快速上传指南

## 🚀 最快方式（无需安装任何东西！

### 第 1 步：创建 GitHub 仓库
- 访问：https://github.com/new
- 仓库名称：jieli-screenshot-manager
- 点击：Create repository

### 第 2 步：上传文件
- 点击：uploading an existing file
- 打开文件夹：${__dirname}
- 全选所有文件（Ctrl+A）
- 拖拽到 GitHub
- 提交！

### 第 3 步：下载 APK
- 等待 3-5 分钟
- 进入仓库 Actions 标签
- 下载 APK！

---

## 项目信息
- 名称：截历
- 描述：截图管理应用
- 平台：Android + Web
`
  
  fs.writeFileSync(path.join(__dirname, 'QUICK_UPLOAD.md'), guide.trim())
  console.log('\n✅ 已创建快速上传指南：QUICK_UPLOAD.md')
}

async function main() {
  const checks = await checkRequirements()
  
  createQuickUploadGuide()
  showGitHubGuide()

  console.log('\n' + '='.repeat(50))
  console.log('💡 提示：')
  console.log('GitHub Actions 会自动处理所有事情！')
  console.log('不需要在本地安装 Java 或 Android SDK！')
  console.log('='.repeat(50))
}

main().catch(console.error)
