const API_URL = process.env.MANUS_API_URL;
const API_KEY = process.env.MANUS_API_KEY;
const MODEL = process.env.HUNAR_LLM_MODEL || 'gpt-6-luna';

const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    intent: { type: ['string', 'null'], enum: ['offer', 'request', null] },
    category: { type: ['string', 'null'] },
    availability: { type: ['string', 'null'] },
    locality: { type: ['string', 'null'] },
    clarification: { type: 'array', items: { type: 'string' } }
  },
  required: ['intent', 'category', 'availability', 'locality', 'clarification']
};

function clean(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function validateExtraction(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Extraction was not an object.');
  const intent = value.intent === 'offer' || value.intent === 'request' ? value.intent : null;
  const category = clean(value.category);
  const availability = clean(value.availability);
  const locality = clean(value.locality);
  const clarification = Array.isArray(value.clarification) ? value.clarification.filter(item => typeof item === 'string' && item.trim()).map(item => item.trim()).slice(0, 3) : [];
  const missing = [];
  if (!intent) missing.push('whether this is an offer or a request');
  if (!category) missing.push('the kind of help');
  if (!locality) missing.push('the neighborhood or locality');
  return { intent, category, availability, locality, clarification: [...new Set([...clarification, ...missing.map(item => `Please add ${item}.`)])] };
}

function parseContent(content) {
  if (typeof content !== 'string' || !content.trim()) throw new Error('The extraction service returned no content.');
  const unfenced = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(unfenced);
}

export async function extractVoice({ transcript }) {
  if (!API_URL || !API_KEY) {
    const error = new Error('Managed extraction service is not configured.');
    error.code = 'llm_not_configured';
    error.retryable = false;
    throw error;
  }
  const payload = {
    model: MODEL,
    messages: [
      { role: 'system', content: 'Extract a neighborhood offer or request. Do not invent missing information. Return only the requested JSON object.' },
      { role: 'user', content: `Transcript:\n${transcript}\n\nReturn intent as offer or request when explicit, category, availability, locality, and a short clarification array for missing intent/category/locality. Sector 62 / Noida may be used only when explicitly supported by the transcript.` }
    ],
    response_format: { type: 'json_schema', json_schema: { name: 'hunarsetu_voice_extraction', strict: true, schema } }
  };
  const response = await fetch(`${API_URL.replace(/\/$/, '')}/v1/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.error) {
    const error = new Error(body?.error?.message || `Extraction service returned ${response.status}`);
    error.code = 'llm_provider_error';
    error.retryable = response.status >= 500 || response.status === 429;
    throw error;
  }
  const content = body?.choices?.[0]?.message?.content;
  try {
    return validateExtraction(parseContent(content));
  } catch (parseError) {
    const error = new Error('The extraction response could not be validated.');
    error.code = 'llm_invalid_result';
    error.retryable = false;
    throw error;
  }
}
