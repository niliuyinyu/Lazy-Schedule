# 📸 截图智能管家 — 产品需求文档 (PRD)

> 版本：v1.1  
> 日期：2026-04-25  
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

## 二、APP命名方案

### 2.1 候选名称评估

| 名称 | 含义 | 优点 | 缺点 | 推荐度 |
|------|------|------|------|--------|
| **截历** | 截图+日历 | 短、好记、谐音"节历"有文化感 | 新造词需解释 | ⭐⭐⭐⭐⭐ |
| **懒人日程** | 懒得记→截图自动变日程 | 朗朗上口，"懒人"系类目认知强 | 没体现截图管理核心 | ⭐⭐⭐⭐ |
| **一拍日程** | 拍一下截图→日程 | 动感、有画面感 | 容易联想到拍照而非截图 | ⭐⭐⭐ |
| **图管家** | 截图管家 | 功能明确 | 太泛，像图片管理器 | ⭐⭐⭐ |
| **截图日程提醒** | 直白描述 | 一眼懂 | 太长、像功能名不像品牌名 | ⭐⭐ |

### 2.2 最终推荐

**🏆「截历」**

理由：
1. 2个字，好记好传播，App Store搜索友好
2. 精准体现核心——"截"（截图）+"历"（日历/历程）
3. 谐音"节历"，有文化底蕴
4. 品牌延展空间大：截历Pro、截历日签、截历小组件
5. Logo方向：一个截图图标叠在日历上，简洁有力

**备选：「懒人日程」**——如果后续想走"懒人"系列品牌路线

---

## 三、功能需求

### P0 — 核心功能（MVP必做）

#### 3.1 截图自动扫描
| 项目 | 说明 |
|------|------|
| 触发方式 | APP后台定时扫描（可配置间隔：1h/2h/6h/12h） |
| 扫描范围 | 系统截图文件夹（Android: DCIM/Screenshots; iOS: Photos截图相册） |
| 增量检测 | 只处理新增截图（基于文件MD5 + 修改时间） |
| 去重检测 | 相同内容截图自动识别，标记为重复，保留最新一张 |

#### 3.2 AI智能分析（在线大模型）
| 项目 | 说明 |
|------|------|
| 分析时机 | 新截图扫描到后，后台异步调用 |
| LLM接口 | 预留Provider接口，用户自选API（Qwen-VL / GPT-4o-mini / DeepSeek-VL / 其他） |
| 分析内容 | ① 智能标签（2-5个） ② 内容摘要（一句话） ③ 日程提取 ④ 紧急程度 ⑤ 截图分类 |
| 结果缓存 | 分析结果存本地SQLite，同一截图只调一次LLM |
| 敏感保护 | 银行卡/密码类截图自动跳过LLM，仅本地OCR |
| 成本预估 | ≈ 0.01-0.03元/张，日均50张 ≈ 0.5-1.5元/天 |

#### 3.3 本地OCR文字提取
| 项目 | 说明 |
|------|------|
| 引擎 | PaddleOCR（离线，免费） |
| 用途 | 提取截图全文字，用于全文搜索 |
| 速度 | 每张 <3秒（本地执行） |
| 存储 | OCR文本存SQLite，供搜索和LLM分析使用 |

#### 3.4 截图分类管理
| 项目 | 说明 |
|------|------|
| AI分类 | 聊天记录/报价单/合同/订单/转账凭证/通知/日程/其他 |
| 对话归类 | 同一联系人的多张聊天截图自动归为一组（列表展示，不物理拼接） |
| 自定义标签 | 用户可自建标签，AI标签 + 用户标签共存 |
| 手动调整 | 支持拖拽移动、批量修改分类 |
| 缩略图 | 归档后本地保留缩略图（最大200px宽）+ OCR文本，可搜索可浏览 |

#### 3.5 日程提取与日历提醒
| 项目 | 说明 |
|------|------|
| 提取方式 | LLM分析截图时提取日程信息（时间+事件+地点） |
| 日历集成 | 生成标准 .ics 文件 → 导入系统日历（iOS/Android） |
| APP内提醒 | 本地通知推送（可配置提前量：5min/15min/1h/1天） |
| 重复提醒 | 支持一次性/每日/每周/每月 |
| 日报 | 每日21:00自动生成当日截图摘要+待办清单（可配置关闭） |
| 开源模块集成 | ical.js（.ics生成）、node-cron风格定时引擎、系统通知API |

#### 3.6 定位记录与地图展示
| 项目 | 说明 |
|------|------|
| GPS记录 | 截图时自动记录地理位置（手机截图读EXIF GPS） |
| 粗略定位 | PC截图从WiFi/IP推断城市级位置 |
| 手动标记 | 用户可在地图上手动标注位置 |
| 地图方案 | Leaflet.js + OpenStreetMap（完全免费，无调用量限制） |
| 地图功能 | ① 按日期显示标记点 ② 点击标记弹出截图缩略图+OCR摘要 ③ 按分类/标签筛选 ④ 不同分类不同颜色标记 |
| 隐私 | 定位功能默认关闭，用户手动开启 |

#### 3.7 自动归档与清理
| 项目 | 说明 |
|------|------|
| 归档触发 | 截图超过30天（可配置15/30/60/90天） |
| 上传目标 | 用户自选：NAS / 云盘 / WebDAV（详见第四章） |
| 归档策略 | 原图上传云端 → 本地保留缩略图+OCR文本 → 可搜索可浏览 |
| 一键清理 | 用户确认后删除已归档的本地原图 |
| 安全机制 | 上传成功验证后才允许删除本地，失败自动重试3次 |

### P1 — 增强功能（二期）

#### 3.8 敏感内容保护
| 项目 | 说明 |
|------|------|
| 自动检测 | 银行卡号、密码、身份证号等敏感信息 |
| 处理方式 | 跳过LLM分析 → 仅本地OCR → 本地加密存储 |
| 加密方式 | AES-256，密钥由用户密码派生 |

#### 3.9 截图来源识别
| 项目 | 说明 |
|------|------|
| 识别能力 | 自动判断来自微信/浏览器/Excel/系统通知等 |
| 用途 | 辅助分类 + 统计截图来源分布 |

#### 3.10 知识沉淀
| 项目 | 说明 |
|------|------|
| 功能 | 截图中的专业信息（报价、规格、工艺标准）自动提取入库 |
| 用途 | 与用户现有知识库体系对接（暖通行业数据等） |

---

## 四、NAS与网盘存储方案对比

### 4.1 总览

所有方案均通过统一存储接口（StorageProvider）接入，用户在APP设置中选择并配置。

```typescript
interface StorageProvider {
  name: string
  type: 'webdav' | 'api' | 's3'
  upload(localPath: string, remotePath: string): Promise<UploadResult>
  download(remotePath: string, localPath: string): Promise<void>
  exists(remotePath: string): Promise<boolean>
  delete(remotePath: string): Promise<void>
  list(remoteDir: string): Promise<FileEntry[]>
}
```

### 4.2 NAS方案

#### A. 飞牛NAS（fnOS）

| 维度 | 说明 |
|------|------|
| **接入方式** | WebDAV（标准协议） |
| **默认端口** | HTTP: 5005 / HTTPS: 5006 |
| **配置路径** | 系统设置 → 文件服务 → WebDAV → 启用 |
| **认证方式** | 用户名+密码（fnOS系统账号） |
| **优点** | ① 国产NAS，中文界面友好 ② fnOS系统免费 ③ WebDAV原生支持，配置简单 ④ Docker可扩展 |
| **缺点** | 生态较新，社区小于群晖 |
| **接入难度** | ⭐⭐（低） |
| **费用** | fnOS免费，硬件自购 |

**接入代码示例（WebDAV）：**
```
PUT https://<NAS-IP>:5006/截图归档/2026-04/image_xxx.png
Authorization: Basic <base64(user:pass)>
Content-Type: image/png
```

#### B. 群晖NAS（Synology DSM）

| 维度 | 说明 |
|------|------|
| **接入方式** | WebDAV 或 Synology REST API |
| **默认端口** | WebDAV: HTTP 5005 / HTTPS 5006 |
| **配置路径** | 套件中心 → 安装WebDAV Server → 启用 |
| **认证方式** | DSM用户账号密码 |
| **REST API** | `https://<NAS>:5001/webapi/entry.cgi` — 支持文件上传/下载/列表 |
| **优点** | ① 市场占有率最高，社区庞大 ② 同时支持WebDAV和REST API ③ QuickConnect免费外网访问 ④ 文档完善 |
| **缺点** | 硬件价格较高 |
| **接入难度** | ⭐⭐（低，WebDAV方式同飞牛） |
| **费用** | 硬件￥2000起 |

**Synology REST API上传示例：**
```
POST https://<NAS>:5001/webapi/entry.cgi?api=SYNO.FileStation.Upload
  &version=2&method=upload
  &dest_folder_path=/截图归档
  &create_parents=true
Authorization: Bearer <sid>
Content-Type: multipart/form-data
```

#### C. 极空间NAS

| 维度 | 说明 |
|------|------|
| **接入方式** | WebDAV |
| **配置路径** | 系统设置 → 网络服务 → 文件访问 → WebDAV服务 |
| **认证方式** | 极空间账号密码 |
| **优点** | ① 性价比高 ② 自带外网访问（无需穿透） |
| **缺点** | WebDAV功能不如群晖/飞牛完善 |
| **接入难度** | ⭐⭐（低） |

#### D. 其他NAS（威联通/铁威马等）

| 维度 | 说明 |
|------|------|
| **接入方式** | 均支持WebDAV |
| **统一方案** | 所有NAS通过WebDAV协议接入，代码完全通用 |
| **注意事项** | ① 需开启WebDAV服务 ② 如需外网访问需配置DDNS/内网穿透 |

### 4.3 云盘方案

#### E. 腾讯微云

| 维度 | 说明 |
|------|------|
| **接入方式** | 腾讯OAuth2.0 API |
| **API地址** | `https://graph.qq.com/weiyun/upload_file` |
| **认证方式** | OAuth2.0（需注册腾讯开放平台应用） |
| **上传流程** | ① 申请上传（传SHA1/MD5/文件大小）→ ② 获取上传服务器地址 → ③ 分块上传 |
| **免费额度** | 个人用户10GB免费空间 |
| **优点** | ① 腾讯生态，微信登录 ② 已有weiyun skill可参考 ③ 秒传（SHA1去重） |
| **缺点** | ① API文档较旧，维护少 ② 免费空间有限 ③ 需OAuth授权 |
| **接入难度** | ⭐⭐⭐（中） |
| **费用** | 10GB免费，扩容需会员 |

**微云上传流程：**
```
Step 1: GET https://graph.qq.com/weiyun/upload_file
  ?sha=<SHA1>&md5=<MD5>&size=<bytes>&name=<filename>
  &access_token=<token>
→ 返回 upload_url + upload_type

Step 2: POST <upload_url>（分块上传文件数据）
```

#### F. 百度网盘

| 维度 | 说明 |
|------|------|
| **接入方式** | 百度开放平台API + MCP协议 |
| **API地址** | `https://pan.baidu.com/rest/2.0/xpan/file` |
| **认证方式** | OAuth2.0（需注册百度开发者应用） |
| **上传流程** | ① 预上传（precreate）→ ② 分块上传（upload）→ ③ 合并（create） |
| **免费额度** | 个人用户免费空间大（注册送100GB+） |
| **优点** | ① 用户基数最大 ② 免费空间充足 ③ 2025年已兼容MCP协议 ④ 秒传（MD5去重） |
| **缺点** | ① 非会员限速 ② API审核严格 ③ 需要百度开发者认证 |
| **接入难度** | ⭐⭐⭐⭐（中高） |
| **费用** | 免费空间充足，会员年费≈￥200 |

**百度网盘上传流程：**
```
Step 1: POST /rest/2.0/xpan/file?method=precreate
  → 返回 uploadid + block_list

Step 2: POST https://d.pcs.baidu.com/rest/2.0/pcs/superfile2?method=upload
  &access_token=<token>&path=<path>&uploadid=<id>&partseq=<n>
  → 逐块上传

Step 3: POST /rest/2.0/xpan/file?method=create
  → 合并所有块
```

#### G. 阿里云盘

| 维度 | 说明 |
|------|------|
| **接入方式** | 阿里云盘开放平台API |
| **API地址** | `https://open.aliyundrive.com/oauth/` + `https://api.aliyundrive.com/v2/` |
| **认证方式** | OAuth2.0（需注册开放平台应用） |
| **上传流程** | ① createFile（获取upload_url）→ ② PUT上传 → ③ complete |
| **免费额度** | 不限速！个人用户大空间 |
| **优点** | ① 不限速！ ② 免费空间大 ③ API较新较规范 |
| **缺点** | ① 开放平台审核周期长 ② 个人开发者接入门槛高 ③ 部分API需要企业认证 |
| **接入难度** | ⭐⭐⭐⭐（中高） |
| **费用** | 免费空间大，会员年费≈￥96 |

### 4.4 通用WebDAV方案

| 维度 | 说明 |
|------|------|
| **适用** | 任何支持WebDAV的存储（NAS、坚果云、NextCloud、自建服务器等） |
| **协议** | HTTP/HTTPS + WebDAV扩展（PUT/PROPFIND/DELETE） |
| **认证** | Basic Auth 或 Digest Auth |
| **优点** | ① 协议标准，一码通用 ② 无需各平台单独对接 ③ 坚果云免费版支持WebDAV |
| **缺点** | 功能不如原生API丰富（无秒传、无分享） |
| **接入难度** | ⭐⭐（低） |
| **坚果云免费额度** | 上传1GB/月，下载3GB/月 |

**WebDAV通用上传代码：**
```javascript
// 适用于所有NAS + 坚果云 + NextCloud等
async function webdavUpload(config, localPath, remotePath) {
  const fileBuffer = fs.readFileSync(localPath);
  await fetch(`${config.url}${remotePath}`, {
    method: 'PUT',
    headers: {
      'Authorization': 'Basic ' + btoa(`${config.user}:${config.pass}`),
      'Content-Type': 'application/octet-stream',
      'Content-Length': fileBuffer.length
    },
    body: fileBuffer
  });
}
```

### 4.5 方案推荐排序

| 优先级 | 方案 | 推荐理由 |
|--------|------|----------|
| 🥇 1 | **NAS + WebDAV**（飞牛/群晖/极空间） | 无空间限制、无私密泄露风险、一次配置永久使用 |
| 🥈 2 | **阿里云盘** | 不限速、大空间，适合无NAS用户 |
| 🥉 3 | **百度网盘** | 用户基数大，MCP协议支持，但限速 |
| 4 | **坚果云 WebDAV** | 免费WebDAV方案，适合小量备份 |
| 5 | **微云** | 腾讯生态好，但空间小、API旧 |

---

## 五、技术架构

### 5.1 开发平台确定：Capacitor + Vue3

**为什么选它：**
1. ✅ **完全免费** — 开源框架，无任何付费层
2. ✅ **热更新免费** — capacitor-updater（开源），自建服务器0成本
3. ✅ **Vue3技术栈** — 你已有经验（红蕊H5），学习成本为零
4. ✅ **Web组件直接用** — Leaflet/PaddleOCR.js/ical.js全部原生支持
5. ✅ **原生能力够** — 文件系统、通知、定位、相机，官方插件全覆盖

**vs 其他免费方案：**
- **uni-app**：基础免费，但HBuilderX绑定强，PaddleOCR集成需原生插件；优势是能出小程序
- **React Native + Expo**：Expo免费额度30k次/月OTA更新，够用；但你没React经验
- **Flutter**：开源免费，不支持热更新，需学Dart

### 5.2 整体架构

```
┌─────────────────────────────────────────────┐
│              「截历」APP (Capacitor+Vue3)      │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │ 前端UI    │  │ 本地引擎  │  │ 系统集成   │  │
│  │ Vue3+TS  │  │ SQLite   │  │ 日历/通知  │  │
│  │ Leaflet  │  │ PaddleOCR│  │ .ics导出  │  │
│  │          │  │ 定时扫描  │  │ 定位API   │  │
│  └──────────┘  └──────────┘  └───────────┘  │
│         │             │                       │
│         └──────┬──────┘                       │
│                │                              │
│  ┌─────────────▼──────────────┐              │
│  │    StorageProvider 接口     │              │
│  │ (WebDAV/API/S3 可插拔)     │              │
│  └──┬──────┬──────┬──────┬────┘              │
│     │      │      │      │                    │
│  ┌──▼─┐ ┌──▼─┐ ┌──▼─┐ ┌──▼──┐              │
│  │NAS │ │阿里 │ │百度 │ │微云  │              │
│  │WDav│ │云盘 │ │网盘 │ │API  │              │
│  └────┘ └────┘ └────┘ └─────┘              │
│                                             │
│  ┌─────────────▼──────────────┐              │
│  │    LLM Provider 接口       │              │
│  │ (用户自选API Key)          │              │
│  └────────────────────────────┘              │
└─────────────────────────────────────────────┘
```

### 5.3 热更新方案

**选用：capacitor-updater + 自建服务器**

```
流程：
1. 开发者修改代码 → npm run build
2. capacitor-updater bundle → 生成更新包
3. 上传到自建服务器（Cloudflare Workers/R2 免费额度）
4. APP启动时 → GET /version.json 检查版本
5. 有新版 → 后台下载ZIP → 下次启动自动切换
6. 失败 → 自动回滚到上一版本
```

**Cloudflare R2 免费额度：**
- 存储：10GB/月免费
- 读取：100万次/月免费
- 写入：100万次/月免费
- → 对于APP热更新完全够用

### 5.4 数据库设计（SQLite）

```sql
CREATE TABLE screenshots (
  id TEXT PRIMARY KEY,
  file_path TEXT,
  file_hash TEXT UNIQUE,
  thumbnail_path TEXT,
  file_size INTEGER,
  created_at DATETIME,
  scanned_at DATETIME,
  ocr_text TEXT,
  source_app TEXT,
  latitude REAL,
  longitude REAL,
  location_text TEXT,
  is_sensitive BOOLEAN DEFAULT 0,
  is_archived BOOLEAN DEFAULT 0,
  is_deleted BOOLEAN DEFAULT 0,
  group_id TEXT
);

CREATE TABLE analysis (
  screenshot_id TEXT PRIMARY KEY,
  tags TEXT,
  summary TEXT,
  category TEXT,
  urgency TEXT,
  provider TEXT,
  analyzed_at DATETIME
);

CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE,
  type TEXT,
  color TEXT
);

CREATE TABLE schedules (
  id TEXT PRIMARY KEY,
  screenshot_id TEXT,
  event_name TEXT,
  event_time DATETIME,
  location TEXT,
  reminder_minutes INTEGER,
  is_exported_to_calendar BOOLEAN DEFAULT 0,
  status TEXT DEFAULT 'pending'
);

CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE,
  icon TEXT,
  color TEXT,
  is_default BOOLEAN DEFAULT 0
);

CREATE TABLE storage_config (
  id TEXT PRIMARY KEY,
  provider_type TEXT,
  config_json TEXT,
  is_active BOOLEAN DEFAULT 0
);

CREATE TABLE llm_config (
  id TEXT PRIMARY KEY,
  provider_name TEXT,
  api_key TEXT,
  endpoint TEXT,
  model TEXT,
  is_active BOOLEAN DEFAULT 0
);
```

---

## 六、开发计划

### 6.1 MVP（4周）

| 周 | 内容 |
|----|------|
| W1 | 项目搭建（Capacitor+Vue3+TS）、截图扫描、SQLite存储、PaddleOCR.js集成 |
| W2 | LLM Provider接口+分析流程、分类管理、标签系统、对话归类、StorageProvider接口+WebDAV实现 |
| W3 | 日程提取、.ics导出、本地通知、日报生成、阿里云盘/百度网盘/微云接入 |
| W4 | 定位记录、Leaflet地图、热更新集成（Cloudflare R2）、测试、打包 |

### 6.2 二期（2周）

- 敏感内容保护（AES-256加密）
- 截图来源识别
- 知识沉淀对接
- UI优化+性能调优

---

## 七、待用户确认事项

| # | 事项 | 状态 |
|---|------|------|
| 1 | APP名称确认：「截历」还是「懒人日程」？ | ⏳ |
| 2 | 你有NAS吗？什么品牌？（影响优先实现哪个存储Provider） | ⏳ |
| 3 | LLM API选择（你自己决定，接口已预留） | 用户自定 |
| 4 | 开发平台：Capacitor+Vue3（已确定） | ✅ |
| 5 | 热更新方案：自建Cloudflare R2（免费额度够用） | ✅ |
| 6 | 存储接口：WebDAV优先，云盘可选（已确定） | ✅ |

---

## 八、风险与应对

| 风险 | 应对 |
|------|------|
| 苹果App Store热更新审核 | capacitor-updater符合Apple指南（只更新Web资源不改原生代码） |
| LLM API费用超标 | 设日调用上限 + 超限降级为纯OCR模式 + 用户自选模型控制成本 |
| PaddleOCR移动端性能 | 大图先压缩到1080p再OCR，预估<3秒/张 |
| OpenStreetMap中国数据精度 | 城市级定位足够，必要时可切换高德瓦片源（免费额度5000次/日） |
| 用户隐私顾虑 | 定位默认关闭、敏感截图本地加密、LLM调用可选关闭 |
| 各网盘API变动 | StorageProvider抽象层隔离，单个Provider变动不影响全局 |
---

> 📌 **文档版本更新记录**
> - v1.2 — 2026-04-25
>   - APP名称更新：「懒人备忘录」✅
>   - 新增P0功能：订单截图OCR提取 + 打包导出

---

## 九、功能更新 v1.2

### 9.1 新功能定位

**核心场景：** 暖通/建材采购场景中，从供应商发来的截图（报价单/订单/发货单）直接提取结构化数据，生成可二次使用的清单。

> 场景举例：给客户采购一批PPR管件，供应商微信发了截图 → 一键提取商品名称、规格、数量、单价 → 打包导出清单发给客户确认

---

### 9.2 订单截图OCR提取（P0 · MVP必做）

#### 功能入口
- 首页快捷入口：「提取订单」按钮
- 支持单张截图 / 多张截图批量处理
- 支持截图相册中选择 + 直接拍照识别

#### AI提取流程

```
用户提交截图
    ↓
本地PaddleOCR提取全文字
    ↓
LLM结构化解析（Provider接口，用户自选）
    ↓
输出结构化订单数据
```

#### 提取字段（LLM解析）

| 字段 | 说明 | 示例 |
|------|------|------|
| 商品名称 | 截图中识别的产品名 | "PPR热水管 DE25×3.5" |
| 规格/型号 | 产品规格 | "DE25×3.5"、"20mm" |
| 数量 | 数字+单位 | "100米"、"50个" |
| 单价 | 含货币单位 | "￥8.5/米"、"¥12.5/个" |
| 总价 | 行合计或总价 | "¥850" |
| 品牌/厂家 | 截图中出现的品牌 | "伟星"、"日丰" |
| 备注 | 其他重要信息 | "含税票"、"送到工地" |
| 客户名称 | 截图中客户名 | 从签名/抬头识别 |
| 供应商名称 | 供应商名称 | 从截图内容提取 |
| 截图日期 | 截图原始时间 | 从EXIF或内容推断 |

#### 结果展示
- 左：原图缩略图（可点击放大）
- 右：提取的结构化数据表格
- 用户可在线编辑/修正提取结果
- 置信度标注：低置信度字段标红提示用户核对

#### 存储处理
- 提取结果存SQLite（含来源截图ID）
- 可关联到已有截图记录（同一截图可同时做归档分析+订单提取）
- 不重复调用LLM：同一截图已有分析结果则复用

---

### 9.3 打包导出（P0 · MVP必做）

#### 导出格式选项

| 格式 | 内容 | 适用场景 |
|------|------|----------|
| **清单CSV** | 纯结构化数据表格（商品/规格/数量/单价/总价） | 发送给客户确认、导入Excel二次编辑 |
| **清单Excel（.xlsx）** | 美化表格，含汇总行、格式、缩略图列 | 正式报价单、打印输出 |
| **打包ZIP** | 原图打包 + 清单CSV/Excel | 存档备查、发给客户完整资料 |
| **图片包** | 原图打包（无清单） | 仅存档原图 |

#### ZIP打包结构

```
订单汇总_20260425/
├── 订单清单.csv          ← 结构化数据
├── 订单清单.xlsx          ← 美化版Excel（可选）
├── thumb_001.jpg         ← 截图缩略图（800px宽）
├── thumb_002.jpg
├── full_001.jpg          ← 原图大图（可选压缩）
└── full_002.jpg
```

#### 导出交互
- 选择要导出的项目（勾选）
- 选择导出格式
- 可添加备注/客户名称/项目名称（打在文件名和清单表头）
- 支持「分享到微信」直接发送文件

#### Excel美化输出（.xlsx）
- 表头：项目名称 + 导出日期 + 客户名称
- 汇总行：合计数量、合计金额
- 缩略图列：嵌入截图小图（便于核对）
- 冻结首行、自动列宽、货币格式

---

### 9.4 多单合并导出（P1 · 二期）

- 将多张订单截图（多家供应商）合并为一个汇总清单
- 自动去重商品项（相同商品合并数量）
- 生成汇总比价表：同一商品多家报价横向对比

---

### 9.5 定价模式预设（P1 · 二期）

- 从截图提取数据后，自动套用预设的「定价模板」
- 例如：供应商报价截图 → 提取成本价 → 乘系数生成对客户报价单
- 支持毛利率/固定加价多种模式

---

### 9.6 新功能数据库扩展

```sql
-- 新增：订单记录表
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT,
  supplier_name TEXT,
  project_name TEXT,
  created_at DATETIME,
  source_type TEXT DEFAULT 'screenshot', -- screenshot / manual
  status TEXT DEFAULT 'draft', -- draft / confirmed / archived
  total_amount TEXT,
  notes TEXT
);

-- 新增：订单明细行
CREATE TABLE order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT,
  screenshot_id TEXT,
  product_name TEXT,
  spec TEXT,
  quantity TEXT,
  unit_price TEXT,
  total_price TEXT,
  brand TEXT,
  notes TEXT,
  confidence REAL,
  is_editable BOOLEAN DEFAULT 1,
  raw_text TEXT,
  llm_provider TEXT,
  analyzed_at DATETIME
);

-- 新增：导出记录
CREATE TABLE exports (
  id TEXT PRIMARY KEY,
  order_id TEXT,
  format TEXT, -- csv / xlsx / zip / images
  file_path TEXT,
  created_at DATETIME
);
```

---

### 9.7 技术实现要点

#### OCR + LLM双阶段提取
```
阶段1：PaddleOCR（本地，<3秒/张）
  → 提取所有文字区块 + 位置信息
  
阶段2：LLM结构化（Provider接口）
  → 输入：OCR文字 + 截图缩略图
  → 输出：JSON结构化数据
  
提示词设计：
"这是一张采购订单截图，请提取其中的商品信息。
  返回JSON数组，每个元素含：商品名称、规格、数量、单价、总价、品牌。
  如果无法识别某字段，返回null。
  图片中如有多个商品，请全部列出。"
```

#### LLM成本控制
- 批量处理：多张截图合并一次LLM调用（降低API开销）
- 缓存：同截图MD5不重复调用
- 降级：LLM不可用时仅用OCR纯文字输出

#### Excel导出（xlsx）
- 使用SheetJS（xlsx.js）前端直接生成
- 无需后端，浏览器即可导出
- 支持嵌入Base64缩略图

#### ZIP打包
- 使用JSZip前端打包
- 缩略图实时生成（canvas压缩到800px）
- 支持直接通过Capacitor分享插件发送到微信

---

## 十、产品定位更新

### 10.1 双核心定位

| 核心功能 | 定位 | 用户价值 |
|---------|------|---------|
| **截图日程管理** | 截图归档 → 事件提醒 → 日历同步 | 不丢截图，随时可用 |
| **订单截图提取** | 采购截图 → 结构化清单 → 导出分享 | 省去手动录入，秒变报价单 |

### 10.2 目标用户扩展

原有：
- 重度截图用户（通用）

新增：
- **暖通/建材行业从业者** — 大量采购截图需要提取整理
- **采购跟单人员** — 需要把供应商截图快速转成客户报价单
- **小型项目管理者** — 多方截图汇总存档

### 10.3 差异化升级

| 对比维度 | Shots Studio | 懒人备忘录 |
|---------|-------------|-----------|
| 截图归档 | ✅ | ✅ |
| AI标签搜索 | ✅ | ✅ |
| 日历事件提取 | ❌ | ✅ |
| 订单截图提取 | ❌ | ✅ |
| 结构化导出 | ❌ | ✅ |
| NAS归档 | ❌ | ✅（飞牛fnOS） |
| 离线AI | ✅（Gemma） | ✅（预留） |
| 行业场景 | 通用 | 通用+暖通采购 |

---

## 十一、开发计划更新（v1.2）

### MVP（4周）扩展

| 周 | 内容 | 说明 |
|----|------|------|
| W1 | 项目搭建、截图扫描、SQLite存储、PaddleOCR集成 | 不变 |
| W2 | **订单提取流程**（OCR+LLM）、**结果编辑界面**、StorageProvider+WebDAV | 核心新增 |
| W3 | 日程提取、.ics导出、**导出功能**（CSV/Excel/ZIP）、本地通知 | 扩展导出模块 |
| W4 | 定位地图、热更新、**分享到微信**集成、测试打包 | 不变 |

> 💡 订单提取功能与截图归档功能共用OCR引擎和LLM接口，代码可复用，开发成本可控。

### 二期功能（按需）

- 多单合并导出
- 定价模板
- 截图对比（两家供应商同商品比价）
- 历史订单搜索 + 复用

---

## 十二、待用户确认事项（v1.2）

| # | 事项 | 状态 |
|---|------|------|
| 1 | APP名称：「懒人备忘录」 | ✅ 确认 |
| 2 | 存储：飞牛NAS + WebDAV | ✅ 确认 |
| 3 | 开发平台：Capacitor + Vue3 | ✅ 确认 |
| 4 | LLM API：用户自选 | 用户自定 |
| 5 | 导出格式优先级：CSV / Excel / ZIP / 微信分享 | 需确认 |
| 6 | 是否需要微信直接分享（文件发给客户）？ | 需确认 |
| 7 | 是否需要定价模板（供应商报价→客户报价自动计算）？ | 需确认（可二期） |
