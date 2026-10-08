import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  X, Download, Printer, ExternalLink, FileText,
  Maximize2, Minimize2, RefreshCw, AlertTriangle
} from 'lucide-react';
import { Button } from './index';
import { fetchPdfBlobUrl, downloadPdf } from '../../utils/pdf';

/**
 * Professional High-Definition PDF Viewer Modal.
 *
 * Features:
 * - Expansive responsive layout (88vh-90vh height by default, eliminates cramped 150px letterboxing)
 * - Fullscreen / Maximize toggle for 100vw x 100vh reading
 * - Direct iframe rendering with native browser zoom & page navigation
 * - Quick toolbar: Fullscreen, Print, Open New Tab, Download, Close
 * - Supports both preloaded blobUrl OR dynamic api endpoint/pdfUrl
 */
export default function PdfViewerModal({
  title = 'Document Preview',
  subtitle = '',
  blobUrl,
  pdfUrl,
  endpoint,
  fileName = 'document.pdf',
  downloadFilename,
  onClose,
  onDownload,
}) {
  const iframeRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [internalBlobUrl, setInternalBlobUrl] = useState(blobUrl || null);
  const [loading, setLoading] = useState(!blobUrl && Boolean(pdfUrl || endpoint));
  const [error, setError] = useState(null);

  const effectiveFileName = downloadFilename || fileName || 'document.pdf';
  const effectiveEndpoint = pdfUrl || endpoint;

  // Asynchronously fetch PDF blob if only endpoint was provided
  useEffect(() => {
    if (blobUrl) {
      setInternalBlobUrl(blobUrl);
      setLoading(false);
      return;
    }

    if (effectiveEndpoint) {
      let isCancelled = false;
      setLoading(true);
      setError(null);

      fetchPdfBlobUrl(effectiveEndpoint)
        .then(({ blobUrl: fetchedUrl }) => {
          if (!isCancelled) {
            setInternalBlobUrl(fetchedUrl);
            setLoading(false);
          }
        })
        .catch(err => {
          if (!isCancelled) {
            setError(err.message || 'Unable to load PDF document.');
            setLoading(false);
          }
        });

      return () => {
        isCancelled = true;
      };
    }
  }, [blobUrl, effectiveEndpoint]);

  // Clean up internally created object URLs on unmount
  useEffect(() => {
    return () => {
      if (internalBlobUrl && !blobUrl) {
        URL.revokeObjectURL(internalBlobUrl);
      }
    };
  }, [internalBlobUrl, blobUrl]);

  // Close on Escape, toggle fullscreen on 'F' key
  useEffect(() => {
    const handleKey = e => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else if (onClose) {
          onClose();
        }
      }
      if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && e.target.tagName !== 'INPUT') {
        setIsFullscreen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFullscreen, onClose]);

  const activeBlobUrl = blobUrl || internalBlobUrl;

  const handlePrint = () => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.focus();
        iframeRef.current.contentWindow.print();
        return;
      }
    } catch (_) {}
    if (activeBlobUrl) {
      const win = window.open(activeBlobUrl, '_blank');
      if (win) {
        win.focus();
        setTimeout(() => {
          try { win.print(); } catch (_) {}
        }, 600);
      }
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }
    if (activeBlobUrl) {
      const a = document.createElement('a');
      a.href = activeBlobUrl;
      a.download = effectiveFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }
    if (effectiveEndpoint) {
      downloadPdf({
        endpoint: effectiveEndpoint,
        defaultFilename: effectiveFileName,
      });
    }
  };

  const handleOpenNewTab = () => {
    if (activeBlobUrl) {
      window.open(activeBlobUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isFullscreen ? 'p-0' : 'p-2 sm:p-5'
      } bg-black/85 backdrop-blur-md transition-all`}
      onClick={e => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.16 }}
        className={`flex flex-col overflow-hidden shadow-2xl border transition-all duration-200 ${
          isFullscreen
            ? 'w-screen h-screen rounded-none border-0'
            : 'w-[96vw] max-w-6xl rounded-2xl border-white/15'
        }`}
        style={{
          background: 'var(--p-surface, #1e222b)',
          color: 'var(--p-text, #f1f5f9)',
          height: isFullscreen ? '100vh' : '90vh',
          maxHeight: isFullscreen ? '100vh' : '92vh',
        }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Document Header */}
        <header
          className="flex items-center justify-between px-4 sm:px-6 py-3 border-b flex-wrap gap-2 flex-shrink-0"
          style={{
            borderColor: 'var(--p-border, rgba(255,255,255,0.1))',
            background: 'var(--p-surface-2, #181b22)',
          }}
        >
          {/* Title & Document Badge */}
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
              style={{
                background: 'var(--p-accent-soft, rgba(23,107,69,0.15))',
                color: 'var(--p-accent, #176b45)',
              }}
            >
              <FileText size={18} />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] sm:text-[16px] font-bold truncate leading-snug" style={{ color: 'var(--p-text)' }}>
                  {title}
                </h2>
                <span
                  className="hidden md:inline-flex px-2 py-0.5 rounded-full text-[10.5px] font-semibold tracking-wide uppercase"
                  style={{
                    background: 'var(--p-accent-soft, rgba(23,107,69,0.15))',
                    color: 'var(--p-accent, #176b45)',
                    border: '1px solid var(--p-accent-line, rgba(23,107,69,0.3))',
                  }}
                >
                  PDF Document
                </span>
              </div>
              {subtitle && (
                <p className="text-[12px] truncate opacity-70 mt-0.5" style={{ color: 'var(--p-muted)' }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* Fullscreen / Window Toggle */}
            <button
              onClick={() => setIsFullscreen(prev => !prev)}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Expand to Full Window'}
              className="px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer hover:border-[var(--p-accent)]"
              style={{
                borderColor: 'var(--p-border, rgba(255,255,255,0.15))',
                background: 'var(--p-surface)',
                color: 'var(--p-text)',
              }}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 size={14} style={{ color: 'var(--p-accent)' }} />
                  <span className="hidden sm:inline">Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 size={14} style={{ color: 'var(--p-accent)' }} />
                  <span className="hidden sm:inline">Big Window</span>
                </>
              )}
            </button>

            {/* Print Button */}
            <Button
              size="sm"
              variant="secondary"
              icon={Printer}
              onClick={handlePrint}
              disabled={loading || !activeBlobUrl}
              title="Print document directly"
              className="hidden sm:inline-flex"
            >
              Print
            </Button>

            {/* Open in New Tab Button */}
            <Button
              size="sm"
              variant="secondary"
              icon={ExternalLink}
              onClick={handleOpenNewTab}
              disabled={loading || !activeBlobUrl}
              title="Open document in a dedicated browser tab"
              className="hidden sm:inline-flex"
            >
              New Tab
            </Button>

            {/* Download Button */}
            <Button
              size="sm"
              variant="primary"
              icon={Download}
              onClick={handleDownload}
              disabled={loading && !activeBlobUrl}
              title="Save PDF file to device"
            >
              Download
            </Button>

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close PDF Viewer"
              className="p-1.5 rounded-lg opacity-75 hover:opacity-100 hover:bg-white/10 transition-colors ml-1 cursor-pointer"
              title="Close (Esc)"
            >
              <X size={19} />
            </button>
          </div>
        </header>

        {/* PDF Viewer Body — Full Height Container */}
        <div
          className="relative flex-1 min-h-0 p-2 sm:p-4 overflow-hidden flex flex-col"
          style={{ background: 'var(--p-bg, #0b0c0e)' }}
        >
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
              <div
                className="w-10 h-10 border-3 rounded-full animate-spin"
                style={{
                  borderColor: 'var(--p-border, rgba(255,255,255,0.15))',
                  borderTopColor: 'var(--p-accent, #176b45)',
                }}
              />
              <p className="text-sm font-medium" style={{ color: 'var(--p-text)' }}>
                Preparing document...
              </p>
              <p className="text-xs" style={{ color: 'var(--p-muted)' }}>
                Formatting statement and invoice lines into PDF layout
              </p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
              <span className="p-3 rounded-2xl bg-red-500/10 text-red-400">
                <AlertTriangle size={32} />
              </span>
              <p className="text-sm font-semibold" style={{ color: 'var(--p-text)' }}>
                {error}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {effectiveEndpoint && (
                  <Button
                    size="sm"
                    variant="primary"
                    icon={RefreshCw}
                    onClick={() => {
                      setLoading(true);
                      setError(null);
                      fetchPdfBlobUrl(effectiveEndpoint)
                        .then(({ blobUrl: fetchedUrl }) => {
                          setInternalBlobUrl(fetchedUrl);
                          setLoading(false);
                        })
                        .catch(err => {
                          setError(err.message || 'Unable to load PDF document.');
                          setLoading(false);
                        });
                    }}
                  >
                    Retry Load
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={handleDownload}>
                  Download Directly
                </Button>
              </div>
            </div>
          ) : activeBlobUrl ? (
            <div className="w-full h-full flex-1 min-h-0 rounded-xl overflow-hidden shadow-inner border border-white/10 bg-slate-900 flex flex-col">
              <iframe
                ref={iframeRef}
                src={activeBlobUrl}
                title={title}
                className="w-full h-full flex-1 border-0 bg-white"
                style={{
                  minHeight: '100%',
                  height: '100%',
                  width: '100%',
                  display: 'block',
                }}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              No document available for preview.
            </div>
          )}

          {/* Quick Helper footer on Mobile / Small screens */}
          <div
            className="sm:hidden mt-2 pt-2 border-t flex items-center justify-between text-xs"
            style={{ borderColor: 'var(--p-border, rgba(255,255,255,0.1))', color: 'var(--p-muted)' }}
          >
            <span>Touch & pinch to zoom document</span>
            <button
              type="button"
              onClick={handleDownload}
              className="font-semibold underline cursor-pointer"
              style={{ color: 'var(--p-accent, #176b45)' }}
            >
              Download PDF
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
