import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Complaint } from "@/src/entities/Complaint";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { 
    AlertTriangle, 
    Clock, 
    TrendingUp, 
    CheckCircle2,
    Users,
    MapPin,
    Calendar,
    Filter
} from "lucide-react";
import { format } from "date-fns";
import ComplaintCard from "../complaints/components/ComplaintCard";

export default function AdminDashboardPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      const data = await Complaint.list("-created_date", 100);
      setComplaints(data);
    } catch (error) {
      console.error("Error loading complaints:", error);
    }
    setLoading(false);
  };

  const updateComplaintStatus = async (complaintId, newStatus) => {
    try {
      await Complaint.update(complaintId, { 
        status: newStatus,
        ...(newStatus === 'completed' && { resolution_notes: `Resolved by admin on ${new Date().toISOString()}` })
      });
      loadComplaints();
    } catch (error) {
      console.error("Error updating complaint:", error);
    }
  };

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === "pending").length,
    escalated: complaints.filter(c => c.status === "escalated").length,
    inProgress: complaints.filter(c => c.status === "in_progress").length,
    completed: complaints.filter(c => c.status === "completed").length
  };

  const filteredComplaints = complaints.filter(complaint => {
    const statusMatch = statusFilter === "all" || complaint.status === statusFilter;
    const categoryMatch = categoryFilter === "all" || complaint.category === categoryFilter;
    return statusMatch && categoryMatch;
  });

  const escalatedComplaints = complaints.filter(c => c.status === "escalated");
  const recentComplaints = complaints.slice(0, 10);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage civic issues and community complaints</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
                <MapPin className="w-4 h-4" />
                Total Issues
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-amber-600 flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                {stats.pending}
              </div>
              <div className="text-sm text-gray-600 mt-1">Pending</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {stats.escalated}
              </div>
              <div className="text-sm text-gray-600 mt-1">Escalated</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {stats.inProgress}
              </div>
              <div className="text-sm text-gray-600 mt-1">In Progress</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                {stats.completed}
              </div>
              <div className="text-sm text-gray-600 mt-1">Completed</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Priority Issues */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-bold">Priority Issues</CardTitle>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="escalated">Escalated</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="road_maintenance">Roads</SelectItem>
                        <SelectItem value="streetlights">Lights</SelectItem>
                        <SelectItem value="waste_management">Waste</SelectItem>
                        <SelectItem value="water_supply">Water</SelectItem>
                        <SelectItem value="drainage">Drainage</SelectItem>
                        <SelectItem value="parks">Parks</SelectItem>
                        <SelectItem value="traffic">Traffic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <AnimatePresence>
                    {filteredComplaints.length === 0 ? (
                      <div className="text-center py-8">
                        <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No complaints match your filters</p>
                      </div>
                    ) : (
                      filteredComplaints.slice(0, 10).map((complaint) => (
                        <motion.div key={complaint.id}>
                          <ComplaintCard
                            complaint={complaint}
                            onClick={() => setSelectedComplaint(complaint)}
                            showActions={false}
                            isAdmin={true}
                          />
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Complaint Details & Quick Actions */}
          <div className="space-y-6">
            {/* Escalated Issues Alert */}
            {escalatedComplaints.length > 0 && (
              <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-orange-800 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Urgent: {escalatedComplaints.length} Escalated Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-orange-700 text-sm mb-3">
                    These issues have received enough community support to require immediate attention.
                  </p>
                  <div className="space-y-2">
                    {escalatedComplaints.slice(0, 3).map((complaint) => (
                      <div key={complaint.id} className="bg-white/50 p-3 rounded-lg">
                        <p className="font-medium text-gray-900 text-sm">{complaint.title}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-600">{complaint.upvote_count} votes</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateComplaintStatus(complaint.id, "in_progress")}
                            className="h-6 px-2 text-xs"
                          >
                            Start Work
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Selected Complaint Details */}
            {selectedComplaint && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Issue Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedComplaint.photo_url && (
                    <img 
                      src={selectedComplaint.photo_url}
                      alt="Issue"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{selectedComplaint.title}</h4>
                    <p className="text-gray-600 text-sm">{selectedComplaint.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <Badge className="ml-2 capitalize">{selectedComplaint.status}</Badge>
                    </div>
                    <div>
                      <span className="text-gray-500">Votes:</span>
                      <span className="ml-2 font-medium">{selectedComplaint.upvote_count || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <span className="ml-2 capitalize">{selectedComplaint.category?.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <span className="ml-2">{format(new Date(selectedComplaint.created_date), 'MMM d')}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateComplaintStatus(selectedComplaint.id, "in_progress")}
                      disabled={selectedComplaint.status === "in_progress"}
                      className="flex-1"
                    >
                      Start Work
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => updateComplaintStatus(selectedComplaint.id, "completed")}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Mark Complete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="bg-white/80 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Today's Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">New Reports</span>
                    <span className="font-bold">{complaints.filter(c => {
                      const today = new Date();
                      const created = new Date(c.created_date);
                      return created.toDateString() === today.toDateString();
                    }).length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Resolved Today</span>
                    <span className="font-bold text-green-600">{complaints.filter(c => {
                      const today = new Date();
                      const updated = new Date(c.updated_date);
                      return c.status === 'completed' && updated.toDateString() === today.toDateString();
                    }).length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg Response Time</span>
                    <span className="font-bold">2.4 hrs</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}