import { create } from 'zustand';

export const useDataStore = create((set, get) => ({
  files: [],
  currentFile: null,
  chartData: null,
  chartConfig: {
    type: 'bar',
    xAxis: '',
    yAxis: '',
    title: 'Analytics Chart'
  },
  
  setFiles: (files) => set({ files }),
  
  addFile: (file) => set(state => ({
    files: [...state.files, file]
  })),
  
  setCurrentFile: (file) => set({ currentFile: file }),
  
  setChartData: (data) => set({ chartData: data }),
  
  updateChartConfig: (config) => set(state => ({
    chartConfig: { ...state.chartConfig, ...config }
  })),
  
  removeFile: (fileId) => set(state => ({
    files: state.files.filter(file => file.id !== fileId)
  })),
}));