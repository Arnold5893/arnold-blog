---
title: "爬虫总结"
date: '2026-10-16'
tags: ['总结']
description: "采集某聘数据"
draft: false
---

## 准备阶段
在开发者工具中获取数据（因boss有极强的反爬机制，需要安装有效插件解决这个问题）：
- Network → Fetch/XHR：页面滚动时发出的`list.json`响应，其中包含岗位名称、岗位JD、明文薪资、技能标签、公司信息等，`hasmore`控制翻页，`list.json`决定了要捕获哪个响应、保留哪些字段
- Network → Doc：详情页`/job_detail/{id}.html`是**服务器直接渲染**的，JD 直接包含在 HTML 文档中（在 Doc 中的 Response 中可以搜到，不需要再找XHR），所以采用HTML方式抓取详情，不需要再找额外的接口
- Elements：用于确定页面元素的定位规则，例如JD 在 `.job-sec-text`、技能标签在 `ul.job-keyword-list li`、要删掉的招聘者卡片在 `.job-boss-info`，以及登录页上切换到扫码的图标

这些URL和定位规则的作用：
- 导航目标（`urls.*`）：让浏览器打开哪个页面（首页的URL用于打开、账号登录页面的URL用于登录账号）
- 捕获过滤：从页面发出的一堆请求中，读取我们需要的一两个响应
- 解析定位：从HTML中切出JD、标签、公司等，并删除个人信息
## 爬取原理
[参考项目](https://github.com/eatmoreduck/boss-zhipin-scraper) ，在此项目基础上根据实际情况做了少量修改

程序通过CDP（Chrome调试协议）连接一个已登录的专用Chrome，只做打开页面、滚动、开新标签页这些正常浏览动作，**接口请求**和**签名**都是由页面自己发出、计算，程序只是监听网络并读出响应内容(在 `Network.loadingFinished` 时用 `Network.getResponseBody` 读出 `joblist.json` 的 JSON)

采集流程：
1. 读取配置，加文件锁
2. 选取任务（根据具体情况向ai说明即可）
3. 启动(无头)浏览器 headless Chrome，使用二维码登录（如果cookie在服务器端仍有效，就不需要登录）并检查出口IP（中国大陆），下述具体过程
4. 采集列表页内容：打开搜索页（左侧为搜索结果），用*模拟滚轮翻页*，每页先判断风控、再脱敏、再保存原始数据
5. 采集详情页内容：在新标签页带上列表页里拿到的`securityId`/`lid`和来源页地址打开详情页，用 **BeautifulSoup** 切出JD，脱敏后保存

最后正常关闭Chrome，这样cookie才会存进浏览器档案
### 二维码登录
关键事实：boss登录页的二维码，内容就是`randkey`接口返回的`qrId`字符串本身，二维码图片在浏览器本地绘制，因此拿到`qrId`后用任何二维码库都能画出同一个二维码
完整过程：
1. 无界面打开登录页，使用二维码登录。如果页面显示的是短信登录，4 秒内没出现`qrId`就点`.btn-sign-switch:not(.phone-switch)`切换到扫码登录
2. 页面POST `randkey`捕获响应里的`qrId`，终端打印二维码（**segno**）、存成PNG，并写进`boss_login.json` 给前端
3. 页面自己定时轮询`scan?uuid=<qrId>`；响应里出现`scanned`时，状态变为“已扫码”
经测试二维码约30s过期，程序在 `qr_ttl=28`秒时重新加载登录页，页面会发出新的`randkey`、得到新的`qrId`；扫码后 60 秒未确认同样刷新
4. 手机扫码确认后，页面离开`/web/user/`，然后CDP Browser.close 正常关闭 Chrome，Cookie 保存到profile中
## 知识补充
### 1. 渲染
渲染：把数据和页面模版变成浏览器能显示的HTML

**服务器渲染**（SSR，Server-Side-Rendering）：
浏览器发送请求 → 服务器获取数据并生成HTML → 浏览器收到HTML，立即显示页面内容 → JavaScript加载后接管**交互**

**客户端渲染**（CSR，Client-Side-Rendering）：
浏览器发送请求 → 服务器返回基础HTML和JavaScript文件 → 浏览器下载并执行 JavaScript → JavaScript获取数据、生成DOM 并显示页面

即 CSR 的 JavaScript 不仅负责交互，还负责生成最初的页面内容，而 SSR 的初始 HTML 已经包含了页面内容，JavaScript 在此基础上补上交互能力；

为什么 CSR 切换页面时，可以只更新部分内容？
SSR：切换页面时，因为整个页面的内容需要服务器返回一份新的 HTML 文档，所以整个页面的所有内容都随着新 HTML 文档重新载入；CSR 应用的 JavaScript 可以持续运行在浏览器中，并维护页面当前的状态，切换页面时，它可以只请求所需的数据，再修改页面中变化的地方，而不必重新请求整份 HTML 文档

注意：这里并不是说 CSR 天生就只更新局部，而是说它可以这样设计。CSR 也能在每次导航时完整刷新页面；SSR 网站也能在初次加载后使用客户端导航，只更新部分页面
### 2. cookie的作用
Cookies是某些网站在用户设备上存储的小文件，它可以帮助网站记忆用户访问网站的有关信息，以便用户便捷地再次访问该网站

不同Cookies有不同的功能，通常用于提高网站导航效率、记住用户的偏好设置以及改善用户体验
###### cookies类别：
1. 按留存时长
	- 会话cookies：仅在打开某个网页时进行临时存储，关闭网页或浏览器后，就会自动删除
	- 持久性cookies：在特定时间段内存储在用户设备上，直到用户主动删除或cookies到期后被浏览器自动删除
2. 按所有方
	- 一方cookies：由网站运营方直接发送到用户设备上的cookies，运营方可利用cookies在用户再次登录该网站时利用其对用户进行识别
	- 第三方cookies：由第三方服务提供商在网站运营方的平台上提供，并可供该服务提供商用于在用户设备访问其它平台时对其进行识别。第三方cookies常用于平台分析或广告目的
### 3. BeautifulSoup
BeautifulSoup：python 的 HTML 解析库。它把一大段HTML字符串解析成一棵可以查询和修改的元素树；BeautifulSoup 可以直接用CSS选择器精确**定位、删除**和**取文本**
### 4. segno
segno：一个 python 二维码生成库。给它一个字符串，它会把内容编码成二维码，可以输出到终端或保存成图片；本项目中 segno 把 `randkey` 接口返回的 `qrId`字符串画成了二维码
### 5. 接口请求 & 签名
现在的网页一般分两层：
- 页面：HTML + JavaScript，负责画界面
- 数据接口（API）：专门返回数据的网址，返回JSON类数据

打开一个网页的流程(CSR)：在地址栏输入URL并回车，浏览器请求 HTML，浏览器解析 HTML 并下载 JS、CSS 等资源，页面里的 JS 开始执行并，它向服务器发送**请求**（通过数据接口，返回需要的数据），服务器返回一段 JSON，JS 根据 JSON 数据更新页面。用户滚动页面时，可能会触发新请求加载更多数据，以显示完整页面

通过数据接口的请求即**接口请求**；

有的服务器不想让程序随便调用它的接口，所以会检查“这个请求是不是从我的网页、由一个登录的真人发出来的”，请求里除了表单参数，还需要 登录cookie和反爬令牌（反爬令牌由页面里加密混淆过的JS根据时间、浏览器环境等信息计算出来，过一段时间就失效）

这类“由页面JS现场计算、服务器负责校验”的参数，就叫**签名或令牌**；

**作用：证明请求来自真实页面，环境正常**；签名不对或缺失时，服务器会拒绝请求，或返回风控码
### 6. Network & Element
Network：查看浏览器请求了什么，服务器返回了什么；Fetch/EHR 和 Doc 是 Network 面板中的请求分类，其中：
- Fetch/XHR：由Fetch API 或 XMLHttpRequest（XHR）发起的网络请求，作用：查看接口请求、请求参数、JSON数据、接口返回结果等
- Doc（Document）：文档请求，通常指页面导航时获取的**HTML文档**，作用：查看页面是如何请求和接收HTML的

Element：Developer tools中的DOM检查面板，查看浏览器当前页面的结构（HTML 元素树、属性、CSS 样式，以及 JavaScript 修改后的结构）