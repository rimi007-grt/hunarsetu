const recordButton = document.querySelector('#record-button');
const recordLabel = document.querySelector('#record-label');
const voiceStatus = document.querySelector('#voice-status');
const preview = document.querySelector('#preview');
const previewText = document.querySelector('#preview-text');
const result = document.querySelector('#result');
let recorder;
let stream;
let chunks = [];
let startedAt = 0;
let previewRecognition;

function setStatus(title, detail) {
  voiceStatus.innerHTML = `<strong>${title}</strong><span>${detail}</span>`;
}
function setBusy(busy) {
  recordButton.disabled = busy;
  recordButton.classList.toggle('recording', busy);
}
function supportedMime() {
  return ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'].find(type => window.MediaRecorder?.isTypeSupported?.(type)) || '';
}
function startPreview() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;
  try {
    previewRecognition = new SpeechRecognition();
    previewRecognition.lang = 'en-IN';
    previewRecognition.interimResults = true;
    previewRecognition.onresult = event => {
      const text = [...event.results].map(item => item[0].transcript).join(' ');
      if (text) { preview.hidden = false; previewText.textContent = text; }
    };
    previewRecognition.start();
  } catch { /* preview is optional and never controls success */ }
}
function stopPreview() { try { previewRecognition?.stop(); } catch {} previewRecognition = null; }
async function startRecording() {
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return setStatus('Recording is not supported here.', 'Please use a recent browser or try again from another device.');
  const mime = supportedMime();
  if (!mime) return setStatus('This browser cannot create a supported recording.', 'Try Chrome, Edge, or Safari, then try again.');
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(stream, { mimeType: mime }); chunks = []; startedAt = Date.now();
    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
    recorder.onstop = finishRecording;
    recorder.start(); startPreview(); setBusy(true); recordLabel.textContent = 'Tap to stop'; setStatus('Listening…', 'Say what you can offer or what you need.');
    window.setTimeout(() => { if (recorder?.state === 'recording') stopRecording(); }, 45000);
  } catch (error) { if (stream) stream.getTracks().forEach(track => track.stop()); setStatus(error.name === 'NotAllowedError' ? 'Microphone permission is needed.' : 'We could not start recording.', 'Check your browser permission and try again.'); }
}
function stopRecording() { if (recorder?.state === 'recording') recorder.stop(); if (stream) stream.getTracks().forEach(track => track.stop()); stopPreview(); setBusy(true); recordLabel.textContent = 'Working…'; setStatus('Uploading your note…', 'Your recording is sent for transcription; it is not saved.'); }
async function finishRecording() {
  const duration = Date.now() - startedAt;
  if (!chunks.length || duration < 350) { setBusy(false); recordLabel.textContent = 'Tap to record'; return setStatus('That note was empty.', 'Try speaking for a moment, then tap stop.'); }
  const blob = new Blob(chunks, { type: recorder.mimeType });
  if (blob.size > 8 * 1024 * 1024) { setBusy(false); recordLabel.textContent = 'Tap to record'; return setStatus('That recording is too large.', 'Keep your note under 8 MB and try again.'); }
  const form = new FormData(); form.append('audio', blob, `hunarsetu-${Date.now()}.webm`);
  setStatus('Finding the shape of your note…', 'We are extracting a suggestion; nothing is posted automatically.');
  try {
    const response = await fetch('/api/voice', { method: 'POST', body: form });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.message || 'We could not process that note.');
    showResult(data);
  } catch (error) { setStatus('We could not finish that note.', `${error.message} You can try again.`); }
  finally { setBusy(false); recordLabel.textContent = 'Tap to record'; }
}
function showResult(data) {
  document.querySelector('#transcript').textContent = `“${data.transcript}”`;
  document.querySelector('#intent').textContent = data.intent || 'Needs clarification';
  document.querySelector('#category').textContent = data.category || 'Needs clarification';
  document.querySelector('#availability').textContent = data.availability || 'Not mentioned';
  document.querySelector('#locality').textContent = data.locality?.label || 'Not mentioned';
  const clarification = document.querySelector('#clarification');
  if (data.clarification?.length) { clarification.hidden = false; clarification.innerHTML = `<strong>Before sharing, clarify:</strong> ${data.clarification.join(' ')}`; } else clarification.hidden = true;
  result.hidden = false; result.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
recordButton?.addEventListener('click', () => recorder?.state === 'recording' ? stopRecording() : startRecording());
document.querySelector('#try-again')?.addEventListener('click', () => { result.hidden = true; preview.hidden = true; setStatus('Ready when you are.', 'Tap the button and speak naturally.'); document.querySelector('#voice').scrollIntoView({ behavior: 'smooth' }); });
document.querySelector('#keep-private')?.addEventListener('click', () => { setStatus('Kept as a private draft.', 'Nothing has been posted. You can record another note whenever you like.'); result.hidden = true; document.querySelector('#voice').scrollIntoView({ behavior: 'smooth' }); });
document.querySelector('#workshop-button')?.addEventListener('click', async () => { const button = document.querySelector('#workshop-button'); button.disabled = true; button.textContent = 'Sandbox checkout coming soon'; try { const response = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ origin: window.location.origin }) }); const data = await response.json(); if (data.url) window.open(data.url, '_blank', 'noopener'); } catch {} finally { window.setTimeout(() => { button.disabled = false; button.textContent = 'View workshop'; }, 2500); } });
