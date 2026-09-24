#!/usr/bin/env bash
# Boot both TruthLens processes inside one container.
#
# Hugging Face Spaces exposes a single port, so the Express adapter is the
# public face on 7860 and FastAPI stays on loopback. If either process dies the
# container exits, so the platform restarts the whole thing rather than leaving
# a half-running app that serves an offline banner.

set -euo pipefail

cd /app/backend

# ── 1. Start the API ─────────────────────────────────────────
echo "[start] launching FastAPI on 127.0.0.1:8000"
python -m uvicorn main:app --host 127.0.0.1 --port 8000 &
API_PID=$!

# ── 2. Wait for it to answer before letting traffic through ──
echo "[start] waiting for the API to become healthy"
for i in $(seq 1 90); do
  if curl -sf http://127.0.0.1:8000/health > /dev/null 2>&1; then
    echo "[start] API healthy after ${i}s"
    break
  fi
  if ! kill -0 "$API_PID" 2>/dev/null; then
    echo "[start] FATAL: the API exited during startup" >&2
    exit 1
  fi
  sleep 1
done

# ── 3. Seed the evidence corpus if it is empty ───────────────
# Without persistent storage the vector store is empty on every cold start,
# which would make the Narrative Drafter return no_evidence for everything.
# Seeding is best effort: a failure here must not stop the app from serving.
DOC_COUNT=$(python -c "
try:
    from storage.vector_store import count_documents
    print(count_documents())
except Exception:
    print(0)
" 2>/dev/null || echo 0)

echo "[start] evidence corpus holds ${DOC_COUNT} document(s)"

if [ "${DOC_COUNT}" -lt 10 ]; then
  echo "[start] corpus looks empty - seeding from fact-check feeds in the background"
  python -m storage.seed_evidence > /tmp/seed.log 2>&1 &
fi

# ── 4. Serve the client ──────────────────────────────────────
cd /app
echo "[start] launching the web client on 0.0.0.0:${PORT:-7860}"
node dist/server.cjs &
WEB_PID=$!

# Exit as soon as either process stops, so the platform can restart cleanly.
wait -n "$API_PID" "$WEB_PID"
echo "[start] a process exited; shutting the container down" >&2
exit 1
