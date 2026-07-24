import { GoogleGenerativeAI } from '@google/generative-ai';
import { env, isConfigured } from '../config/env.js';

let client = null;

function getModel() {
  if (!isConfigured('gemini')) return null;
  if (!client) client = new GoogleGenerativeAI(env.gemini.apiKey);
  return client.getGenerativeModel({ model: env.gemini.model });
}

/**
 * Strip ```json fences and parse defensively. Returns fallback on failure.
 */
export function safeJsonParse(text, fallback = null) {
  if (!text || typeof text !== 'string') return fallback;
  let cleaned = text.trim();
  // Remove code fences
  cleaned = cleaned.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  // Grab the first {...} or [...] block if extra prose surrounds it.
  const match = cleaned.match(/[[{][\s\S]*[\]}]/);
  if (match) cleaned = match[0];
  try {
    return JSON.parse(cleaned);
  } catch {
    return fallback;
  }
}

/**
 * Call Gemini with a prompt, retrying once on failure. Returns raw text or
 * null when Gemini is unavailable / errors persist.
 */
async function generate(prompt, { imageUrls = [] } = {}) {
  const model = getModel();
  if (!model) return null;

  const parts = [{ text: prompt }];
  // Vision: attach images by URL when the model supports them.
  for (const url of imageUrls.slice(0, 4)) {
    if (url) parts.push({ text: `Image reference: ${url}` });
  }

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const result = await model.generateContent(parts);
      return result.response.text();
    } catch (err) {
      console.error(
        `[Gemini] generate failed (attempt ${attempt + 1}):`,
        err.message
      );
      if (attempt === 1) return null;
    }
  }
  return null;
}

// ── Text helpers for the heuristic fallback ──────────────────────────
const STOP = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'in', 'on', 'at', 'to', 'with',
  'my', 'is', 'was', 'it', 'for', 'i', 'this', 'that', 'has', 'have',
]);

function tokens(text = '') {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function jaccard(aText, bText) {
  const a = new Set(tokens(aText));
  const b = new Set(tokens(bText));
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const w of a) if (b.has(w)) inter += 1;
  const union = new Set([...a, ...b]).size;
  return inter / union;
}

/**
 * Score how likely a lost item matches a found item.
 * Returns { confidence, reasoning, isLikelyMatch }.
 */
export async function scoreItemMatch(lostItem, foundItem) {
  const prompt = `You are an assistant for a campus Lost & Found system.
Compare a LOST item and a FOUND item and judge if they are the same physical object.
Respond with STRICT JSON only, no prose, no code fences:
{"confidence": <0-100 integer>, "reasoning": "<one or two sentences>", "isLikelyMatch": <true|false>}

LOST ITEM:
- title: ${lostItem.title}
- category: ${lostItem.category}
- description: ${lostItem.description}
- location: ${lostItem.location?.name || 'unknown'}
- date: ${lostItem.dateLostOrFound}

FOUND ITEM:
- title: ${foundItem.title}
- category: ${foundItem.category}
- description: ${foundItem.description}
- location: ${foundItem.location?.name || 'unknown'}
- date: ${foundItem.dateLostOrFound}`;

  const imageUrls = [
    ...(lostItem.images || []).map((i) => i.url),
    ...(foundItem.images || []).map((i) => i.url),
  ];

  const raw = await generate(prompt, { imageUrls });
  const parsed = safeJsonParse(raw);
  if (parsed && typeof parsed.confidence === 'number') {
    return {
      confidence: Math.max(0, Math.min(100, Math.round(parsed.confidence))),
      reasoning: String(parsed.reasoning || 'AI comparison.'),
      isLikelyMatch: Boolean(parsed.isLikelyMatch),
      source: 'gemini',
    };
  }

  // ── Heuristic fallback ──────────────────────────────
  const sameCategory = lostItem.category === foundItem.category;
  const textSim = jaccard(
    `${lostItem.title} ${lostItem.description}`,
    `${foundItem.title} ${foundItem.description}`
  );
  const locSim = jaccard(lostItem.location?.name, foundItem.location?.name);
  let confidence = Math.round(
    (sameCategory ? 40 : 0) + textSim * 45 + locSim * 15
  );
  confidence = Math.max(0, Math.min(100, confidence));
  return {
    confidence,
    reasoning: `Heuristic match: ${
      sameCategory ? 'same category' : 'different category'
    }, ${Math.round(textSim * 100)}% keyword overlap in description${
      locSim > 0 ? `, ${Math.round(locSim * 100)}% location overlap` : ''
    }.`,
    isLikelyMatch: confidence >= env.matchThreshold,
    source: 'heuristic',
  };
}

/**
 * Generate up to `count` ownership-verification questions from a found item's
 * private details. Falls back to generic prompts when Gemini is unavailable.
 */
export async function generateVerificationQuestions(foundItem, count = 3) {
  const prompt = `A campus Lost & Found finder recorded PRIVATE distinguishing details about a found item.
Generate exactly ${count} short verification questions that ONLY the true owner could answer, based on these private details. Do NOT reveal the answers.
Respond with STRICT JSON only: {"questions": ["...", "..."]}

ITEM: ${foundItem.title} (${foundItem.category})
PUBLIC DESCRIPTION: ${foundItem.description}
PRIVATE DETAILS: ${foundItem.privateDetails || '(none provided)'}`;

  const raw = await generate(prompt);
  const parsed = safeJsonParse(raw);
  if (parsed && Array.isArray(parsed.questions) && parsed.questions.length) {
    return parsed.questions.slice(0, count).map(String);
  }

  // Fallback generic questions
  return [
    `Describe any unique marks, stickers, or damage on this ${foundItem.category} item.`,
    'What was inside or attached to it when you lost it?',
    'Where and approximately when did you lose it?',
  ].slice(0, count);
}

/**
 * Score a claimant's answers against the found item's private details.
 * Returns { score, feedback }.
 */
export async function scoreVerificationAnswers(foundItem, questions, answers) {
  const qa = questions
    .map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${answers[i] || '(no answer)'}`)
    .join('\n');

  const prompt = `You verify ownership for a campus Lost & Found system.
Given the finder's PRIVATE details and the claimant's answers, rate how likely the claimant is the true owner.
Respond with STRICT JSON only: {"score": <0-100 integer>, "feedback": "<one sentence>"}

PRIVATE DETAILS: ${foundItem.privateDetails || '(none)'}
PUBLIC DESCRIPTION: ${foundItem.description}

${qa}`;

  const raw = await generate(prompt);
  const parsed = safeJsonParse(raw);
  if (parsed && typeof parsed.score === 'number') {
    return {
      score: Math.max(0, Math.min(100, Math.round(parsed.score))),
      feedback: String(parsed.feedback || ''),
      source: 'gemini',
    };
  }

  // Heuristic fallback: overlap of answers with private details + description.
  const reference = `${foundItem.privateDetails || ''} ${foundItem.description || ''}`;
  const answerText = answers.join(' ');
  const sim = jaccard(reference, answerText);
  const score = Math.max(0, Math.min(100, Math.round(sim * 120)));
  return {
    score,
    feedback: `Heuristic similarity of answers to recorded details: ${Math.round(
      sim * 100
    )}%.`,
    source: 'heuristic',
  };
}

/**
 * Recommend 3-5 personalized educational resources for a finder based on their
 * interests and stats. Falls back to a curated list.
 */
export async function generateEducationalRewards(user) {
  const interests = (user.interests || []).join(', ') || 'general tech, career growth';
  const prompt = `A student named ${user.name} just honestly returned a lost item on campus.
Reward them with 3 to 5 personalized educational resources aligned with their interests.
Respond with STRICT JSON only:
{"resources":[{"title":"...","type":"roadmap|interview-prep|cheatsheet|docs|career","url":"https://...","reason":"one line"}]}

INTERESTS: ${interests}
ITEMS RETURNED SO FAR: ${user.stats?.itemsReturned ?? 0}`;

  const raw = await generate(prompt);
  const parsed = safeJsonParse(raw);
  const valid = (r) =>
    r &&
    r.title &&
    ['roadmap', 'interview-prep', 'cheatsheet', 'docs', 'career'].includes(r.type);
  if (parsed && Array.isArray(parsed.resources)) {
    const list = parsed.resources.filter(valid).slice(0, 5);
    if (list.length) return list;
  }

  // Curated fallback tailored loosely by keywords in interests.
  return curatedRewards(user.interests || []);
}

function curatedRewards(interests) {
  const base = [
    {
      title: 'Developer Roadmaps',
      type: 'roadmap',
      url: 'https://roadmap.sh',
      reason: 'Structured learning paths across many tech tracks.',
    },
    {
      title: 'Tech Interview Handbook',
      type: 'interview-prep',
      url: 'https://www.techinterviewhandbook.org',
      reason: 'Free, curated interview preparation material.',
    },
    {
      title: 'DevDocs API Documentation',
      type: 'docs',
      url: 'https://devdocs.io',
      reason: 'Fast offline-friendly docs for hundreds of technologies.',
    },
  ];
  const lower = interests.map((i) => i.toLowerCase()).join(' ');
  if (/design|ui|ux/.test(lower)) {
    base.push({
      title: 'Refactoring UI',
      type: 'cheatsheet',
      url: 'https://www.refactoringui.com',
      reason: 'Practical visual design tips for developers.',
    });
  }
  if (/career|intern|job|resume/.test(lower)) {
    base.push({
      title: 'Levels.fyi Career Guides',
      type: 'career',
      url: 'https://www.levels.fyi',
      reason: 'Salary data and career growth resources.',
    });
  }
  return base.slice(0, 5);
}

/**
 * Produce a normalized one-line summary of an item for future matching.
 */
export async function summarizeItem(item) {
  const prompt = `Summarize this ${item.type} item in one concise sentence capturing category, key attributes, color, brand, and distinguishing features. Plain text only.
Title: ${item.title}
Category: ${item.category}
Description: ${item.description}`;
  const raw = await generate(prompt);
  if (raw) return raw.trim().slice(0, 300);
  return `${item.category}: ${item.title} — ${item.description}`.slice(0, 300);
}
