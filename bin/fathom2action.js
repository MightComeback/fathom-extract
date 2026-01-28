#!/usr/bin/env node
import fs from 'node:fs';
import process from 'node:process';

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => (data += c));
    process.stdin.on('end', () => resolve(data));
  });
}

function usage(code = 0) {
  console.log(`fathom2action\n\nUsage:\n  fathom2action <fathom-url>\n  fathom2action --stdin\n\nOutput:\n  Prints a markdown bug brief template filled with extracted context (best effort).\n\nNotes:\n  MVP intentionally works even without API keys: if we can't fetch/parse the link, pipe transcript/notes via --stdin.\n`);
  process.exit(code);
}

function mkBrief({ source, content }) {
  const text = (content || '').trim();
  const lines = [];
  lines.push(`# Bug brief`);
  lines.push('');
  if (source) lines.push(`Source: ${source}`);
  lines.push('');
  lines.push('## Summary (1 sentence)');
  lines.push('');
  lines.push('- ');
  lines.push('');
  lines.push('## Repro steps');
  lines.push('');
  lines.push('1. ');
  lines.push('');
  lines.push('## Expected vs actual');
  lines.push('');
  lines.push('- Expected: ');
  lines.push('- Actual: ');
  lines.push('');
  lines.push('## Context / environment');
  lines.push('');
  lines.push('- Where (env/feature flag/build): ');
  lines.push('- Who saw it: ');
  lines.push('- When: ');
  lines.push('');
  lines.push('## Timestamps (if mentioned)');
  lines.push('');
  lines.push('- ');
  lines.push('');
  lines.push('## Notes / raw extract');
  lines.push('');
  lines.push('```');
  lines.push(text.slice(0, 4000));
  if (text.length > 4000) lines.push('\n…(truncated)…');
  lines.push('```');
  lines.push('');
  lines.push('## Next actions');
  lines.push('');
  lines.push('- [ ] Create Linear/GitHub issue');
  lines.push('- [ ] Assign owner');
  lines.push('- [ ] Add severity + scope');
  return lines.join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  if (!args.length || args.includes('-h') || args.includes('--help')) usage(0);

  if (args[0] === '--stdin') {
    const content = await readStdin();
    if (!content.trim()) {
      console.error('ERR: stdin is empty');
      process.exit(2);
    }
    console.log(mkBrief({ source: 'stdin', content }));
    return;
  }

  const url = args[0];
  // MVP: we don't fetch the URL yet (auth/cookies vary). We just print a template.
  console.log(mkBrief({ source: url, content: 'TODO: paste transcript/notes here (or run fathom2action --stdin and pipe content).' }));
}

main().catch((e) => {
  console.error(String(e?.stack || e));
  process.exit(1);
});
