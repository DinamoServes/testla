import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function ServerFilesPage() {
  const router = useRouter();
  const { id } = router.query;
  const [dir, setDir] = useState('/data');
  const [listing, setListing] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mkdirName, setMkdirName] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) fetchListing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, dir]);

  async function fetchListing() {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/files/${id}/list`, { params: { dir } });
      setListing(res.data.data.output);
    } catch (e) {
      setError('Failed to list files.');
    }
    setLoading(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    formData.append('dest', dir);
    try {
      await axios.post(`/api/files/${id}/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      fetchListing();
    } catch {
      setError('Upload failed.');
    }
    setUploading(false);
    if (fileInput.current) fileInput.current.value = '';
  }

  async function handleDownload(file: string) {
    window.open(`/api/files/${id}/download?file=${encodeURIComponent(file)}`);
  }

  async function handleDelete(file: string) {
    if (!confirm('Delete this file/folder?')) return;
    try {
      await axios.delete(`/api/files/${id}/delete`, { data: { file } });
      fetchListing();
    } catch {
      setError('Delete failed.');
    }
  }

  async function handleMkdir() {
    if (!mkdirName) return;
    try {
      await axios.post(`/api/files/${id}/mkdir`, { dir: dir + '/' + mkdirName });
      setMkdirName('');
      fetchListing();
    } catch {
      setError('Create folder failed.');
    }
  }

  function parseListing(listing: string) {
    return listing.split('\n').filter(Boolean).map(line => {
      const parts = line.split(/\s+/);
      const name = parts.slice(8).join(' ');
      const isDir = line.startsWith('d');
      return { name, isDir };
    });
  }

  function goToSubdir(sub: string) {
    setDir(dir === '/' ? '/' + sub : dir + '/' + sub);
  }

  function goUp() {
    if (dir === '/' || dir === '/data') return;
    setDir(dir.replace(/\/[^\/]+$/, ''));
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">File Manager</h1>
      <div className="mb-2 flex gap-2 items-center">
        <button className="px-2 py-1 bg-gray-200 rounded" onClick={goUp}>Up</button>
        <span className="font-mono text-xs">{dir}</span>
      </div>
      {error && <div className="mb-2 text-red-600">{error}</div>}
      <div className="mb-4 flex gap-2 items-center">
        <input type="file" ref={fileInput} onChange={handleUpload} disabled={uploading} />
        <input type="text" placeholder="New folder name" value={mkdirName} onChange={e => setMkdirName(e.target.value)} className="border rounded px-2 py-1" />
        <button className="bg-blue-600 text-white px-2 py-1 rounded" onClick={handleMkdir}>Create Folder</button>
      </div>
      <div className="bg-white border rounded p-2 text-xs">
        {loading ? 'Loading...' : (
          <table className="w-full">
            <tbody>
              {parseListing(listing).map(f => (
                <tr key={f.name}>
                  <td>
                    {f.isDir ? (
                      <button className="text-blue-600 hover:underline" onClick={() => goToSubdir(f.name)}>[DIR] {f.name}</button>
                    ) : (
                      f.name
                    )}
                  </td>
                  <td className="text-right">
                    {!f.isDir && <button className="text-green-600 mr-2" onClick={() => handleDownload(dir + '/' + f.name)}>Download</button>}
                    <button className="text-red-600" onClick={() => handleDelete(dir + '/' + f.name)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 