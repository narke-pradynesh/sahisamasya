import mongoose from 'mongoose';

const upvoteSchema = new mongoose.Schema({
  complaint_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: [true, 'Complaint ID is required']
  },
  user_email: {
    type: String,
    required: [true, 'User email is required'],
    lowercase: true,
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

// Compound index to ensure one upvote per user per complaint
upvoteSchema.index({ complaint_id: 1, user_email: 1 }, { unique: true });

// Index for user email queries
upvoteSchema.index({ user_email: 1 });

// Index for complaint queries
upvoteSchema.index({ complaint_id: 1 });

const Upvote = mongoose.model('Upvote', upvoteSchema);

export default Upvote;
