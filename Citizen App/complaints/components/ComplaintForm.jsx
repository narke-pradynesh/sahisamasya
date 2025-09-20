import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { 
    Camera, 
    MapPin, 
    Upload, 
    Loader2,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { UploadFile, InvokeLLM } from "@/src/integrations/Core";

export default function ComplaintForm({ onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    photo_url: "",
    category: "other",
    latitude: null,
    longitude: null,
    address: ""
  });
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      setErrors(prev => ({ ...prev, location: "Geolocation is not supported by this browser" }));
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          latitude,
          longitude
        }));
        setLocationGranted(true);
        
        // Get address from coordinates (simplified - you'd use Google Maps API in production)
        const address = `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        setFormData(prev => ({ ...prev, address }));
        
        setIsGettingLocation(false);
      },
      (error) => {
        let errorMessage = "Unable to get your location. ";
        
        // Check if this is due to insecure context (HTTP over network)
        if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
          errorMessage += "Geolocation requires HTTPS when accessing from network. Please enter location manually or access via localhost.";
        } else {
          errorMessage += "Please try again or enter location manually.";
        }
        
        setErrors(prev => ({ ...prev, location: errorMessage }));
        setIsGettingLocation(false);
      }
    );
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Clear previous errors
    setErrors(prev => ({ ...prev, photo: null }));

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, photo: "Please upload an image file (JPG, PNG, GIF)" }));
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, photo: "File size must be less than 10MB" }));
      return;
    }

    setIsUploading(true);
    try {
      const uploadResult = await UploadFile({ file });
      setFormData(prev => ({ ...prev, photo_url: uploadResult.file_url }));
      
      // Auto-classify the issue using AI
      setIsClassifying(true);
      try {
        const classification = await InvokeLLM({
          prompt: `Analyze this image of a civic issue and determine the most appropriate category. 
          Categories: road_maintenance, streetlights, waste_management, water_supply, drainage, parks, traffic, noise_pollution, other.
          Also suggest a brief title for this issue.
          Return only the category name and title, nothing else.`,
          file_urls: [uploadResult.file_url],
          file_data: uploadResult.base64_data, // Pass base64 data for AI classification
          response_json_schema: {
            type: "object",
            properties: {
              category: { type: "string" },
              title: { type: "string" }
            }
          }
        });
        
        if (classification && classification.category) {
          setFormData(prev => ({
            ...prev,
            title: classification.title || "Civic Issue Report",
            category: classification.category
          }));
          console.log("AI classification successful:", classification);
        } else if (!formData.title) {
          // Set a default title if AI classification is not available
          setFormData(prev => ({
            ...prev,
            title: "Civic Issue Report"
          }));
        }
      } catch (aiError) {
        console.warn("AI classification failed:", aiError);
        // Don't show error to user, just continue without auto-classification
      } finally {
        setIsClassifying(false);
      }
      
    } catch (error) {
      console.error("Upload error:", error);
      setErrors(prev => ({ 
        ...prev, 
        photo: error.message || "Failed to upload photo. Please try again." 
      }));
    }
    setIsUploading(false);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.photo_url) newErrors.photo = "Photo is required";
    // Location is now optional - removed validation requirement
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Card className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto bg-white/80 backdrop-blur-sm shadow-xl border-0">
      <CardHeader className="text-center pb-4 sm:pb-6 px-4 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">Report a Civic Issue</CardTitle>
        <p className="text-sm sm:text-base text-gray-600">Help make your community better by reporting local issues</p>
      </CardHeader>
      
      <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Photo Upload */}
          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="photo" className="text-sm font-semibold text-gray-900">
              Photo of Issue *
            </Label>
            <div className="flex flex-col gap-3 sm:gap-4">
              {!formData.photo_url ? (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-center hover:border-blue-400 transition-colors cursor-pointer touch-spacing"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-gray-600 mb-2">Click to take a photo or upload an image</p>
                  <p className="text-xs sm:text-sm text-gray-500">JPG, PNG, GIF up to 10MB</p>
                </div>
              ) : (
                <div className="relative group">
                  <img 
                    src={formData.photo_url} 
                    alt="Uploaded issue"
                    className="w-full h-40 sm:h-48 object-cover rounded-xl shadow-lg"
                    onError={(e) => {
                      console.error("Image load error:", e);
                      setErrors(prev => ({ ...prev, photo: "Failed to load image. Please try again." }));
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl flex items-center justify-center">
                    {isClassifying && (
                      <div className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">AI Analyzing...</span>
                      </div>
                    )}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="bg-white/90 backdrop-blur-sm touch-spacing-sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        <Camera className="w-4 h-4 mr-1" />
                        Change
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="bg-white/90 backdrop-blur-sm text-red-600 hover:text-red-700 touch-spacing-sm"
                        onClick={() => setFormData(prev => ({ ...prev, photo_url: "" }))}
                        disabled={isUploading}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full touch-spacing-sm"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {formData.photo_url ? 'Change Photo' : 'Upload Photo'}
                  </>
                )}
              </Button>
            </div>
            {errors.photo && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.photo}</AlertDescription>
              </Alert>
            )}
            {formData.category && formData.category !== "other" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    AI detected: <strong>{formData.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-sm font-semibold text-gray-900">
              Location <span className="text-gray-500 font-normal">(Optional)</span>
            </Label>
            <Button
              type="button"
              variant="outline"
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className={`w-full touch-spacing-sm ${locationGranted ? 'border-green-300 bg-green-50' : ''}`}
            >
              {isGettingLocation ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Getting location...
                </>
              ) : locationGranted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                  Location captured
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 mr-2" />
                  Get current location
                </>
              )}
            </Button>
            {formData.address && (
              <p className="text-xs sm:text-sm text-gray-600 bg-gray-50 p-2 sm:p-3 rounded-lg break-words">
                📍 {formData.address}
              </p>
            )}
            {errors.location && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.location}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="title" className="text-sm font-semibold text-gray-900">
              Issue Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Brief description of the issue"
              className="text-base sm:text-lg focus-visible-enhanced"
            />
            {errors.title && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.title}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="description" className="text-sm font-semibold text-gray-900">
              Detailed Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Provide more details about the issue, when you noticed it, and any other relevant information..."
              className="min-h-20 sm:min-h-24 resize-none focus-visible-enhanced"
              rows={4}
            />
            {errors.description && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.description}</AlertDescription>
              </Alert>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 py-3 text-base sm:text-lg touch-spacing focus-visible-enhanced"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                <span className="text-sm sm:text-base">Submitting Report...</span>
              </>
            ) : (
              <span className="text-sm sm:text-base">Submit Report</span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}