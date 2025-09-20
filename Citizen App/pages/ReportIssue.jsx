import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Complaint } from "@/src/entities/Complaint";
import { User } from "@/src/entities/User";
import { InvokeLLM } from "@/src/integrations/Core";
import { createPageUrl } from "@/src/utils";
import { ArrowLeft, CheckCircle2, MapPin } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import ComplaintForm from "../complaints/components/ComplaintForm";

export default function ReportIssuePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.error("Error checking auth:", error);
      setUser(null);
    }
    setLoading(false);
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    
    try {
      // Use AI to classify the issue and suggest category
      const classification = await InvokeLLM({
        prompt: `Based on this civic issue report, classify it into one of these categories:
        - road_maintenance (potholes, damaged roads, sidewalk issues)
        - streetlights (broken lights, dark areas)  
        - waste_management (garbage, littering, overflowing bins)
        - water_supply (leaks, pressure issues, quality problems)
        - drainage (flooding, clogged drains, sewage issues)
        - parks (damaged equipment, maintenance needed)
        - traffic (signals, signs, congestion issues)
        - noise_pollution (loud noises, disturbances)
        - other (anything else)
        
        Title: ${formData.title}
        Description: ${formData.description}
        
        Return only the category name.`,
        file_urls: formData.photo_url ? [formData.photo_url] : null,
        response_json_schema: {
          type: "object",
          properties: {
            category: { type: "string" }
          }
        }
      });

      // Create the complaint with AI classification
      await Complaint.create({
        ...formData,
        category: classification.category || "other",
        status: "pending",
        upvote_count: 0,
        escalation_threshold: 5
      });

      setSubmitted(true);
      
      // Redirect after a delay to show success message
      setTimeout(() => {
        navigate(createPageUrl("Home"));
      }, 2000);
      
    } catch (error) {
      console.error("Error submitting complaint:", error);
      alert("Failed to submit report. Please try again.");
    }
    
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-200 rounded-full"></div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
        <div className="text-center bg-white rounded-2xl p-8 shadow-xl max-w-md w-full">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to report civic issues and help improve your community.</p>
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/')}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
            >
              Sign In / Register
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="w-full"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white rounded-2xl p-8 shadow-xl max-w-md w-full"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Report Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your civic issue has been successfully reported. The community can now see and support your report.
          </p>
          <div className="text-sm text-gray-500">
            Redirecting to community feed...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Home"))}
            className="bg-white/80 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Report Civic Issue</h1>
            <p className="text-gray-600">Help improve your community by reporting local issues</p>
          </div>
        </div>

        {/* Form */}
        <ComplaintForm 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}