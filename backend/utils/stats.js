function isFiniteNumber(x){ return typeof x === 'number' && Number.isFinite(x); }

function summarizeColumn(rows, key){
  const values = rows.map(r => {
    const v = r?.[key];
    const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : v;
    return isFiniteNumber(n) ? n : null;
  }).filter(v => v !== null);
  const count = values.length;
  if (count === 0) return { count: 0 };
  const sum = values.reduce((a,b)=>a+b,0);
  const mean = sum / count;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const variance = values.reduce((a,b)=>a + Math.pow(b-mean,2),0) / count;
  const std = Math.sqrt(variance);
  return { count, mean, min, max, std, sum };
}

function autoInferTypes(rows){
  const keys = Object.keys(rows[0] || {});
  const types = {};
  keys.forEach(k => {
    let num = 0, total = 0;
    for(const r of rows){
      const v = r?.[k];
      if (v === null || v === undefined || v === '') continue;
      total++;
      const n = typeof v === 'string' ? Number(v) : v;
      if (Number.isFinite(n)) num++;
    }
    types[k] = (num/Math.max(1,total) >= 0.8) ? 'number' : 'string';
  });
  return types;
}

function groupByAggregate(rows, groupKey, aggKey, op='sum'){
  const groups = new Map();
  for (const r of rows) {
    const g = r?.[groupKey];
    const vRaw = r?.[aggKey];
    const v = typeof vRaw === 'string' ? Number(vRaw) : vRaw;
    const n = Number.isFinite(v) ? v : 0;
    if(!groups.has(g)) groups.set(g, []);
    groups.get(g).push(n);
  }
  const result = [];
  for(const [g, arr] of groups){
    if (arr.length === 0) { result.push({ [groupKey]: g, value: null }); continue; }
    let value = null;
    if (op === 'sum') value = arr.reduce((a,b)=>a+b,0);
    else if (op === 'mean') value = arr.reduce((a,b)=>a+b,0)/arr.length;
    else if (op === 'min') value = Math.min(...arr);
    else if (op === 'max') value = Math.max(...arr);
    else if (op === 'count') value = arr.length;
    result.push({ [groupKey]: g, value });
  }
  return result;
}

module.exports = { summarizeColumn, autoInferTypes, groupByAggregate };
