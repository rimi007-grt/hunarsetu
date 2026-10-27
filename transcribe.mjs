const API_URL = process.env.MANUS_API_URL;
const API_KEY = process.env.MANUS_API_KEY;

export async function transcribeAudio({ bytes, mime, filename, language = 'Hindi and English Hinglish' }) {
  if (!API_URL || !API_KEY) {
    const error = new Error('Managed speech service is not configured.');
    error.code = 'speech_not_configured';
    error.retryable = false;
    throw error;
  }
  const form = new FormData();
  form.append('file', new Blob([bytes], { type: mime || 'audio/webm' }), filename || 'hunarsetu-recording.webm');
  form.append('model', 'whisper-1');
  form.append('prompt', `Transcribe the user's neighborhood offer or request. Working language: ${language}. Preserve names, localities, Hindi, English, and Hinglish words.`);
  const response = await fetch(`${API_URL.replace(/\/$/, '')}/v1/audio/transcriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}` },
    body: form
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.error) {
    const error = new Error(body?.error?.message || `Speech service returned ${response.status}`);
    error.code = 'speech_provider_error';
    error.retryable = response.status >= 500 || response.status === 429;
    throw error;
  }
  const text = typeof body.text === 'string' ? body.text.trim() : '';
  if (!text) {
    const error = new Error('The speech service returned no transcript.');
    error.code = 'speech_empty_result';
    error.retryable = true;
    throw error;
  }
  return { text, language: body.language || null, duration: body.duration || null };
}
