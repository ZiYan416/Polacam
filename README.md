<div align="center">
  <br />
  <h1>📸 Polacam</h1>
  <p>
    <strong>Digital Analog • Cyber Polaroid • 赛博拍立得</strong>
  </p>
  <p>
    An interactive retro instant camera experience for the web. <br/>
    Capture, Edit, Develop, and Collect.
  </p>
  
  <p align="center">
    <a href="#-readme-english">English</a> | <a href="#-说明文档-中文">中文</a>
  </p>
  <br />
</div>

---

<a name="-readme-english"></a>
# 📘 README (English)

## 📖 Introduction
**Polacam** is a React-based web application that simulates the tactile experience of instant photography. It leverages the **HTML5 Canvas API** for real-time image processing (filters, textures, composites) and **CSS3** for realistic mechanical animations. 

Unlike typical photo apps, Polacam focuses on the "process"—from the mechanical shutter click to the slow development of the film, bringing the ritual of analog photography to the digital screen.

## ✨ Features
- **Retro Camera Interface**: A skeumorphic design built purely with CSS/SVG.
- **Darkroom Editor**:
  - **Transform**: Crop, Zoom, Rotate.
  - **Filters**: Custom pixel-manipulation filters (Vintage, Noir, Sepia, Cool).
  - **Frames**: Support for Square (Classic), Mini (Portrait), and Wide ratios.
- **Physics & Animation**:
  - Photos "eject" physically from the camera slot.
  - Draggable floating photos with physics-like feel.
  - Simulated chemical development process.
- **Data Persistence**: Currently uses `LocalStorage` for a server-less experience, ready for REST API integration.

## 🛠 Tech Stack
- **Core**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Graphics**: HTML5 Canvas API (No heavy 3rd-party graphics libs)
- **Icons**: Lucide React
- **Architecture**: Service-based pattern for easy Backend substitution.

---

## 🔌 Backend Integration Guide

The application is designed with a **Service Layer Pattern**. The frontend communicates with data sources strictly through `services/storageService.ts`. Currently, this service uses the browser's `LocalStorage`.

To connect a **Python (FastAPI)** backend, follow these steps:

### 1. API Specification
Your backend should implement the following endpoints:

#### A. Photo Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/photos` | Retrieve user's photo gallery |
| `POST` | `/api/v1/photos` | Upload a generated Polaroid |
| `DELETE` | `/api/v1/photos/{id}` | Delete a specific photo |

**POST Payload Example (JSON)**
```json
{
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJR...",
  "original_url": "blob:http://localhost...",
  "meta": {
    "filter": "Vintage",
    "frame_type": "Square",
    "caption": "Sunday Vibes",
    "created_at": 1715420000
  }
}
```

### 2. Updating the Frontend Service
Modify `services/storageService.ts` to replace `localStorage` calls with `fetch` or `axios`.

```typescript
// services/storageService.ts (Example Implementation)

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const savePhoto = async (photo: Photo): Promise<void> => {
  const response = await fetch(`${API_BASE}/api/v1/photos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}` // Uncomment for Auth
    },
    body: JSON.stringify({
      id: photo.id,
      image_data: photo.dataUrl,
      caption: photo.caption,
      // ... map other fields
    })
  });
  
  if (!response.ok) throw new Error('Upload failed');
};

export const getPhotos = async (): Promise<Photo[]> => {
  const res = await fetch(`${API_BASE}/api/v1/photos`);
  return res.json();
};
```

### 3. User Authentication (Extension)
To add a User System (Login/Register):
1.  **Backend**: Implement `POST /auth/login` returning a JWT.
2.  **Frontend**: 
    - Store the JWT in `localStorage` or `Cookie`.
    - Inject the token into the `Authorization` header in `storageService.ts`.

---

## 🗺 Roadmap

- [ ] **Social Sharing**: One-click generation of shareable cards for Instagram/Twitter.
- [ ] **Cloud Sync**: Complete the FastAPI integration for multi-device sync.
- [ ] **Collaborative Rolls**: Allow multiple users to contribute to a single "Film Roll".
- [ ] **Physical Printing**: Integration with portable printers via WebBluetooth (Experimental).

---

<br />
<br />

<a name="-说明文档-中文"></a>
# 📘 说明文档 (中文)

## 📖 简介
**Polacam (赛博拍立得)** 是一款基于 React 开发的 Web 应用程序，旨在还原即时成像摄影的触感与仪式感。它利用 **HTML5 Canvas API** 进行实时的图像处理（如滤镜、纹理叠加、合成），并通过 精细的 **CSS3** 动画模拟机械运作。

Polacam 不仅仅是一个滤镜 App，它强调“摄影过程”——从按下快门的机械震动，到相纸缓缓吐出，再到影像在屏幕上缓慢显影的过程。

## ✨ 核心功能
- **拟物化相机界面**：纯 CSS/SVG 构建，具有真实的物理交互感。
- **暗房修图室**：
  - **构图**：支持自由缩放、旋转、拖拽裁剪。
  - **滤镜**：内置复古、黑白、胶片、冷调等 Canvas 像素级滤镜。
  - **画幅**：支持 经典方 (Square)、三寸 (Mini)、宽幅 (Wide) 三种相纸比例。
- **物理动画引擎**：
  - 相片从相机顶部插槽“滑出”的视觉错觉动画。
  - 悬浮相片支持拖拽，模拟真实桌面的散落感。
  - 模拟化学显影的色彩渐变过程。
- **数据持久化**：目前使用本地存储，支持无缝切换至云端数据库。

## 🛠 技术栈
- **前端框架**: React 18, TypeScript
- **构建工具**: Vite
- **样式库**: Tailwind CSS
- **图形核心**: HTML5 Canvas API (未使用 Fabric.js 等重型库，保证轻量高效)
- **架构**: 服务层模式 (Service Layer Pattern)，便于解耦。

---

## 🔌 后端对接指引 (Backend Integration)

本项目采用 **服务层模式** 设计，所有数据交互逻辑封装在 `services/storageService.ts` 中。目前默认使用浏览器 `LocalStorage` 进行演示。

若需对接 **Python (FastAPI)** 或其他后端服务，请参考以下规范：

### 1. API 接口规范
建议后端实现以下 RESTful 接口：

#### A. 照片管理 (Photo Resources)
| 方法 | 路径 | 描述 |
| :--- | :--- | :--- |
| `GET` | `/api/v1/photos` | 获取当前用户的照片流 |
| `POST` | `/api/v1/photos` | 上传一张生成的拍立得照片 |
| `DELETE` | `/api/v1/photos/{id}` | 删除指定照片 |

**上传数据结构示例 (JSON)**
由于前端已经生成了合成后的 Base64 图片，后端只需负责存储字符串或转存至对象存储（S3/OSS）。
```json
{
  "image_data": "data:image/jpeg;base64,/9j/4AAQSkZJR...",
  "meta": {
    "filter": "Vintage",
    "caption": "周末愉快",
    "created_at": 1715420000
  }
}
```

### 2. 修改前端服务层
你需要修改 `services/storageService.ts`，将本地存储逻辑替换为网络请求。

```typescript
// services/storageService.ts (对接示例)

// 环境变量获取 API 地址
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const savePhoto = async (photo: Photo): Promise<void> => {
  // 发送请求到后端
  const response = await fetch(`${API_BASE}/api/v1/photos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 如需鉴权，在此处添加 Token
      // 'Authorization': `Bearer ${localStorage.getItem('token')}` 
    },
    body: JSON.stringify({
      id: photo.id,
      image_data: photo.dataUrl, // 完整的 Base64 字符串
      caption: photo.caption,
      filter: photo.filter
    })
  });
  
  if (!response.ok) throw new Error('上传失败');
};

export const getPhotos = async (): Promise<Photo[]> => {
  const res = await fetch(`${API_BASE}/api/v1/photos`);
  if (!res.ok) return [];
  return res.json(); // 确保后端返回格式与 TypeScript 接口 Photo 匹配
};
```

### 3. 用户系统对接 (User System)
若需添加登录注册功能：
1.  **后端**：实现 `/auth/login` 接口，验证成功后返回 JWT Token。
2.  **前端**：
    - 创建一个新的 `AuthService` 处理登录逻辑。
    - 将 Token 存储在 `LocalStorage` 或 `Cookie` 中。
    - 在 `savePhoto` 等请求的 Header 中带上 Token。

---

## 🗺 未来规划 (Roadmap)

- [ ] **社交分享卡片**：一键生成适合 Instagram/小红书 分享的精美卡片。
- [ ] **云端同步**：完成 FastAPI 对接，实现多端数据同步。
- [ ] **胶卷共享计划**：允许好友共同向同一个“胶卷”中拍摄照片。
- [ ] **实体打印对接**：尝试通过 WebBluetooth 连接便携式照片打印机（实验性）。

---

<div align="center">
  <p>Made with ❤️ by Polacam Team</p>
</div>