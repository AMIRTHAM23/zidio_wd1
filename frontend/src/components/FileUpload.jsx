import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { useDataStore } from '../store/dataStore';

export default function FileUpload() {
  const [uploading, setUploading] = useState(false);
  const { addFile } = useDataStore();

  const processExcelFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          resolve({
            id: Date.now().toString(),
            name: file.name,
            size: file.size,
            uploadDate: new Date().toISOString(),
            sheetName,
            data: jsonData,
            columns: jsonData[0] || [],
            rowCount: jsonData.length - 1
          });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);

    try {
      for (const file of acceptedFiles) {
        const processedFile = await processExcelFile(file);
        addFile(processedFile);
        toast.success(`${file.name} uploaded successfully!`);
      }
    } catch (error) {
      toast.error('Error processing file: ' + error.message);
    } finally {
      setUploading(false);
    }
  }, [addFile]);

  // ✅ FIX: use fileRejections instead of rejectedFiles
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            <p className="text-lg font-medium text-gray-700">Processing files...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <Upload className="h-12 w-12 text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-700">
                {isDragActive ? 'Drop the files here...' : 'Drag & drop Excel files here'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                or click to select files (.xlsx, .xls - max 10MB each)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ✅ FIX: fileRejections used instead of rejectedFiles */}
      {fileRejections.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-sm font-medium text-red-800 mb-2">Rejected Files:</h4>
          {fileRejections.map(({ file, errors }) => (
            <div key={file.path} className="text-sm text-red-700">
              {file.path} - {errors.map(e => e.message).join(', ')}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
