import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { 
    MapPin, 
    ThumbsUp, 
    Clock, 
    User,
    ChevronRight,
    CheckCircle2,
    AlertTriangle
} from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  escalated: "bg-orange-100 text-orange-800 border-orange-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200"
};

const categoryColors = {
  road_maintenance: "bg-gray-100 text-gray-800",
  streetlights: "bg-yellow-100 text-yellow-800",
  waste_management: "bg-green-100 text-green-800",
  water_supply: "bg-blue-100 text-blue-800",
  drainage: "bg-cyan-100 text-cyan-800",
  parks: "bg-emerald-100 text-emerald-800",
  traffic: "bg-red-100 text-red-800",
  noise_pollution: "bg-purple-100 text-purple-800",
  other: "bg-pink-100 text-pink-800"
};

export default function ComplaintCard({ 
  complaint, 
  onUpvote, 
  hasUpvoted, 
  onClick,
  showActions = true,
  isAdmin = false 
}) {
  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'escalated':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      <Card 
        className="hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm touch-spacing-sm"
        onClick={onClick}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex gap-3 sm:gap-4">
            {complaint.photo_url && (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                <img 
                  src={complaint.photo_url}
                  alt="Issue"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1 sm:mb-2">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate pr-2">
                  {complaint.title}
                </h3>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
              </div>
              
              <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                {complaint.description}
              </p>
              
              {(complaint.address || (complaint.latitude && complaint.longitude)) && (
                <div className="flex items-center gap-2 mb-2 sm:mb-3 text-xs sm:text-sm text-gray-500">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">
                    {complaint.address || `${complaint.latitude?.toFixed(4)}, ${complaint.longitude?.toFixed(4)}`}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                  <Badge className={`${statusColors[complaint.status] || statusColors.pending} text-xs`}>
                    {getStatusIcon(complaint.status)}
                    <span className="ml-1 capitalize hidden xs:inline">{complaint.status?.replace('_', ' ')}</span>
                  </Badge>
                  
                  <Badge variant="secondary" className={`${categoryColors[complaint.category]} text-xs hidden sm:inline-flex`}>
                    {complaint.category?.replace('_', ' ')}
                  </Badge>
                </div>
                
                {showActions && !isAdmin && (
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 hidden sm:flex">
                      <User className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>
                        {complaint.created_date && !isNaN(new Date(complaint.created_date)) ? 
                          format(new Date(complaint.created_date), 'MMM d') : 
                          'No date'
                        }
                      </span>
                    </div>
                    <Button
                      variant={hasUpvoted ? "default" : "outline"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpvote(complaint);
                      }}
                      className={`${hasUpvoted ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' : 'hover:bg-blue-50 text-gray-700 border-gray-300'} touch-spacing-sm text-xs sm:text-sm transition-colors`}
                      title={hasUpvoted ? "Click to remove your upvote" : "Click to upvote this complaint"}
                    >
                      <ThumbsUp className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 ${hasUpvoted ? 'fill-current' : ''}`} />
                      {complaint.upvote_count || 0}
                    </Button>
                  </div>
                )}
                
                {isAdmin && (
                  <div className="text-xs sm:text-sm text-gray-500 flex-shrink-0">
                    <span className="sm:hidden">{complaint.upvote_count || 0} votes</span>
                    <span className="hidden sm:inline">
                      {complaint.upvote_count || 0} votes • {complaint.created_date && !isNaN(new Date(complaint.created_date)) ? 
                        format(new Date(complaint.created_date), 'MMM d, h:mm a') : 
                        'No date'
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}