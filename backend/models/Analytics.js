import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    required: [true, 'File ID is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  chartType: {
    type: String,
    required: [true, 'Chart type is required'],
    enum: ['bar', 'line', 'pie', 'doughnut', 'scatter', 'radar', 'polarArea']
  },
  chartConfig: {
    xAxis: {
      type: String,
      required: [true, 'X-axis is required']
    },
    yAxis: {
      type: String,
      required: [true, 'Y-axis is required']
    },
    title: {
      type: String,
      default: 'Analytics Chart'
    },
    colorScheme: {
      type: String,
      enum: ['default', 'ocean', 'sunset', 'forest', 'gradient'],
      default: 'default'
    }
  },
  chartData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  insights: {
    summary: String,
    keyFindings: [String],
    recommendations: [String],
    correlations: [{
      variables: [String],
      coefficient: Number,
      strength: String
    }],
    outliers: [{
      column: String,
      values: [mongoose.Schema.Types.Mixed],
      count: Number
    }],
    statistics: {
      mean: mongoose.Schema.Types.Mixed,
      median: mongoose.Schema.Types.Mixed,
      mode: mongoose.Schema.Types.Mixed,
      standardDeviation: mongoose.Schema.Types.Mixed,
      variance: mongoose.Schema.Types.Mixed
    }
  },
  exportCount: {
    png: { type: Number, default: 0 },
    pdf: { type: Number, default: 0 },
    csv: { type: Number, default: 0 },
    json: { type: Number, default: 0 }
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
analyticsSchema.index({ userId: 1, createdAt: -1 });
analyticsSchema.index({ fileId: 1 });
analyticsSchema.index({ chartType: 1 });
analyticsSchema.index({ isPublic: 1 });
analyticsSchema.index({ tags: 1 });

// Update the updatedAt field before saving
analyticsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to increment export count
analyticsSchema.methods.incrementExport = function(format) {
  if (this.exportCount[format] !== undefined) {
    this.exportCount[format] += 1;
    return this.save();
  }
  throw new Error(`Invalid export format: ${format}`);
};

// Static method to get analytics statistics
analyticsSchema.statics.getAnalyticsStats = async function(userId = null) {
  const match = userId ? { userId: mongoose.Types.ObjectId(userId) } : {};
  
  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalAnalytics: { $sum: 1 },
        chartTypeDistribution: {
          $push: '$chartType'
        },
        totalExports: {
          $sum: {
            $add: [
              '$exportCount.png',
              '$exportCount.pdf',
              '$exportCount.csv',
              '$exportCount.json'
            ]
          }
        }
      }
    },
    {
      $project: {
        totalAnalytics: 1,
        totalExports: 1,
        chartTypeDistribution: {
          $reduce: {
            input: '$chartTypeDistribution',
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $arrayToObject: [
                    [{
                      k: '$$this',
                      v: {
                        $add: [
                          { $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] },
                          1
                        ]
                      }
                    }]
                  ]
                }
              ]
            }
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalAnalytics: 0,
    totalExports: 0,
    chartTypeDistribution: {}
  };
};

// Static method to get popular chart configurations
analyticsSchema.statics.getPopularConfigurations = async function(limit = 10) {
  return await this.aggregate([
    {
      $group: {
        _id: {
          chartType: '$chartType',
          xAxis: '$chartConfig.xAxis',
          yAxis: '$chartConfig.yAxis'
        },
        count: { $sum: 1 },
        avgExports: {
          $avg: {
            $add: [
              '$exportCount.png',
              '$exportCount.pdf',
              '$exportCount.csv',
              '$exportCount.json'
            ]
          }
        }
      }
    },
    { $sort: { count: -1 } },
    { $limit: limit },
    {
      $project: {
        configuration: '$_id',
        usage: '$count',
        avgExports: { $round: ['$avgExports', 2] },
        _id: 0
      }
    }
  ]);
};

export default mongoose.model('Analytics', analyticsSchema);