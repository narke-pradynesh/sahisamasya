// Core integrations with improved file upload functionality

// Helper function to convert file to base64 data URL
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const UploadFile = async ({ file }) => {
  try {
    console.log("Uploading file:", file.name, "Size:", file.size);
    
    // Validate file
    if (!file) {
      throw new Error("No file provided");
    }
    
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error("File size must be less than 10MB");
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      throw new Error("Only image files are allowed");
    }
    
    // Get auth token
    const token = localStorage.getItem('SahiSamasya_token');
    if (!token) {
      throw new Error("Authentication required for file upload");
    }
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('photo', file);
    
    // Get base URL for API
    const getBaseURL = () => {
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return `http://${window.location.hostname}:3000/api`;
      }
      return 'http://localhost:3000/api';
    };
    
    const baseURL = getBaseURL();
    
    // Upload to server
    const response = await fetch(`${baseURL}/upload/single`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `Upload failed with status: ${response.status}`);
    }
    
    if (data.success) {
      // Convert relative URL to absolute URL
      const fileUrl = data.data.file_url.startsWith('http') 
        ? data.data.file_url 
        : `${baseURL.replace('/api', '')}${data.data.file_url}`;
      
      // Generate base64 data for AI classification
      const base64Data = await fileToBase64(file);
      
      return {
        file_url: fileUrl,
        file_name: data.data.file_name,
        file_size: data.data.file_size,
        file_type: data.data.file_type,
        base64_data: base64Data
      };
    } else {
      throw new Error(data.message || "Upload failed");
    }
    
  } catch (error) {
    console.error("File upload error:", error);
    
    // Fallback to data URL if server upload fails
    console.log("Falling back to data URL upload");
    const base64Data = await fileToBase64(file);
    return {
      file_url: base64Data,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      base64_data: base64Data
    };
  }
};

// OpenRouter API configuration
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// Valid categories for image classification (matching the complaint system)
const VALID_CATEGORIES = [
  "road_maintenance",
  "streetlights", 
  "waste_management",
  "water_supply",
  "drainage",
  "parks",
  "traffic",
  "noise_pollution",
  "other"
];

export const InvokeLLM = async ({ prompt, file_urls, file_data, response_json_schema }) => {
  try {
    console.log("Invoking LLM with prompt:", prompt);
    console.log("File URLs:", file_urls);
    console.log("File data available:", !!file_data);
    console.log("Response schema:", response_json_schema);
    
    // Check if OpenRouter API key is configured
    if (!OPENROUTER_API_KEY) {
      console.warn("OpenRouter API key not configured. Skipping AI classification.");
      return null;
    }
    
    // Check if we have image data to work with
    if (!file_data && (!file_urls || file_urls.length === 0)) {
      console.warn("No image data or URLs provided. Skipping AI classification.");
      return {
        category: "other",
        title: "Civic Issue Report"
      };
    }
    
    // Use x-ai/grok-4-fast:free for image classification
    
    // Prepare the classification prompt
    const classificationPrompt = `Analyze this civic issue image and classify it into one of these categories: road_maintenance, streetlights, waste_management, water_supply, drainage, parks, traffic, noise_pollution, other.

Return JSON format: {"category": "category_name", "title": "Brief title"}`;
    
    // Prepare messages for the API
    const messages = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: classificationPrompt
          }
        ]
      }
    ];
    
    // Add image data to the message - prefer base64 data over URLs
    if (file_data) {
      // Use base64 data directly
      messages[0].content.push({
        type: "image_url",
        image_url: {
          url: file_data // This should be a data URL (data:image/jpeg;base64,...)
        }
      });
    } else if (file_urls && file_urls.length > 0) {
      // Fallback to URLs if no base64 data available
      file_urls.forEach(fileUrl => {
        messages[0].content.push({
          type: "image_url",
          image_url: {
            url: fileUrl
          }
        });
      });
    }
    
    // Make API call to OpenRouter with fallback models
    const primaryModel = import.meta.env.VITE_OPENROUTER_MODEL || "x-ai/grok-4-fast:free";
    const fallbackModels = import.meta.env.VITE_OPENROUTER_FALLBACK_MODELS 
      ? import.meta.env.VITE_OPENROUTER_FALLBACK_MODELS.split(',')
      : ["openai/gpt-4o-mini", "anthropic/claude-3-haiku"];
    
    const models = [primaryModel, ...fallbackModels];
    
    let requestBody = {
      model: models[0], // Try primary model first
      messages: messages
    };
    
    // Try each model until one works
    for (let i = 0; i < models.length; i++) {
      requestBody.model = models[i];
      console.log(`Trying model ${i + 1}/${models.length}: ${models[i]}`);
      console.log("Making API request to OpenRouter with body:", JSON.stringify(requestBody, null, 2));
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "SahiSamasya Mobile",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        console.log(`✅ Success with model: ${models[i]}`);
        const data = await response.json();
        const responseContent = data.choices?.[0]?.message?.content?.trim();
        
        console.log("✅ OpenRouter API call successful!");
        console.log("Raw AI response:", responseContent);
        
        // Try to parse JSON response
        let classification = null;
        try {
          // Extract JSON from response if it's wrapped in other text
          const jsonMatch = responseContent.match(/\{.*\}/s);
          if (jsonMatch) {
            classification = JSON.parse(jsonMatch[0]);
          } else {
            classification = JSON.parse(responseContent);
          }
        } catch (parseError) {
          console.warn("Failed to parse AI response as JSON:", parseError);
          // Fallback: try to extract category from text
          const categoryMatch = responseContent.match(/(road_maintenance|streetlights|waste_management|water_supply|drainage|parks|traffic|noise_pollution|other)/i);
          if (categoryMatch) {
            classification = {
              category: categoryMatch[1].toLowerCase(),
              title: "Civic Issue Report"
            };
          }
        }
        
        // Validate the classification result
        if (classification && classification.category && VALID_CATEGORIES.includes(classification.category)) {
          console.log("Valid classification:", classification);
          return {
            category: classification.category,
            title: classification.title || `${classification.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Issue`
          };
        } else {
          console.warn("Invalid or missing classification:", classification);
          return {
            category: "other",
            title: "Civic Issue Report"
          };
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(`Model ${models[i]} failed: ${response.status} - ${errorData.error?.message || response.statusText}`);
        
        // If this is the last model, provide detailed error info
        if (i === models.length - 1) {
          console.error("All models failed. Full error response:", errorData);
          console.error("Request that failed:", JSON.stringify(requestBody, null, 2));
          
          // Provide specific error messages based on status code
          if (response.status === 400) {
            console.error("400 Bad Request - This usually means:");
            console.error("1. The model name is incorrect or not available");
            console.error("2. The image URL is not publicly accessible");
            console.error("3. The request format is invalid");
            console.error("4. The API key has insufficient permissions");
          } else if (response.status === 401) {
            console.error("401 Unauthorized - Check your OpenRouter API key");
          } else if (response.status === 429) {
            console.error("429 Rate Limited - Too many requests");
          }
        }
      }
    }
    
    // If all models failed, return fallback response
    console.warn("All OpenRouter models failed, using fallback response");
    return {
      category: "other",
      title: "Civic Issue Report"
    };
    
  } catch (error) {
    console.error("LLM invocation error:", error);
    
    // Return fallback response on error
    return {
      category: "other",
      title: "Civic Issue Report"
    };
  }
};
