import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDownToLine,
  CircleAlert,
  CircleCheck,
  FileVideo,
  Trash2,
  X
} from 'lucide-react';
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle
} from '@/components/ui/item';
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const STATUS_LABELS = {
  starting: 'Preparing',
  downloading: 'Downloading',
  processing: 'Merging video and audio'
};

const formatSize = (bytes) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
};

const formatDate = (value) =>
  new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

const displayName = (file) => file.replace(/\.[^.]+$/, '');

const readError = async (response, fallback) => {
  try {
    const data = await response.json();
    return data.error || fallback;
  } catch {
    return fallback;
  }
};

function IconButton({ label, children, ...props }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="ghost" size="icon-sm" aria-label={label} {...props} />}>
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function GithubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.2 1.9 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.6 18.3 5 18.3 5c.7 1.7.3 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

export default function App() {
  const [url, setUrl] = useState('');
  const [job, setJob] = useState(null);
  const [notice, setNotice] = useState(null);
  const [downloads, setDownloads] = useState([]);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [clearOpen, setClearOpen] = useState(false);
  const eventSourceRef = useRef(null);

  const busy = Boolean(job);

  const fetchDownloads = useCallback(async () => {
    try {
      const response = await fetch('/downloads');
      if (!response.ok) throw new Error();
      setDownloads(await response.json());
    } catch {
      setNotice({ type: 'error', title: 'Could not load downloads', message: 'Make sure the backend server is running.' });
    }
  }, []);

  useEffect(() => {
    fetchDownloads();
    return () => eventSourceRef.current?.close();
  }, [fetchDownloads]);

  const finish = (nextNotice) => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    setJob(null);
    if (nextNotice) setNotice(nextNotice);
  };

  const saveFile = (href, filename) => {
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const value = url.trim();
    if (!value || busy) return;

    setNotice(null);
    setJob({ id: null, status: 'starting', progress: 0 });

    try {
      const response = await fetch('/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: value })
      });
      if (!response.ok) throw new Error(await readError(response, 'Could not start the download.'));

      const { jobId } = await response.json();
      setJob({ id: jobId, status: 'starting', progress: 0 });

      const source = new EventSource(`/download/progress/${jobId}`);
      eventSourceRef.current = source;

      source.onmessage = (message) => {
        const data = JSON.parse(message.data);

        if (data.status === 'completed') {
          saveFile(data.downloadUrl, data.filename);
          setUrl('');
          fetchDownloads();
          finish({ type: 'success', title: 'Download complete', message: displayName(data.filename) });
        } else if (data.status === 'error') {
          finish({ type: 'error', title: 'Download failed', message: data.error || 'The link is not supported or the video is unavailable.' });
        } else if (data.status === 'cancelled') {
          finish({ type: 'info', title: 'Download cancelled', message: 'Partial files were removed.' });
        } else {
          setJob({ id: jobId, status: data.status, progress: data.progress || 0 });
        }
      };

      source.onerror = () => {
        finish({ type: 'error', title: 'Connection lost', message: 'The connection to the backend server was interrupted.' });
      };
    } catch (error) {
      finish({ type: 'error', title: 'Download failed', message: error.message || 'Could not reach the backend server.' });
    }
  };

  const handleCancel = async () => {
    if (!job?.id) return;
    try {
      await fetch(`/download/cancel/${job.id}`, { method: 'POST' });
    } catch {
      finish({ type: 'error', title: 'Could not cancel', message: 'The backend server did not respond.' });
    }
  };

  const handleDelete = async () => {
    if (!fileToDelete) return;
    try {
      const response = await fetch(`/downloads/${encodeURIComponent(fileToDelete)}`, { method: 'DELETE' });
      if (!response.ok) throw new Error();
      await fetchDownloads();
    } catch {
      setNotice({ type: 'error', title: 'Could not delete the file', message: displayName(fileToDelete) });
    }
    setFileToDelete(null);
  };

  const handleClear = async () => {
    try {
      const response = await fetch('/downloads', { method: 'DELETE' });
      if (!response.ok) throw new Error();
      await fetchDownloads();
    } catch {
      setNotice({ type: 'error', title: 'Could not clear downloads', message: 'The backend server did not respond.' });
    }
    setClearOpen(false);
  };

  const progress = Math.round(job?.progress || 0);
  const NoticeIcon = notice?.type === 'success' ? CircleCheck : CircleAlert;

  return (
    <TooltipProvider>
      <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-12 px-4 py-6 sm:py-10">
        <section className="flex flex-col gap-5">
          <div className="relative overflow-hidden rounded-2xl border">
            <img
              src="/cover.jpg"
              alt=""
              className="h-72 w-full object-cover object-[50%_60%] sm:h-80"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 via-30% to-transparent to-60% sm:bg-linear-to-r sm:from-background/95 sm:via-background/55 sm:via-40% sm:to-transparent sm:to-70%" />
            <div className="absolute top-3 right-3 rounded-lg bg-background/70 p-1 backdrop-blur-sm">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <a
                      href="https://github.com/xkintaro/video-downloader"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="GitHub"
                      className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
                    />
                  }
                >
                  <GithubIcon className="size-4" />
                </TooltipTrigger>
                <TooltipContent>GitHub</TooltipContent>
              </Tooltip>
            </div>
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5 sm:right-auto sm:max-w-88 sm:p-6">
              <h1 className="text-2xl font-semibold sm:text-3xl sm:whitespace-nowrap">Download a video</h1>
              <p className="text-muted-foreground">
                Paste a link from YouTube, X, Instagram, TikTok or any other site supported by{' '}
                <span className="whitespace-nowrap">yt-dlp</span>.
                The best available quality is saved as MP4.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="url"
              inputMode="url"
              required
              placeholder="https://www.youtube.com/watch?v=..."
              aria-label="Video link"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              disabled={busy}
              className="h-9 flex-1"
            />
            <Button type="submit" size="lg" disabled={busy || !url.trim()}>
              {busy ? <Spinner /> : <ArrowDownToLine />}
              Download
            </Button>
          </form>

          {job && (
            <Card size="sm">
              <CardContent>
                <div className="flex items-center gap-4">
                  <Progress value={job.status === 'starting' ? null : progress} className="flex-1">
                    <ProgressLabel>{STATUS_LABELS[job.status] || 'Working'}</ProgressLabel>
                    {job.status !== 'starting' && <ProgressValue />}
                  </Progress>
                  <Button variant="outline" size="sm" onClick={handleCancel} disabled={!job.id}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {notice && (
            <Alert variant={notice.type === 'error' ? 'destructive' : 'default'}>
              <NoticeIcon />
              <AlertTitle>{notice.title}</AlertTitle>
              <AlertDescription className="break-all">{notice.message}</AlertDescription>
              <AlertAction>
                <Button variant="ghost" size="icon-xs" aria-label="Dismiss" onClick={() => setNotice(null)}>
                  <X />
                </Button>
              </AlertAction>
            </Alert>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex h-7 items-center justify-between">
            <h2 className="text-sm font-medium">
              Downloads <span className="text-muted-foreground">{downloads.length}</span>
            </h2>
            {downloads.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setClearOpen(true)} disabled={busy}>
                <Trash2 />
                Clear all
              </Button>
            )}
          </div>

          {downloads.length === 0 ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileVideo />
                </EmptyMedia>
                <EmptyTitle>No downloads yet</EmptyTitle>
                <EmptyDescription>Videos you download will appear here.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ItemGroup className="rounded-xl border p-1">
              {downloads.map((file, index) => (
                <div key={file.name}>
                  {index > 0 && <ItemSeparator className="my-1" />}
                  <Item size="sm">
                    <ItemMedia variant="icon" className="text-muted-foreground">
                      <FileVideo />
                    </ItemMedia>
                    <ItemContent className="min-w-0">
                      <ItemTitle className="w-full truncate">{displayName(file.name)}</ItemTitle>
                      <ItemDescription>
                        {formatSize(file.size)} · {formatDate(file.createdAt)}
                      </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <a
                              href={file.url}
                              download={file.name}
                              aria-label="Save"
                              className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
                            />
                          }
                        >
                          <ArrowDownToLine />
                        </TooltipTrigger>
                        <TooltipContent>Save</TooltipContent>
                      </Tooltip>
                      <IconButton label="Delete" onClick={() => setFileToDelete(file.name)}>
                        <Trash2 />
                      </IconButton>
                    </ItemActions>
                  </Item>
                </div>
              ))}
            </ItemGroup>
          )}
        </section>
      </main>

      <Dialog open={Boolean(fileToDelete)} onOpenChange={(open) => !open && setFileToDelete(null)}>
        <DialogContent className="sm:max-w-sm" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete this file?</DialogTitle>
            <DialogDescription className="break-all">
              {fileToDelete && displayName(fileToDelete)} will be removed from the downloads folder.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={clearOpen} onOpenChange={setClearOpen}>
        <DialogContent className="sm:max-w-sm" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Clear all downloads?</DialogTitle>
            <DialogDescription>
              All {downloads.length} files will be removed from the downloads folder.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" onClick={handleClear}>
              Clear all
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
