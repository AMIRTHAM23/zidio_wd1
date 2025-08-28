import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileSpreadsheet, 
  Calendar, 
  Database, 
  BarChart3, 
  Trash2,
  Eye
} from 'lucide-react';
import { useDataStore } from '../store/dataStore';
import { formatBytes } from '../utils/formatBytes';
import { formatDate } from '../utils/formatDate';
import toast from 'react-hot-toast';

export default function FileList() {
  const { files, removeFile, setCurrentFile } = useDataStore();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const navigate = useNavigate();

  const handleViewAnalytics = (file) => {
    setCurrentFile(file);
    navigate(`/analytics/${file.id}`);
  };

  const handleDeleteFile = (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      removeFile(fileId);
      toast.success('File deleted successfully');
    }
  };

  const handleBulkDelete = () => {
    if (selectedFiles.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedFiles.length} file(s)?`)) {
      selectedFiles.forEach(fileId => removeFile(fileId));
      setSelectedFiles([]);
      toast.success(`${selectedFiles.length} file(s) deleted successfully`);
    }
  };

  const toggleFileSelection = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <FileSpreadsheet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-lg text-gray-500">No files uploaded yet</p>
        <p className="text-sm text-gray-400">Upload an Excel file to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedFiles.length > 0 && (
        <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
          <span className="text-sm text-blue-700">
            {selectedFiles.length} file(s) selected
          </span>
          <button
            onClick={handleBulkDelete}
            className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Selected</span>
          </button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {files.map((file) => (
          <div
            key={file.id}
            className={`bg-white rounded-lg shadow-md p-6 border-2 transition-all hover:shadow-lg ${
              selectedFiles.includes(file.id) 
                ? 'border-blue-300 bg-blue-50' 
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedFiles.includes(file.id)}
                  onChange={() => toggleFileSelection(file.id)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-medium text-gray-900 truncate max-w-xs" title={file.name}>
                    {file.name}
                  </h3>
                  <p className="text-sm text-gray-500">{formatBytes(file.size)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(file.uploadDate)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Database className="h-4 w-4" />
                <span>{file.rowCount} rows, {file.columns.length} columns</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleViewAnalytics(file)}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Analyze</span>
              </button>
              <button
                onClick={() => handleDeleteFile(file.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Delete file"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}