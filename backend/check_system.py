"""
End-to-end health check for the TruthLens pipeline.

Run from backend/ with the API running:

    python check_system.py

Checks, in order:
  1. FastAPI is up
  2. Neo4j is reachable and how much is stored
  3. Which ingestion sources are configured
  4. RAG evidence store size
  5. Semantic claim index size
  6. A real claim through all four agents
  7. Whether any claim has a multi-outlet propagation chain

Exit code 0 if everything essential passed, 1 otherwise.
"""

import json
import sys
import urllib.error
import urllib.request

API = "http://127.0.0.1:8000"

PASS, FAIL, WARN = "[PASS]", "[FAIL]", "[WARN]"
failures = 0


def head(title):
    print(f"\n{'-' * 62}\n{title}\n{'-' * 62}")


def call(path, method="GET", timeout=180):
    req = urllib.request.Request(f"{API}{path}", method=method)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode())


def main():
    global failures

    # 1 - API reachable -----------------------------------------------------
    head("1. API")
    try:
        h = call("/health", timeout=10)
        print(f"  {PASS} FastAPI responding: {h.get('status')}")
    except Exception as e:
        print(f"  {FAIL} FastAPI not reachable at {API} ({e})")
        print("         Start it:  python -m uvicorn main:app --reload")
        return 1

    # 2 - Neo4j -------------------------------------------------------------
    head("2. Neo4j graph")
    try:
        from graph.neo4j_client import driver
        with driver.session() as s:
            claims = s.run("MATCH (c:Claim) RETURN count(c) AS n").single()["n"]
            sources = s.run("MATCH (x:Source) RETURN count(x) AS n").single()["n"]
            edges = s.run("MATCH (:Claim)-[r:REPORTED_BY]->(:Source) RETURN count(r) AS n").single()["n"]
            audit = s.run("MATCH (a:AuditEvent) RETURN count(a) AS n").single()["n"]
            reviews = s.run("MATCH (r:Review) RETURN count(r) AS n").single()["n"]
        print(f"  {PASS} Connected. claims={claims} sources={sources} "
              f"reported_by={edges} audit={audit} reviews={reviews}")
    except Exception as e:
        print(f"  {FAIL} Neo4j unreachable ({e})")
        failures += 1

    # 3 - Ingestion sources -------------------------------------------------
    head("3. Ingestion sources")
    try:
        for s in call("/api/sources", timeout=15)["sources"]:
            if s["configured"]:
                print(f"  {PASS} {s['id']:9} ready        ({s['label']})")
            elif s["live"]:
                print(f"  {WARN} {s['id']:9} needs keys   ({s['label']})")
            else:
                print(f"  {WARN} {s['id']:9} scaffold only({s['label']})")
    except Exception as e:
        print(f"  {FAIL} /api/sources failed ({e})")
        failures += 1

    # 4 - RAG evidence store ------------------------------------------------
    head("4. RAG evidence store")
    try:
        ev = call("/api/evidence", timeout=20)
        n = ev.get("count", 0)
        if n == 0:
            print(f"  {FAIL} empty - Agent 4 will always return 'no_evidence'")
            failures += 1
        elif n < 20:
            print(f"  {WARN} only {n} documents - Agent 4 will miss most real claims")
        else:
            print(f"  {PASS} {n} documents indexed")
    except Exception as e:
        print(f"  {FAIL} /api/evidence failed ({e})")
        failures += 1

    # 5 - Semantic claim index ---------------------------------------------
    head("5. Semantic claim index")
    try:
        from storage.claim_index import MAX_DISTANCE, index_size
        print(f"  {PASS} {index_size()} canonical claims tracked "
              f"(merge threshold {MAX_DISTANCE})")
    except Exception as e:
        print(f"  {FAIL} claim index unavailable ({e})")
        failures += 1

    # 6 - All four agents ---------------------------------------------------
    head("6. Four agents, one live claim")
    probe = ("A giant asteroid will secretly hit Earth next month "
             "and NASA is covering it up")
    try:
        res = call(f"/api/ingest?text={urllib.parse.quote(probe)}&source=rss", "POST")
        pr = res.get("pipeline_result", {})

        d_ok = pr.get("detection_status") is not None
        o_ok = pr.get("origin_status") is not None
        s_ok = pr.get("spread_status") is not None
        n_ok = pr.get("narrative_status") == "drafted"

        print(f"  {PASS if d_ok else FAIL} Agent 1 Detector   "
              f"misinfo={pr.get('is_misinformation')} conf={pr.get('detection_confidence')} "
              f"sev={pr.get('severity')} -> {pr.get('detection_status')}")
        print(f"  {PASS if o_ok else FAIL} Agent 2 Origin     "
              f"{pr.get('origin_status')}, outlets={pr.get('origin_outlet_count')}")
        print(f"  {PASS if s_ok else FAIL} Agent 3 Spread     "
              f"risk={pr.get('risk_score')} R0={pr.get('spread_r0')} "
              f"reach={pr.get('spread_current_reach')}")
        print(f"  {PASS if n_ok else WARN} Agent 4 Narrative  "
              f"{pr.get('narrative_status')}, "
              f"sources={len(json.loads(pr.get('rag_sources') or '[]'))}")
        if n_ok:
            print(f"         \"{(pr.get('narrative') or '')[:120]}...\"")
        else:
            print("         (no matching evidence in the RAG store for this claim)")

        failures += sum(1 for ok in (d_ok, o_ok, s_ok) if not ok)
    except Exception as e:
        print(f"  {FAIL} pipeline run failed ({e})")
        failures += 1

    # 7 - Propagation chains ------------------------------------------------
    head("7. Multi-outlet propagation")
    try:
        from graph.neo4j_client import driver
        with driver.session() as s:
            rec = s.run("""
                MATCH (c:Claim)-[:REPORTED_BY]->(x:Source)
                WITH c, count(x) AS outlets WHERE outlets > 1
                RETURN count(c) AS chains, max(outlets) AS biggest
            """).single()
        chains, biggest = rec["chains"], rec["biggest"]
        if chains:
            print(f"  {PASS} {chains} claim(s) carried by 2+ outlets (largest: {biggest})")
        else:
            print(f"  {WARN} no claim has 2+ outlets yet - Agent 2 chains and Agent 3")
            print("         velocity stay flat until the same claim is seen twice.")
            print("         Run a bulk ingest, then re-check.")
    except Exception as e:
        print(f"  {FAIL} chain query failed ({e})")
        failures += 1

    head("RESULT")
    if failures:
        print(f"  {failures} check(s) failed.")
        return 1
    print("  All essential checks passed.")
    return 0


if __name__ == "__main__":
    import urllib.parse  # noqa: E402  (used in main)
    sys.exit(main())
