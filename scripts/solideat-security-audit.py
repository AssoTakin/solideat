#!/usr/bin/env python3
"""
Security audit runner for Solideat.
Adapted from taka-security-audit skill for the Solideat project.

Usage:
    python3 scripts/solideat-security-audit.py
    python3 scripts/solideat-security-audit.py --json

It checks:
  - Hardcoded secrets in source files
  - Security headers on production URLs
  - Public endpoints health
  - Environment variable completeness
  - Git repository hygiene

Saves a JSON report to /tmp/solideat-security-audit-report.json.
"""
import argparse
import json
import os
import re
import subprocess
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path

PROJECT_NAME = "solideat"
REPO = "AssoTakin/solideat"
FRONTEND_URL = "https://solid-eat.com"
BACKEND_URL = "https://api.solid-eat.com"
VERCEL_PROJECT_ID = "prj_QPBgoDOlMaGlXQ5gnT02tvauaJJB"
PUBLIC_ENDPOINTS = [
    "/health",
    "/api/meals?limit=1",
]
REQUIRED_ENV_VARS = [
    "JWT_SECRET",
    "DATABASE_URL",
    "DIRECT_URL",
    "RESEND_API_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "FRONTEND_URL",
]
SECRET_PATTERNS = [
    re.compile(r"sk-(live|test)_[A-Za-z0-9]{24,}", re.IGNORECASE),
    re.compile(r"vcp_[A-Za-z0-9_]{40,}", re.IGNORECASE),
    re.compile(r"re_[A-Za-z0-9_]{20,}", re.IGNORECASE),
    re.compile(r"SG\.[A-Za-z0-9_\-]{20,}", re.IGNORECASE),
    re.compile(r"AC[a-f0-9]{32}", re.IGNORECASE),
    re.compile(r"postgresql://[^:]+:[^@]+@", re.IGNORECASE),
    re.compile(r"redis://:[^@]+@", re.IGNORECASE),
    re.compile(r"ai_[A-Za-z0-9_]{20,}", re.IGNORECASE),
    re.compile(r"[a-f0-9]{32,}", re.IGNORECASE),
]
ALLOWLIST = [
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "node_modules",
    "dist",
    "build",
    ".next",
    ".git",
    "skills-lock.json",
]


def is_likely_false_positive(line, match):
    """Heuristiques pour éviter les faux positifs courants."""
    stripped = line.strip().lower()
    # Lignes de commentaire explicites
    if stripped.startswith("#") or stripped.startswith("//"):
        if any(w in stripped for w in ["example", "pattern", "regex", "format", "placeholder"]):
            return True
    # Contenu du fichier audit lui-même
    if "solideat-security-audit.py" in stripped:
        return True
    # Documentation d'architecture avec URLs d'exemple
    if "postgresql://user:password" in line or "postgresql://postgres:password" in line:
        return True
    # Faux secrets documentaires typiques
    if re.search(r"RE_CLE_GENERE|RE_GENERATED_KEY|votre_token|your_token|example|placeholder", line, re.IGNORECASE):
        return True
    # Variables d'environnement référencées, pas des valeurs
    if re.search(r"process\.env\.[A-Z_]+", line) and match.group(0) not in line:
        return True
    return False


def run(cmd, cwd=None, capture=True, timeout=120):
    try:
        if capture:
            r = subprocess.run(
                cmd, shell=True, cwd=cwd, capture_output=True, text=True, timeout=timeout
            )
            return r.returncode, r.stdout, r.stderr
        else:
            return subprocess.run(cmd, shell=True, cwd=cwd, timeout=timeout).returncode, "", ""
    except subprocess.TimeoutExpired:
        return 1, "", "timeout"
    except Exception as e:
        return 1, "", str(e)


def http_get(url, headers=None, timeout=15):
    req = urllib.request.Request(url, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return {"ok": True, "status": r.status, "headers": dict(r.headers)}
    except urllib.error.HTTPError as e:
        return {"ok": False, "status": e.code, "headers": dict(e.headers)}
    except Exception as e:
        return {"ok": False, "status": 0, "headers": {}, "error": str(e)}


def scan_secrets(repo_dir):
    findings = []
    for root, dirs, files in os.walk(repo_dir):
        # Skip allowlisted dirs
        dirs[:] = [d for d in dirs if d not in ALLOWLIST]
        for filename in files:
            if filename in ALLOWLIST:
                continue
            ext = Path(filename).suffix.lower()
            if ext not in {
                ".ts",
                ".tsx",
                ".js",
                ".jsx",
                ".json",
                ".env",
                ".env.example",
                ".yml",
                ".yaml",
                ".md",
                ".sh",
                ".py",
            }:
                continue
            path = Path(root) / filename
            try:
                text = path.read_text(encoding="utf-8", errors="ignore")
            except Exception:
                continue
            lines = text.splitlines()
            for lineno, line in enumerate(lines, start=1):
                for pattern in SECRET_PATTERNS:
                    for match in pattern.finditer(line):
                        if is_likely_false_positive(line, match):
                            continue
                        findings.append(
                            {
                                "file": str(path.relative_to(repo_dir)),
                                "line": lineno,
                                "snippet": line.strip()[:120],
                                "matched": match.group(0)[:20],
                            }
                        )
    return findings


def check_security_headers(url):
    r = http_get(url)
    if not r["ok"]:
        return {"error": f"HTTP {r['status']}", "headers": r.get("headers", {})}
    h = r["headers"]
    required = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": re.compile(r"DENY|SAMEORIGIN"),
        "Referrer-Policy": re.compile(r"strict-origin|same-origin|no-referrer"),
        "Content-Security-Policy": re.compile(r"."),
    }
    findings = {}
    for key, expected in required.items():
        val = h.get(key, "")
        if isinstance(expected, re.Pattern):
            findings[key] = bool(expected.search(val))
        else:
            findings[key] = expected.lower() in val.lower()
    return findings


def check_public_endpoints(base_url, endpoints):
    results = []
    for ep in endpoints:
        url = f"{base_url}{ep}"
        r = http_get(url)
        results.append({"endpoint": ep, "status": r["status"], "ok": r["ok"]})
    return results


def check_env_variables():
    missing = []
    for var in REQUIRED_ENV_VARS:
        if not os.environ.get(var):
            missing.append(var)
    return missing


def check_git_hygiene(repo_dir):
    findings = {}
    rc, out, _ = run("git log --all --full-history --source -p -S 'sk_live_' | head -50", cwd=repo_dir)
    findings["sk_live_in_history"] = rc == 0 and bool(out.strip())
    rc, out, _ = run("git log --all --full-history --source -p -S 'vcp_' | head -50", cwd=repo_dir)
    findings["vercel_token_in_history"] = rc == 0 and bool(out.strip())
    return findings


def audit_solideat():
    repo_dir = Path(__file__).resolve().parents[1]
    report = {
        "project": PROJECT_NAME,
        "repo": REPO,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    print(f"\n{'='*60}")
    print(f"Security audit: {PROJECT_NAME}")
    print(f"{'='*60}")

    # 1. Secret scan
    print("\n🔍 Scanning source files for secrets...")
    secret_findings = scan_secrets(repo_dir)
    if secret_findings:
        print(f"⚠️  {len(secret_findings)} potential secret(s) found")
        for f in secret_findings[:10]:
            print(f"   {f['file']}:{f['line']} → {f['matched']}...")
    else:
        print("✅ No obvious secrets found in source files")
    report["secret_scan"] = {
        "count": len(secret_findings),
        "findings": secret_findings,
    }

    # 2. Security headers
    print("\n🛡️  Checking security headers...")
    frontend_headers = check_security_headers(FRONTEND_URL)
    backend_headers = check_security_headers(BACKEND_URL)
    report["security_headers"] = {
        "frontend": frontend_headers,
        "backend": backend_headers,
    }
    for name, headers in [("Frontend", frontend_headers), ("Backend", backend_headers)]:
        print(f"\n   {name} ({FRONTEND_URL if name == 'Frontend' else BACKEND_URL}):")
        if "error" in headers:
            print(f"   ❌ {headers['error']}")
            continue
        for k, v in headers.items():
            icon = "✅" if v else "❌"
            print(f"   {icon} {k}")

    # 3. Public endpoints
    print("\n🌐 Checking public endpoints...")
    endpoints = check_public_endpoints(BACKEND_URL, PUBLIC_ENDPOINTS)
    for ep in endpoints:
        icon = "✅" if ep["ok"] else "❌"
        print(f"   {icon} {ep['endpoint']} → HTTP {ep['status']}")
    report["public_endpoints"] = endpoints

    # 4. Environment variables
    print("\n🔐 Checking environment variables...")
    missing_env = check_env_variables()
    if missing_env:
        print(f"   ❌ Missing env vars: {', '.join(missing_env)}")
    else:
        print("   ✅ All required env vars are present in this environment")
    report["missing_env_vars"] = missing_env

    # 5. Git hygiene
    print("\n🌿 Checking git history...")
    git_hygiene = check_git_hygiene(repo_dir)
    for k, v in git_hygiene.items():
        icon = "❌" if v else "✅"
        print(f"   {icon} {k}")
    report["git_hygiene"] = git_hygiene

    # Save report
    report_path = f"/tmp/{PROJECT_NAME}-security-audit-report.json"
    Path(report_path).write_text(json.dumps(report, indent=2))
    print(f"\n📄 Report saved to {report_path}")

    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Solideat security audit runner")
    parser.add_argument("--json", action="store_true", help="Output report as JSON to stdout")
    args = parser.parse_args()

    report = audit_solideat()
    if args.json:
        print(json.dumps(report, indent=2))

    # Exit non-zero if critical issues found
    if report["secret_scan"]["count"] > 0 or any(not ep["ok"] for ep in report["public_endpoints"]):
        sys.exit(1)
    sys.exit(0)
