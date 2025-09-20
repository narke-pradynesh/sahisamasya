// Complaint entity with MongoDB backend integration
import { apiRequest } from '../config/api.js';

export class Complaint {
  static async list(orderBy = "-created_date", limit = 50, page = 1, filters = {}) {
    try {
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
        ...filters
      });

      const response = await apiRequest(`/complaints?${queryParams}`);
      
      if (response.success) {
        // Normalize server documents to app shape
        const normalized = (response.data || []).map((doc) => ({
          id: doc._id || doc.id,
          title: doc.title,
          description: doc.description,
          photo_url: doc.photo_url,
          latitude: doc.latitude,
          longitude: doc.longitude,
          address: doc.address,
          category: doc.category,
          status: doc.status,
          upvote_count: doc.upvote_count,
          escalation_threshold: doc.escalation_threshold,
          created_date: doc.created_at || doc.created_date,
          updated_date: doc.updated_at || doc.updated_date,
        }));
        return normalized;
      }
      
      throw new Error(response.message || 'Failed to fetch complaints');
    } catch (error) {
      console.error('Error fetching complaints:', error);
      // Return empty array instead of demo data
      return [];
    }
  }

  static async create(data) {
    try {
      const response = await apiRequest('/complaints', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          status: "pending",
          upvote_count: 0,
          escalation_threshold: 5
        })
      });
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to create complaint');
    } catch (error) {
      console.error('Error creating complaint:', error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const response = await apiRequest(`/complaints/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to update complaint');
    } catch (error) {
      console.error('Error updating complaint:', error);
      throw error;
    }
  }

  static async get(id) {
    try {
      const response = await apiRequest(`/complaints/${id}`);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch complaint');
    } catch (error) {
      console.error('Error fetching complaint:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const response = await apiRequest(`/complaints/${id}`, {
        method: 'DELETE'
      });
      
      if (response.success) {
        return { success: true };
      }
      
      throw new Error(response.message || 'Failed to delete complaint');
    } catch (error) {
      console.error('Error deleting complaint:', error);
      throw error;
    }
  }
}
