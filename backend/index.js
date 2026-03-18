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

const activeJobs = new Map();

app.post('/download', (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL cannot be empty' });
  }

  const jobId = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now();
  const filename = sanitizeFilename(`kintaro_downloader_${timestamp}.mp4`);
  const filepath = path.join(DOWNLOAD_DIR, filename);

  const options = {
    output: filepath,
    format: 'best',
    restrictFilenames: true,
    noCacheDir: true,
    noWarnings: true,
    noCheckCertificates: true,
    socketTimeout: 30,
    addHeader: [
      'referer:google.com',
      'Accept-Language:en-US,en;q=0.9',
      'User-Agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
    ]
  };

  try {
    const subprocess = ytdl.exec(url, options);

    activeJobs.set(jobId, {
      subprocess,
      progress: 0,
      status: 'starting',
      filename,
      filepath,
      res: null
    });

    subprocess.stdout.on('data', (data) => {
      const output = data.toString();
      const match = output.match(/\[download\]\s+([\d.]+)%/);
      if (match) {
        const prog = parseFloat(match[1]);
        const job = activeJobs.get(jobId);
        if (job) {
          job.progress = prog;
          job.status = 'downloading';
          if (job.res) {
            job.res.write(`data: ${JSON.stringify({ progress: prog, status: 'downloading' })}\n\n`);
          }
        }
      }
    });

    subprocess.on('close', (code) => {
      const job = activeJobs.get(jobId);
      if (job) {
        if (code === 0) {
          job.status = 'completed';
          if (job.res) {
            job.res.write(`data: ${JSON.stringify({ 
              status: 'completed', 
              filename: job.filename, 
              downloadUrl: `/downloads/${encodeURIComponent(job.filename)}` 
            })}\n\n`);
            job.res.end();
          }
        } else if (job.status !== 'cancelled') {
          job.status = 'error';
          if (job.res) {
            job.res.write(`data: ${JSON.stringify({ status: 'error', error: 'Download failed or unsupported URL' })}\n\n`);
            job.res.end();
          }
        }
        activeJobs.delete(jobId);
      }
    });

    subprocess.on('error', (err) => {
      const job = activeJobs.get(jobId);
      if (job) {
        job.status = 'error';
        if (job.res) {
           job.res.write(`data: ${JSON.stringify({ status: 'error', error: err.message })}\n\n`);
           job.res.end();
        }
        activeJobs.delete(jobId);
      }
    });

    return res.json({ jobId });
  } catch (error) {
    console.error('Download start error:', error);
    return res.status(500).json({
      error: 'Video download initialization failed',
      details: error.message
    });
  }
});

app.get('/download/progress/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = activeJobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  job.res = res;
  res.write(`data: ${JSON.stringify({ progress: job.progress, status: job.status })}\n\n`);

  req.on('close', () => {
    if (job && job.res === res) {
      job.res = null;
    }
  });
});

app.post('/download/cancel/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = activeJobs.get(jobId);

  if (job) {
    job.status = 'cancelled';
    if (job.res) {
      job.res.write(`data: ${JSON.stringify({ status: 'cancelled' })}\n\n`);
      job.res.end();
    }
    try {
      if (job.subprocess.pid) {
        job.subprocess.kill();
      }
    } catch (e) {
      console.error('Error killing process', e);
    }
    
    setTimeout(() => {
      if (fsSync.existsSync(job.filepath)) {
        try { fsSync.unlinkSync(job.filepath); } catch(e) {}
      }
    }, 1000);
    
    activeJobs.delete(jobId);
    return res.json({ success: true });
  }

  return res.status(404).json({ error: 'Job not found' });
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