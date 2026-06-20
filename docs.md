# 项目架构说明

## 1. 项目定位

这是一个很轻量的 Node.js + Express 项目，用来把 Mastodon / Pleroma / GoToSocial 的公开动态聚合成一个单页时间线页面。

项目本身不保存数据，也没有数据库层，核心职责只有两件事：

1. 提供一个首页 HTML 壳，并托管前端静态资源。
2. 代理上游社交实例接口，避免前端直接访问第三方 API。

## 2. 运行方式

- 运行时：Node.js
- Web 框架：Express
- HTTP 客户端：Axios
- 配置加载：dotenv
- 启动入口：`index.js`
- 本地启动命令：`npm start` 或 `npm run dev`
- 部署目标：Vercel（见 `vercel.json`）

`package.json` 里没有构建步骤，属于直接运行型服务。

## 3. 顶层结构

```text
.
├─ index.js              # 服务端入口，负责页面输出、静态资源托管和 API 代理
├─ public/               # 前端静态资源
│  └─ assets/
│     ├─ css/            # 页面样式
│     ├─ img/            # logo、默认图片等资源
│     └─ js/             # 前端渲染、主题切换、链接卡片逻辑
├─ test-emoji.js         # 独立的表情渲染实验脚本，不在 npm scripts 中
├─ vercel.json           # Vercel 部署配置
├─ .env / .env.exm       # 环境变量
└─ README.md             # 简要说明
```

## 4. 服务端职责

### 4.1 首页路由 `/`

`index.js` 里的 `/` 路由直接拼接 HTML 字符串返回页面，不使用模板引擎。

这个 HTML 壳主要做几件事：

- 注入站点标题和描述。
- 引入 `public/assets/css/*` 样式文件。
- 引入 `public/assets/js/*` 前端脚本。
- 提供 `#memos` 容器，交给前端异步填充动态内容。

也就是说，首页首屏结构由服务端输出，动态内容由前端再拉取。

### 4.2 静态资源托管

服务端通过：

```js
app.use(express.static(path.join(__dirname, 'public')));
```

把 `public/` 目录映射为静态资源目录，因此页面里的 CSS、JS、图片都从这里直接提供。

### 4.3 动态 API 代理 `/api/memos`

这是项目的核心数据接口，用来代理上游实例的用户动态：

- 根据 `HOST`、`USERID`、`TOKEN` 读取目标实例配置。
- 向 `${HOST}/api/v1/accounts/${USERID}/statuses` 发请求。
- 服务端固定带上：
  - `exclude_replies=true`
  - `only_public=true`
- 支持透传分页参数：
  - `max_id`
  - `since_id`
- 如果上游返回 `Link` header，会继续透传给前端，供“加载更多”使用。

这个接口的意义是把第三方实例访问集中在服务端处理，前端只和当前站点通信。

### 4.4 链接预览代理 `/api/link-preview`

这个接口负责把正文里的普通 URL 转成链接卡片所需的元数据：

- 接收查询参数 `url`
- 服务端抓取目标网页 HTML
- 提取 `og:title`、`og:description`、`og:image`、`og:site_name`
- 提取失败时降级返回域名和默认说明

这是一个典型的“后端代抓网页元数据”设计，原因通常有两个：

1. 浏览器直接跨站抓取网页元数据会遇到 CORS 限制。
2. 由服务端统一抓取，前端逻辑更简单。

需要注意的是，这里为了兼容部分站点，显式关闭了 HTTPS 证书校验，这提升了兼容性，但也降低了安全性。

## 5. 前端职责

前端逻辑主要集中在 `public/assets/js/`。

### 5.1 `main.js`

这是时间线渲染主流程：

- 页面加载后调用 `/api/memos?limit=10`
- 解析返回的动态列表
- 过滤转嘟和回复
- 将动态内容转成页面结构并插入 `#memos`
- 解析 `Link` header，保存下一页 URL
- 控制“加载更多”按钮的显示和翻页

它还承担了内容增强逻辑：

- 将 Bilibili、网易云、QQ 音乐、QQ 视频、Spotify、优酷、YouTube 链接转成内嵌播放器
- 将自定义 emoji shortcode 替换成图片
- 将图片附件渲染成图片网格
- 调用 `window.processLinkCards` 继续处理普通链接卡片

所以 `main.js` 既是数据拉取层，也是主要的内容渲染层。

### 5.2 `link-card.js`

这个文件负责识别正文里的普通 URL，并生成链接卡片：

- 用正则匹配文本里的 URL
- 排除图片直链
- 为每个普通链接创建占位容器
- 再调用 `/api/link-preview`
- 成功时渲染标题、描述、缩略图
- 失败或超时时降级成简单卡片

另外它做了一个内存级缓存 `linkPreviewCache`，避免同一个链接重复请求。

### 5.3 `custom.js`

这是一些 UI 辅助行为：

- 主题切换（明暗模式）
- 把主题保存在 `localStorage`
- “返回顶部”按钮的显示与点击行为

它不参与数据链路，主要负责交互体验。

## 6. 关键请求链路

页面打开后的主流程可以概括为：

```text
浏览器访问 /
  -> Express 返回首页 HTML
  -> 浏览器加载 public/assets 下的 CSS/JS
  -> main.js 请求 /api/memos
  -> Express 代理请求到 Mastodon/Pleroma/GotoSocial 实例
  -> 服务端返回动态 JSON
  -> 前端渲染时间线
  -> 如果正文里有普通链接，再请求 /api/link-preview
  -> 服务端抓取第三方网页 metadata
  -> 前端把链接渲染成预览卡片
```

## 7. 环境变量

项目当前依赖这些环境变量：

- `HOST`：目标实例地址
- `USERID`：需要展示的用户 ID
- `DESCRIPTION`：首页描述文案
- `TITTLE`：页面标题
- `TOKEN`：某些实例需要的访问令牌
- `PORT`：本地启动端口，默认 `3000`

说明：

- 变量名使用的是 `TITTLE`，不是常见的 `TITLE`。这是当前实现的一部分，改动时要同步代码。
- `.env.exm` 里给出了最小示例配置，但字段并不完整，没有包含 `TOKEN`。

## 8. 部署方式

`vercel.json` 表明这是一个 Vercel Node Function 部署：

- `index.js` 被作为运行入口
- 所有路由最终都交给这个入口处理

因此项目同时兼容：

- 本地常驻进程运行
- Vercel 上的函数式部署

## 9. 当前架构特征

从整体上看，这个项目的架构特点是：

- 单体但非常轻量：前后端在一个仓库里，没有拆分服务。
- 无状态：不落库，不维护会话，主要依赖上游实例 API。
- 服务端做代理，前端做渲染：职责边界比较清楚。
- 以静态资源 + 少量动态接口为核心：适合个人站点或轻量展示页。

## 10. 当前值得注意的点

下面这些点对后续维护比较重要：

- `index.js` 直接用字符串拼 HTML，改页面结构时会比较难维护；如果页面继续变复杂，可以考虑拆模板。
- `/api/link-preview` 关闭了 HTTPS 证书校验，兼容性高，但安全性偏弱。
- `main.js` 中默认请求 `/api/memos?limit=10`，但服务端实际没有把 `limit` 拼进上游请求，前后端在这个字段上并没有完全对齐。
- `README.md` 和部分源码注释里存在编码显示异常，后续如果要继续维护中文内容，建议统一文件编码为 UTF-8。
- `test-emoji.js` 更像手工验证脚本，不属于当前正式测试体系。

## 11. 一句话总结

这是一个“Express 代理上游动态 + 原生前端渲染时间线”的轻量展示站，核心链路短、依赖少，适合快速部署个人 Mastodon/GotoSocial 动态聚合页。
