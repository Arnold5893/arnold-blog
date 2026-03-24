---
title: '你好，世界！——博客搭建记录'
date: '2026-03-23'
tags: ['博客']
description: '这是我博客的第一篇文章，记录用 Astro + Tailwind CSS 搭建个人博客的过程与感想。'
draft: false
---

## 为什么搭建博客？

互联网上有那么多平台可以写作，为什么还要自己搭一个博客？

原因很简单：**自由**。我想要一个完全属于自己的地方，可以自定义每一个像素，不受平台算法干扰，不担心内容消失。

## 技术选型

这个博客使用了以下技术栈：

| 类别 | 选型 |
|------|------|
| 框架 | Astro |
| 样式 | Tailwind CSS |
| 内容 | Markdown / MDX |
| 评论 | Giscus |
| 部署 | Vercel |

选 **Astro** 是因为它生成纯静态 HTML，首屏极快，而且对 Markdown 的支持非常好。

## 代码示例

下面是阅读时长计算函数的实现：

```typescript
// 约 300 字/分钟（中文阅读速度）
export function getReadingTime(content: string): string {
  const chars = content.replace(/<[^>]*>/g, '').replace(/\s+/g, '').length;
  const minutes = Math.max(1, Math.ceil(chars / 300));
  return `${minutes} 分钟`;
}
```

代码块右上角有一键复制按钮，非常方便。

## 特色功能

- 🌸 **花瓣飘落动画** — 用纯 CSS 实现，移动端自动减少粒子
- ✨ **打字机效果** — Hero 区的个人介绍文字循环打字
- 📖 **悬浮 TOC** — 桌面端右侧自动生成文章目录，高亮当前节
- 💬 **Giscus 评论** — 基于 GitHub Discussions，无需额外账号

## 接下来

博客搭起来只是第一步，更重要的是持续输出内容。我计划定期写：

1. 技术学习笔记
2. 项目复盘
3. 日常碎碎念

希望这个博客能陪伴我走很远。

---

如果你也想搭建类似的博客，欢迎在评论区交流！
