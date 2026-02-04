import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';

export function parseSimpleVtt(text) {
  const s = String(text || '');
  if (!s.trim()) return '';

  // Extremely simple VTT -> plain text extractor.
  // Keep it deterministic for tests.
  const lines = s
    .replace(/\r/g, '')
    .split('\n')
    .map((l) => l.trimEnd());

  const out = [];
  let skipBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i] || '';
    const line = raw.trim();

    // Some VTT features include header blocks like:
    //   NOTE ...
    //   STYLE ...
    //   REGION ...
    // which can span multiple lines until the next blank line.
    if (!line) {
      if (skipBlock) skipBlock = false;
      continue;
    }

    if (skipBlock) continue;

    if (i === 0 && /^WEBVTT\b/i.test(line)) continue;

    // HLS/WebVTT metadata.
    if (/^X-TIMESTAMP-MAP=/i.test(line)) continue;

    // Block headers (skip until blank line).
    if (/^(?:NOTE|STYLE|REGION)\b/i.test(line)) {
      skipBlock = true;
      continue;
    }

    // Skip cue identifiers (a line of digits) if it's followed by a timing line.
    if (/^\d+$/.test(line) && i + 1 < lines.length && /-->/.test(lines[i + 1])) {
      continue;
    }

    // Skip timing lines.
    if (/-->/.test(line)) continue;

    // Many provider captions (YouTube/Vimeo/Loom) include lightweight markup in WebVTT.
    // Strip the most common tags to improve transcript quality.
    let cleaned = line.replace(/<[^>]+>/g, '');

    // Decode a small set of common HTML entities.
    // Keep this intentionally small + deterministic for tests.
    cleaned = cleaned
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      // Common punctuation entities show up in YouTube/Vimeo/Loom captions.
      // Keep this list small + deterministic for tests.
      .replace(/&mdash;/gi, '—')
      .replace(/&ndash;/gi, '–')
      .replace(/&hellip;/gi, '…')
      .replace(/&ldquo;/gi, '“')
      .replace(/&rdquo;/gi, '”')
      .replace(/&lsquo;/gi, '‘')
      .replace(/&rsquo;/gi, '’')
      // Directional/invisible marks sometimes appear in provider captions.
      // Strip them so downstream text heuristics don't get confused.
      .replace(/&lrm;/gi, '')
      .replace(/&rlm;/gi, '')
      // Apostrophes show up in provider transcripts in a few common encodings.
      .replace(/&apos;/gi, "'")
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/gi, "'");

    // Decode numeric HTML entities (e.g. &#8217; or &#x2019;) that are common in captions.
    cleaned = cleaned.replace(/&#(x?[0-9a-fA-F]+);?/g, (_m, raw) => {
      try {
        const isHex = String(raw).toLowerCase().startsWith('x');
        const n = Number.parseInt(isHex ? String(raw).slice(1) : String(raw), isHex ? 16 : 10);
        if (!Number.isFinite(n) || n < 0 || n > 0x10ffff) return _m;
        return String.fromCodePoint(n);
      } catch {
        return _m;
      }
    });

    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    if (cleaned) out.push(cleaned);
  }

  // Merge with spaces; this matches the unit test expectations.
  return out.join(' ').replace(/\s+/g, ' ').trim();
}

export async function downloadMedia(url, destPath) {
  const res = await fetch(String(url || ''));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  await fs.promises.mkdir(new URL('.', `file://${destPath}`).pathname, { recursive: true }).catch(() => {});

  const file = fs.createWriteStream(destPath);
  await pipeline(res.body, file);
  return destPath;
}
