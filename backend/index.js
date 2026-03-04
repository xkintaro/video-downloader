const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const ytdl = require('yt-dlp-exec');
const dotenv = require('dotenv');

dotenv.config();

const DOWNLOAD_DIR = path.join(__dirname, process.env.VITE_DOWNLOADS_DIR || 'downloads');

const app = express();
const PORT = process.env.VITE_BACKEND_PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use('/downloads', express.static(DOWNLOAD_DIR));

const ensureDownloadDir = async () => {
  try {
    await fs.mkdir(DOWNLOAD_DIR, { recursive: true });
  } catch (err) {
    console.error('Error creating download directory:', err);
    throw new Error('Could not initialize download directory');
  }
};

const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-z0-9_.-]/gi, '_');
};

const updateYtdl = async () => {
  try {
    console.log('🔄 Checking for yt-dlp updates...');

    await ytdl.exec('', {
      update: true
    });

    console.log('✅ yt-dlp is successfully updated');
  } catch (err) {
    console.error('⚠️ Failed to update yt-dlp (Network issue or already updating). Using the current version. Details:', err.message);
  }
};

(async () => {
  if (!fsSync.existsSync(DOWNLOAD_DIR)) {
    await ensureDownloadDir();
  }

  await updateYtdl();
})();

app.post('/download', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL cannot be empty' });
    }

    const timestamp = Date.now();
    const filename = sanitizeFilename(`kintaro_downloader_${timestamp}.mp4`);
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

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});