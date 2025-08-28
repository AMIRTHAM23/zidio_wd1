# Excel Analysis API (Add-on)

This adds analysis endpoints to your existing Node/Express backend.

## Endpoints

### 1) Summary
`GET /api/analysis/summary?file=<filename>&sheet=<optional>`

**Response:**
```json
{
  "sheetName": "Sheet1",
  "columns": ["A","B","C"],
  "types": {"A":"number","B":"string","C":"number"},
  "summary": { "A": {"count": 100, "mean": 42.1, "min": 3, "max": 88, "std": 11.2, "sum": 4210 } },
  "rowCount": 1000
}
```

### 2) Pivot/Aggregation
`GET /api/analysis/pivot?file=<filename>&sheet=<optional>&groupKey=Region&aggKey=Sales&op=sum`

**Response:**
```json
{
  "sheetName": "Sheet1",
  "groupKey": "Region",
  "aggKey": "Sales",
  "op": "sum",
  "data": [
    {"Region":"East","value":12345},
    {"Region":"West","value":9876}
  ]
}
```

### 3) Export as Excel
`POST /api/analysis/export`

**Body:**
```json
{
  "file": "uploaded.xlsx",
  "sheet": "Filtered",
  "rows": [{"A":1,"B":"x"}, {"A":2,"B":"y"}]
}
```

**Response:**
```json
{ "download": "/uploads/export_1730000000000.xlsx" }
```

## Notes
- Files are expected under `uploads/` with their original filename (e.g., from your existing upload route).
- Requires dependency: `xlsx` (added to `package.json` if missing).
- Stats are computed server-side with zero external services.
