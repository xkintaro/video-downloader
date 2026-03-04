import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useRef } from 'react';
import { CiFileOn } from "react-icons/ci";
import { IoMdDownload } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import { RiDonutChartFill, RiDownloadCloudFill, RiTerminalWindowLine, RiGithubFill, RiDiscordFill, RiEarthLine, RiArchiveDrawerFill, RiSignalWifiFill } from "react-icons/ri";

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  show: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }
  }
};

const modalOverlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const modalContent = {
  hidden: { opacity: 0, scale: 0.85, y: 30, filter: 'blur(10px)' },
  visible: {
    opacity: 1, scale: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
  },
  exit: {
    opacity: 0, scale: 0.9, y: 20, filter: 'blur(6px)',
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] }
  }
};

const statusMessage = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }
  },
  exit: {
    opacity: 0, y: -10,
    transition: { duration: 0.3 }
  }
};

function OrbitalVisualizer() {
  const dataLabels = [
    { text: 'SYNC', x: '82%', y: '18%', delay: 0 },
    { text: '00:FF:88', x: '75%', y: '78%', delay: 1.2 },
    { text: 'READY', x: '15%', y: '65%', delay: 0.6 },
    { text: 'NODE_3', x: '20%', y: '25%', delay: 1.8 },
  ];

  return (
    <motion.div
      className="relative w-full aspect-square max-w-[500px]"
      initial={{ opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 1.2, delay: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
    >
      <div className="absolute inset-0 rounded-full bg-accent/5 blur-[80px]" />

      <div className="absolute inset-[5%] animate-spin-slow">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle
            cx="100" cy="100" r="90"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="0.5"
            strokeDasharray="8 20 2 20"
            opacity="0.3"
            className="animate-dash-move"
          />
          <circle cx="100" cy="10" r="3" fill="var(--color-accent)" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="190" cy="100" r="2" fill="var(--color-accent)" opacity="0.5">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="30" cy="150" r="2.5" fill="var(--color-accent)" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0.1;0.6" dur="2.5s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>

      <div className="absolute inset-[18%] animate-spin-reverse">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle
            cx="100" cy="100" r="90"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="0.8"
            strokeDasharray="4 30 15 30"
            opacity="0.2"
          />
          <path
            d="M 100 10 A 90 90 0 0 1 190 100"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
          />
          <circle cx="100" cy="10" r="4" fill="var(--color-accent)" opacity="0.9">
            <animate attributeName="r" values="4;2;4" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="190" cy="100" r="3" fill="var(--color-accent)" opacity="0.7">
            <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>

      <div className="absolute inset-[30%] animate-spin-slower">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle
            cx="100" cy="100" r="90"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="1"
            strokeDasharray="2 15"
            opacity="0.15"
          />
          <circle cx="10" cy="100" r="2" fill="var(--color-accent)" opacity="0.8" />
          <circle cx="150" cy="25" r="1.5" fill="var(--color-accent)" opacity="0.6" />
        </svg>
      </div>

      <div className="absolute inset-[38%]">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon
            points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="0.5"
            opacity="0.15"
          />
          <polygon
            points="50,15 83,32.5 83,67.5 50,85 17,67.5 17,32.5"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="0.3"
            opacity="0.1"
          />
        </svg>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <motion.div
            className="absolute -inset-4 rounded-full bg-accent/20 blur-xl"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="w-5 h-5 rounded-full bg-accent shadow-[0_0_20px_var(--color-accent),0_0_60px_var(--color-accent)]"
            animate={{
              scale: [1, 1.2, 1],
              boxShadow: [
                '0 0 20px var(--color-accent), 0 0 60px var(--color-accent)',
                '0 0 30px var(--color-accent), 0 0 80px var(--color-accent)',
                '0 0 20px var(--color-accent), 0 0 60px var(--color-accent)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute w-full h-px bg-linear-to-r from-transparent via-accent/10 to-transparent" />
        <div className="absolute h-full w-px bg-linear-to-b from-transparent via-accent/10 to-transparent" />
      </div>

      {dataLabels.map((label, i) => (
        <motion.div
          key={i}
          className="absolute font-mono text-[10px] tracking-[0.25em] text-accent/60 animate-data-flicker"
          style={{ left: label.x, top: label.y, animationDelay: `${label.delay}s` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 + label.delay * 0.3, duration: 0.8 }}
        >
          <span className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-accent/50" />
            {label.text}
          </span>
        </motion.div>
      ))}

      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-[2px] h-[2px] rounded-full bg-accent/40"
          style={{
            left: `${20 + i * 12}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [0, -30 - i * 10, 0],
            x: [0, 10 + i * 5, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 3 + i * 0.8,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'easeInOut',
          }}
        />
      ))}

      <div className="absolute top-[8%] left-[8%] w-6 h-6 border-l border-t border-accent/20" />
      <div className="absolute top-[8%] right-[8%] w-6 h-6 border-r border-t border-accent/20" />
      <div className="absolute bottom-[8%] left-[8%] w-6 h-6 border-l border-b border-accent/20" />
      <div className="absolute bottom-[8%] right-[8%] w-6 h-6 border-r border-b border-accent/20" />

      <motion.div
        className="absolute bottom-[2%] left-0 right-0 text-center font-mono text-[9px] tracking-[0.3em] text-accent/30 uppercase"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        ◆ Signal Active ◆
      </motion.div>
    </motion.div>
  );
}

function App() {
  const [url, setUrl] = useState('');
  const [downloadInfo, setDownloadInfo] = useState(null);
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const archiveSectionRef = useRef(null);
  const dividerRef = useRef(null);
  const archiveInView = useInView(archiveSectionRef, { once: true, margin: '-80px' });
  const dividerInView = useInView(dividerRef, { once: true, margin: '-40px' });

  const fetchDownloads = async () => {
    try {
      const response = await axios.get('/downloads');
      setDownloads(response.data.reverse());
    } catch (err) {
      console.error('Error fetching downloads:', err);
      setError('Failed to fetch downloads');
    }
  };

  useEffect(() => {
    fetchDownloads();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDownloadInfo(null);

    if (!url) {
      setError('PLEASE ENTER A VIDEO URL');
      return;
    }

    try {
      setLoading(true);
      const infoResponse = await axios.post('/download', { url });
      setDownloadInfo(infoResponse.data);

      const fileResponse = await axios.get(infoResponse.data.downloadUrl, {
        responseType: 'blob'
      });

      const blob = new Blob([fileResponse.data], { type: 'video/mp4' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', infoResponse.data.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      fetchDownloads();
      setUrl('');
    } catch (err) {
      console.error('Download error:', err);
      setError(err.response?.data?.error || 'VIDEO DOWNLOAD PROCESS FAILED');
    } finally {
      setLoading(false);
    }
  };

  const handleClearDownloads = async () => {
    try {
      await axios.delete('/downloads');
      fetchDownloads();
      setClearDialogOpen(false);
    } catch (err) {
      console.error('Failed to delete downloads:', err);
      setError('FAILED TO PURGE DOWNLOADS');
    }
  };

  const handleDeleteFile = async (filename) => {
    try {
      const encodedFilename = encodeURIComponent(filename);
      await axios.delete(`/downloads/${encodedFilename}`);
      fetchDownloads();
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error('Failed to delete file:', err);
      setError('FAILED TO PURGE FILE');
    }
  };

  return (
    <div className="min-h-dvh bg-bg-base text-fg-base font-mono relative overflow-hidden selection:bg-accent selection:text-bg-base">

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-bg-base">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(var(--color-accent) 1px, transparent 1px), linear-gradient(90deg, var(--color-accent) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)'
          }}
        />

        <motion.div
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent/10 blur-[120px] mix-blend-screen"
          animate={{
            scale: [1, 1.2, 0.9, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-accent/5 blur-[150px] mix-blend-screen"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        <div
          className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <main className="relative z-10 w-full max-w-[1660px] mx-auto p-4 sm:p-8 lg:p-20 flex flex-col justify-center gap-10">

        <motion.div
          className="sm:min-h-[70dvh] flex flex-col lg:flex-row lg:items-center lg:gap-16 gap-10 justify-center max-sm:pt-4"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >

          <div className="flex flex-col gap-10 lg:flex-1">
            <header className="flex flex-col gap-4 sm:gap-6">
              <motion.div variants={fadeUp} className="flex items-center gap-3 text-accent text-sm tracking-[0.2em] font-bold uppercase w-full">
                <RiTerminalWindowLine className="text-xl shrink-0" />
                <span className="shrink-0">System v1.0.0</span>
                <motion.span
                  className="inline-block w-2 h-4 bg-accent ml-1"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
                />
              </motion.div>

              <motion.h1 variants={fadeUp} className="font-display text-2xl sm:text-3xl md:text-4xl 2xl:text-7xl sm:leading-[0.9] font-bold tracking-tighter uppercase text-wrap">
                Kintaro<br />
                <span className="text-transparent" style={{ WebkitTextStroke: '1px var(--color-fg-muted)' }}>Downloader</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-fg-muted max-w-lg text-sm md:text-base leading-relaxed mt-2 border-l-2 border-accent pl-5">
                High-performance media download unit. Paste the link, initialize the protocol, and synchronize the archive to your local drive.
              </motion.p>
            </header>

            <motion.form variants={fadeUp} onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-6 w-full max-w-xl relative">

              <div className="relative group">
                <motion.div
                  className="relative flex flex-col sm:flex-row gap-3 bg-bg-surface/80 backdrop-blur-md p-2 border border-border rounded-xl"
                >
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="[ AWAITING URL INPUT // ]"
                    className="w-full bg-transparent border-none outline-none px-4 py-4 text-base placeholder:text-fg-muted/50 focus:ring-0 text-accent font-bold tracking-wide"
                  />
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="bg-accent text-bg-base font-bold uppercase tracking-wider px-8 py-4 sm:py-0 rounded-lg hover:bg-accent-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RiDonutChartFill className="animate-spin text-xl" />
                        <span>Processing</span>
                      </>
                    ) : (
                      <>
                        <RiDownloadCloudFill className="text-xl" />
                        <span>Initialize</span>
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </div>

              <motion.div variants={fadeUp} className="flex items-center gap-3 text-accent text-sm tracking-[0.2em] font-bold uppercase w-full mt-2">
                <RiEarthLine className="text-xl shrink-0" />
                <span className="shrink-0">Socials</span>
                <span className="flex-1 h-px bg-accent mx-2 opacity-30"></span>
                <div className="flex items-center gap-4 shrink-0">
                  <motion.a
                    href="https://github.com/xkintaro/video-downloader" target="_blank" rel="noopener noreferrer"
                    className="hover:text-white transition-all cursor-pointer" title="GitHub"
                  >
                    <RiGithubFill className="text-2xl" />
                  </motion.a>
                  <motion.a
                    href="https://discord.gg/NSQk27Zdkv" target="_blank" rel="noopener noreferrer"
                    className="hover:text-[#5865F2] transition-all cursor-pointer" title="Discord"
                  >
                    <RiDiscordFill className="text-2xl" />
                  </motion.a>
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key="error"
                    variants={statusMessage}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex items-center gap-3 bg-error-transparent border border-error/20 text-error px-4 py-3 rounded-lg text-sm"
                  >
                    <div className="w-2 h-2 rounded-full bg-error animate-pulse shrink-0"></div>
                    <span className="font-bold tracking-wider">{error}</span>
                  </motion.div>
                )}

                {downloadInfo && !error && (
                  <motion.div
                    key="success"
                    variants={statusMessage}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex items-center gap-3 bg-accent-transparent border border-accent/20 text-accent px-4 py-3 rounded-lg text-sm"
                  >
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0"></div>
                    <span className="font-bold tracking-wider uppercase">Video downloaded successfully.</span>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.form>
          </div>

          <motion.div
            className="hidden lg:flex lg:flex-1 items-center justify-center"
            variants={fadeUp}
          >
            <OrbitalVisualizer />
          </motion.div>

        </motion.div>

        <div ref={dividerRef} className="relative flex items-center gap-4 py-6">
          <motion.div
            className="flex-1 h-px bg-linear-to-r from-transparent via-accent/50 to-transparent"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={dividerInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 1.2, ease: [0.25, 0.4, 0.25, 1] }}
          />
          <motion.div
            className="flex items-center gap-2 text-accent text-xs font-bold tracking-[0.3em] uppercase shrink-0"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={dividerInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <RiSignalWifiFill className="text-sm" />
            <span>Local Drive</span>
          </motion.div>
          <motion.div
            className="flex-1 h-px bg-linear-to-r from-transparent via-accent/50 to-transparent"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={dividerInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 1.2, ease: [0.25, 0.4, 0.25, 1] }}
          />
        </div>

        <motion.div
          ref={archiveSectionRef}
          initial={{ opacity: 0, y: 60, filter: 'blur(10px)' }}
          animate={archiveInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.9, ease: [0.25, 0.4, 0.25, 1], delay: 0.8 }}
          className="border border-border rounded-2xl flex flex-col min-h-[350px] max-h-[600px] overflow-hidden relative bg-bg-base/40 backdrop-blur-xl"
        >

          <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 bg-bg-base/80 z-10 sticky top-0">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <RiArchiveDrawerFill className="text-xl" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-display sm:text-lg font-bold uppercase tracking-tight text-fg-base">Archive</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                    <span className="text-[10px] text-accent font-bold tracking-widest uppercase">Active</span>
                  </div>
                </div>
                <div className="text-xs text-fg-muted mt-1 flex items-center gap-2 font-bold tracking-wider uppercase">
                  <span>{downloads.length} Files</span>
                  <span className="text-border">/</span>
                  <span className="text-accent">{formatFileSize(downloads.reduce((acc, file) => acc + file.size, 0))}</span>
                </div>
              </div>
            </div>

            {downloads.length > 0 && (
              <motion.button
                onClick={() => setClearDialogOpen(true)}
                className="text-xs font-bold uppercase tracking-widest text-fg-muted hover:text-error transition-colors px-4 py-2 border border-border hover:border-error/30 rounded-lg hover:bg-error/5"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Purge All
              </motion.button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 custom-scrollbar">
            {downloads.length === 0 ? (
              <motion.div
                className="flex-1 flex flex-col items-center justify-center text-center p-8 min-h-[220px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="w-20 h-20 border border-dashed border-fg-muted rounded-full flex items-center justify-center mb-6">
                  <CiFileOn className="text-4xl text-fg-muted" />
                </div>
                <p className="text-sm font-bold tracking-[0.2em] uppercase">Archive_Empty_</p>
                <p className="text-xs text-fg-muted mt-3 max-w-[200px] uppercase tracking-wider leading-relaxed">No saved media files detected in the system.</p>
              </motion.div>
            ) : (
              <div className="flex flex-col gap-2">
                {downloads.map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.06, ease: [0.25, 0.4, 0.25, 1] }}
                    className="group bg-bg-surface/30 border border-border hover:border-accent/30 rounded-xl p-4 flex items-center justify-between transition-colors duration-300 hover:bg-bg-surface/70"
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <span className="text-[10px] font-bold text-fg-muted/40 tracking-widest w-6 text-right shrink-0 tabular-nums">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <div className="w-10 h-10 rounded-lg bg-bg-base/80 flex items-center justify-center shrink-0 text-fg-muted group-hover:text-accent group-hover:bg-accent/10 transition-colors border border-border group-hover:border-accent/20">
                        <CiFileOn className="text-xl pt-0.5" />
                      </div>
                      <div className="flex flex-col min-w-0 gap-0.5">
                        <span className="text-sm font-bold truncate text-fg-base group-hover:text-accent transition-colors">
                          {file.name}
                        </span>
                        <span className="text-[11px] text-accent/60 tracking-widest font-bold">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 ml-4">
                      <motion.button
                        onClick={() => {
                          setFileToDelete(file.name);
                          setDeleteDialogOpen(true);
                        }}
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-fg-muted hover:text-error hover:bg-error/10 border border-transparent hover:border-error/20 transition-all"
                        title="Purge"
                      >
                        <MdDeleteForever className="text-lg" />
                      </motion.button>
                      <motion.a
                        href={file.url}
                        download
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-fg-muted hover:text-accent hover:bg-accent/10 border border-transparent hover:border-accent/20 transition-all"
                        title="Download"
                      >
                        <IoMdDownload className="text-lg" />
                      </motion.a>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </motion.div>

      </main>

      <AnimatePresence>
        {clearDialogOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-base/90 backdrop-blur-sm"
            variants={modalOverlay}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setClearDialogOpen(false)}
          >
            <motion.div
              className="bg-bg-surface border border-error/30 p-8 rounded-2xl max-w-md w-full shadow-[0_0_50px_rgba(255,51,102,0.1)]"
              variants={modalContent}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display text-2xl font-bold uppercase text-error mb-4 flex items-center gap-3">
                <motion.div
                  className="w-3 h-3 bg-error rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                System_Alert
              </h3>
              <p className="text-sm text-fg-muted mb-8 leading-relaxed font-bold tracking-wider">
                ENTIRE LOCAL ARCHIVE WILL BE PURGED. THIS ACTION IS IRREVERSIBLE. DO YOU CONFIRM?
              </p>
              <div className="flex justify-end gap-4">
                <motion.button
                  onClick={() => setClearDialogOpen(false)}
                  className="px-6 py-3 border border-border text-fg-muted hover:text-fg-base rounded-lg text-sm font-bold tracking-widest uppercase transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Abort
                </motion.button>
                <motion.button
                  onClick={handleClearDownloads}
                  className="px-6 py-3 bg-error/10 text-error hover:bg-error hover:text-white border border-error/50 rounded-lg text-sm font-bold tracking-widest uppercase transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Confirm
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteDialogOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-base/90 backdrop-blur-sm"
            variants={modalOverlay}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setDeleteDialogOpen(false)}
          >
            <motion.div
              className="bg-bg-surface border border-error/30 p-8 rounded-2xl max-w-md w-full shadow-[0_0_50px_rgba(255,51,102,0.1)]"
              variants={modalContent}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display text-2xl font-bold uppercase text-error mb-4 flex items-center gap-3">
                <motion.div
                  className="w-3 h-3 bg-error rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                File_Purge
              </h3>
              <p className="text-sm text-fg-muted mb-3 font-bold tracking-wider uppercase">Target File:</p>
              <p className="text-sm font-bold text-accent mb-8 truncate p-4 bg-bg-base rounded-lg border border-border">
                {fileToDelete}
              </p>
              <div className="flex justify-end gap-4">
                <motion.button
                  onClick={() => setDeleteDialogOpen(false)}
                  className="px-6 py-3 border border-border text-fg-muted hover:text-fg-base rounded-lg text-sm font-bold tracking-widest uppercase transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Abort
                </motion.button>
                <motion.button
                  onClick={() => handleDeleteFile(fileToDelete)}
                  className="px-6 py-3 bg-error/10 text-error hover:bg-error hover:text-white border border-error/50 rounded-lg text-sm font-bold tracking-widest uppercase transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Purge
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default App;