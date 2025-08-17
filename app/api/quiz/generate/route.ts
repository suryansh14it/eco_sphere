import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { materialTitle, materialType, content, description } = body;
    
    if (!materialTitle || !materialType) {
      return NextResponse.json(
        { error: 'Material title and type are required' },
        { status: 400 }
      );
    }
    
    // Prepare the prompt for OpenAI
    let systemPrompt = `You are an expert educational quiz generator. Create a quiz based on the following ${materialType} material titled "${materialTitle}".`;
    
    if (description) {
      systemPrompt += ` Description of the material: ${description}`;
    }
    
    systemPrompt += ` Generate a quiz with 5 multiple-choice questions. Each question should have 4 options with only one correct answer. 
    
    Format the response as a structured JSON with the following format:
    {
      "title": "Quiz on [Material Title]",
      "questions": [
        {
          "id": "q1",
          "question": "Question text here?",
          "options": [
            {"id": "a", "text": "Option A"},
            {"id": "b", "text": "Option B"},
            {"id": "c", "text": "Option C"},
            {"id": "d", "text": "Option D"}
          ],
          "correctAnswer": "a",
          "explanation": "Brief explanation of why this answer is correct"
        },
        ...more questions...
      ]
    }`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: content || `Generate a quiz about ${materialTitle} focusing on the main concepts and key points.` }
      ],
      response_format: { type: "json_object" }
    });

    // Extract the generated quiz
    const quizContent = completion.choices[0]?.message?.content || '';
    
    // Parse the JSON response
    try {
      const quiz = JSON.parse(quizContent);
      return NextResponse.json(quiz);
    } catch (error) {
      console.error('Error parsing quiz JSON:', error);
      return NextResponse.json(
        { error: 'Failed to generate a valid quiz format', rawContent: quizContent },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Quiz generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
