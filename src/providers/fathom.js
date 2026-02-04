function cleanUrlInput(url) {
  let s = String(url || '').trim();
  if (!s) return '';

  // Provider parity: HTML copy/paste often escapes query separators.
  s = s.replace(/&amp;/gi, '&').replace(/&#0*38;/gi, '&');

  // Provider parity: accept angle-wrapped links (common in markdown/chat), including Slack-style <url|label>.
  const slack = s.match(/^<\s*([^|>\s]+)\s*\|[^>]*>$/i);
  if (slack) s = String(slack[1] || '').trim();
  const angle = s.match(/^<\s*([^>\s]+)\s*>$/i);
  if (angle) s = String(angle[1] || '').trim();

  // Provider parity: URLs pasted in chat are often wrapped in quotes.
  for (let i = 0; i < 2; i++) {
    const first = s.slice(0, 1);
    const last = s.slice(-1);
    // Standard quotes, backtick, and Unicode quotes (smart quotes, guillemets, angle quotes)
    const q = ['"', "'", '`', '\u201c', '\u201d', '\u2018', '\u2019', '\u00ab', '\u00bb', '\u2039', '\u203a'];
    let changed = false;
    if (q.includes(first)) {
      s = s.slice(1).trim();
      changed = true;
    }
    if (q.includes(last)) {
      s = s.slice(0, -1).trim();
      changed = true;
    }
    if (!changed) break;
  }

  // Strip lightweight trailing punctuation first so wrappers like "(https://...)\." can be unwrapped.
  for (let i = 0; i < 4; i++) {
    const stripped = s.replace(/[.,;:!?…。！，？。､、]+$/g, '').trim();
    if (stripped.length === s.length) break;
    s = stripped;
  }

  const unwrap = [
    [/^\((.*)[)）]$/, 1],
    [/^\[(.*)\]$/, 1],
    [/^\{(.*)\}$/, 1],
  ];
  for (const [re] of unwrap) {
    const m = s.match(re);
    if (m && m[1]) {
      s = String(m[1]).trim();
      break;
    }
  }

  // After unwrapping parentheses, re-handle angle-bracket wrappers.
  const slack2 = s.match(/^<\s*([^|>\s]+)\s*\|[^>]*>$/i);
  if (slack2) s = String(slack2[1] || '').trim();
  const angle2 = s.match(/^<\s*([^>\s]+)\s*>$/i);
  if (angle2) s = String(angle2[1] || '').trim();

  // Common copy/paste pattern: "https://... (Fathom)".
  s = s.replace(/\s+\([^)]*\)\s*$/g, '');

  for (let i = 0; i < 3; i++) {
    // Strip trailing punctuation including Unicode variants
    const stripped = s.replace(/[)\]>'"`\u201c\u201d\u2018\u2019\u00ab\u00bb\u2039\u203a.,;:!?…。！，？。､、）】〉》」』}]+$/g, '').trim();
    if (stripped.length === s.length) break;

    if (s.endsWith(')') && stripped.length < s.length) {
      const openCount = (stripped.match(/\(/g) || []).length;
      const closeCount = (stripped.match(/\)/g) || []).length;
      if (openCount > closeCount && s.slice(stripped.length).startsWith(')')) {
        s = (stripped + ')').trim();
        continue;
      }
    }

    s = stripped;
  }

  return s;
}

function withScheme(s) {
  const v = cleanUrlInput(s);
  if (!v) return '';

  // Accept protocol-relative URLs like "//fathom.video/share/...".
  if (v.startsWith('//')) return `https:${v}`;

  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}

export function extractFathomId(url) {
  const s0 = withScheme(url);
  if (!s0) return null;

  let u;
  try {
    u = new URL(s0);
  } catch {
    return null;
  }

  const host = u.hostname.replace(/^www\./i, '').toLowerCase();
  if (!/(^|\.)fathom\.video$/i.test(host)) return null;

  const parts = (u.pathname || '/')
    .split('/')
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length < 2) return null;

  const kind = String(parts[0] || '').toLowerCase();
  if (!['share', 'recording'].includes(kind)) return null;

  const id = String(parts[1] || '').trim();
  return /^[a-zA-Z0-9_-]+$/.test(id) ? id : null;
}

export function isFathomUrl(url) {
  return !!extractFathomId(url);
}

// Normalize common Fathom URL shapes to a canonical share URL.
// Provider parity: similar to Loom/YouTube/Vimeo normalization.
export function normalizeFathomUrl(url) {
  const s = withScheme(url);
  if (!s) return '';

  let u;
  try {
    u = new URL(s);
  } catch {
    return String(url || '').trim();
  }

  const host = u.hostname.replace(/^www\./i, '').toLowerCase();
  if (!/(^|\.)fathom\.video$/i.test(host)) return u.toString();

  const id = extractFathomId(u.toString());
  if (!id) return u.toString();

  // Canonical form: https://fathom.video/share/<id>
  const out = new URL(`https://fathom.video/share/${id}`);

  // Preserve deep-link timestamps if present.
  const t = u.searchParams.get('t') || u.searchParams.get('start') || '';
  if (t) out.searchParams.set('t', t);

  const hash = String(u.hash || '').replace(/^#/, '').trim();
  if (hash) {
    const hp = new URLSearchParams(hash);
    const ht = hp.get('t') || hp.get('start') || '';
    if (ht && !out.searchParams.get('t')) out.searchParams.set('t', ht);
  }

  return out.toString();
}

// Detect Fathom non-video pages and return actionable guidance.
// Provider parity: similar to loomNonVideoReason/youtubeNonVideoReason/vimeoNonVideoReason.
export function fathomNonVideoReason(url) {
  const s = withScheme(url);
  if (!s) return '';

  let u;
  try {
    u = new URL(s);
  } catch {
    return '';
  }

  const host = u.hostname.replace(/^www\./i, '').toLowerCase();
  if (!/(^|\.)fathom\.video$/i.test(host)) return '';

  // If it's a valid Fathom video URL, don't flag it.
  if (extractFathomId(s)) return '';

  const segs = (u.pathname || '/')
    .split('/')
    .map((x) => x.trim())
    .filter(Boolean);
  const first = String(segs[0] || '').toLowerCase();

  // Common non-video sections on Fathom.
  const nonVideo = new Set([
    '',
    'login',
    'logout',
    'signup',
    'sign-up',
    'pricing',
    'enterprise',
    'teams',
    'features',
    'integrations',
    'security',
    'careers',
    'blog',
    'help',
    'support',
    'settings',
    'terms',
    'privacy',
    'auth',
    'account',
    'dashboard',
    'admin',
    'api',
    'docs',
    'documentation',
  ]);

  if (nonVideo.has(first)) {
    return 'This Fathom URL does not appear to be a direct video link. Please provide a Fathom share URL like https://fathom.video/share/<id> instead.';
  }

  // Generic Fathom domain but not a recognized video path.
  return 'This Fathom URL does not appear to be a direct video link. Please provide a Fathom share URL like https://fathom.video/share/<id> instead.';
}

export function extractFathomTranscriptUrl(html) {
  const h = String(html || '');
  if (!h) return null;

  // JSON blobs in scripts often include: copyTranscriptUrl: "..."
  const m1 = h.match(/(?:["']?copyTranscriptUrl["']?)\s*[:=]\s*"(?<u>https?:\/\/[^"\s]+copy_transcript[^"\s]*)"/i);
  if (m1?.groups?.u) return String(m1.groups.u).replace(/\\u002F/gi, '/').replace(/\\\//g, '/');

  // Direct links
  const m2 = h.match(/href\s*=\s*"(?<u>https?:\/\/[^"\s]+copy_transcript[^"\s]*)"/i);
  if (m2?.groups?.u) return String(m2.groups.u).replace(/\\u002F/gi, '/').replace(/\\\//g, '/');

  return null;
}

// NOTE: full fathom extraction is implemented in src/extractor.js. This provider module
// keeps compatibility exports used by unit tests.
export async function extractFathom(url, page) {
  return { title: '', transcript: '', sourceUrl: url };
}
