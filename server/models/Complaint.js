import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  photo_url: {
    type: String,
    required: [true, 'Photo is required'],
    trim: true
  },
  latitude: {
    type: Number,
    required: false,
    default: null,
    min: [-90, 'Latitude must be between -90 and 90'],
    max: [90, 'Latitude must be between -90 and 90']
  },
  longitude: {
    type: Number,
    required: false,
    default: null,
    min: [-180, 'Longitude must be between -180 and 180'],
    max: [180, 'Longitude must be between -180 and 180']
  },
  address: {
    type: String,
    required: false,
    default: '',
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'road_maintenance',
      'streetlights',
      'waste_management',
      'water_supply',
      'drainage',
      'parks',
      'traffic',
      'noise_pollution',
      'other'
    ],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['pending', 'escalated', 'in_progress', 'completed', 'rejected'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  upvote_count: {
    type: Number,
    default: 0,
    min: [0, 'Upvote count cannot be negative']
  },
  escalation_threshold: {
    type: Number,
    default: 5,
    min: [1, 'Escalation threshold must be at least 1']
  },
  assigned_to: {
    type: String,
    trim: true
  },
  resolution_notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Resolution notes cannot exceed 1000 characters']
  },
  estimated_completion: {
    type: Date
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for better query performance
complaintSchema.index({ created_at: -1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ created_by: 1 });
complaintSchema.index({ latitude: 1, longitude: 1 });

// Virtual for checking if complaint is escalated
complaintSchema.virtual('is_escalated').get(function() {
  return this.upvote_count >= this.escalation_threshold;
});

// Method to update status based on upvotes
complaintSchema.methods.updateStatusFromUpvotes = function() {
  if (this.upvote_count >= this.escalation_threshold && this.status === 'pending') {
    this.status = 'escalated';
  }
  return this.save();
};

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;
