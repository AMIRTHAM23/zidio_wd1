import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, FileSpreadsheet, Download, Brain } from 'lucide-react';
import { useDataStore } from '../store/dataStore';
import ChartGenerator from '../components/ChartGenerator';
import toast from 'react-hot-toast';

export default function Analytics() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const { files, currentFile, setCurrentFile } = useDataStore();
  const [activeTab, setActiveTab] = useState('chart');
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      setCurrentFile(file);
    } else {
      toast.error('File not found');
      navigate('/dashboard');
    }
  }, [fileId, files, setCurrentFile, navigate]);

  const generateAIInsights = async () => {
    if (!currentFile) return;
    
    setLoadingInsights(true);
    try {
      // Simulate AI analysis - Replace with actual AI API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const insights = {
        summary: `Analysis of ${currentFile.name} reveals ${currentFile.rowCount} data points across ${currentFile.columns.length} variables.`,
        keyFindings: [
          'Data distribution appears normal across most numerical columns',
          'No significant missing values detected',
          'Strong correlation found between key variables',
          'Outliers identified in 2-3% of records'
        ],
        recommendations: [
          'Consider data normalization for better visualization',
          'Remove outliers for more accurate analysis',
          'Focus on top 3 correlated variables for insights'
        ]
      };
      
      setAiInsights(insights);
      toast.success('AI insights generated successfully!');
    } catch (error) {
      toast.error('Failed to generate AI insights');
    } finally {
      setLoadingInsights(false);
    }
  };

  const exportData = (format) => {
    if (!currentFile) return;
    
    let content = '';
    let filename = `${currentFile.name.replace(/\.[^/.]+$/, '')}_export.${format}`;
    
    if (format === 'csv') {
      content = currentFile.data.map(row => row.join(',')).join('\n');
    } else if (format === 'json') {
      const jsonData = currentFile.data.slice(1).map(row => {
        const obj = {};
        currentFile.columns.forEach((col, index) => {
          obj[col] = row[index];
        });
        return obj;
      });
      content = JSON.stringify(jsonData, null, 2);
    }
    
    const blob = new Blob([content], { type: `text/${format}` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success(`Data exported as ${format.toUpperCase()}`);
  };

  if (!currentFile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <FileSpreadsheet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg text-gray-500">Loading file...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{currentFile.name}</h1>
            <p className="text-gray-600">
              {currentFile.rowCount} rows • {currentFile.columns.length} columns
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportData('csv')}
            className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => exportData('json')}
            className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('chart')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'chart'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Chart Visualization
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'data'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Data Preview
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'insights'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            AI Insights
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'chart' && (
        <ChartGenerator file={currentFile} />
      )}

      {activeTab === 'data' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Data Preview</h3>
            <div className="flex items-center text-sm text-gray-500">
              <Database className="h-4 w-4 mr-1" />
              Showing first 100 rows
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {currentFile.columns.map((column, index) => (
                    <th
                      key={index}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentFile.data.slice(1, 101).map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
            <button
              onClick={generateAIInsights}
              disabled={loadingInsights}
              className="flex items-center space-x-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              <Brain className="h-4 w-4" />
              <span>{loadingInsights ? 'Analyzing...' : 'Generate Insights'}</span>
            </button>
          </div>

          {aiInsights ? (
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Summary</h4>
                <p className="text-gray-700">{aiInsights.summary}</p>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Key Findings</h4>
                <ul className="list-disc list-inside space-y-1">
                  {aiInsights.keyFindings.map((finding, index) => (
                    <li key={index} className="text-gray-700">{finding}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Recommendations</h4>
                <ul className="list-disc list-inside space-y-1">
                  {aiInsights.recommendations.map((rec, index) => (
                    <li key={index} className="text-gray-700">{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-500">Generate AI insights to see analysis</p>
              <p className="text-sm text-gray-400">Click the button above to analyze your data</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}