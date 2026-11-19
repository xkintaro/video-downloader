const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const ytdl = require('yt-dlp-exec');
const ffmpegPath = require('ffmpeg-static');
const dotenv = require('dotenv');

dotenv.config();

const DOWNLOAD_DIR = path.join(__dirname, process.env.VITE_DOWNLOADS_DIR || 'downloads');
const TEMP_DIR = path.join(DOWNLOAD_DIR, '.tmp');

const app = express();
const PORT = process.env.VITE_BACKEND_PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use('/downloads', express.static(DOWNLOAD_DIR, { redirect: false }));

const ensureDownloadDir = async () => {
  try {
    await fs.mkdir(DOWNLOAD_DIR, { recursive: true });
  } catch (err) {
    console.error('Error creating download directory:', err);
    throw new Error('Could not initialize download directory');
  }
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

const ready = (async () => {
  if (!fsSync.existsSync(DOWNLOAD_DIR)) {
    await ensureDownloadDir();
  }

  await fs.rm(TEMP_DIR, { recursive: true, force: true });

  await updateYtdl();
})().catch((err) => console.error('Startup error:', err.message));

const activeJobs = new Map();

const removeJobDir = (dir) => {
  try { fsSync.rmSync(dir, { recursive: true, force: true }); } catch {}
};

const isTemporaryFile = (file) => /\.(part|ytdl|temp)$/.test(file) || /\.f\d+\./.test(file);

const findFinalFile = (dir) => {
  try {
    return fsSync.readdirSync(dir).find(file => !isTemporaryFile(file));
  } catch {
    return undefined;
  }
};

const uniqueName = (filename) => {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  let candidate = filename;
  for (let i = 2; fsSync.existsSync(path.join(DOWNLOAD_DIR, candidate)); i++) {
    candidate = `${base} (${i})${ext}`;
  }
  return candidate;
};

const listFiles = async () => {
  const entries = await fs.readdir(DOWNLOAD_DIR, { withFileTypes: true });
  return entries.filter(entry => entry.isFile() && !entry.name.startsWith('.')).map(entry => entry.name);
};

const sendEvent = (job, payload) => {
  if (job.res) {
    job.res.write(`data: ${JSON.stringify(payload)}\n\n`);
  }
};

app.post('/download', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL cannot be empty' });
  }

  await ready;

  const jobId = Math.random().toString(36).substring(2, 15);
  const dir = path.join(TEMP_DIR, jobId);
  fsSync.mkdirSync(dir, { recursive: true });

  const options = {
    output: path.join(dir, '%(title).150B.%(ext)s'),
    format: 'bv*+ba/b',
    formatSort: 'res,vcodec:h264,acodec:m4a',
    mergeOutputFormat: 'mp4',
    ffmpegLocation: ffmpegPath,
    jsRuntimes: `node:${process.execPath}`,
    newline: true,
    windowsFilenames: true,
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

  const finishJob = (job, payload) => {
    job.status = payload.status;
    job.final = payload;
    sendEvent(job, payload);
    if (job.res) {
      job.res.end();
      job.res = null;
    }
    setTimeout(() => activeJobs.delete(jobId), 60000);
  };

  try {
    const subprocess = ytdl.exec(url, options);
    subprocess.catch(() => {});

    const job = {
      subprocess,
      dir,
      progress: 0,
      status: 'starting',
      streams: 1,
      stream: -1,
      final: null,
      res: null
    };
    activeJobs.set(jobId, job);

    let buffer = '';
    subprocess.stdout.on('data', (data) => {
      buffer += data.toString();
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop();

      for (const line of lines) {
        const formats = line.match(/Downloading \d+ format\(s\): (\S+)/);
        if (formats) {
          job.streams = formats[1].split('+').length;
          continue;
        }

        if (/^\[download\] Destination:/.test(line)) {
          job.stream = Math.min(job.stream + 1, job.streams - 1);
          continue;
        }

        if (/^\[(Merger|VideoConvertor|FixupM3u8)\]/.test(line)) {
          job.status = 'processing';
          job.progress = 100;
          sendEvent(job, { progress: 100, status: 'processing' });
          continue;
        }

        const match = line.match(/^\[download\]\s+([\d.]+)%/);
        if (match && job.status !== 'processing') {
          const stream = Math.max(job.stream, 0);
          const overall = ((stream * 100) + parseFloat(match[1])) / job.streams;
          job.progress = Math.max(job.progress, Math.min(overall, 100));
          job.status = 'downloading';
          sendEvent(job, { progress: job.progress, status: 'downloading' });
        }
      }
    });

    subprocess.on('close', (code) => {
      if (job.status === 'cancelled') return;

      const finalFile = findFinalFile(dir);

      if (code === 0 && finalFile) {
        try {
          const filename = uniqueName(finalFile);
          fsSync.renameSync(path.join(dir, finalFile), path.join(DOWNLOAD_DIR, filename));
          finishJob(job, {
            status: 'completed',
            filename,
            downloadUrl: `/downloads/${encodeURIComponent(filename)}`
          });
        } catch (err) {
          console.error('Error moving download:', err);
          finishJob(job, { status: 'error', error: 'Could not save the downloaded file' });
        }
      } else {
        finishJob(job, { status: 'error', error: 'Download failed or unsupported URL' });
      }
      removeJobDir(dir);
    });

    subprocess.on('error', (err) => {
      if (job.status === 'cancelled' || job.final) return;
      finishJob(job, { status: 'error', error: err.message });
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

  if (job.final) {
    res.write(`data: ${JSON.stringify(job.final)}\n\n`);
    return res.end();
  }

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

  if (job && !job.final) {
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
    
    setTimeout(() => removeJobDir(job.dir), 1000);
    
    activeJobs.delete(jobId);
    return res.json({ success: true });
  }

  return res.status(404).json({ error: 'Job not found' });
});

app.get('/downloads', async (req, res) => {
  try {
    const files = await listFiles();
    const fileData = await Promise.all(
      files
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

    fileData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json(fileData);
  } catch (error) {
    console.error('Error listing downloads:', error);
    return res.status(500).json({ error: 'Could not list downloads' });
  }
});

app.delete('/downloads', async (req, res) => {
  try {
    const files = await listFiles();
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
    const filename = path.basename(decodeURIComponent(req.params.filename));
    const filepath = path.join(DOWNLOAD_DIR, filename);

    if (filename.startsWith('.') || !fsSync.existsSync(filepath) || !fsSync.statSync(filepath).isFile()) {
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