import { useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import UploadArea from '../components/UploadArea';
import SummaryTable from '../components/SummaryTable';
import PivotChart from '../components/PivotChart';

export default function ExcelAnalysis(){
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [sheet, setSheet] = useState('');
  const [summary, setSummary] = useState(null);
  const [pivot, setPivot] = useState(null);
  const [groupKey, setGroupKey] = useState('');
  const [aggKey, setAggKey] = useState('');
  const [op, setOp] = useState('sum');
  const [chartType, setChartType] = useState('bar');

  // Optional: get a list of uploaded files from a backend route (fallback: manual input)
  const fetchFiles = async () => {
    try{
      const res = await api.get('/files'); // expects array like [{name:'file.xlsx'}]
      const names = (res.data || []).map(f => f.name || f);
      setFiles(names);
      if (names.length && !selectedFile) setSelectedFile(names[0]);
    }catch(e){
      // silently ignore if /files not available
    }
  };
  useEffect(()=>{ fetchFiles(); }, []);

  const loadSummary = async () => {
    if(!selectedFile) return;
    const res = await api.get('/api/analysis/summary', { params: { file: selectedFile, sheet: sheet || undefined } });
    setSummary(res.data);
    // Preselect columns for pivot
    const cols = res.data?.columns || [];
    if(cols.length){
      setGroupKey(cols[0]);
      setAggKey(cols.find(c => res.data?.types?.[c] === 'number') || cols[0]);
    }
  };

  const loadPivot = async () => {
    if(!selectedFile || !groupKey || !aggKey) return;
    const res = await api.get('/api/analysis/pivot', { params: { file: selectedFile, sheet: sheet || undefined, groupKey, aggKey, op } });
    setPivot(res.data);
  };

  useEffect(()=>{ if(selectedFile) loadSummary(); }, [selectedFile, sheet]);
  useEffect(()=>{ if(selectedFile && groupKey && aggKey) loadPivot(); }, [selectedFile, sheet, groupKey, aggKey, op]);

  const downloadExport = async () => {
    if(!summary) return;
    const res = await api.post('/api/analysis/export', { file: selectedFile, sheet: summary.sheetName, rows: [] });
    const url = (res.data?.download || '').startsWith('http') ? res.data.download : (api.defaults.baseURL.replace(/\/$/, '') + (res.data?.download || ''));
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Excel Analysis</h1>

      <UploadArea onUploaded={()=>fetchFiles()} />

      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border shadow-sm bg-white space-y-3">
          <h3 className="font-semibold">Controls</h3>
          <label className="block text-sm">File</label>
          <select className="w-full border rounded-xl p-2" value={selectedFile} onChange={e=>setSelectedFile(e.target.value)}>
            <option value="">Select file</option>
            {files.map(f => <option key={f} value={f}>{f}</option>)}
          </select>

          <label className="block text-sm mt-3">Sheet (optional)</label>
          <input className="w-full border rounded-xl p-2" placeholder="e.g., Sheet1" value={sheet} onChange={e=>setSheet(e.target.value)} />

          <button onClick={loadSummary} className="mt-3 w-full px-3 py-2 rounded-2xl bg-black text-white">Refresh Summary</button>

          <hr className="my-3"/>
          <h4 className="font-semibold">Pivot</h4>
          <label className="block text-sm">Group by</label>
          <input className="w-full border rounded-xl p-2" value={groupKey} onChange={e=>setGroupKey(e.target.value)} />
          <label className="block text-sm mt-2">Aggregate column</label>
          <input className="w-full border rounded-xl p-2" value={aggKey} onChange={e=>setAggKey(e.target.value)} />
          <label className="block text-sm mt-2">Operation</label>
          <select className="w-full border rounded-xl p-2" value={op} onChange={e=>setOp(e.target.value)}>
            <option>sum</option><option>mean</option><option>min</option><option>max</option><option>count</option>
          </select>
          <label className="block text-sm mt-2">Chart</label>
          <select className="w-full border rounded-xl p-2" value={chartType} onChange={e=>setChartType(e.target.value)}>
            <option value="bar">Bar</option>
            <option value="line">Line</option>
            <option value="pie">Pie</option>
          </select>
          <button onClick={loadPivot} className="mt-3 w-full px-3 py-2 rounded-2xl bg-gray-900 text-white">Refresh Pivot</button>
          <button onClick={downloadExport} className="mt-2 w-full px-3 py-2 rounded-2xl bg-gray-100">Export Empty Sheet</button>
        </div>

        <div className="md:col-span-2 space-y-4">
          <SummaryTable data={summary} />
          <PivotChart payload={pivot} chartType={chartType} />
        </div>
      </div>
    </div>
  );
}
