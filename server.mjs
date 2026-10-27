import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, normalize, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transcribeAudio } from './src/voice/transcribe.mjs';
import { extractVoice } from './src/voice/extract.mjs';
import { workshop } from './products.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
const publicRoot = join(root, 'dist');
const PORT = Number(process.env.PORT || 3000);
const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
const MAX_BODY_BYTES = MAX_AUDIO_BYTES + 1024 * 1024;
const contentTypes = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

function json(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(payload));
}

async function readBody(req, limit = MAX_BODY_BYTES) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) { const error = new Error('request_too_large'); error.code = 'request_too_large'; throw error; }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function parseMultipart(body, contentType) {
  const boundaryMatch = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType || '');
  if (!boundaryMatch) return null;
  const boundary = Buffer.from(`--${boundaryMatch[1] || boundaryMatch[2]}`);
  let cursor = 0;
  while (true) {
    const start = body.indexOf(boundary, cursor);
    if (start < 0) break;
    const headerStart = start + boundary.length + 2;
    const headerEnd = body.indexOf(Buffer.from('\r\n\r\n'), headerStart);
    if (headerEnd < 0) break;
    const headers = body.subarray(headerStart, headerEnd).toString('utf8');
    const end = body.indexOf(boundary, headerEnd + 4);
    if (end < 0) break;
    const valueEnd = Math.max(headerEnd + 4, end - 2);
    const value = body.subarray(headerEnd + 4, valueEnd);
    const disposition = /name="([^"]+)"(?:;\s*filename="([^"]*)")?/i.exec(headers);
    const type = /content-type:\s*([^\r\n]+)/i.exec(headers)?.[1]?.trim() || 'application/octet-stream';
    if (disposition?.[2]) return { name: disposition[1], filename: disposition[2], mime: type, bytes: value };
    cursor = end;
  }
  return null;
}

async function handleVoice(req, res) {
  try {
    const body = await readBody(req);
    const audio = parseMultipart(body, req.headers['content-type']);
    if (!audio || !audio.bytes?.length) return json(res, 400, { ok: false, code: 'empty_recording', message: 'No recording was received. Please try again.' });
    if (audio.bytes.length > MAX_AUDIO_BYTES) return json(res, 413, { ok: false, code: 'upload_too_large', message: 'That recording is too large. Keep it under 8 MB.' });
    if (!/^audio\/(webm|ogg|mpeg|mp4|wav|x-m4a)/i.test(audio.mime) && !/\.(webm|ogg|mp3|m4a|wav)$/i.test(audio.filename || '')) {
      return json(res, 415, { ok: false, code: 'unsupported_format', message: 'This audio format is not supported. Try recording again.' });
    }
    const transcript = await transcribeAudio(audio);
    const extraction = await extractVoice({ transcript: transcript.text });
    const locality = extraction.locality?.toLowerCase().includes('sector 62') || extraction.locality?.toLowerCase().includes('noida') ? { label: extraction.locality, approximation: true } : extraction.locality ? { label: extraction.locality, approximation: false } : null;
    return json(res, 200, { ok: true, transcript: transcript.text, language: transcript.language, intent: extraction.intent, category: extraction.category, availability: extraction.availability, locality, clarification: extraction.clarification, persisted: false });
  } catch (error) {
    const status = error.code === 'request_too_large' ? 413 : error.code === 'speech_not_configured' || error.code === 'llm_not_configured' ? 503 : error.retryable ? 502 : 500;
    return json(res, status, { ok: false, code: error.code || 'voice_failed', retryable: Boolean(error.retryable), message: status === 503 ? 'Voice services are not ready yet. Please try again shortly.' : error.message || 'We could not process that recording.' });
  }
}

async function serveStatic(req, res, pathname) {
  let requested = pathname === '/' || pathname === '/orders' ? '/index.html' : pathname;
  requested = normalize(requested).replace(/^\.\.(?:\/|\\)/, '');
  const file = join(publicRoot, requested);
  try {
    const info = await stat(file);
    if (!info.isFile()) throw new Error('not_file');
    const body = await readFile(file);
    const type = contentTypes[extname(file)] || 'application/octet-stream';
    const immutable = /-[a-f0-9]{12}\.(css|js)$/i.test(file);
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache' });
    res.end(body);
  } catch { json(res, 404, { ok: false, code: 'not_found', message: 'Not found' }); }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if (req.method === 'GET' && (url.pathname === '/api/health' || url.pathname === '/_app/health')) return json(res, 200, { ok: true, service: 'hunarfix' });
  if (req.method === 'POST' && url.pathname === '/api/voice') return handleVoice(req, res);
  if (req.method === 'GET' && url.pathname === '/api/orders') return json(res, 200, { ok: true, orders: [], note: 'Order history is empty for this browser.' });
  if (req.method === 'POST' && url.pathname === '/api/checkout') return json(res, 501, { ok: false, code: 'checkout_not_ready', message: 'Workshop checkout is reserved for the configured Stripe sandbox.' });
  return serveStatic(req, res, url.pathname);
});

server.listen(PORT, '0.0.0.0', () => console.log(`HunarSetu listening on ${PORT}; workshop=${workshop.id}; build=${createHash('sha1').update(new Date().toISOString()).digest('hex').slice(0, 8)}`));
