import { useState } from 'react';
import api from '../lib/api';

export default function UploadArea({ onUploaded, endpoint="/upload" }){
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();
    if(!file) return setError("Please choose a file");
    setLoading(true); setError(""); setSuccess("");
    try{
      const form = new FormData();
      form.append('file', file);
      const res = await api.post(endpoint, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const payload = res.data;
      setSuccess("Uploaded successfully");
      onUploaded?.(payload);
    }catch(err){
      setError(err?.response?.data?.message || err.message || "Upload failed");
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-2xl border shadow-sm bg-white">
      <h3 className="font-semibold text-lg mb-2">Upload Excel/CSV</h3>
      <form onSubmit={handleUpload} className="flex items-center gap-3">
        <input type="file" accept=".xlsx,.xls,.csv" onChange={e=>setFile(e.target.files?.[0] || null)} className="file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"/>
        <button disabled={loading} className="px-4 py-2 rounded-2xl bg-black text-white disabled:opacity-50">{loading ? "Uploading..." : "Upload"}</button>
      </form>
      {error && <p className="text-red-600 mt-2">{error}</p>}
      {success && <p className="text-green-600 mt-2">{success}</p>}
    </div>
  );
}
