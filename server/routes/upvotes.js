import express from 'express';
import Upvote from '../models/Upvote.js';
import Complaint from '../models/Complaint.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all upvotes
router.get('/', async (req, res) => {
  try {
    const upvotes = await Upvote.find()
      .populate('complaint_id', 'title status')
      .sort({ created_at: -1 });

    res.json({
      success: true,
      data: upvotes
    });
  } catch (error) {
    console.error('Get upvotes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upvotes'
    });
  }
});

// Get upvotes for a specific complaint
router.get('/complaint/:complaintId', async (req, res) => {
  try {
    const upvotes = await Upvote.find({ complaint_id: req.params.complaintId })
      .sort({ created_at: -1 });

    res.json({
      success: true,
      data: upvotes
    });
  } catch (error) {
    console.error('Get complaint upvotes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upvotes'
    });
  }
});

// Create upvote
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('Upvote request body:', req.body);
    console.log('Authenticated user:', req.user);
    
    const { complaint_id } = req.body;
    const user_email = req.user.email;

    // Check if complaint exists
    const complaint = await Complaint.findById(complaint_id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if user already upvoted
    const existingUpvote = await Upvote.findOne({
      complaint_id,
      user_email
    });

    if (existingUpvote) {
      return res.status(400).json({
        success: false,
        message: 'You have already upvoted this complaint'
      });
    }

    // Create upvote
    const upvote = new Upvote({
      complaint_id,
      user_email
    });

    await upvote.save();

    // Update complaint upvote count
    complaint.upvote_count += 1;
    
    // Check if complaint should be escalated
    if (complaint.upvote_count >= complaint.escalation_threshold && complaint.status === 'pending') {
      complaint.status = 'escalated';
    }

    await complaint.save();

    res.status(201).json({
      success: true,
      message: 'Upvote added successfully',
      data: upvote
    });
  } catch (error) {
    console.error('Create upvote error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already upvoted this complaint'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create upvote'
    });
  }
});

// Remove upvote
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    console.log('Delete upvote request:', { id: req.params.id, user: req.user?.email });
    
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid upvote ID format'
      });
    }

    const upvote = await Upvote.findById(req.params.id);

    if (!upvote) {
      console.log('Upvote not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Upvote not found'
      });
    }

    console.log('Found upvote:', { 
      id: upvote._id, 
      user_email: upvote.user_email, 
      complaint_id: upvote.complaint_id,
      requesting_user: req.user.email 
    });

    // Check if user owns this upvote
    if (upvote.user_email !== req.user.email) {
      console.log('User does not own upvote:', { 
        upvote_user: upvote.user_email, 
        requesting_user: req.user.email 
      });
      return res.status(403).json({
        success: false,
        message: 'You can only remove your own upvotes'
      });
    }

    // Get complaint to update upvote count
    const complaint = await Complaint.findById(upvote.complaint_id);
    if (complaint) {
      console.log('Updating complaint upvote count:', { 
        complaint_id: complaint._id, 
        current_count: complaint.upvote_count,
        current_status: complaint.status 
      });
      
      complaint.upvote_count = Math.max(0, complaint.upvote_count - 1);
      
      // If upvote count is below threshold and status is escalated, revert to pending
      if (complaint.upvote_count < complaint.escalation_threshold && complaint.status === 'escalated') {
        complaint.status = 'pending';
        console.log('Reverting complaint status to pending');
      }
      
      await complaint.save();
      console.log('Complaint updated:', { 
        new_count: complaint.upvote_count, 
        new_status: complaint.status 
      });
    } else {
      console.log('Complaint not found for upvote:', upvote.complaint_id);
    }

    // Delete upvote
    const deleteResult = await Upvote.findByIdAndDelete(req.params.id);
    console.log('Upvote deleted:', deleteResult ? 'success' : 'failed');

    res.json({
      success: true,
      message: 'Upvote removed successfully'
    });
  } catch (error) {
    console.error('Delete upvote error:', error);
    console.error('Error stack:', error.stack);
    console.error('Request details:', {
      id: req.params.id,
      user: req.user?.email,
      headers: req.headers
    });
    res.status(500).json({
      success: false,
      message: 'Failed to remove upvote',
      error: error.message,
      details: {
        upvoteId: req.params.id,
        userId: req.user?.email
      }
    });
  }
});

// Check if user has upvoted a complaint
router.get('/check/:complaintId', authenticateToken, async (req, res) => {
  try {
    const upvote = await Upvote.findOne({
      complaint_id: req.params.complaintId,
      user_email: req.user.email
    });

    res.json({
      success: true,
      hasUpvoted: !!upvote,
      upvoteId: upvote?._id
    });
  } catch (error) {
    console.error('Check upvote error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check upvote status'
    });
  }
});

export default router;
