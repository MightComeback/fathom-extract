import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractLoomTranscriptUrl } from '../src/providers/loom.js';

test('extractLoomTranscriptUrl: extracts VTT transcript URL from Apollo state', () => {
  const mockState = {
    'VideoTranscriptDetails:abc123': {
      captions_source_url: 'https://cdn.loom.com/transcript.vtt',
      source_url: 'https://cdn.loom.com/transcript.json'
    }
  };

  const html = `
    <html>
    <script>
    window.__APOLLO_STATE__ = ${JSON.stringify(mockState)};
    </script>
    </html>
  `;

  const url = extractLoomTranscriptUrl(html);
  assert.equal(url, 'https://cdn.loom.com/transcript.vtt');
});

test('extractLoomTranscriptUrl: prefers VTT over JSON when both present', () => {
  const mockState = {
    'VideoTranscriptDetails:def456': {
      captions_source_url: 'https://cdn.loom.com/captions.vtt?token=xyz',
      source_url: 'https://cdn.loom.com/source.json'
    }
  };

  const html = `<script>window.__APOLLO_STATE__ = ${JSON.stringify(mockState)};</script>`;
  const url = extractLoomTranscriptUrl(html);
  assert.ok(url?.includes('.vtt'));
  assert.ok(url?.includes('captions'));
});

test('extractLoomTranscriptUrl: falls back to source_url when no VTT', () => {
  const mockState = {
    'VideoTranscriptDetails:ghi789': {
      source_url: 'https://cdn.loom.com/transcript.json'
    }
  };

  const html = `<script>window.__APOLLO_STATE__ = ${JSON.stringify(mockState)};</script>`;
  const url = extractLoomTranscriptUrl(html);
  assert.equal(url, 'https://cdn.loom.com/transcript.json');
});

test('extractLoomTranscriptUrl: returns null when no transcript found', () => {
  const mockState = {
    'RegularUserVideo:123': {
      name: 'Video without transcript'
    }
  };

  const html = `<script>window.__APOLLO_STATE__ = ${JSON.stringify(mockState)};</script>`;
  const url = extractLoomTranscriptUrl(html);
  assert.equal(url, null);
});

test('extractLoomTranscriptUrl: handles protocol-relative URLs', () => {
  const mockState = {
    'VideoTranscriptDetails:jkl012': {
      captions_source_url: '//cdn.loom.com/transcript.vtt'
    }
  };

  const html = `<script>window.__APOLLO_STATE__ = ${JSON.stringify(mockState)};</script>`;
  const url = extractLoomTranscriptUrl(html);
  assert.equal(url, 'https://cdn.loom.com/transcript.vtt');
});

test('extractLoomTranscriptUrl: returns null for empty HTML', () => {
  assert.equal(extractLoomTranscriptUrl(''), null);
  assert.equal(extractLoomTranscriptUrl(null), null);
  assert.equal(extractLoomTranscriptUrl(undefined), null);
});

test('extractLoomTranscriptUrl: handles multiple VideoTranscriptDetails and picks first with URL', () => {
  const mockState = {
    'VideoTranscriptDetails:empty1': {},
    'VideoTranscriptDetails:valid': {
      captions_source_url: 'https://cdn.loom.com/valid.vtt'
    },
    'VideoTranscriptDetails:empty2': {}
  };

  const html = `<script>window.__APOLLO_STATE__ = ${JSON.stringify(mockState)};</script>`;
  const url = extractLoomTranscriptUrl(html);
  assert.equal(url, 'https://cdn.loom.com/valid.vtt');
});
