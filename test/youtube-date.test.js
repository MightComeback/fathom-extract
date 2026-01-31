import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractYoutubeMetadataFromHtml } from '../src/providers/youtube.js';

test('extractYoutubeMetadataFromHtml: extracts date (publishDate)', () => {
  const mockData = {
    videoDetails: {
      title: 'Rick Astley - Never Gonna Give You Up',
      publishDate: '2009-10-25',
      uploadDate: '2009-10-25' // Sometimes it's here
    },
    microformat: {
        playerMicroformatRenderer: {
            publishDate: "2009-10-25",
            uploadDate: "2009-10-25"
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

  const meta = extractYoutubeMetadataFromHtml(html);
  assert.equal(meta.date, '2009-10-25');
});
