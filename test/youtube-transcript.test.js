import test from 'node:test';
import assert from 'node:assert/strict';

import { extractYoutubeTranscriptUrl, extractYoutubeMetadataFromHtml } from '../src/providers/youtube.js';

// Provider parity: extractYoutubeTranscriptUrl tests (matches Fathom/Loom coverage)
test('extractYoutubeTranscriptUrl extracts English manual captions from ytInitialPlayerResponse', () => {
  const mockData = {
    videoDetails: { title: 'Test' },
    captions: {
      playerCaptionsTracklistRenderer: {
        captionTracks: [
          { languageCode: 'es', baseUrl: 'https://youtube.com/api/timedtext?fmt=vtt&lang=es' },
          { languageCode: 'en', baseUrl: 'https://youtube.com/api/timedtext?fmt=vtt&lang=en', kind: 'standard' },
          { languageCode: 'en', baseUrl: 'https://youtube.com/api/timedtext?fmt=vtt&lang=en&kind=asr', kind: 'asr' }
        ]
      }
    }
  };

  const html = `
    <html>
      <script>
        var ytInitialPlayerResponse = ${JSON.stringify(mockData)};
      </script>
    </html>
  `;

  const url = extractYoutubeTranscriptUrl(html);
  // Should prefer English manual over English ASR
  assert.ok(url?.includes('lang=en'));
  assert.ok(!url?.includes('kind=asr'));
});

test('extractYoutubeTranscriptUrl falls back to English ASR when no manual captions', () => {
  const mockData = {
    videoDetails: { title: 'Test' },
    captions: {
      playerCaptionsTracklistRenderer: {
        captionTracks: [
          { languageCode: 'es', baseUrl: 'https://youtube.com/api/timedtext?fmt=vtt&lang=es' },
          { languageCode: 'en', baseUrl: 'https://youtube.com/api/timedtext?fmt=vtt&lang=en&kind=asr', kind: 'asr' }
        ]
      }
    }
  };

  const html = `
    <html>
      <script>
        var ytInitialPlayerResponse = ${JSON.stringify(mockData)};
      </script>
    </html>
  `;

  const url = extractYoutubeTranscriptUrl(html);
  assert.ok(url?.includes('lang=en'));
  assert.ok(url?.includes('kind=asr'));
});

test('extractYoutubeTranscriptUrl forces fmt=vtt when missing', () => {
  const mockData = {
    videoDetails: { title: 'Test' },
    captions: {
      playerCaptionsTracklistRenderer: {
        captionTracks: [
          { languageCode: 'en', baseUrl: 'https://youtube.com/api/timedtext?lang=en' }
        ]
      }
    }
  };

  const html = `
    <html>
      <script>
        var ytInitialPlayerResponse = ${JSON.stringify(mockData)};
      </script>
    </html>
  `;

  const url = extractYoutubeTranscriptUrl(html);
  assert.ok(url?.includes('fmt=vtt'));
});

test('extractYoutubeTranscriptUrl returns first track when no English available', () => {
  const mockData = {
    videoDetails: { title: 'Test' },
    captions: {
      playerCaptionsTracklistRenderer: {
        captionTracks: [
          { languageCode: 'es', baseUrl: 'https://youtube.com/api/timedtext?fmt=vtt&lang=es' },
          { languageCode: 'fr', baseUrl: 'https://youtube.com/api/timedtext?fmt=vtt&lang=fr' }
        ]
      }
    }
  };

  const html = `
    <html>
      <script>
        var ytInitialPlayerResponse = ${JSON.stringify(mockData)};
      </script>
    </html>
  `;

  const url = extractYoutubeTranscriptUrl(html);
  // Should return first available track
  assert.ok(url?.includes('lang=es'));
});

test('extractYoutubeTranscriptUrl returns null when no captions available', () => {
  const mockData = {
    videoDetails: { title: 'Test' }
    // No captions field
  };

  const html = `
    <html>
      <script>
        var ytInitialPlayerResponse = ${JSON.stringify(mockData)};
      </script>
    </html>
  `;

  const url = extractYoutubeTranscriptUrl(html);
  assert.equal(url, null);
});

test('extractYoutubeTranscriptUrl returns null for empty captionTracks', () => {
  const mockData = {
    videoDetails: { title: 'Test' },
    captions: {
      playerCaptionsTracklistRenderer: {
        captionTracks: []
      }
    }
  };

  const html = `
    <html>
      <script>
        var ytInitialPlayerResponse = ${JSON.stringify(mockData)};
      </script>
    </html>
  `;

  const url = extractYoutubeTranscriptUrl(html);
  assert.equal(url, null);
});

test('extractYoutubeTranscriptUrl returns null for invalid HTML', () => {
  assert.equal(extractYoutubeTranscriptUrl(''), null);
  assert.equal(extractYoutubeTranscriptUrl('<html>no player response</html>'), null);
});

test('extractYoutubeTranscriptUrl extracts via window["ytInitialPlayerResponse"]', () => {
  const mockData = {
    videoDetails: { title: 'Test' },
    captions: {
      playerCaptionsTracklistRenderer: {
        captionTracks: [
          { languageCode: 'en', baseUrl: 'https://youtube.com/api/timedtext?fmt=vtt&lang=en' }
        ]
      }
    }
  };

  const html = `
    <html>
      <script>
        window["ytInitialPlayerResponse"] = ${JSON.stringify(mockData)};
      </script>
    </html>
  `;

  const url = extractYoutubeTranscriptUrl(html);
  assert.ok(url?.includes('lang=en'));
});

test('extractYoutubeTranscriptUrl extracts via window[\'ytInitialPlayerResponse\']', () => {
  const mockData = {
    videoDetails: { title: 'Test' },
    captions: {
      playerCaptionsTracklistRenderer: {
        captionTracks: [
          { languageCode: 'en', baseUrl: 'https://youtube.com/api/timedtext?fmt=vtt&lang=en' }
        ]
      }
    }
  };

  const html = `
    <html>
      <script>
        window['ytInitialPlayerResponse'] = ${JSON.stringify(mockData)};
      </script>
    </html>
  `;

  const url = extractYoutubeTranscriptUrl(html);
  assert.ok(url?.includes('lang=en'));
});
