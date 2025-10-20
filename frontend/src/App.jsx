import 'kintaro-ui/src/root.css';
import {
  KintaroTitle1,
  KintaroTextBox1,
  KintaroButton1, KintaroButton2, KintaroButton4,
  KintaroDescription,
  KintaroModal,
} from 'kintaro-ui/src';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { CiFileOn } from "react-icons/ci";
import { IoMdDownload } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";

import './App.css';

import {
  KintaroErrorMessage1,
  KintaroSuccessMessage1
} from "./components/KintaroSystemMessages";

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

function App() {
  const [url, setUrl] = useState('');
  const [downloadInfo, setDownloadInfo] = useState(null);
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

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
      setError('Please enter a video URL');
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
      setError(err.response?.data?.error || 'Failed to download video');
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
      setError('Failed to delete downloads');
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
      setError('Failed to delete file');
    }
  };

  return (
    <div className="kintaro-xahzy">
      <div className="max-w-700px w-95p flex flex-col padding-xs">
        <KintaroModal
          isOpen={clearDialogOpen}
          onClose={() => setClearDialogOpen(false)}
          title="Confirm Transaction"
        >
          <div className="kintaro-modal-content">
            <KintaroDescription
              text={"This will delete all downloaded files. This action cannot be undone."} />
            <div className="kintaro-modal-footer">
              <KintaroButton2
                title={"Cancel"}
                onClick={() => setClearDialogOpen(false)}
              >
                Cancel
              </KintaroButton2>
              <KintaroButton1
                className='bg-error'
                onClick={handleClearDownloads}
                title="Confirm"
              >
                Confirm
              </KintaroButton1>
            </div>
          </div>
        </KintaroModal>

        <KintaroModal
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          title="Confirm Transaction"
        >
          <div className="kintaro-modal-content">
            <KintaroDescription
              text={`Are you sure you want to delete the file "${fileToDelete}"? This action cannot be undone.`} />

            <div className="kintaro-modal-footer">
              <KintaroButton2
                title={"Cancel"}
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </KintaroButton2>
              <KintaroButton1
                className='bg-error'
                onClick={() => handleDeleteFile(fileToDelete)}
                title="Confirm"
              >
                Confirm
              </KintaroButton1>
            </div>
          </div>
        </KintaroModal>

        <KintaroTitle1 className='margin-bottom-xs'>Kintaro Downloader</KintaroTitle1>

        <div className="flex flex-col gap-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-sm">
            <KintaroDescription
              text={"Download videos from any platform"}
            />
            <KintaroTextBox1
              type={"text"}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={"Enter the video URL"}
            />
            <div className='flex justify-between items-center flex-wrap'>
              <KintaroButton1
                type="submit"
                disabled={loading}
                className='bg-accent'
              >
                {loading ? 'Downloading...' : 'Download'}
              </KintaroButton1>
              <div className="size-xs text-color-2 text-center padding-xs">
                {downloads.length} item{downloads.length !== 1 ? 's' : ''} •
                Total: {formatFileSize(downloads.reduce((acc, file) => acc + file.size, 0))}
              </div>
            </div>
            {loading && <KintaroDescription text={"Downloading..."} />}
            {error && <KintaroErrorMessage1 message={error} autoDismiss={true} />}
            {downloadInfo && (
              <KintaroSuccessMessage1 message={"Download complete!"} autoDismiss={true} />
            )}
          </form>

          {downloads.length === 0 ? (
            <div className="flex flex-col items-center text-center justify-center gap-sm h-200px border-1 border-solid border-color rounded">
              <CiFileOn className="size-xxl text-color-1 opacity-50" />
              <KintaroDescription
                text={"No downloads yet. Videos you download will appear here."}
              />
            </div>
          ) : (
            <div className="flex flex-col rounded overflow-hidden">
              <div className="overflow-y-auto max-h-400px flex flex-col">
                {downloads.map((file, index) => (
                  <div key={index} className="flex justify-between items-center padding-sm transition-all gap-sm hover:bg-color-3">
                    <div className="flex items-center gap-sm">
                      <CiFileOn className="text-color-1 size-xl" />
                      <div className="flex flex-col overflow-hidden gap-xs">
                        <KintaroDescription
                          text={file.name}
                          maxLength={50}
                          showToggleButton={false}
                        />
                        <span className="size-xs text-color-2">{formatFileSize(file.size)}</span>
                      </div>
                    </div>
                    <div className="flex gap-xs">
                      <button
                        className="flex items-center justify-center padding-xs rounded-full size-lg cursor-pointer transition-all bg-transparent text-error hover:text-error-transparent"
                        title="Delete"
                        onClick={() => {
                          setFileToDelete(file.name);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <MdDeleteForever />
                      </button>
                      <a
                        href={file.url}
                        download
                        className="flex items-center justify-center padding-xs rounded-full size-lg cursor-pointer transition-all bg-transparent text-success hover:text-success-transparent"
                        title="Download"
                      >
                        <IoMdDownload />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {downloads.length > 3 && (
            <button
              onClick={() => setClearDialogOpen(true)}
              title={"Delete All Downloads"}
              className='border-error outline-none bg-transparent w-fit text-error hover:text-error-transparent size-sm text-shadow cursor-pointer transition-all'
            >
              Delete All Downloads
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App; 