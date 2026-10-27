import test from 'node:test';
import assert from 'node:assert/strict';
import { validateExtraction } from '../src/voice/extract.mjs';

test('incomplete voice extraction asks for missing intent, category, and locality', () => {
  const result = validateExtraction({ intent: null, category: null, availability: 'evenings', locality: null, clarification: [] });
  assert.equal(result.intent, null);
  assert.match(result.clarification.join(' '), /offer or a request/);
  assert.match(result.clarification.join(' '), /kind of help/);
  assert.match(result.clarification.join(' '), /neighborhood or locality/);
});

test('valid extraction preserves the bounded fields', () => {
  const result = validateExtraction({ intent: 'offer', category: 'tailoring', availability: 'weekends', locality: 'Sector 62, Noida', clarification: [] });
  assert.deepEqual(result, { intent: 'offer', category: 'tailoring', availability: 'weekends', locality: 'Sector 62, Noida', clarification: [] });
});
