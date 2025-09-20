import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Complaint, Upvote, User } from "@/src/entities/all";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { 
    Search, 
    Filter, 
    MapPin, 
    TrendingUp,
    Clock,
    CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/src/utils";
import ComplaintCard from "../complaints/components/ComplaintCard";

export default function HomePage() {
  const [complaints, setComplaints] = useState([]);
  const [upvotes, setUpvotes] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Load timeout')), 30000); // 30 second timeout
      });
      
      const loadPromise = (async () => {
        // First check if user is authenticated
        const userData = await User.me();
        setUser(userData);
        
        // Only load complaints and upvotes if user is authenticated
        if (userData) {
          const [complaintsData, upvotesData] = await Promise.all([
            Complaint.list("-created_date", 50),
            Upvote.list()
          ]);
          
          console.log('Loaded upvotes data:', {
            total: upvotesData.length,
            userUpvotes: upvotesData.filter(u => u.user_email === userData.email),
            sampleUpvotes: upvotesData.slice(0, 3),
            allUpvotes: upvotesData,
            complaintIdsInUpvotes: [...new Set(upvotesData.map(u => u.complaint_id))]
          });
          
          setComplaints(complaintsData);
          setUpvotes(upvotesData);
        } else {
          // If not authenticated, show empty state
          setComplaints([]);
          setUpvotes([]);
        }
      })();
      
      await Promise.race([loadPromise, timeoutPromise]);
    } catch (error) {
      console.error("Error loading data:", error);
      // Show empty state on error instead of demo data
      setComplaints([]);
      setUpvotes([]);
    }
    setLoading(false);
  };

  const handleUpvote = async (complaint) => {
    console.log('handleUpvote called with:', { complaint, user: user?.email });
    
    // Only allow upvoting for authenticated users
    if (!user) {
      alert('Please log in to upvote complaints.');
      return;
    }

    try {
      const complaintId = complaint.id || complaint._id;
      if (!complaintId) {
        console.warn('Cannot upvote: complaint has no valid id');
        alert('Unable to upvote this item. Missing identifier.');
        return;
      }

      console.log('Checking server upvote status for complaint:', complaintId);
      
      // Use the server's check endpoint to get current upvote status
      const checkResponse = await Upvote.hasUserUpvoted(complaintId);
      console.log('Server upvote check result:', checkResponse);
      
      if (checkResponse) {
        console.log('User has upvoted - removing upvote');
        // User has upvoted, so remove it
        // First get the upvote ID from the server
        const userUpvotes = await Upvote.getComplaintUpvotes(complaintId);
        const userUpvote = userUpvotes.find(u => u.user_email === user.email);
        
        if (userUpvote) {
          const upvoteId = userUpvote._id || userUpvote.id;
          console.log('Deleting upvote with ID:', upvoteId);
          await Upvote.delete(upvoteId);
          console.log('Upvote removed successfully');
        } else {
          console.log('No upvote found for user:', user.email);
        }
      } else {
        console.log('User has not upvoted - adding upvote');
        // User hasn't upvoted, so add it
        await Upvote.create({
          complaint_id: complaintId,
          user_email: user.email
        });
        console.log('Upvote added successfully');
      }

      // Update local state instead of reloading all data
      console.log('Updating local state after upvote operation');
      
      // Refresh upvotes data to get current state
      const updatedUpvotes = await Upvote.list();
      setUpvotes(updatedUpvotes);
      
      // Update complaint upvote count locally
      setComplaints(prevComplaints => 
        prevComplaints.map(c => {
          const cId = c.id || c._id;
          if (cId === complaintId) {
            const newCount = checkResponse ? 
              Math.max(0, (c.upvote_count || 0) - 1) : 
              (c.upvote_count || 0) + 1;
            
            const threshold = c.escalation_threshold || 5;
            const newStatus = newCount >= threshold ? 'escalated' : 
                            (newCount < threshold && c.status === 'escalated') ? 'pending' : c.status;
            
            return { ...c, upvote_count: newCount, status: newStatus };
          }
          return c;
        })
      );
      
    } catch (error) {
      console.error("Error in upvote operation:", error);
      alert("Failed to upvote. Please try again.");
      
    }
  };

  const hasUpvoted = (complaintId) => {
    // Simple check using local upvotes data
    const userUpvote = upvotes.find(upvote => 
      (upvote.complaint_id === complaintId || upvote.complaint_id === complaintId?.toString()) && 
      upvote.user_email === user?.email
    );
    return !!userUpvote;
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === "all") return matchesSearch;
    if (filter === "pending") return matchesSearch && complaint.status === "pending";
    if (filter === "escalated") return matchesSearch && complaint.status === "escalated";
    if (filter === "resolved") return matchesSearch && complaint.status === "completed";
    
    return matchesSearch;
  });

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === "pending").length,
    escalated: complaints.filter(c => c.status === "escalated").length,
    resolved: complaints.filter(c => c.status === "completed").length
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 max-w-sm sm:max-w-md md:max-w-lg lg:max-w-4xl xl:max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4 sm:space-y-6">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2 sm:w-1/3"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-20 sm:h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="space-y-3 sm:space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-28 sm:h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 safe-area-bottom">
      <div className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-4xl xl:max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Community Feed</h1>
            <p className="text-sm sm:text-base text-gray-600">See what's happening in your neighborhood</p>
            {!user && (
              <div className="mt-2 px-2 py-1 sm:px-3 bg-amber-100 text-amber-800 text-xs sm:text-sm rounded-full inline-block">
                Demo Mode - Limited functionality
              </div>
            )}
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <Link to={createPageUrl("ReportIssue")} className="flex-1 sm:flex-initial">
              <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-4 sm:px-6 w-full sm:w-auto touch-spacing-sm">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="text-sm sm:text-base">Report New Issue</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border border-gray-100">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Issues</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border border-gray-100">
            <div className="text-xl sm:text-2xl font-bold text-amber-600 flex items-center justify-center gap-1 sm:gap-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              {stats.pending}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border border-gray-100">
            <div className="text-xl sm:text-2xl font-bold text-orange-600 flex items-center justify-center gap-1 sm:gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              {stats.escalated}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Escalated</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border border-gray-100">
            <div className="text-xl sm:text-2xl font-bold text-green-600 flex items-center justify-center gap-1 sm:gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              {stats.resolved}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Resolved</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search issues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-200 text-sm sm:text-base focus-visible-enhanced"
                />
              </div>
            </div>
            <Tabs value={filter} onValueChange={setFilter} className="w-full sm:w-auto">
              <TabsList className="bg-gray-100 grid grid-cols-2 sm:flex w-full sm:w-auto">
                <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
                <TabsTrigger value="pending" className="text-xs sm:text-sm">Pending</TabsTrigger>
                <TabsTrigger value="escalated" className="text-xs sm:text-sm">Escalated</TabsTrigger>
                <TabsTrigger value="resolved" className="text-xs sm:text-sm">Resolved</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Complaints List */}
        <div className="space-y-4 sm:space-y-6">
          <AnimatePresence>
            {filteredComplaints.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 sm:py-12"
              >
                <MapPin className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">No issues found</h3>
                <p className="text-sm sm:text-base text-gray-500 px-4">
                  {searchQuery ? "Try adjusting your search terms" : "Be the first to report an issue in your community"}
                </p>
              </motion.div>
            ) : (
              filteredComplaints.map((complaint, index) => (
                <ComplaintCard
                  key={complaint.id || complaint._id || `complaint-${index}`}
                  complaint={complaint}
                  onUpvote={handleUpvote}
                  hasUpvoted={hasUpvoted(complaint.id || complaint._id)}
                  onClick={() => {/* Could open detail modal */}}
                  showActions={true}
                  isAdmin={false}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}