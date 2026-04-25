# 截历 App 构建指南

## 项目状态
- ✅ Web 应用已构建完成
- ✅ Android 平台已配置
- ✅ 所有核心功能已实现
- ⏸️ 需要手动安装 JDK 17+ 才能生成 APK
- 🚀 开发服务器运行中：http://localhost:5174/

## 快速使用

### 1. 在浏览器中测试（无需 APK）
直接访问 **http://localhost:5174/** 即可体验所有功能

### 2. 生成 APK（需要 JDK）

#### 方案 A：安装 JDK 后使用构建脚本
1. 下载并安装 **JDK 17+**：
   - 访问：https://adoptium.net/
   - 下载 Windows x64 版本（.msi 或 .zip）
   - 安装后设置环境变量 `JAVA_HOME`

2. 运行构建脚本：
   ```bash
   build.bat
   ```

#### 方案 B：使用 Android Studio（推荐）
1. 下载并安装 **Android Studio**：https://developer.android.com/studio
2. 打开 Android Studio
3. 选择 **"Open an existing project"**
4. 选择项目中的 `android` 文件夹
5. 等待依赖同步完成（可能需要几分钟）
6. 点击 **Build > Build Bundle(s) / APK(s) > Build APK(s)**
7. APK 生成位置：`android\app\build\outputs\apk\debug\app-debug.apk`

## 开发服务器
- **运行中**：http://localhost:5174/
- 可在浏览器中测试所有功能

## 核心功能
- 📷 截图管理（查看、分类、搜索）
- 📅 日程管理（导出、提醒、标记完成）
- 🤖 AI 分析（GLM-4.1V 模型）
- 🔒 本地存储（IndexedDB）
- ☁️ 云存储（飞牛 NAS WebDAV）

## 配置文件
- **应用 ID**：com.jieli.app
- **应用名称**：截历
- **Web 目录**：dist

## 注意事项
- 云存储功能需要在 App 中测试（浏览器有 CORS 限制）
- 首次运行需要配置 LLM API Key
- 日程导出需要系统日历权限
- Android 6.0+ 需要动态权限申请

## 技术栈
- Capacitor 6.2.1
- Vue 3
- Vite
- TypeScript
- Pinia

## 项目结构
```
screenshot-manager/
├── src/
│   ├── views/          # 页面组件
│   ├── services/       # 服务逻辑
│   ├── stores/         # 状态管理
│   └── router/         # 路由配置
├── android/            # Android 平台代码
├── dist/               # Web 构建输出
└── BUILD.md            # 本文件
```