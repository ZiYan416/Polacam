<div align="center">
  <br />
  <h1>📸 Polacam</h1>
  <h3>Digital Analog • Cyber Polaroid • 赛博拍立得</h3>
  <p>
    An interactive retro instant camera experience for the web. <br/>
    Capture, Edit, Develop, and Collect.
  </p>
  
  <p align="center">
    <a href="#-english">English</a> | <a href="#-中文">中文</a>
  </p>
  <br />
</div>

---

<a name="-english"></a>
# 📘 Polacam (English)

## 📖 Introduction
**Polacam** is a React-based web application that simulates the tactile experience of instant photography. It leverages the **HTML5 Canvas API** for real-time image processing (filters, textures, composites) and **CSS3** for realistic mechanical animations. 

It is designed to bring the "ritual" of analog photography to the digital screen: from the mechanical shutter click, to the tactile photo ejection, to the slow development process.

## ✨ Key Features

### 1. 📷 Retro Camera Studio
- **Skeuomorphic Design**: A camera interface built purely with CSS/SVG/HTML (no heavy 3D models).
- **Physical Animations**: Photos physically "eject" from the camera slot using CSS clip-paths and transforms.
- **Mobile Adaptive**: Optimized layout that feels like a real device on mobile screens.

### 2. 🎨 Darkroom Editor (The Lab)
- **Aspect Ratios**: Support for **Square (1:1)**, **Mini (3:4)**, **Wide (16:9)**, **Cinema (21:9)**, and **Portrait (4:5)**.
- **Canvas Engine**: Real-time, high-performance image processing using HTML5 Canvas.
- **Filters**: Custom pixel-manipulation filters (Vintage, Noir, Sepia, Cool) applied instantly.
- **Transform**: Pan, Zoom, and Rotate your image to frame the perfect shot.
- **Smart Captions**: Auto-date stamping or random trendy caption generation.

### 3. 🖼️ Floating Desktop
- **Interactive Physics**: Ejected photos float on your screen. You can drag, throw, and stack them.
- **Gestures**:
  - **Drag**: Move photos around.
  - **Zoom**: Mouse wheel (Desktop) or Pinch (Mobile).
  - **Rotate**: Multi-touch rotation (Mobile) or Reset button.
- **Persistent State**: Photos stay where you left them, even if you switch tabs (via React State lifting).

### 4. 🎞️ Gallery & Storage
- **Local Collection**: Save your favorite shots to the "Gallery".
- **Toggle System**: Like/Unlike photos to add/remove them from your persistent collection.
- **Data Persistence**: Uses `LocalStorage` by default, preserving your memories across sessions.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/polacam.git
   cd polacam
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   Open `http://localhost:5173` in your browser.

### Build for Production
```bash
npm run build
```
The output will be in the `dist` folder, ready for static hosting.

---

## ☁️ Deployment

Since Polacam is a static web application (SPA), it can be deployed easily on any static hosting service.

### Option 1: Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project root.
3. Follow the prompts. Vercel automatically detects Vite settings.

### Option 2: Netlify
1. Drag and drop the `dist` folder (created after `npm run build`) into Netlify Drop.
2. Or connect your GitHub repo to Netlify and set the build command to `npm run build` and publish directory to `dist`.

### Option 3: GitHub Pages
1. Update `vite.config.ts` to set base path: `base: '/polacam/',` (if deploying to a subdirectory).
2. Run build.
3. Push the `dist` folder to a `gh-pages` branch.

---

## 🔌 Backend Integration (Optional)

The app currently runs in **Serverless Mode** (using LocalStorage). To connect a real backend (e.g., Python FastAPI):

1. **API Specification**:
   Implement a `POST /api/photos` endpoint that accepts JSON:
   ```json
   { "image_data": "base64_string...", "meta": { ... } }
   ```

2. **Update Service**:
   Modify `src/services/storageService.ts`. Replace `localStorage` logic with `fetch()` calls to your API.

---

<br/>

<a name="-中文"></a>
# 📘 Polacam (中文说明)

## 📖 项目简介
**Polacam (赛博拍立得)** 是一款基于 React 开发的 Web 应用程序，旨在还原即时成像摄影的触感与仪式感。它利用 **HTML5 Canvas API** 进行实时的图像处理，并通过精细的 **CSS3** 动画模拟机械运作。

从按下快门的机械震动，到相纸缓缓吐出，再到悬浮在桌面上等待显影，Polacam 致力于在数字屏幕上重现模拟摄影的温情。

## ✨ 核心功能详解

### 1. 📷 拟物化相机 (Studio)
- **纯代码构建**: 界面完全由 CSS/SVG 绘制，无大型 3D 模型文件，加载极快。
- **机械动画**: 实现了相纸从出片口“滑出”的物理视觉错觉，配合机械音效（未来计划）。
- **移动端适配**: 针对手机竖屏优化的操作布局，单手即可完成拍摄。

### 2. 🎨 暗房修图室 (The Lab)
- **多画幅支持**: 提供 **经典方 (Square)**、**三寸 (Mini)**、**宽幅 (Wide)**、**电影感 (Cinema)** 等多种比例。
- **Canvas 引擎**: 纯前端高性能渲染，所见即所得 (WYSIWYG)。
- **实时滤镜**: 内置复古、黑白、胶片、冷调等像素级滤镜。
- **自由构图**: 支持对上传图片进行缩放、旋转、拖拽，重新构图。
- **智能文案**: 自动生成日期水印，或使用“魔法棒”随机生成潮流文案。

### 3. 🖼️ 悬浮桌面 (Interactive Desktop)
- **物理交互**: 照片吐出后会悬浮在屏幕上。你可以像在真实桌面上一样拖拽、堆叠它们。
- **手势操作**:
  - **拖拽**: 随意整理照片位置。
  - **缩放**: 桌面端使用鼠标滚轮，移动端支持双指捏合。
  - **旋转**: 移动端支持双指旋转。
- **状态记忆**: 即使切换到相册页面再回来，桌面上照片的位置、角度都会被完美保留。

### 4. 🎞️ 碎片收集 (Gallery)
- **持久化存储**: 点击照片底部的“红心”即可收藏。
- **数据管理**: 默认使用浏览器本地存储 (LocalStorage)，隐私安全，无需联网即可使用。
- **一键整理**: 桌面太乱？点击顶部的“整理桌面”按钮，自动将照片排列整齐。

---

## 🚀 开发与启动指南

### 环境要求
- **Node.js**: v16 或更高版本
- **包管理器**: npm 或 yarn

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/your-username/polacam.git
   cd polacam
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或者使用 yarn
   yarn install
   ```

3. **启动本地开发服务器**
   ```bash
   npm run dev
   # 或者
   yarn dev
   ```
   启动后，在浏览器访问 `http://localhost:5173` 即可看到应用。

### 打包构建
当准备发布时，运行以下命令生成静态文件：
```bash
npm run build
```
构建产物将输出在 `dist` 目录中。

---

## ☁️ 部署指南

Polacam 是纯静态应用 (SPA)，可以部署在任何静态托管服务上。

### 推荐：Vercel 部署
1. 全局安装 Vercel CLI: `npm i -g vercel`
2. 在项目根目录运行: `vercel`
3. 一路回车，Vercel 会自动识别 Vite 配置并完成部署。

### Netlify 部署
1. 将 `npm run build` 生成的 `dist` 文件夹直接拖入 Netlify Drop 区域。
2. 或者在 Netlify 后台关联 GitHub 仓库，设置 Build command 为 `npm run build`，Publish directory 为 `dist`。

### GitHub Pages 部署
1. 若部署在子路径，请修改 `vite.config.ts` 添加 `base: '/repo-name/'`。
2. 运行构建，将 `dist` 目录内容推送到仓库的 `gh-pages` 分支。

---

## 🔌 后端扩展 (可选)

本项目采用了**服务层模式 (Service Pattern)**，数据逻辑与 UI 解耦。

若需接入 Python / Node.js 后端：
1. 打开 `src/services/storageService.ts`。
2. 将其中的 `localStorage` 操作替换为您后端的 API 请求 (axios/fetch)。
3. 后端需提供图片上传及元数据存储接口。

---

<div align="center">
  <p>Made with ❤️ by Polacam Team</p>
</div>