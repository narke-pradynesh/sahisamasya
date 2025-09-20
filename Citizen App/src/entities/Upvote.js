// Upvote entity with MongoDB backend integration
import { apiRequest } from '../config/api.js';

export class Upvote {
  static async list() {
    try {
      const response = await apiRequest('/upvotes');
      
      if (response.success) {
        console.log('Raw upvotes data from server:', response.data?.slice(0, 2));
        
        // Normalize server upvotes to ensure consistent field names
        const normalized = (response.data || [])
          .filter(upvote => upvote.complaint_id) // Filter out upvotes with null complaint_id
          .map((upvote) => ({
            id: upvote._id || upvote.id,
            // Handle populated complaint_id (could be object or string or null)
            complaint_id: typeof upvote.complaint_id === 'object' && upvote.complaint_id?._id 
              ? upvote.complaint_id._id 
              : upvote.complaint_id,
            user_email: upvote.user_email,
            created_at: upvote.created_at
          }))
          .filter(upvote => upvote.complaint_id); // Double-check after normalization
        
        console.log('Normalized upvotes data:', normalized.slice(0, 2));
        return normalized;
      }
      
      throw new Error(response.message || 'Failed to fetch upvotes');
    } catch (error) {
      console.error('Error fetching upvotes:', error);
      // Return empty array instead of demo data
      return [];
    }
  }

  static async create(data) {
    try {
      const response = await apiRequest('/upvotes', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to create upvote');
    } catch (error) {
      console.error('Error creating upvote:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const response = await apiRequest(`/upvotes/${id}`, {
        method: 'DELETE'
      });
      
      if (response.success) {
        return { success: true };
      }
      
      throw new Error(response.message || 'Failed to delete upvote');
    } catch (error) {
      console.error('Error deleting upvote:', error);
      throw error;
    }
  }

  // Helper method to check if user has upvoted a complaint
  static async hasUserUpvoted(complaintId) {
    try {
      const response = await apiRequest(`/upvotes/check/${complaintId}`);
      
      if (response.success) {
        return response.hasUpvoted;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking upvote status:', error);
      return false;
    }
  }

  // Helper method to get upvote count for a complaint
  static async getUpvoteCount(complaintId) {
    try {
      const response = await apiRequest(`/upvotes/complaint/${complaintId}`);
      
      if (response.success) {
        return response.data.length;
      }
      
      return 0;
    } catch (error) {
      console.error('Error getting upvote count:', error);
      return 0;
    }
  }

  // Helper method to get upvotes for a specific complaint
  static async getComplaintUpvotes(complaintId) {
    try {
      const response = await apiRequest(`/upvotes/complaint/${complaintId}`);
      
      if (response.success) {
        console.log('Raw upvotes from server:', response.data);
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting complaint upvotes:', error);
      return [];
    }
  }
}
