# Arnold's Blog — 搭建方案文档

> 本文档是博客搭建的完整规划，供在 VS Code 中使用 Claude Code 实现时参考。

---

## 一、技术栈

| 类别 | 选型 |
|------|------|
| 框架 | [Astro](https://astro.build/) |
| 样式 | [Tailwind CSS](https://tailwindcss.com/) |
| 内容 | Markdown / MDX（文章写作格式） |
| 评论 | [Giscus](https://giscus.app/)（基于 GitHub Discussions） |
| 字体 | Noto Serif SC（宋体）+ JetBrains Mono（代码） |
| 部署 | Vercel |

---

## 二、设计规范

### 2.1 配色方案

```
主背景：      #FFFAF8  （极暖白）
次要背景：    #FFF0EE  （浅粉米，用于卡片/区块）
Accent 主色： #F4A7B9  （暖金粉，来源于角色图配色）
Accent 辅色： #A8D8C8  （薄荷青绿，来源于角色眼睛/发饰）
正文颜色：    #2D2D2D  （深灰，保证阅读舒适）
次要文字：    #9CA3AF  （浅灰，用于日期、标签等）
分割线：      #F3E8E8  （淡粉）
```

### 2.2 字体

```css
/* 中文正文 */
font-family: 'Noto Serif SC', 'Source Han Serif CN', STSong, serif;

/* 英文/数字标题 */
font-family: 'Playfair Display', serif;

/* 代码块 */
font-family: 'JetBrains Mono', monospace;
```

- 正文行高：1.8
- 文章正文宽度：最大 680px（居中）
- 标题字重：700

### 2.3 动漫素材使用规范

- **首页 Hero 立绘**：我提供的图片，放置在首页右侧，带轻微浮动动画
- 文件路径：`/home/zang/my_blog/莉雪.jpg`

---

## 三、页面结构

### 3.1 页面列表

| 页面 | 路由 | 文件路径 |
|------|------|---------|
| 首页 | `/` | `src/pages/index.astro` |
| 文章列表 | `/blog` | `src/pages/blog/index.astro` |
| 文章详情 | `/blog/[slug]` | `src/pages/blog/[slug].astro` |
| 关于我 | `/about` | `src/pages/about.astro` |
| 项目展示 | `/projects` | `src/pages/projects.astro` |
| 404 | `/404` | `src/pages/404.astro` |

### 3.2 各页面内容说明

#### 首页 `/`
- **导航栏**：博客名 "Arnold" + 导航链接（首页 / Blog / Projects / About）
- **Hero 区**：
  - 左侧：打字机效果的个人介绍文字、社交链接（GitHub / Email）
  - 右侧：动漫立绘图，带 `animate-float`（上下浮动）CSS 动画
- **最新文章**：展示最近 3～5 篇文章卡片
- **背景装饰**：花瓣/光点飘落 CSS 动画

#### 文章列表 `/blog`
- 搜索框（前端过滤）
- 标签筛选栏
- 文章卡片列表：封面图（可选）、标题、日期、标签、阅读时长预估

#### 文章详情 `/blog/[slug]`
- 文章头部：标题、日期、标签、阅读时长
- 右侧悬浮 TOC（目录）
- Markdown 正文渲染，代码块语法高亮（Shiki）
- 代码块右上角一键复制按钮
- 文章底部：上一篇 / 下一篇导航
- **Giscus 评论区**（文章最底部）

#### 关于我 `/about`
- 头像（个人上传）
- 个人介绍段落
- 技能标签云
- 社交链接卡片

#### 项目展示 `/projects`
- 项目卡片网格布局
- 每张卡片：项目名、描述、技术标签、GitHub 链接、演示链接

#### 404 页面
- 动漫角色图 + 可爱文案

---

## 四、组件规划

```
src/components/
├── layout/
│   ├── Header.astro          # 导航栏
│   ├── Footer.astro          # 页脚
│   └── BaseLayout.astro      # 基础布局（含 SEO meta）
├── home/
│   ├── Hero.astro            # 首页 Hero 区
│   ├── RecentPosts.astro     # 最新文章列表
│   └── Sakura.astro          # 花瓣飘落动画
├── blog/
│   ├── PostCard.astro        # 文章卡片
│   ├── TagFilter.astro       # 标签筛选
│   ├── TOC.astro             # 悬浮目录
│   ├── ReadingTime.astro     # 阅读时长
│   └── Comments.astro        # Giscus 评论区
└── projects/
    └── ProjectCard.astro     # 项目卡片
```

---

## 五、特色功能实现要点

### 5.1 花瓣飘落动画（`Sakura.astro`）
- 用 JavaScript 动态生成若干 `div` 元素
- 每个花瓣随机：初始位置、下落速度、旋转角度、大小、透明度
- 使用 CSS `@keyframes` 实现下落 + 旋转
- 颜色取自 Accent 色系（粉色 / 薄荷绿）

### 5.2 Hero 浮动动画
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-12px); }
}
.animate-float {
  animation: float 4s ease-in-out infinite;
}
```

### 5.3 阅读时长计算
```ts
// 约 300 字/分钟（中文阅读速度）
export function getReadingTime(content: string): string {
  const words = content.replace(/<[^>]*>/g, '').length;
  const minutes = Math.ceil(words / 300);
  return `${minutes} 分钟`;
}
```

### 5.4 Giscus 评论区配置
在 GitHub 仓库中开启 Discussions，然后前往 https://giscus.app 生成配置：
```html
<script src="https://giscus.app/client.js"
  data-repo="Arnold5893/blog-comments"
  data-repo-id="R_kgDORuR-Ng"
  data-category="Announcements"
  data-category-id="DIC_kwDORuR-Ns4C5Ezb"
  data-mapping="pathname"
  data-theme="light"
  crossorigin="anonymous"
  async>
</script>
```

### 5.5 代码高亮
在 `astro.config.mjs` 中配置 Shiki：
```js
import { defineConfig } from 'astro/config';
export default defineConfig({
  markdown: {
    shikiConfig: {
      theme: 'rose-pine-dawn', // 粉/绿调主题（或者有一点蓝色），契合整体风格
      wrap: true,
    },
  },
});
```

---

## 六、项目初始化命令

```bash
# 1. 创建 Astro 项目
npm create astro@latest arnold-blog

# 2. 进入项目目录
cd arnold-blog

# 3. 安装 Tailwind CSS 集成
npx astro add tailwind

# 4. 安装 MDX 支持（可选，支持在 Markdown 中使用组件）
npx astro add mdx

# 5. 启动开发服务器
npm run dev
```

---

## 七、文章 Frontmatter 规范

每篇 Markdown 文章头部使用以下格式：

```markdown
---
title: '文章标题'
date: '2026-03-23'
tags: ['标签1', '标签2']
description: '文章摘要，用于列表页展示和 SEO'
cover: '/images/posts/cover.webp'  # 可选
draft: false
---

正文内容...
```

---

## 八、目录结构总览

```
arnold-blog/
├── public/
│   ├── images/
│   │   ├── hero.png          # 动漫立绘
│   │   └── posts/            # 文章封面图
│   └── favicon.ico
├── src/
│   ├── components/           # 见第四节
│   ├── content/
│   │   └── blog/             # Markdown 文章存放目录
│   │       └── hello-world.md
│   ├── layouts/
│   │   └── PostLayout.astro  # 文章详情布局
│   ├── pages/                # 见第三节
│   ├── styles/
│   │   └── global.css        # 全局样式、字体引入
│   └── utils/
│       └── reading-time.ts   # 阅读时长工具函数
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── package.json
```

---

## 九、SEO & 性能优化

- 每个页面通过 `BaseLayout.astro` 注入 `<title>`、`<meta description>`、OG 标签
- 图片使用 Astro 内置的 `<Image />` 组件自动优化为 WebP
- 生成 `/rss.xml` RSS 订阅源
- 静态生成（SSG）确保首屏加载极快

---

## 十、响应式适配需求

### 断点规范（基于 Tailwind 默认断点）

| 断点 | 宽度范围       | 目标设备          |
| ---- | -------------- | ----------------- |
| `sm` | < 640px        | 手机竖屏          |
| `md` | 640px ~ 768px  | 手机横屏 / 小平板 |
| `lg` | 768px ~ 1024px | 平板 / 小笔记本   |
| `xl` | ≥ 1024px       | 桌面显示器        |

------

### 各页面响应式行为

**导航栏**

- 桌面端：顶部横向导航，显示所有页面链接
- 移动端：折叠为汉堡菜单（☰），点击展开全屏或抽屉式菜单

**首页 Hero 区**

- 桌面端：左侧文字 + 右侧立绘图，左右两栏并排
- 移动端：立绘图居上或隐藏，文字内容居中显示在下方

**文章列表页**

- 桌面端：2 ~ 3 列卡片网格
- 移动端：单列卡片，铺满屏幕宽度

**文章详情页**

- 桌面端：正文居中（最大宽度 680px）+ 右侧悬浮 TOC 目录
- 移动端：TOC 收起为顶部下拉按钮，正文全宽显示

**项目展示页**

- 桌面端：2 ~ 3 列项目卡片
- 移动端：单列展示

**关于我页**

- 桌面端：头像 + 信息左右排布
- 移动端：头像居中，信息纵向堆叠

------

### 通用原则

- 所有字体大小、间距、图片使用相对单位（`rem`、`%`、`vw`），不写死 `px`
- 图片使用 `object-fit: cover` 防止变形，并设置合理的 `max-width`
- 触摸目标（按钮、链接）最小点击区域 **44×44px**，避免手机端误触
- 樱花飘落动画在移动端**减少粒子数量**，避免性能问题