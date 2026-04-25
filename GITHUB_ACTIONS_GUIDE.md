# 自动构建 APK - GitHub Actions 使用指南

## 🎉 最推荐方案：GitHub Actions（完全免费！

我已经为你配置好了 GitHub Actions，这是最简单的自动生成 APK 的方案！

---

## 📋 使用步骤

### 第 1 步：创建 GitHub 仓库
1. 在 GitHub 上创建一个新仓库
2. 或使用现有仓库

### 第 2 步：推送代码
```bash
cd c:\Users\Administrator\.qclaw\workspace\screenshot-manager

# 初始化 Git（如果还没有）
git init
git add .
git commit -m "Initial commit: 截历截图管理应用"

# 添加远程仓库
git remote add origin https://github.com/你的用户名/仓库名.git

# 推送代码
git branch -M main
git push -u origin main
```

### 第 3 步：自动构建 APK！
推送代码后，GitHub Actions 会自动：
1. ✅ 安装 JDK 17
2. ✅ 安装依赖
3. ✅ 构建 Web 应用
4. ✅ 同步 Capacitor
5. ✅ 生成 APK
6. ✅ 上传 APK 为可下载文件

---

## 🔍 查看构建状态

1. 访问你的 GitHub 仓库
2. 点击 **"Actions"** 标签
3. 可以看到正在运行的构建任务
4. 构建完成后，在任务详情页可以下载 APK！

---

## 📥 下载 APK

构建成功后：
1. 进入 Actions 构建详情页
2. 在 **"Artifacts"** 部分找到 **"截历-APK"**
3. 点击下载即可！

---

## ⚙️ 手动触发构建

如果不想每次 push 都构建，可以：
1. 访问 Actions 页面
2. 选择 **"Build Android APK"** 工作流
3. 点击 **"Run workflow"** 手动触发

---

## 🆘 其他方案（如果不想用 GitHub）

### 方案 A：安装 Android Studio（本地构建）
1. 下载：https://developer.android.com/studio
2. 安装后打开 `android` 文件夹
3. 点击 **Build > Build Bundle(s) / APK(s)**

### 方案 B：使用在线构建服务
- **Codemagic**：https://codemagic.io/
- **App Center**：https://appcenter.ms/

---

## 📁 项目文件结构
```
screenshot-manager/
├── .github/
│   └── workflows/
│       └── build-android.yml  # 👈 GitHub Actions 配置
├── src/                      # 源代码
├── android/                  # Android 项目
├── dist/                     # Web 构建输出
└── ...其他文件...
```

---

## ✨ 开始使用吧！

现在只需要把代码推送到 GitHub，一切都会自动完成！🚀