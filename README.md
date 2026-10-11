# 前方高能！ · 哔哩哔哩品牌体验

一个围绕兴趣发现、弹幕共鸣、创作回响和入站档案的中文单页网站。面向 AI 产品经理的面试展示，记录从需求澄清、设计取舍到 AI 协作实现的完整过程。

## 体验内容

- 粉蓝霓虹小电视首屏与 1.5 秒兴趣终端启动。
- 原生纵向滚动驱动的 3D 发牌舞台，六种兴趣最多选择三种。
- 自制 12 秒无声概念短片、二十字弹幕、提交时的像素粒子。
- 三组概念创作者，可切换作品与点赞、投币、收藏。
- 编辑昵称与宣言，生成并保存 1080 × 1350 PNG 入站档案。
- 当前会话刷新恢复；重新探索清空互动。
- 小于 768px、低于 640px 高度或系统要求减少动态效果时，卸载复杂滚动动画。

所有体验留在当前页面。创作者和作品均为概念示例，互动数据保存在当前浏览器会话。

## 本地运行

需要 Node.js 24 与 pnpm 11.25.0。

```sh
pnpm install --frozen-lockfile
pnpm dev
```

验证静态产物：

```sh
pnpm build
pnpm check:budget
pnpm preview --port 4173
```

按预览服务输出的本机地址访问。源码修改后，开发模式自动刷新；静态预览需重新构建并刷新浏览器。

## 技术选择

React 19、TypeScript 7、Vite 8、GSAP 3。CSS Grid/Flex 负责自动布局，GSAP matchMedia 管理滚动动画的创建和清理，原生 video 播放短片，独立 Canvas 生成档案与粒子。依赖精确版本记录在 pnpm-lock.yaml。

首屏只加载必要图片。GSAP 与档案绘制分别拆分模块；视频接近视口后才设置地址，离开视口、页面隐藏或用户暂停时停止播放。图片和视频由 Vite 输出为带内容指纹的文件名，重复访问由浏览器与 GitHub Pages 的 HTTP 缓存控制。

## 发布到 GitHub Pages

1. 把项目推送到 GitHub 仓库的 `main` 分支。
2. 在仓库 `Settings → Pages → Build and deployment` 中选择 `GitHub Actions`。
3. 工作流 `.github/workflows/deploy.yml` 会安装依赖、构建、检查资源预算并部署。
4. 工作流完成后，从部署环境 `github-pages` 打开实际地址。

Vite 读取 `GITHUB_REPOSITORY`：普通项目站点自动使用 `/<仓库名>/`，`用户名.github.io` 仓库使用 `/`。自定义域名时可通过 `VITE_BASE_PATH=/` 覆盖。章节使用本页锚点，资源与 PNG 绘制均兼容项目路径。[Vite GitHub Pages 文档](https://vite.dev/guide/static-deploy.html#github-pages)

目标仓库：[lizeping-hub/landing-page-bilibili](https://github.com/lizeping-hub/landing-page-bilibili)。Pages 地址：[前方高能！](https://lizeping-hub.github.io/landing-page-bilibili/)。部署结果以仓库 Actions 和 `github-pages` 环境为准。

## 资源预算

| 项目 | 本地生产构建测得 | 目标 |
| --- | --- | --- |
| 全部站点资源原始体积 | 约 2.28MB | ≤ 6MB |
| 全部 JavaScript gzip | 约 126KB | ≤ 300KB |
| 首屏关键资源估算 | 约 344KB | ≤ 1.5MB |
| MP4 短片 | 1.27MB | ≤ 3MB |

首屏估算包含所有 JS 分块的 gzip、CSS gzip 和首屏三个插画文件。这里是构建体积统计，实际传输大小以服务器响应为准。LCP、INP、CLS 与帧率需要在指定网络和设备上另行测量。

## 项目材料

- [设计方案](docs/落地页设计方案-v1.md)
- [AI 协作与设计决策](docs/AI协作与设计决策.md)
- [素材来源](docs/素材来源.md) 与 [完整生成提示词](docs/素材提示词.json)
- [本地验收记录](docs/验收记录.md)

项目代码使用 MIT 许可证。品牌名称和标识不包含在项目代码授权中；依赖各自遵循其许可证。页面标注为个人概念设计。
