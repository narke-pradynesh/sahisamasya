import express from 'express';
import Complaint from '../models/Complaint.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all complaints
router.get('/', async (req, res) => {
  try {
    const { status, category, limit = 50, page = 1 } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get complaints with pagination
    const complaints = await Complaint.find(filter)
      .populate('created_by', 'full_name email')
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const total = await Complaint.countDocuments(filter);

    res.json({
      success: true,
      data: complaints,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints'
    });
  }
});

// Get single complaint
router.get('/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('created_by', 'full_name email');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.json({
      success: true,
      data: complaint
    });
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaint'
    });
  }
});

// Create new complaint
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('Create complaint request body:', req.body);
    
    // Clean up location data - ensure we don't pass undefined/null as strings
    const complaintData = {
      ...req.body,
      latitude: req.body.latitude || null,
      longitude: req.body.longitude || null,
      address: req.body.address || '',
      created_by: req.user._id
    };
    
    console.log('Complaint data to save:', complaintData);

    const complaint = new Complaint(complaintData);
    await complaint.save();

    // Populate the created_by field
    await complaint.populate('created_by', 'full_name email');

    res.status(201).json({
      success: true,
      message: 'Complaint created successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create complaint'
    });
  }
});

// Update complaint (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Update complaint
    Object.assign(complaint, req.body);
    await complaint.save();

    // Populate the created_by field
    await complaint.populate('created_by', 'full_name email');

    res.json({
      success: true,
      message: 'Complaint updated successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update complaint'
    });
  }
});

// Delete complaint (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.json({
      success: true,
      message: 'Complaint deleted successfully'
    });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete complaint'
    });
  }
});

export default router;
