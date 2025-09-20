// API Test Utility - Use this to test your API integration
import { Complaint } from '../entities/Complaint.js';
import { Upvote } from '../entities/Upvote.js';
import { User } from '../entities/User.js';

export const testApiIntegration = async () => {
  console.log('🧪 Testing API Integration...');
  
  try {
    // Test 1: Fetch complaints
    console.log('📋 Testing Complaint.list()...');
    const complaints = await Complaint.list();
    console.log('✅ Complaints fetched:', complaints.length, 'items');
    
    // Test 2: Fetch upvotes
    console.log('👍 Testing Upvote.list()...');
    const upvotes = await Upvote.list();
    console.log('✅ Upvotes fetched:', upvotes.length, 'items');
    
    // Test 3: Get user info
    console.log('👤 Testing User.me()...');
    const user = await User.me();
    console.log('✅ User info:', user);
    
    // Test 4: Create a test complaint (optional - uncomment to test)
    /*
    console.log('📝 Testing Complaint.create()...');
    const testComplaint = await Complaint.create({
      title: 'Test API Integration',
      description: 'This is a test complaint to verify API integration',
      photo_url: 'https://via.placeholder.com/400x300',
      latitude: 40.7128,
      longitude: -74.0060,
      address: 'Test Location',
      category: 'other'
    });
    console.log('✅ Test complaint created:', testComplaint);
    */
    
    console.log('🎉 All API tests passed!');
    return { success: true, complaints, upvotes, user };
    
  } catch (error) {
    console.error('❌ API test failed:', error);
    return { success: false, error: error.message };
  }
};

// Helper function to test specific API endpoints
export const testSpecificEndpoint = async (endpoint, method = 'GET', data = null) => {
  const API_BASE_URL = 'https://app.base44.com/api/apps/68ccfbb81d46a4f46a63c627';
  const API_KEY = '152ccf803de8447b8aa536565ca84f77';
  
  try {
    const config = {
      method,
      headers: {
        'api_key': API_KEY,
        'Content-Type': 'application/json'
      }
    };
    
    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const result = await response.json();
    
    console.log(`✅ ${method} ${endpoint}:`, result);
    return { success: true, data: result };
    
  } catch (error) {
    console.error(`❌ ${method} ${endpoint} failed:`, error);
    return { success: false, error: error.message };
  }
};
