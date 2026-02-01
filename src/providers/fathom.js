import { JSDOM } from 'jsdom';

export function isFathomUrl(url) {
  const u = String(url || '').trim();
  if (!u) return false;
  
  // Basic check
  if (u.includes('fathom.video/')) return true;

  try {
    const parsed = new URL(u);
    return parsed.hostname.endsWith('fathom.video') || parsed.hostname === 'fathom.video';
  } catch {
    return false;
  }
}

export function extractFathomTranscriptUrl(html) {
  const s = String(html || '');
  
  // Fathom: copyTranscriptUrl in JSON state
  const m = s.match(/copyTranscriptUrl"\s*:\s*"([^"\s]+\/copy_transcript[^"\s]*)"/i);
  if (m && m[1]) return m[1];

  // Fathom: direct copy_transcript URL match
  const m2 = s.match(/https?:\/\/[^\s"'<>]+\/copy_transcript\b[^\s"'<>]*/i);
  if (m2 && m2[0]) return m2[0];

  return null;
}

export async function extractFathom(url, page) {
    // Navigate and wait for content to load
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    try {
        await page.waitForSelector('[data-testid="transcript-container"], video', { timeout: 15000 });
    } catch (e) {
        console.warn("Timed out waiting for transcript or video selector. Continuing with current DOM state.");
    }

    const content = await page.content();
    const dom = new JSDOM(content);
    const document = dom.window.document;

    const title = document.querySelector('h1')?.textContent?.trim() || 
                  document.title.replace(' | Fathom', '').trim() || 
                  'Fathom Recording';
    
    const date = document.querySelector('time')?.getAttribute('datetime') || 
                 new Date().toISOString();

    const transcriptBlocks = [];
    const transcriptContainer = document.querySelector('[data-testid="transcript-container"]') || 
                                document.querySelector('.transcript-content');
    
    if (transcriptContainer) {
      // Basic text extraction
      const textNodes = Array.from(transcriptContainer.querySelectorAll('p, div[role="listitem"]'));
      textNodes.forEach(node => {
          const text = node.textContent.trim();
          if (text) transcriptBlocks.push(text);
      });
    }

    let transcript = transcriptBlocks.join('\n\n');

    // Try enhanced extraction if basic failed or as augmentation
    if (!transcript) {
       const directUrl = extractFathomTranscriptUrl(content);
       if (directUrl) {
          try {
             console.log('Found direct transcript URL, attempting fetch:', directUrl);
             
             // Attempt to fetch via page context to leverage existing auth/session
             const fetchedTranscript = await page.evaluate(async (u) => {
                 try {
                     const r = await fetch(u);
                     if (!r.ok) return null;
                     return await r.text();
                 } catch (e) {
                     return null;
                 }
             }, directUrl);

             if (fetchedTranscript) {
                 transcript = fetchedTranscript;
             }
          } catch(e) {
              console.warn('Failed to fetch direct transcript via page context:', e);
          }
       }
    }

    let videoUrl = null;
    const videoEl = document.querySelector('video');
    if (videoEl) {
        videoUrl = videoEl.src || videoEl.querySelector('source')?.src;
    }

    return { title, date, transcript, videoUrl, sourceUrl: url };
}
