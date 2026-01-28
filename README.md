# fathom-extract (repo currently named `fathom2action`)

Single-purpose micro-tool:

- Input: a Fathom share/call URL (optionally with auth cookies)
- Output: **transcript + media URL**, and (when possible) a downloaded **video.mp4** split into ~5-minute segments (Gemini-ready).

## Important: not published to npm

This is a private/internal CLI repo. It is **not** published to npm.

You can run it from the repo, or `npm link` locally if you want the `fathom-extract` command on your PATH.

## Usage

### Extract transcript + video + 5-minute segments (recommended)

```bash
# cookie file → transcript + video.mp4 + 5-min segments
FATHOM_COOKIE_FILE=./cookie.txt \
  fathom-extract "https://fathom.video/share/..." \
  --out-dir ./artifacts \
  --pretty
```

Artifacts written under `--out-dir`:
- `transcript.txt`
- `extracted.json`
- `video.mp4` (if media is downloadable)
- `segments/segment_000.mp4`, `segment_001.mp4`, ...

### Transcript-only (skip video download)

```bash
fathom-extract "https://fathom.video/share/..." --no-download --pretty
```

### Segment size control

Default is 300 seconds. You can set it via env var or CLI:

```bash
export FATHOM_SPLIT_SECONDS=300

# or
fathom-extract "https://..." --split-seconds 300
```

### Cookies (auth-gated pages)

Cookie options:
- `--cookie "name=value; other=value"`
- `--cookie-file ./cookie.txt` (supports Netscape cookies.txt, one-per-line `name=value`, and JSON exports)
- env vars: `FATHOM_COOKIE` / `FATHOM_COOKIE_FILE`

## What this repo does NOT do

- No LLM processing.
- No “bug brief” generation.

That step belongs in **Aethlon** (Gemini over the extracted video + transcript).

## Next

Once we confirm extraction works on your real Fathom links end-to-end, we’ll integrate it into Aethlon + Canvas:
- detect Fathom links
- run `fathom-extract` to produce artifacts
- feed `segments/*.mp4` (and `transcript.txt`) to Gemini with your specific prompt
