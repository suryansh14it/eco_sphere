import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { projectData } = await request.json();

    if (!projectData) {
      return NextResponse.json(
        { error: 'Project data is required' },
        { status: 400 }
      );
    }

    const prompt = `
You are an environmental impact analyst with expertise in project evaluation, funding assessment, and environmental science. 

Analyze the following project request and provide a comprehensive assessment:

Project Details:
- Title: ${projectData.title}
- Organization: ${projectData.organization}
- Requested Funding: ${projectData.funding}
- Location: ${projectData.location}
- Priority Level: ${projectData.priority}
- Description: ${projectData.description || 'No detailed description provided'}

IMPORTANT: Please respond ONLY with valid JSON in the following structure. Do not include any other text before or after the JSON:

{
  "summary": {
    "recommendation": "APPROVE" | "REJECT" | "APPROVE_WITH_CONDITIONS" | "NEEDS_MODIFICATION",
    "confidenceLevel": "HIGH" | "MEDIUM" | "LOW",
    "overallScore": 1-10,
    "keyHighlights": ["Brief highlight 1", "Brief highlight 2", "Brief highlight 3"]
  },
  "sections": [
    {
      "title": "Environmental Impact Assessment",
      "icon": "environment",
      "items": [
        {
          "type": "positive",
          "title": "Positive Environmental Benefits",
          "content": "Detailed analysis of environmental benefits..."
        },
        {
          "type": "risk",
          "title": "Potential Environmental Risks",
          "content": "Analysis of potential risks and concerns..."
        },
        {
          "type": "sustainability",
          "title": "Long-term Sustainability",
          "content": "Long-term sustainability implications..."
        }
      ]
    },
    {
      "title": "Financial Analysis",
      "icon": "financial",
      "items": [
        {
          "type": "cost",
          "title": "Cost-Effectiveness",
          "content": "Analysis of cost-effectiveness..."
        },
        {
          "type": "funding",
          "title": "Funding Appropriateness",
          "content": "Assessment of funding amount..."
        },
        {
          "type": "roi",
          "title": "Return on Investment",
          "content": "Expected environmental ROI..."
        }
      ]
    },
    {
      "title": "Implementation Feasibility",
      "icon": "implementation",
      "items": [
        {
          "type": "technical",
          "title": "Technical Feasibility",
          "content": "Technical implementation analysis..."
        },
        {
          "type": "timeline",
          "title": "Timeline Assessment",
          "content": "Timeline and scheduling considerations..."
        },
        {
          "type": "resources",
          "title": "Resource Requirements",
          "content": "Required resources and infrastructure..."
        }
      ]
    },
    {
      "title": "Risk Assessment",
      "icon": "risk",
      "items": [
        {
          "type": "risks",
          "title": "Major Risks",
          "content": "Identification of major project risks..."
        },
        {
          "type": "mitigation",
          "title": "Mitigation Strategies",
          "content": "Recommended risk mitigation approaches..."
        },
        {
          "type": "success",
          "title": "Success Probability",
          "content": "Factors affecting success probability..."
        }
      ]
    },
    {
      "title": "Recommendations",
      "icon": "recommendation",
      "items": [
        {
          "type": "decision",
          "title": "Final Recommendation",
          "content": "Should this project be approved, rejected, or modified..."
        },
        {
          "type": "conditions",
          "title": "Key Conditions for Approval",
          "content": "Specific conditions that must be met..."
        },
        {
          "type": "alternatives",
          "title": "Alternative Suggestions",
          "content": "Alternative approaches or modifications..."
        }
      ]
    }
  ]
}

Provide a thorough, balanced analysis considering both environmental benefits and practical constraints. Include specific, actionable recommendations with quantifiable metrics where possible.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert environmental impact analyst. Always respond with valid JSON only. Do not include any explanatory text before or after the JSON response."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 3000,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const analysisText = completion.choices[0]?.message?.content;

    if (!analysisText) {
      return NextResponse.json(
        { error: 'Failed to generate analysis' },
        { status: 500 }
      );
    }

    try {
      // Parse the JSON response from the LLM
      const analysis = JSON.parse(analysisText);
      
      return NextResponse.json({
        analysis,
        projectTitle: projectData.title,
        timestamp: new Date().toISOString()
      });
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('AI Analysis error:', error);
    
    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'OpenAI API quota exceeded. Please check your billing settings.' },
        { status: 429 }
      );
    }
    
    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key. Please check your environment variables.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        error: 'AI analysis failed', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
