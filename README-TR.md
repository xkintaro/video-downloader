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
    Cyberpunk temalı video indirme aracı
  </p>

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

  <p>
    <a href="#features">Özellikler</a> •
    <a href="#tech">Teknolojiler</a> •
    <a href="#installation">Kurulum</a> •
    <a href="#license">Lisans</a> •
    <a href="#gallery">Galeri</a>
  </p>

  <br />
  <br />
</div>

## 📋 Hakkında

**Kintaro Downloader**, cyberpunk temalı bir arayüze sahip self-hosted bir video indirme aracıdır. [yt-dlp](https://github.com/yt-dlp/yt-dlp) gücünü şık bir React frontend ve Express backend ile sarmalayarak YouTube, TikTok ve yüzlerce diğer platformdan tek tıkla video indirmenizi sağlar.

Tüm indirmeler makinenize yerel olarak kaydedilir — cloud yok, üçüncü taraf sunucular yok. Sadece bir URL yapıştırın, **Initialize** butonuna basın ve video doğrudan yerel arşivinize insin.

<img src="frontend/public/md/20260304203540024.jpg" width="100%" />

## <a id="features"></a> ✨ Özellikler

###  Evrensel Video İndirme
- yt-dlp aracılığıyla **YouTube, TikTok, Twitter/X, Instagram, Reddit** ve [yüzlercesini daha](https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md) destekler.
- Mevcut en iyi kaliteyi otomatik olarak seçer.
- Kolay sıralama için indirmeler zaman damgalı bir dosya adı ile kaydedilir.

### Yerel Arşiv Yönetimi
- İndirilen tüm dosyalara entegre **Local Archive** panelinden göz atın.
- Dosya adlarını, boyutlarını ve indirme tarihlerini bir bakışta görüntüleyin.
- Tüm arşivi temizlemek için **tek tek silme** veya **Purge All** seçeneği.
- Herhangi bir dosyayı doğrudan arşiv listesinden yeniden indirin.

### Cyberpunk Arayüzü
- Neon vurgu renkleriyle **koyu glassmorphism** estetiği.
- Giriş bölümünde orbital animasyonlu visualizer.
- Baştan sona pürüzsüz **Framer Motion** geçişleri ve mikro animasyonlar.
- Tamamen responsive — masaüstü ve mobilde çalışır.

### Otomatik Güncelleme
- Maksimum platform uyumluluğu sağlamak için yt-dlp binary dosyası her sunucu başlatıldığında **otomatik olarak güncellenir**.

### Self-Hosted ve Gizli
- Her şey **kendi makinenizde** veya sunucunuzda çalışır. Ağınızdan hiçbir veri çıkmaz.
- Portlar ve path'ler için basit `.env` konfigürasyonu.
- Doğrudan kullanıma hazır **Docker** deployment desteği.

## <a id="tech"></a> 🛠️ Teknolojiler

### Backend
- **Node.js**: Sunucu için JavaScript runtime.
- **Express**: REST API endpoint'leri için minimal web framework.
- **yt-dlp**: Zengin özelliklere sahip command-line video indirici (`yt-dlp-exec` aracılığıyla).
- **dotenv**: Environment variable yönetimi.

### Frontend
- **React 19**: En son React özelliklerine sahip component tabanlı arayüz.
- **Vite**: Yıldırım hızında build aracı ve dev server.
- **Tailwind CSS v4**: Hızlı stil tanımlama için utility-first CSS framework.
- **Framer Motion**: Üretime hazır animasyon kütüphanesi.
- **Axios**: Promise tabanlı HTTP client.
- **React Icons**: React component'leri olarak popüler ikon setleri.

## <a id="installation"></a> 🚀 Kurulum

### Gereksinimler
- **Node.js** (v18+)
- **npm** (Node.js ile birlikte gelir)
- **yt-dlp** sistem PATH'inizde mevcut olmalıdır veya `yt-dlp-exec` paketi bunu otomatik olarak halledecektir.

### Adım Adım Kurulum

1. **Depoyu Klonlayın:**
   ```bash
   git clone https://github.com/xkintaro/video-downloader.git
   cd video-downloader
   ```

2. **Backend Bağımlılıklarını Yükleyin:**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Bağımlılıklarını Yükleyin:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Değişkenleri Yapılandırın:**

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

5. **Uygulamayı Başlatın:**

   ```bash
   # Terminal 1 — Backend
   cd backend && node index.js

   # Terminal 2 — Frontend
   cd frontend && npm run dev
   ```

6. İndirmeye başlamak için tarayıcınızda `http://localhost:5065` adresini açın.

## 📄 Lisans <a id="license"></a>

Bu proje MIT Lisansı ile lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasını inceleyebilirsiniz.

## 🖼️ Galeri <a id="gallery"></a>

<img src="frontend/public/md/20260304203540138.jpg" width="100%" />

#

<img src="frontend/public/md/20260304203540238.jpg" width="auto" />

#

<p align="center">
  <sub>❤️ Developed by "Mustafa TAŞAL" (kintaro)</sub>
</p>