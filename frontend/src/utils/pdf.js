import API from './api';
import toast from 'react-hot-toast';

/**
 * Downloads a PDF file from an authenticated backend endpoint.
 * Directly streams the blob and triggers browser download with the given or server-provided filename.
 */
export async function downloadPdf({ endpoint, defaultFilename = 'document.pdf', toastMessage = 'PDF downloaded.' }) {
  const toastId = toast.loading('Preparing PDF...');
  try {
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${API.defaults.baseURL}${endpoint}${separator}download=1`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      throw new Error(json.message || `Server responded with status ${response.status}`);
    }

    // Extract filename from Content-Disposition header if available
    let filename = defaultFilename;
    const disposition = response.headers.get('content-disposition');
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^";]+)"?/i);
      if (match && match[1]) filename = match[1].trim();
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    toast.success(toastMessage, { id: toastId });
    return true;
  } catch (err) {
    toast.error(err.message || 'Could not download PDF.', { id: toastId });
    return false;
  }
}

/**
 * Fetches PDF as a Blob Object URL for in-dashboard modal preview.
 */
export async function fetchPdfBlobUrl(endpoint) {
  const url = `${API.defaults.baseURL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    const json = await response.json().catch(() => ({}));
    throw new Error(json.message || `Server responded with status ${response.status}`);
  }

  let filename = 'document.pdf';
  const disposition = response.headers.get('content-disposition');
  if (disposition && disposition.includes('filename=')) {
    const match = disposition.match(/filename="?([^";]+)"?/i);
    if (match && match[1]) filename = match[1].trim();
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);

  return { blobUrl, filename, blob };
}
