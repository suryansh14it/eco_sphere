import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { image, projectLocation, context, attendanceType } = await request.json();

    if (!image || !projectLocation) {
      return NextResponse.json(
        { error: 'Image and project location are required' },
        { status: 400 }
      );
    }

    // Remove data:image/jpeg;base64, prefix if present
    const base64Image = image.replace(/^data:image\/[a-z]+;base64,/, '');

    const prompt = `
You are an expert location verification analyst. Your task is to analyze an image and determine if it was taken at or near a specific project location for attendance verification purposes.

Project Location: "${projectLocation}"
Attendance Type: ${attendanceType || 'check-in/check-out'}
Context: ${context || 'Verify if this photo matches the project location'}

Please analyze the uploaded image and determine:
1. What type of environment/location is shown in the image
2. Are there any visible landmarks, signs, or distinctive features?
3. Does the environment match what you would expect at "${projectLocation}"?
4. Are there any environmental project indicators (trees, cleanup areas, conservation sites, etc.)?

IMPORTANT: Respond ONLY with valid JSON in this exact format:

{
  "verified": true/false,
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "reason": "Brief explanation of why verification passed or failed",
  "analysis": {
    "environmentType": "Description of the environment shown",
    "visibleFeatures": ["feature1", "feature2", "feature3"],
    "locationMatch": "Explanation of how well it matches the expected location",
    "projectRelevance": "How relevant the image is to environmental project work"
  },
  "recommendations": [
    "Recommendation 1 if verification failed",
    "Recommendation 2 if verification failed"
  ]
}

Verification Guidelines:
- APPROVE if the image clearly shows the expected location or environment
- APPROVE if the image shows environmental project-related activities at a reasonable location
- APPROVE if visible features match the general area description
- REJECT if the image is clearly from a different type of location
- REJECT if the image appears to be taken indoors when outdoor location expected
- REJECT if there are no environmental indicators for environmental projects
- Use MEDIUM confidence for borderline cases
- Use HIGH confidence only when very certain about the match
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const aiResponse = response.choices[0]?.message?.content;
    
    if (!aiResponse) {
      return NextResponse.json(
        { error: 'No response from AI service' },
        { status: 500 }
      );
    }

    try {
      // Parse the JSON response from AI
      const analysisResult = JSON.parse(aiResponse);
      
      // Validate the response structure
      if (typeof analysisResult.verified !== 'boolean') {
        throw new Error('Invalid AI response format');
      }

      return NextResponse.json({
        success: true,
        ...analysisResult,
        timestamp: new Date().toISOString(),
        projectLocation: projectLocation
      });

    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.log('Raw AI response:', aiResponse);
      
      // Fallback response if JSON parsing fails
      return NextResponse.json({
        success: true,
        verified: false,
        confidence: "LOW",
        reason: "Unable to properly analyze the image. Please try uploading a clearer photo taken at the project site.",
        analysis: {
          environmentType: "Unable to determine",
          visibleFeatures: [],
          locationMatch: "Analysis failed",
          projectRelevance: "Could not be determined"
        },
        recommendations: [
          "Upload a clearer, well-lit photo",
          "Ensure the photo shows distinctive features of the project location",
          "Take the photo outdoors at the actual project site"
        ],
        timestamp: new Date().toISOString(),
        projectLocation: projectLocation,
        error: "AI response parsing failed"
      });
    }

  } catch (error) {
    console.error('Error in location verification:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to verify location', 
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false,
        verified: false,
        reason: "Technical error occurred during verification"
      },
      { status: 500 }
    );
  }
}
