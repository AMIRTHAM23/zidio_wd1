import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  originalName: {
    type: String,
    required: [true, 'Original file name is required']
  },
  size: {
    type: Number,
    required: [true, 'File size is required']
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required'],
    enum: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ]
  },
  path: {
    type: String,
    required: [true, 'File path is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  sheetName: {
    type: String,
    default: 'Sheet1'
  },
  columns: [{
    type: String
  }],
  rowCount: {
    type: Number,
    required: [true, 'Row count is required'],
    min: 0
  },
  columnCount: {
    type: Number,
    required: [true, 'Column count is required'],
    min: 0
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  metadata: {
    fileType: String,
    encoding: String,
    lastModified: Date,
    worksheets: [String]
  },
  analysisHistory: [{
    chartType: String,
    xAxis: String,
    yAxis: String,
    title: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  downloadCount: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
fileSchema.index({ userId: 1, createdAt: -1 });
fileSchema.index({ name: 'text', originalName: 'text' });
fileSchema.index({ mimeType: 1 });
fileSchema.index({ isPublic: 1 });
fileSchema.index({ tags: 1 });

// Update the updatedAt field before saving
fileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for file URL
fileSchema.virtual('url').get(function() {
  return `/uploads/${this.path}`;
});

// Method to add analysis to history
fileSchema.methods.addAnalysis = function(analysisData) {
  this.analysisHistory.push(analysisData);
  if (this.analysisHistory.length > 50) {
    this.analysisHistory = this.analysisHistory.slice(-50); // Keep only last 50 analyses
  }
  return this.save();
};

// Method to increment download count
fileSchema.methods.incrementDownload = function() {
  this.downloadCount += 1;
  return this.save();
};

// Static method to get user file statistics
fileSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalFiles: { $sum: 1 },
        totalRows: { $sum: '$rowCount' },
        totalSize: { $sum: '$size' },
        avgRowsPerFile: { $avg: '$rowCount' },
        totalDownloads: { $sum: '$downloadCount' }
      }
    }
  ]);
  
  return stats[0] || {
    totalFiles: 0,
    totalRows: 0,
    totalSize: 0,
    avgRowsPerFile: 0,
    totalDownloads: 0
  };
};

// Static method to get file types distribution
fileSchema.statics.getFileTypesDistribution = async function(userId = null) {
  const match = userId ? { userId: mongoose.Types.ObjectId(userId) } : {};
  
  return await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$mimeType',
        count: { $sum: 1 },
        totalSize: { $sum: '$size' }
      }
    },
    {
      $project: {
        type: {
          $switch: {
            branches: [
              { case: { $eq: ['$_id', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] }, then: 'xlsx' },
              { case: { $eq: ['$_id', 'application/vnd.ms-excel'] }, then: 'xls' }
            ],
            default: 'unknown'
          }
        },
        count: 1,
        totalSize: 1
      }
    }
  ]);
};

export default mongoose.model('File', fileSchema);