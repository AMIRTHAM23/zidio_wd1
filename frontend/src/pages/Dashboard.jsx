import { useState, useEffect } from 'react';
import { Upload, FileSpreadsheet, BarChart3, TrendingUp, Users, Activity } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { files } = useDataStore();
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalRows: 0,
    totalColumns: 0,
    lastUpload: null
  });

  useEffect(() => {
    const totalRows = files.reduce((sum, file) => sum + file.rowCount, 0);
    const totalColumns = files.reduce((sum, file) => sum + file.columns.length, 0);
    const lastUpload = files.length > 0 
      ? new Date(Math.max(...files.map(f => new Date(f.uploadDate))))
      : null;

    setStats({
      totalFiles: files.length,
      totalRows,
      totalColumns,
      lastUpload
    });
  }, [files]);

  const statCards = [
    {
      title: 'Total Files',
      value: stats.totalFiles,
      icon: FileSpreadsheet,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: 'Total Rows',
      value: stats.totalRows.toLocaleString(),
      icon: BarChart3,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      title: 'Total Columns',
      value: stats.totalColumns,
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      title: 'Last Upload',
      value: stats.lastUpload 
        ? stats.lastUpload.toLocaleDateString()
        : 'No uploads',
      icon: Activity,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name || user?.email}!
        </h1>
        <p className="text-gray-600 mt-2">
          Upload and analyze your Excel files with powerful visualization tools
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-lg p-6`}>
            <div className="flex items-center">
              <div className={`${stat.color} rounded-md p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-semibold ${stat.textColor}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center mb-4">
          <Upload className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Upload Excel Files</h2>
        </div>
        <FileUpload />
      </div>

      {/* Files List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <FileSpreadsheet className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Your Files</h2>
        </div>
        <FileList />
      </div>
    </div>
  );
}