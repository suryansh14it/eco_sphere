import OpenAI from 'openai';
import type { IUser } from '@/models/User';
import Issue, { ISSUE_CATEGORIES, type IIssueMedia } from '@/models/Issue';
import IssueUpdate from '@/models/IssueUpdate';

export const CATEGORY_LABELS: Record<string, string> = {
  pollution: 'Water / Air Pollution',
  waste: 'Illegal Dumping & Waste',
  deforestation: 'Deforestation',
  industrial: 'Industrial Damage',
  water: 'Water Bodies',
  air: 'Air Quality',
  wildlife: 'Wildlife & Biodiversity',
  encroachment: 'Encroachment',
  other: 'Other',
};

export const STATUS_LABELS: Record<string, string> = {
  reported: 'Reported',
  verified: 'Verified',
  triaged: 'With Government',
  assigned: 'NGO Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
  duplicate: 'Duplicate',
};

const MAX_IMAGES = 3;
const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024; // 1.5 MB per image
const DUPLICATE_RADIUS_METERS = 150;
const DUPLICATE_WINDOW_DAYS = 30;

export interface IssueValidation {
  isValid: boolean;
  severity: number;
  confidence: number;
  impactType: string;
  impactDescription: string;
  shouldEscalate: boolean;
  feedback: string;
  suggestions: string[];
  recommendedXP: number;
  model: string;
  validatedAt: Date | null;
}

const FALLBACK_VALIDATION: IssueValidation = {
  isValid: true,
  severity: 5,
  confidence: 0,
  impactType: 'Unclassified',
  impactDescription: 'Automatic analysis is unavailable for this report.',
  shouldEscalate: false,
  feedback:
    'Your report has been saved. Automatic verification is temporarily unavailable, so it will be reviewed by the community and authorities.',
  suggestions: [],
  recommendedXP: 15,
  model: 'none',
  validatedAt: null,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function haversineMeters(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
) {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
}

async function readImages(images: File[]): Promise<IIssueMedia[]> {
  const media: IIssueMedia[] = [];

  for (const image of images.slice(0, MAX_IMAGES)) {
    if (!image || image.size === 0) continue;
    if (!image.type.startsWith('image/')) continue;
    if (image.size > MAX_IMAGE_BYTES) continue;

    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    media.push({
      dataUrl: `data:${image.type};base64,${base64}`,
      mimeType: image.type,
      size: image.size,
    });
  }

  return media;
}

async function analyseIssue(input: {
  title: string;
  description: string;
  category: string;
  location: string;
  media: IIssueMedia[];
}): Promise<IssueValidation> {
  if (!process.env.OPENAI_API_KEY) {
    return FALLBACK_VALIDATION;
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 20000,
    });

    const prompt = `You are an environmental triage assistant. Analyse this citizen report and respond ONLY with JSON.

Report:
- Title: ${input.title}
- Category: ${input.category}
- Location: ${input.location}
- Description: ${input.description}

Respond with this exact shape:
{
  "isValid": boolean,          // is this a plausible, actionable environmental issue?
  "severity": number,          // 1-10
  "confidence": number,        // 1-10 confidence in your assessment
  "impactType": string,        // e.g. "water pollution", "air quality", "habitat loss"
  "impactDescription": string, // one sentence
  "recommendedXP": number,     // 10-40 based on report quality
  "shouldEscalate": boolean,   // does this need urgent authority attention?
  "feedback": string,          // short message to the citizen
  "suggestions": string[]      // 0-3 practical next steps
}`;

    const imageParts = input.media.slice(0, 2).map((item) => ({
      type: 'image_url' as const,
      image_url: { url: item.dataUrl },
    }));

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content:
            imageParts.length > 0
              ? [{ type: 'text' as const, text: prompt }, ...imageParts]
              : prompt,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 700,
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');

    return {
      isValid: parsed.isValid !== false,
      severity: clamp(Number(parsed.severity) || 5, 1, 10),
      confidence: clamp(Number(parsed.confidence) || 5, 1, 10),
      impactType: String(parsed.impactType || 'Environmental impact'),
      impactDescription: String(parsed.impactDescription || ''),
      shouldEscalate: Boolean(parsed.shouldEscalate),
      feedback: String(parsed.feedback || ''),
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions.map(String).slice(0, 3)
        : [],
      recommendedXP: clamp(Number(parsed.recommendedXP) || 15, 10, 40),
      model: 'gpt-4o-mini',
      validatedAt: new Date(),
    };
  } catch (error) {
    console.error('Issue AI analysis failed, continuing without it:', error);
    return FALLBACK_VALIDATION;
  }
}

async function findDuplicate(input: {
  category: string;
  latitude?: number;
  longitude?: number;
}) {
  if (typeof input.latitude !== 'number' || typeof input.longitude !== 'number') {
    return null;
  }

  const since = new Date(Date.now() - DUPLICATE_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const delta = 0.003; // ~330m bounding box, refined with haversine below

  const candidates = await Issue.find({
    category: input.category,
    status: { $nin: ['resolved', 'rejected', 'duplicate'] },
    createdAt: { $gte: since },
    'location.latitude': { $gte: input.latitude - delta, $lte: input.latitude + delta },
    'location.longitude': { $gte: input.longitude - delta, $lte: input.longitude + delta },
  })
    .select('_id title location confirmations confirmCount duplicateCount')
    .limit(10);

  for (const candidate of candidates) {
    const lat = candidate.location?.latitude;
    const lng = candidate.location?.longitude;
    if (typeof lat !== 'number' || typeof lng !== 'number') continue;

    const distance = haversineMeters(
      { latitude: input.latitude, longitude: input.longitude },
      { latitude: lat, longitude: lng }
    );

    if (distance <= DUPLICATE_RADIUS_METERS) {
      return { issue: candidate, distance };
    }
  }

  return null;
}

export async function createIssueFromReport({
  user,
  formData,
}: {
  user: IUser;
  formData: FormData;
}) {
  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const rawCategory = String(formData.get('category') || 'other').trim();
  const locationAddress = String(formData.get('location') || '').trim();
  const district = String(formData.get('district') || '').trim();
  const state = String(formData.get('state') || '').trim();
  const latitudeRaw = formData.get('latitude');
  const longitudeRaw = formData.get('longitude');
  const latitude = latitudeRaw === null || latitudeRaw === '' ? NaN : Number(latitudeRaw);
  const longitude = longitudeRaw === null || longitudeRaw === '' ? NaN : Number(longitudeRaw);
  const providedSeverity = Number(formData.get('severity'));
  const images = formData.getAll('images').filter((item): item is File => item instanceof File);

  if (!title || !description || !locationAddress) {
    throw Object.assign(new Error('Title, description and location are required.'), { status: 400 });
  }

  const category = (ISSUE_CATEGORIES as readonly string[]).includes(rawCategory)
    ? rawCategory
    : 'other';

  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
  const coordinates = hasCoordinates ? { latitude, longitude } : {};

  // Check for a nearby report before spending an AI call on it.
  const duplicate = await findDuplicate({
    category,
    latitude: hasCoordinates ? latitude : undefined,
    longitude: hasCoordinates ? longitude : undefined,
  });

  if (duplicate) {
    const existing = duplicate.issue;
    const userId = String(user._id);

    // The same person may report the same spot twice (or report after already
    // confirming it). Count the extra report as a duplicate, but never let one
    // person inflate the confirmation count for the same issue.
    const alreadyConfirmed = existing.confirmations.some(
      (confirmation) => confirmation.userId === userId && confirmation.type === 'confirm'
    );

    if (!alreadyConfirmed) {
      existing.confirmations.push({
        userId,
        name: user.name,
        type: 'confirm',
        createdAt: new Date(),
      });
      existing.confirmCount += 1;
    }

    existing.duplicateCount += 1;
    await existing.save();

    await IssueUpdate.create({
      issueId: existing._id,
      author: { id: userId, name: user.name, role: user.role },
      type: 'verification',
      body: alreadyConfirmed
        ? `The same issue was reported again from ${Math.round(duplicate.distance)}m away.`
        : `Another citizen reported the same issue from ${Math.round(duplicate.distance)}m away.`,
    });

    const xpAwarded = alreadyConfirmed ? 1 : 3;

    await user.addXP(xpAwarded, {
      eventType: 'issue_reported',
      description: `Confirmed existing report: ${existing.title}`,
      relatedItemId: `issue-${existing._id}`,
      timestamp: new Date(),
    });

    return {
      issue: existing,
      duplicate: true,
      validation: FALLBACK_VALIDATION,
      xpAwarded,
    };
  }

  const media = await readImages(images);
  const validation = await analyseIssue({
    title,
    description,
    category: CATEGORY_LABELS[category] || category,
    location: locationAddress,
    media,
  });

  const severity = clamp(
    Number.isFinite(providedSeverity) && providedSeverity > 0
      ? providedSeverity
      : validation.severity,
    1,
    10
  );

  const status = validation.isValid && validation.confidence >= 5 ? 'verified' : 'reported';

  const issue = await Issue.create({
    reporter: { id: String(user._id), name: user.name, role: user.role },
    title,
    description,
    category,
    severity,
    location: {
      address: locationAddress,
      ...coordinates,
      ...(district ? { district } : {}),
      ...(state ? { state } : {}),
    },
    media,
    mediaCount: media.length,
    status,
    aiValidation: {
      isValid: validation.isValid,
      severity: validation.severity,
      confidence: validation.confidence,
      impactType: validation.impactType,
      impactDescription: validation.impactDescription,
      shouldEscalate: validation.shouldEscalate,
      feedback: validation.feedback,
      suggestions: validation.suggestions,
      model: validation.model,
      validatedAt: validation.validatedAt || undefined,
    },
    escalated: validation.shouldEscalate,
  });

  await IssueUpdate.create({
    issueId: issue._id,
    author: { id: String(user._id), name: user.name, role: user.role },
    type: 'status_change',
    body:
      status === 'verified'
        ? 'Report submitted and automatically verified. It is now visible on the public issue board.'
        : 'Report submitted. It is now visible on the public issue board and awaiting verification.',
    toStatus: status,
  });

  const xpAwarded = clamp(validation.recommendedXP, 10, 40);

  await user.addXP(xpAwarded, {
    eventType: 'issue_reported',
    description: `Reported: ${title}`,
    environmentalImpact: {
      co2Offset: severity * 0.1,
      treesPlanted: 0,
      waterSaved: 0,
    },
    timestamp: new Date(),
    relatedItemId: `issue-${issue._id}`,
  });

  return {
    issue,
    duplicate: false,
    validation,
    xpAwarded,
  };
}
