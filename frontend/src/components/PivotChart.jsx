import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Tooltip, Legend
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend);

export default function PivotChart({ payload, chartType='bar' }){
  if(!payload) return null;
  const { data, groupKey } = payload;
  const labels = data.map(d => String(d[groupKey]));
  const values = data.map(d => Number(d.value ?? 0));
  const dataset = {
    labels,
    datasets: [{ label: 'Value', data: values }]
  };
  return (
    <div className="p-4 rounded-2xl border shadow-sm bg-white">
      <h3 className="font-semibold text-lg mb-3">Pivot Chart</h3>
      {chartType === 'bar' && <Bar data={dataset} />}
      {chartType === 'line' && <Line data={dataset} />}
      {chartType === 'pie' && <Pie data={dataset} />}
    </div>
  );
}
