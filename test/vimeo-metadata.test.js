import { test } from 'node:test';
import assert from 'node:assert';
import { extractVimeoMetadataFromHtml } from '../src/providers/vimeo.js';

test('extractVimeoMetadataFromHtml extracts metadata from clip_page_config', () => {
  const mockConfig = {
    clip: {
      name: 'Vimeo Test',
      duration: { raw: 120 },
      poster: { display_src: 'https://cdn.vimeo.com/poster.jpg' }
    },
    owner: {
      display_name: 'Vimeo User',
    },
    request: {
      files: {
        progressive: [
          { url: 'https://cdn.vimeo.com/video.mp4', width: 1920, quality: '1080p' },
          { url: 'https://cdn.vimeo.com/video-sm.mp4', width: 640, quality: '360p' }
        ]
      },
      text_tracks: [
        { url: 'https://cdn.vimeo.com/subs.vtt', lang: 'en' }
      ]
    }
  };
  
  const html = `
    <html>
      <script>
        window.vimeo = window.vimeo || {};
        window.vimeo.clip_page_config = ${JSON.stringify(mockConfig)};
      </script>
    </html>
  `;
  
  const result = extractVimeoMetadataFromHtml(html);
  
  assert.ok(result);
  assert.strictEqual(result.title, 'Vimeo Test');
  assert.strictEqual(result.duration, 120);
  assert.strictEqual(result.author, 'Vimeo User');
  assert.strictEqual(result.thumbnailUrl, 'https://cdn.vimeo.com/poster.jpg');
  assert.strictEqual(result.mediaUrl, 'https://cdn.vimeo.com/video.mp4'); // Should pick highest width
  assert.strictEqual(result.transcriptUrl, 'https://cdn.vimeo.com/subs.vtt');
});

test('extractVimeoMetadataFromHtml normalizes scheme-less and relative asset URLs', () => {
  const mockConfig = {
    clip: {
      name: 'Vimeo Test',
      duration: { raw: 120 },
      poster: { display_src: 'https://cdn.vimeo.com/poster.jpg' }
    },
    owner: {
      display_name: 'Vimeo User',
    },
    request: {
      files: {
        progressive: [
          { url: '//cdn.vimeo.com/video.mp4', width: 1920, quality: '1080p' },
        ]
      },
      text_tracks: [
        { url: '/texttrack/subs.vtt', lang: 'en' }
      ]
    }
  };

  const html = `
    <html>
      <script>
        window.vimeo = window.vimeo || {};
        window.vimeo.clip_page_config = ${JSON.stringify(mockConfig)};
      </script>
    </html>
  `;

  const result = extractVimeoMetadataFromHtml(html);
  assert.ok(result);
  assert.strictEqual(result.mediaUrl, 'https://cdn.vimeo.com/video.mp4');
  assert.strictEqual(result.transcriptUrl, 'https://vimeo.com/texttrack/subs.vtt');
});

test('extractVimeoMetadataFromHtml adds format=vtt to texttrack transcript endpoints when missing', () => {
  const mockConfig = {
    clip: { name: 'Vimeo TextTrack Endpoint', duration: { raw: 10 } },
    request: {
      text_tracks: [
        // Some pages expose captions via a /texttrack endpoint without an explicit format.
        { url: 'https://vimeo.com/texttrack/12345', lang: 'en', name: 'English' },
      ],
    },
  };

  const html = `
    <html>
      <script>
        window.vimeo = window.vimeo || {};
        window.vimeo.clip_page_config = ${JSON.stringify(mockConfig)};
      </script>
    </html>
  `;

  const result = extractVimeoMetadataFromHtml(html);
  assert.ok(result);
  assert.strictEqual(result.transcriptUrl, 'https://vimeo.com/texttrack/12345?format=vtt');
});

test('extractVimeoMetadataFromHtml handles protocol-relative texttrack URLs', () => {
  const mockConfig = {
    clip: { name: 'Vimeo TextTrack Protocol Relative', duration: { raw: 10 } },
    request: {
      text_tracks: [
        { url: '//vimeo.com/texttrack/12345', lang: 'en', name: 'English' },
      ],
    },
  };

  const html = `
    <html>
      <script>
        window.vimeo = window.vimeo || {};
        window.vimeo.clip_page_config = ${JSON.stringify(mockConfig)};
      </script>
    </html>
  `;

  const result = extractVimeoMetadataFromHtml(html);
  assert.ok(result);
  assert.strictEqual(result.transcriptUrl, 'https://vimeo.com/texttrack/12345?format=vtt');
});

test('extractVimeoMetadataFromHtml falls back to HLS manifest when progressive MP4 is missing', () => {
  const mockConfig = {
    clip: {
      name: 'Vimeo HLS Only',
      duration: { raw: 10 },
      poster: { display_src: 'https://cdn.vimeo.com/poster.jpg' },
    },
    request: {
      files: {
        hls: {
          default_cdn: 'fastly_skyfire',
          cdns: {
            fastly_skyfire: { url: 'https://cdn.vimeo.com/manifest.m3u8' },
          },
        },
      },
    },
  };

  const html = `
    <html>
      <script>
        window.vimeo = window.vimeo || {};
        window.vimeo.clip_page_config = ${JSON.stringify(mockConfig)};
      </script>
    </html>
  `;

  const result = extractVimeoMetadataFromHtml(html);
  assert.ok(result);
  assert.strictEqual(result.title, 'Vimeo HLS Only');
  assert.strictEqual(result.mediaUrl, 'https://cdn.vimeo.com/manifest.m3u8');
});

test('extractVimeoMetadataFromHtml prefers non-auto English VTT text tracks', () => {
  const mockConfig = {
    clip: {
      name: 'Vimeo Track Preference',
      duration: { raw: 10 },
    },
    request: {
      text_tracks: [
        { url: 'https://cdn.vimeo.com/subs-auto.vtt', lang: 'en', name: 'English (auto)' },
        { url: 'https://cdn.vimeo.com/subs.json', lang: 'en', name: 'English' },
        // Some Vimeo pages serve VTT via an endpoint with a format query param (no .vtt extension).
        { url: 'https://vimeo.com/texttrack/12345?format=vtt', lang: 'en', name: 'English' },
        { url: 'https://cdn.vimeo.com/subs.vtt', lang: 'en', name: 'English' },
        { url: 'https://cdn.vimeo.com/subs-es.vtt', lang: 'es', name: 'Español' },
      ],
    },
  };

  const html = `
    <html>
      <script>
        window.vimeo = window.vimeo || {};
        window.vimeo.clip_page_config = ${JSON.stringify(mockConfig)};
      </script>
    </html>
  `;

  const result = extractVimeoMetadataFromHtml(html);
  assert.ok(result);
  assert.strictEqual(result.transcriptUrl, 'https://cdn.vimeo.com/subs.vtt');
});

test('extractVimeoMetadataFromHtml returns null if config missing', () => {
  assert.strictEqual(extractVimeoMetadataFromHtml('<html></html>'), null);
});

test('extractVimeoMetadataFromHtml extracts date from LD+JSON (provider parity with Fathom)', () => {
  const mockConfig = {
    clip: {
      name: 'Vimeo with Date',
      duration: { raw: 120 },
      poster: { display_src: 'https://cdn.vimeo.com/poster.jpg' },
    },
    owner: {
      display_name: 'Vimeo User',
    },
    request: {
      files: {
        progressive: [
          { url: 'https://cdn.vimeo.com/video.mp4', width: 1920 },
        ]
      },
      text_tracks: [
        { url: 'https://cdn.vimeo.com/subs.vtt', lang: 'en' }
      ]
    }
  };

  const ldData = {
    '@type': 'VideoObject',
    uploadDate: '2024-02-15',
    datePublished: '2024-02-15',
  };

  const html = `
    <html>
      <script>
        window.vimeo = window.vimeo || {};
        window.vimeo.clip_page_config = ${JSON.stringify(mockConfig)};
      </script>
      <script type="application/ld+json">
        ${JSON.stringify(ldData)}
      </script>
    </html>
  `;

  const result = extractVimeoMetadataFromHtml(html);
  assert.ok(result);
  assert.strictEqual(result.date, '2024-02-15');
});

test('extractVimeoMetadataFromHtml prefers og:description over clip.description', () => {
  const mockConfig = {
    clip: {
      name: 'Vimeo',
      duration: { raw: 120 },
      poster: { display_src: 'https://cdn.vimeo.com/poster.jpg' },
      description: 'Config description',
    },
    owner: {
      display_name: 'Vimeo User',
    },
    request: {
      files: {
        progressive: [
          { url: 'https://cdn.vimeo.com/video.mp4', width: 1920 },
        ]
      },
    },
  };

  const html = `
    <html>
      <head>
        <meta property="og:description" content="OG description">
      </head>
      <script>
        window.vimeo = window.vimeo || {};
        window.vimeo.clip_page_config = ${JSON.stringify(mockConfig)};
      </script>
    </html>
  `;

  const result = extractVimeoMetadataFromHtml(html);
  assert.strictEqual(result.description, 'OG description');
});
