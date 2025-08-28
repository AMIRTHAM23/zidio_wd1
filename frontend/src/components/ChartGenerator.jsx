import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut, Scatter, Radar, PolarArea } from 'react-chartjs-2';
import { Download, Settings } from 'lucide-react';
import { useDataStore } from '../store/dataStore';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale
);

const chartTypes = [
  { type: 'bar', label: 'Bar Chart', component: Bar },
  { type: 'line', label: 'Line Chart', component: Line },
  { type: 'pie', label: 'Pie Chart', component: Pie },
  { type: 'doughnut', label: 'Doughnut Chart', component: Doughnut },
  { type: 'scatter', label: 'Scatter Plot', component: Scatter },
  { type: 'radar', label: 'Radar Chart', component: Radar },
  { type: 'polarArea', label: 'Polar Area', component: PolarArea },
];

const colorSchemes = {
  default: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'],
  ocean: ['#0EA5E9', '#06B6D4', '#14B8A6', '#10B981', '#84CC16', '#EAB308'],
  sunset: ['#F97316', '#EF4444', '#EC4899', '#8B5CF6', '#6366F1', '#3B82F6'],
  forest: ['#10B981', '#059669', '#047857', '#065F46', '#064E3B', '#022C22'],
  gradient: ['#8B5CF6', '#A855F7', '#C084FC', '#DDD6FE', '#EDE9FE', '#F3F4F6'],
};

export default function ChartGenerator({ file }) {
  const { chartConfig, updateChartConfig } = useDataStore();
  const [showSettings, setShowSettings] = useState(false);
  const [colorScheme, setColorScheme] = useState('default');
  const [numericalColumns, setNumericalColumns] = useState([]);
  const allColumns = file?.columns || [];

  // Auto-detect numeric columns and reset chartConfig when a new file is loaded
  useEffect(() => {
  if (!file || !file.columns || !file.data) return;

  // Detect numeric columns
  const detectedNumericalColumns = file.columns.filter((col, index) => {
    if (file.data.length < 2) return false;
    const sampleValues = file.data.slice(1, 6).map(row => {
      const val = row[index];
      return val !== '' && !isNaN(parseFloat(val));
    });
    return sampleValues.some(Boolean);
  });

  setNumericalColumns(detectedNumericalColumns);

  if (!detectedNumericalColumns.length) {
    // No numeric column found
    toast.error('No numeric columns detected in this file');
    updateChartConfig({ xAxis: '', yAxis: '', type: 'bar', title: file.name || 'Chart' });
    return;
  }

  // Set default axes using detected numeric column
  const defaultX = file.columns[0] || '';
  const defaultY = detectedNumericalColumns[0] || '';

  updateChartConfig({
    xAxis: defaultX,
    yAxis: defaultY,
    type: 'bar',
    title: file.name || 'Chart',
  });
}, [file, updateChartConfig]);


  const generateChartData = () => {
    if (!chartConfig.xAxis || !chartConfig.yAxis || !file?.data?.length) return null;

    const xIndex = file.columns.indexOf(chartConfig.xAxis);
    const yIndex = file.columns.indexOf(chartConfig.yAxis);
    if (xIndex === -1 || yIndex === -1) return null;

    const dataRows = file.data.slice(1);
    const labels = dataRows.map(row => row[xIndex]).filter(Boolean);
    const values = dataRows
      .map(row => {
        const val = parseFloat(row[yIndex]);
        return isNaN(val) ? null : val;
      })
      .filter(val => val !== null);

    const colors = colorSchemes[colorScheme];

    return {
      labels,
      datasets: [
        {
          label: chartConfig.yAxis,
          data: values,
          backgroundColor:
            chartConfig.type === 'line'
              ? colors[0] + '20'
              : labels.map((_, i) => colors[i % colors.length] + '80'),
          borderColor:
            chartConfig.type === 'line'
              ? colors[0]
              : labels.map((_, i) => colors[i % colors.length]),
          borderWidth: 2,
          fill: chartConfig.type === 'line' ? false : true,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: chartConfig.title,
        font: { size: 16, weight: 'bold' },
      },
    },
    scales:
      chartConfig.type === 'pie' ||
      chartConfig.type === 'doughnut' ||
      chartConfig.type === 'radar' ||
      chartConfig.type === 'polarArea'
        ? {}
        : {
            x: { title: { display: true, text: chartConfig.xAxis } },
            y: { title: { display: true, text: chartConfig.yAxis } },
          },
  };

  const downloadChart = format => {
    const chartElement = document.querySelector('canvas');
    if (!chartElement) return toast.error('No chart to download');

    const link = document.createElement('a');
    link.download = `${chartConfig.title.replace(/\s+/g, '_')}.${format}`;

    if (format === 'png') {
      link.href = chartElement.toDataURL('image/png');
      link.click();
      toast.success(`Chart downloaded as ${format.toUpperCase()}`);
    } else if (format === 'pdf') {
      const imgData = chartElement.toDataURL('image/png');
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head><title>${chartConfig.title}</title></head>
          <body style="margin:0; display:flex; justify-content:center; align-items:center; height:100vh;">
            <img src="${imgData}" style="max-width:100%; max-height:100%;" />
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const chartData = generateChartData();
  const ChartComponent = chartTypes.find(ct => ct.type === chartConfig.type)?.component || Bar;

  if (!chartData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg text-gray-500">Configure chart settings to generate visualization</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Chart Visualization</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            title="Chart Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
          <button
            onClick={() => downloadChart('png')}
            className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>PNG</span>
          </button>
          <button
            onClick={() => downloadChart('pdf')}
            className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chart Type</label>
              <select
                value={chartConfig.type}
                onChange={e => updateChartConfig({ type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {chartTypes.map(chart => (
                  <option key={chart.type} value={chart.type}>
                    {chart.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">X-Axis</label>
              <select
                value={chartConfig.xAxis}
                onChange={e => updateChartConfig({ xAxis: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {allColumns.map(col => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Y-Axis</label>
              <select
                value={chartConfig.yAxis}
                onChange={e => updateChartConfig({ yAxis: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {numericalColumns.map(col => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color Scheme</label>
              <select
                value={colorScheme}
                onChange={e => setColorScheme(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(colorSchemes).map(scheme => (
                  <option key={scheme} value={scheme}>
                    {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chart Title</label>
            <input
              type="text"
              value={chartConfig.title}
              onChange={e => updateChartConfig({ title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter chart title"
            />
          </div>
        </div>
      )}

      <div className="h-96">
        <ChartComponent data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
