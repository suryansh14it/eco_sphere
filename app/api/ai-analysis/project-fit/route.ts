import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { project, user } = await request.json();

    if (!project) {
      return NextResponse.json({ error: 'Project details are required' }, { status: 400 });
    }

    const prompt = `You are a helpful assistant that advises a community member whether to join an environmental project.
Evaluate user fit based on: requirements, time/effort, skills, potential impact, location, and XP reward.

PROJECT:\nTitle: ${project.title}\nOrganization: ${project.organization}\nLocation: ${project.location}\nDates: ${project.startDate} to ${project.endDate}\nParticipants: ${project.participants}/${project.maxParticipants}\nStatus: ${project.status}\nXP Reward: ${project.xp}\nImpact Type: ${project.environmentalImpact?.type || 'N/A'}\nImpact Metrics: ${JSON.stringify(project.environmentalImpact?.metrics || {})}\nGoals: ${Array.isArray(project.goals) ? project.goals.join('; ') : 'N/A'}\nRequirements: ${Array.isArray(project.requirements) ? project.requirements.join('; ') : 'N/A'}\nDescription: ${project.description || 'N/A'}

USER (if provided):\nLocation: ${user?.location || 'N/A'}\nInterests: ${Array.isArray(user?.interests) ? user?.interests.join(', ') : 'N/A'}\nLevel: ${user?.level ?? 'N/A'}

Respond ONLY as strict JSON with this exact shape and keys:
{
  "summary": {
    "recommendation": "JOIN" | "CONSIDER" | "SKIP",
    "confidence": "HIGH" | "MEDIUM" | "LOW",
    "matchScore": 0-100,
    "effortLevel": "LOW" | "MEDIUM" | "HIGH",
    "timeCommitment": "LOW" | "MEDIUM" | "HIGH",
    "quickReason": "string"
  },
  "fitAnalysis": {
    "requirementsMatch": [
      { "requirement": "string", "fit": "GOOD" | "PARTIAL" | "LOW", "note": "string" }
    ],
    "benefits": ["string"],
    "risks": ["string"],
    "effortVsReward": "string",
    "whoShouldJoin": ["string"]
  },
  "impactOverview": {
    "xpReward": number,
    "expectedImpact": ["string"],
    "metrics": {
      "treesPlanted"?: number,
      "co2Reduction"?: number,
      "wasteRecycled"?: number,
      "areaRestored"?: number,
      "speciesProtected"?: number
    }
  },
  "actionItems": ["string"]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You advise users on project suitability. Always return valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'Failed to generate analysis' }, { status: 500 });
    }

    const parsed = JSON.parse(content);
    return NextResponse.json({ analysis: parsed, projectTitle: project.title, timestamp: new Date().toISOString() });
  } catch (error: any) {
    console.error('Project fit analysis error:', error);
    if (error.code === 'invalid_api_key') {
      return NextResponse.json({ error: 'Invalid OpenAI API key.' }, { status: 401 });
    }
    if (error.code === 'insufficient_quota') {
      return NextResponse.json({ error: 'OpenAI quota exceeded.' }, { status: 429 });
    }
    return NextResponse.json({ error: 'AI analysis failed', details: error.message }, { status: 500 });
  }
}
