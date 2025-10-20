const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const ytdl = require('yt-dlp-exec');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Constants
const DOWNLOAD_DIR = path.join(__dirname, process.env.VITE_DOWNLOADS_DIR || 'downloads');
const ALLOWED_PLATFORMS = {
  tiktok: ['tiktok.com'],
  youtube: ['youtube.com', 'youtu.be']
};

// Initialize Express app
const app = express();
const PORT = process.env.VITE_BACKEND_PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/downloads', express.static(DOWNLOAD_DIR));

// Helper functions
const ensureDownloadDir = async () => {
  try {
    await fs.mkdir(DOWNLOAD_DIR, { recursive: true });
  } catch (err) {
    console.error('Error creating download directory:', err);
    throw new Error('Could not initialize download directory');
  }
};

const getPlatformFromUrl = (url) => {
  for (const [platform, domains] of Object.entries(ALLOWED_PLATFORMS)) {
    if (domains.some(domain => url.includes(domain))) {
      return platform;
    }
  }
  return 'other';
};

const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-z0-9_.-]/gi, '_');
};

// Initialize download directory
(async () => {
  if (!fsSync.existsSync(DOWNLOAD_DIR)) {
    await ensureDownloadDir();
  }
})();

// Video download endpoint
app.post('/download', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL cannot be empty' });
    }

    const platform = getPlatformFromUrl(url);
    const timestamp = Date.now();
    const filename = sanitizeFilename(`kintaro_${platform}_${timestamp}.mp4`);
    const filepath = path.join(DOWNLOAD_DIR, filename);

    const options = {
      output: filepath,
      format: 'best',
      restrictFilenames: true
    };

    await ytdl(url, options);

    if (!fsSync.existsSync(filepath)) {
      throw new Error('Downloaded file not found');
    }

    return res.json({
      success: true,
      downloadUrl: `/downloads/${encodeURIComponent(filename)}`,
      filename
    });

  } catch (error) {
    console.error('Download error:', error);
    return res.status(500).json({
      error: 'Video download failed',
      details: error.message
    });
  }
});

// List downloads endpoint
app.get('/downloads', async (req, res) => {
  try {
    const files = await fs.readdir(DOWNLOAD_DIR);
    const fileData = await Promise.all(
      files
        .filter(file => file.startsWith('kintaro_'))
        .map(async file => {
          const filepath = path.join(DOWNLOAD_DIR, file);
          const stats = await fs.stat(filepath);
          return {
            name: file,
            url: `/downloads/${encodeURIComponent(file)}`,
            size: stats.size,
            createdAt: stats.birthtime
          };
        })
    );

    return res.json(fileData);
  } catch (error) {
    console.error('Error listing downloads:', error);
    return res.status(500).json({ error: 'Could not list downloads' });
  }
});

// Delete all downloads endpoint
app.delete('/downloads', async (req, res) => {
  try {
    const files = await fs.readdir(DOWNLOAD_DIR);
    await Promise.all(
      files.map(file =>
        fs.unlink(path.join(DOWNLOAD_DIR, file))
      )
    );

    return res.json({
      success: true,
      message: 'All downloads deleted',
      count: files.length
    });
  } catch (error) {
    console.error('Error deleting downloads:', error);
    return res.status(500).json({ error: 'Could not delete downloads' });
  }
});

// Delete single download endpoint
app.delete('/downloads/:filename', async (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    const filepath = path.join(DOWNLOAD_DIR, filename);

    if (!fsSync.existsSync(filepath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    await fs.unlink(filepath);
    return res.json({ success: true });

  } catch (error) {
    console.error('Error deleting file:', error);
    return res.status(500).json({ error: 'Could not delete file' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});