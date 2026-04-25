# 📸 截图智能管家 — 产品需求文档 (PRD)

> 版本：v1.0  
> 日期：2026-04-24  
> 作者：QClaw + 昭润  
> 状态：需求确认中

---

## 一、产品概述

### 1.1 产品定位
一款面向个人用户的手机APP，自动管理手机截图：AI智能分析、分类归档、日程提取、定位记录、自动清理，让截图从"存了就忘"变成"随时可用"。

### 1.2 核心价值
- **不丢**：截图自动归档，30天以上自动上传NAS/云端
- **能找**：AI标签 + OCR全文搜索，秒级定位任何截图
- **有用**：日程自动提取→日历提醒，截图信息变行动项
- **省空间**：归档后留缩略图+OCR文本，原图云端存储

### 1.3 目标用户
- 重度截图用户（微信聊天截图、工作凭证、报价单等）
- 需要从截图中提取待办/日程的人
- 手机存储经常被截图占满的人

---

## 二、功能需求

### P0 — 核心功能（MVP必做）

#### 2.1 截图自动扫描
| 项目 | 说明 |
|------|------|
| 触发方式 | APP后台定时扫描（可配置间隔：1h/2h/6h/12h） |
| 扫描范围 | 系统截图文件夹（Android: DCIM/Screenshots; iOS: Photos截图相册） |
| 增量检测 | 只处理新增截图（基于文件MD5 + 修改时间） |
| 去重检测 | 相同内容截图自动识别，标记为重复，保留最新一张 |

#### 2.2 AI智能分析（在线大模型）
| 项目 | 说明 |
|------|------|
| 分析时机 | 新截图扫描到后，后台异步调用 |
| LLM接口 | 预留Provider接口，后补API Key |
| 分析内容 | ① 智能标签（2-5个） ② 内容摘要（一句话） ③ 日程提取 ④ 紧急程度 ⑤ 截图分类 |
| 结果缓存 | 分析结果存本地SQLite，同一截图只调一次LLM |
| 敏感保护 | 银行卡/密码类截图自动跳过LLM，仅本地OCR |
| 成本预估 | Qwen-VL/GPT-4o-mini ≈ 0.01-0.03元/张，日均50张 ≈ 0.5-1.5元/天 |

#### 2.3 本地OCR文字提取
| 项目 | 说明 |
|------|------|
| 引擎 | PaddleOCR（离线，免费） |
| 用途 | 提取截图全文字，用于全文搜索 |
| 速度 | 每张 <3秒（本地执行） |
| 存储 | OCR文本存SQLite，供搜索和LLM分析使用 |

#### 2.4 截图分类管理
| 项目 | 说明 |
|------|------|
| AI分类 | 聊天记录/报价单/合同/订单/转账凭证/通知/日程/其他 |
| 对话归类 | 同一联系人的多张聊天截图自动归为一组（不物理拼接，列表展示） |
| 自定义标签 | 用户可自建标签，AI标签 + 用户标签共存 |
| 手动调整 | 支持拖拽移动、批量修改分类 |
| 缩略图 | 归档后本地保留缩略图（最大200px宽）+ OCR文本，可搜索可浏览 |

#### 2.5 日程提取与日历提醒
| 项目 | 说明 |
|------|------|
| 提取方式 | LLM分析截图时提取日程信息（时间+事件+地点） |
| 日历集成 | 生成标准 .ics 文件 → 导入系统日历（iOS/Android） |
| APP内提醒 | 本地通知推送（可配置提前量：5min/15min/1h/1天） |
| 重复提醒 | 支持一次性/每日/每周/每月 |
| 日报 | 每日21:00自动生成当日截图摘要+待办清单（可配置关闭） |
| 开源模块集成 | ical.js（.ics生成）、node-cron风格定时引擎、系统通知API |

#### 2.6 定位记录与地图展示
| 项目 | 说明 |
|------|------|
| GPS记录 | 截图时自动记录地理位置（手机截图读EXIF GPS） |
| 粗略定位 | PC截图从WiFi/IP推断城市级位置 |
| 手动标记 | 用户可在地图上手动标注位置 |
| 地图方案 | Leaflet.js + OpenStreetMap（完全免费，无调用量限制） |
| 地图功能 | ① 按日期显示标记点 ② 点击标记弹出截图缩略图+OCR摘要 ③ 按分类/标签筛选 ④ 不同分类不同颜色标记 |
| 隐私 | 定位功能默认关闭，用户手动开启 |

#### 2.7 自动归档与清理
| 项目 | 说明 |
|------|------|
| 归档触发 | 截图超过30天（可配置15/30/60/90天） |
| 上传目标 | ① 飞牛NAS（首选） ② 微云（备选） ③ 其他WebDAV |
| 归档策略 | 原图上传云端 → 本地保留缩略图+OCR文本 → 可搜索可浏览 |
| 一键清理 | 用户确认后删除已归档的本地原图 |
| 安全机制 | 上传成功验证后才允许删除本地，失败自动重试3次 |

### P1 — 增强功能（二期）

#### 2.8 敏感内容保护
| 项目 | 说明 |
|------|------|
| 自动检测 | 银行卡号、密码、身份证号等敏感信息 |
| 处理方式 | 跳过LLM分析 → 仅本地OCR → 本地加密存储 |
| 加密方式 | AES-256，密钥由用户密码派生 |

#### 2.9 截图来源识别
| 项目 | 说明 |
|------|------|
| 识别能力 | 自动判断来自微信/浏览器/Excel/系统通知等 |
| 用途 | 辅助分类 + 统计截图来源分布 |

#### 2.10 知识沉淀
| 项目 | 说明 |
|------|------|
| 功能 | 截图中的专业信息（报价、规格、工艺标准）自动提取入库 |
| 用途 | 与用户现有知识库体系对接（暖通行业数据等） |

---

## 三、技术架构

### 3.1 整体架构

```
┌─────────────────────────────────────────────┐
│                  手机 APP                     │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │ 前端UI    │  │ 本地引擎  │  │ 系统集成   │  │
│  │ (Vue3)   │  │ SQLite   │  │ 日历/通知  │  │
│  │ Leaflet  │  │ PaddleOCR│  │ .ics导出  │  │
│  │          │  │ 定时扫描  │  │ 定位API   │  │
│  └──────────┘  └──────────┘  └───────────┘  │
│         │             │                       │
│         └──────┬──────┘                       │
│                │                              │
│         ┌──────▼──────┐                       │
│         │ LLM Provider │ ← 在线大模型API      │
│         │ (可插拔接口)  │   (Qwen-VL等)       │
│         └──────┬──────┘                       │
│                │                              │
└────────────────┼──────────────────────────────┘
                 │
         ┌───────▼───────┐
         │   云端存储      │
         │ NAS / 微云      │
         │ / WebDAV       │
         └───────────────┘
```

### 3.2 LLM Provider 接口设计

```typescript
interface LLMProvider {
  name: string                    // "qwen-vl" | "gpt-4o-mini" | "deepseek-vl"
  endpoint: string                // API URL
  apiKey: string                  // 待用户提供
  model: string                   // 模型名
  
  analyze(image: Buffer, prompt: string): Promise<AnalysisResult>
}

interface AnalysisResult {
  tags: string[]                  // 智能标签
  summary: string                 // 内容摘要
  category: string                // 分类
  schedules: Schedule[]           // 提取的日程
  urgency: 'low' | 'medium' | 'high'  // 紧急程度
  isSensitive: boolean            // 是否包含敏感信息
}
```

### 3.3 数据库设计（SQLite）

```sql
-- 截图表
CREATE TABLE screenshots (
  id TEXT PRIMARY KEY,            -- UUID
  file_path TEXT,                 -- 原始路径
  file_hash TEXT UNIQUE,          -- MD5去重
  thumbnail_path TEXT,            -- 缩略图路径
  file_size INTEGER,
  created_at DATETIME,            -- 截图时间
  scanned_at DATETIME,            -- 扫描时间
  ocr_text TEXT,                  -- OCR全文
  source_app TEXT,                -- 来源APP
  latitude REAL,                  -- GPS纬度
  longitude REAL,                 -- GPS经度
  location_text TEXT,             -- 位置文字描述
  is_sensitive BOOLEAN DEFAULT 0,
  is_archived BOOLEAN DEFAULT 0,
  is_deleted BOOLEAN DEFAULT 0,
  group_id TEXT                   -- 归类组ID（同一对话）
);

-- AI分析结果
CREATE TABLE analysis (
  screenshot_id TEXT PRIMARY KEY,
  tags TEXT,                      -- JSON array
  summary TEXT,
  category TEXT,
  urgency TEXT,
  provider TEXT,                  -- 使用的LLM
  analyzed_at DATETIME
);

-- 标签
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE,
  type TEXT,                      -- 'ai' | 'user'
  color TEXT
);

-- 日程
CREATE TABLE schedules (
  id TEXT PRIMARY KEY,
  screenshot_id TEXT,
  event_name TEXT,
  event_time DATETIME,
  location TEXT,
  reminder_minutes INTEGER,       -- 提前提醒分钟数
  is_exported_to_calendar BOOLEAN DEFAULT 0,
  status TEXT DEFAULT 'pending'   -- pending | done | cancelled
);

-- 分类
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE,
  icon TEXT,
  color TEXT,
  is_default BOOLEAN DEFAULT 0
);
```

### 3.4 地图方案：Leaflet + OpenStreetMap

```
技术栈：
- Leaflet.js（42KB，轻量地图库）
- OpenStreetMap瓦片（完全免费，无需API Key）
- 标记点自定义图标（按分类颜色区分）
- 离线缓存（已查看区域瓦片缓存本地）

调用方式：
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
  L.marker([lat, lng]).bindPopup(缩略图+摘要)
```

---

## 四、开发平台选型对比

### 4.1 候选方案

| 维度 | **React Native + Expo** ⭐ | **uni-app** | **Capacitor + Vue3** | **Flutter** |
|------|--------------------------|-------------|---------------------|-------------|
| **语言** | JavaScript/TypeScript | Vue/JS | Vue3/TypeScript | Dart |
| **热更新** | ✅ Expo OTA（内置，免费） | ✅ wgt包热更新（原生支持） | ✅ Capacitor-updater / Capgo | ❌ 不支持热更新 |
| **更新推送** | ✅ Expo内置推送服务 | ⚠️ 需自建或用uni-push | ⚠️ 需自建或用Capgo | ⚠️ 需自建 |
| **iOS+Android** | ✅ 一套代码 | ✅ 一套代码 | ✅ 一套代码 | ✅ 一套代码 |
| **小程序** | ❌ | ✅ 微信/支付宝等 | ❌ | ❌ |
| **原生能力** | ✅ Expo SDK丰富 | ✅ plus.runtime | ✅ Capacitor插件 | ✅ Platform Channel |
| **地图** | ✅ react-native-maps | ✅ 内置地图组件 | ✅ Leaflet直接用 | ✅ flutter_map |
| **OCR** | ⚠️ 需桥接原生 | ⚠️ 需原生插件 | ✅ Web可跑PaddleOCR.js | ⚠️ 需原生插件 |
| **学习曲线** | 中 | 低（Vue生态） | 低（Web开发者友好） | 高（需学Dart） |
| **社区** | 非常大 | 国内最大 | 中等 | 大 |
| **免费程度** | Expo免费 | 基础免费 | 开源免费 | 开源免费 |
| **上架** | 正常 | 正常 | 正常 | 正常 |

### 4.2 推荐方案：Capacitor + Vue3

**理由：**

1. **热更新**：Capacitor-updater（开源）或Capgo（SaaS）支持OTA更新，改了前端代码直接推送，用户无需重新安装
2. **Web技术栈**：Vue3 + TypeScript，Leaflet/PaddleOCR.js都能直接用，无需桥接原生
3. **更新推送流程**：
   ```
   修改代码 → npm run build → capacitor-updater deploy
     → 用户APP下次启动自动检测 → 下载新包 → 静默更新 → 重启生效
   ```
4. **你已有Vue3经验**（红蕊H5就是Vue3），学习成本最低
5. **原生能力够用**：截图扫描、文件系统、通知、定位，Capacitor都有官方插件

### 4.3 备选方案：uni-app

如果后续想同时出**微信小程序版**，可以考虑uni-app：
- 一套代码 → APP + 微信小程序
- wgt热更新原生支持
- 国内社区大，文档全中文
- 缺点：PaddleOCR集成不如Web方便，需写原生插件

### 4.4 热更新方案对比

| 方案 | 原理 | 免费？ | 推荐度 |
|------|------|--------|--------|
| **Capgo**（Capacitor推荐） | SaaS托管更新包，APP轮询下载 | 开源版免费，云服务有限额 | ⭐⭐⭐ |
| **Capacitor-updater自建** | 自己服务器托管更新包 | 完全免费 | ⭐⭐⭐⭐ |
| **Expo OTA** | Expo内置推送 | 免费（有额度） | ⭐⭐⭐⭐ |
| **uni-app wgt** | 生成wgt升级包 | 完全免费 | ⭐⭐⭐⭐ |
| **CodePush**（微软） | 云端托管 | ⚠️ 2025年App Center已停服 | ❌ |

---

## 五、开发计划

### 5.1 MVP（4周）

| 周 | 内容 |
|----|------|
| W1 | 项目搭建（Capacitor+Vue3）、截图扫描、SQLite存储、PaddleOCR集成 |
| W2 | LLM Provider接口+分析流程、分类管理、标签系统、对话归类 |
| W3 | 日程提取、.ics导出、本地通知、日报生成 |
| W4 | 定位记录、Leaflet地图、自动归档上传、热更新集成、测试 |

### 5.2 二期（2周）

- 敏感内容保护
- 截图来源识别
- 知识沉淀对接
- UI优化+性能调优

---

## 六、待确认事项

| # | 事项 | 状态 |
|---|------|------|
| 1 | LLM API选择（Qwen-VL? GPT-4o-mini? DeepSeek?） | ⏳ 用户后补 |
| 2 | 开发平台最终确认（Capacitor vs uni-app） | ⏳ 用户确认 |
| 3 | NAS上传目标确认（飞牛NAS的WebDAV地址） | ⏳ 待提供 |
| 4 | 微云上传是否需要（已有weiyun skill可复用） | ⏳ 待确认 |
| 5 | APP名称确认 | ⏳ 待定 |
| 6 | 是否需要微信小程序版 | ⏳ 待确认 |

---

## 七、风险与应对

| 风险 | 应对 |
|------|------|
| 苹果App Store热更新审核 | Capacitor-updater符合Apple指南（只更新Web资源不改原生代码） |
| LLM API费用超标 | 设日调用上限 + 超限降级为纯OCR模式 |
| PaddleOCR移动端性能 | 大图先压缩到1080p再OCR，预估<3秒/张 |
| OpenStreetMap中国数据精度 | 城市级定位足够，必要时可切换高德瓦片源 |
| 用户隐私顾虑 | 定位默认关闭、敏感截图本地加密、LLM调用可选关闭 |
