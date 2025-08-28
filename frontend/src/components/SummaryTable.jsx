export default function SummaryTable({ data }){
  if(!data) return null;
  const { sheetName, columns, types, summary, rowCount } = data;
  const numericCols = Object.keys(summary || {});
  return (
    <div className="p-4 rounded-2xl border shadow-sm bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg">Summary — {sheetName}</h3>
        <span className="text-sm text-gray-600">Rows: {rowCount}</span>
      </div>
      {numericCols.length === 0 ? (
        <p className="text-gray-600">No numeric columns detected.</p>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Column</th>
                <th className="py-2 pr-4">Count</th>
                <th className="py-2 pr-4">Mean</th>
                <th className="py-2 pr-4">Min</th>
                <th className="py-2 pr-4">Max</th>
                <th className="py-2 pr-4">Std</th>
                <th className="py-2 pr-4">Sum</th>
              </tr>
            </thead>
            <tbody>
              {numericCols.map(col => {
                const s = summary[col] || {};
                return (
                  <tr key={col} className="border-b">
                    <td className="py-2 pr-4 font-medium">{col}</td>
                    <td className="py-2 pr-4">{s.count ?? '-'}</td>
                    <td className="py-2 pr-4">{s.mean?.toFixed?.(3) ?? '-'}</td>
                    <td className="py-2 pr-4">{s.min ?? '-'}</td>
                    <td className="py-2 pr-4">{s.max ?? '-'}</td>
                    <td className="py-2 pr-4">{s.std?.toFixed?.(3) ?? '-'}</td>
                    <td className="py-2 pr-4">{s.sum ?? '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
