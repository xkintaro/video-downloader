<a href="README.md">
  <img src="https://img.shields.io/badge/Language-English-blue?style=flat-square&logo=google-translate&logoColor=white" alt="English">
</a>
<a href="README-TR.md">
  <img src="https://img.shields.io/badge/Dil-Türkçe-red?style=flat-square&logo=google-translate&logoColor=white" alt="Türkçe">
</a>

  <br />
  <br />

<div align="center">
  <img src="frontend/public/kintaro.png" width="120" height="120" />
  <br />
  <br />

  <p>
    Cyberpunk-themed video downloader tool
  </p>

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

  <p>
    <a href="#features">Features</a> •
    <a href="#tech">Technologies</a> •
    <a href="#installation">Installation</a> •
    <a href="#license">License</a> •
    <a href="#gallery">Gallery</a>
  </p>

  <br />
  <br />
</div>

## 📋 About

**Kintaro Downloader** is a self-hosted video downloader tool with a cyberpunk-themed interface. It wraps the power of [yt-dlp](https://github.com/yt-dlp/yt-dlp) in a sleek React frontend and Express backend, letting you download videos from YouTube, TikTok, and hundreds of other platforms with a single click.

All downloads are saved locally on your machine — no cloud, no third-party servers. Just paste a URL, hit **Initialize**, and the video lands straight in your local archive.

<img src="frontend/public/md/20260304203540024.jpg" width="100%" />

## <a id="features"></a> ✨ Features

### Universal Video Downloading
- Supports **YouTube, TikTok, Twitter/X, Instagram, Reddit** and [hundreds more](https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md) via yt-dlp.
- Automatically selects the **best available quality**.
- Downloads are saved with a timestamped filename for easy sorting.

### Local Archive Management
- Browse all downloaded files from the integrated **Local Archive** panel.
- View file names, sizes, and download dates at a glance.
- **Individual delete** or **Purge All** option to clear the entire archive.
- Re-download any file directly from the archive list.

### Cyberpunk UI
- **Dark glassmorphism** aesthetic with neon accent colors.
- Orbital animated visualizer on the landing section.
- Smooth **Framer Motion** transitions and micro-animations throughout.
- Fully responsive — works on desktop and mobile.

### Auto-Updating
- yt-dlp binary is **automatically updated** on every server start to ensure maximum platform compatibility.

### Self-Hosted & Private
- Everything runs on **your own machine** or server. No data leaves your network.
- Simple `.env` configuration for ports and paths.
- Ready for **Docker** deployment out of the box.

## <a id="tech"></a> 🛠️ Technologies

### Backend
- **Node.js**: JavaScript runtime for the server.
- **Express**: Minimal web framework for REST API endpoints.
- **yt-dlp**: Feature-rich command-line video downloader (via `yt-dlp-exec`).
- **dotenv**: Environment variable management.

### Frontend
- **React 19**: Component-based UI with the latest React features.
- **Vite**: Lightning-fast build tool and dev server.
- **Tailwind CSS v4**: Utility-first CSS framework for rapid styling.
- **Framer Motion**: Production-ready animation library.
- **Axios**: Promise-based HTTP client.
- **React Icons**: Popular icon sets as React components.

## <a id="installation"></a> 🚀 Installation

### Requirements
- **Node.js** (v18+)
- **npm** (comes with Node.js)
- **yt-dlp** must be available in your system PATH, or the `yt-dlp-exec` package will handle it automatically.

### Step-by-Step Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/xkintaro/video-downloader.git
   cd video-downloader
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure Variables:**

   **Backend** (`backend/.env`):
   ```env
   VITE_BACKEND_PORT=5066
   VITE_DOWNLOADS_DIR=downloads
   ```

   **Frontend** (`frontend/.env`):
   ```env
   VITE_FRONTEND_API_URL=http://localhost:5066
   VITE_DOWNLOADS_DIR=downloads
   VITE_FRONTEND_PORT=5065
   ```

5. **Start the Application:**

   ```bash
   # Terminal 1 — Backend
   cd backend && node index.js

   # Terminal 2 — Frontend
   cd frontend && npm run dev
   ```

6. Open `http://localhost:5065` in your browser to start downloading.

## 📄 License <a id="license"></a>

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🖼️ Gallery <a id="gallery"></a>

<img src="frontend/public/md/20260304203540138.jpg" width="100%" />

#

<img src="frontend/public/md/20260304203540238.jpg" width="auto" />

#

<p align="center">
  <sub>❤️ Developed by "Mustafa TAŞAL" (kintaro)</sub>
</p>
