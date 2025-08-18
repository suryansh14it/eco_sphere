import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const formData = await req.formData();
    const userId = formData.get('userId') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const location = formData.get('location') as string;
    const latitude = formData.get('latitude') as string;
    const longitude = formData.get('longitude') as string;
    const images = formData.getAll('images') as File[];
    
    if (!userId || !title || !description || !location) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields" 
      }, { status: 400 });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: "User not found" 
      }, { status: 404 });
    }
    
    // Convert images to base64 for AI analysis
    const imageData = [];
    for (const image of images) {
      if (image.size > 0) {
        const bytes = await image.arrayBuffer();
        const base64 = Buffer.from(bytes).toString('base64');
        imageData.push({
          type: "image_url",
          image_url: {
            url: `data:${image.type};base64,${base64}`
          }
        });
      }
    }
    
    // Validate the issue using OpenAI
    const validationPrompt = `You are an environmental expert tasked with validating environmental issue reports. 
    
    Please analyze this environmental issue report and determine:
    1. Is this a legitimate environmental concern?
    2. How severe is the issue (scale 1-10)?
    3. What type of environmental impact does this have?
    4. How well documented is the report?
    5. Should this be escalated to researchers/authorities?
    
    Report Details:
    - Title: ${title}
    - Category: ${category}
    - Location: ${location}
    - Description: ${description}
    
    ${imageData.length > 0 ? 'Images are provided for visual evidence.' : 'No images provided.'}
    
    Respond in JSON format:
    {
      "isValid": boolean,
      "severity": number (1-10),
      "confidence": number (1-10),
      "environmentalImpact": {
        "type": string,
        "description": string
      },
      "recommendedXP": number (10-50 based on quality),
      "shouldEscalate": boolean,
      "feedback": string,
      "suggestions": string[]
    }`;
    
    const messages: any[] = [
      {
        role: "user",
        content: imageData.length > 0 
          ? [
              { type: "text", text: validationPrompt },
              ...imageData
            ]
          : validationPrompt
      }
    ];
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      response_format: { type: "json_object" },
      max_tokens: 1000
    });
    
    const validation = JSON.parse(completion.choices[0]?.message?.content || '{}');
    
    // Create issue record (you might want to create a separate Issue model)
    const issueData = {
      title,
      description,
      category,
      location,
      coordinates: latitude && longitude ? { lat: parseFloat(latitude), lng: parseFloat(longitude) } : null,
      userId: user._id,
      validation,
      status: validation.isValid ? 'approved' : 'rejected',
      createdAt: new Date(),
      imageCount: images.length
    };
    
    // Award XP using centralized method to ensure consistency
    const xpToAward = validation.isValid ? validation.recommendedXP : 5;
    const relatedItemId = `issue-${Date.now()}`;

    await user.addXP(xpToAward, {
      eventType: 'issue_reported',
      description: `Reported: ${title}`,
      environmentalImpact: validation.isValid
        ? { co2Offset: validation.severity * 0.1, treesPlanted: 0, waterSaved: 0 }
        : undefined,
      timestamp: new Date(),
      relatedItemId,
      // Note: activityHistory schema is strict; extra fields like issueData won't be stored there.
    } as any);

    // Persist any additional user changes if needed (addXP already saves internally)
    // Return response with updated XP/level
    return NextResponse.json({
      success: true,
      validation,
      xpAwarded: xpToAward,
      newLevel: user.level,
      message: validation.isValid 
        ? "Thank you for your environmental report! It has been validated and will be forwarded to relevant authorities."
        : "Thank you for your report. While this particular issue may not require immediate environmental action, we appreciate your vigilance."
    });
    
  } catch (error: any) {
    console.error("Error submitting environmental issue:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error processing your report. Please try again." 
    }, { status: 500 });
  }
}
