#!/usr/bin/env python3
"""setup_apps.py — create + install the two GitHub Apps that give the swarm real review identities.

WHY
---
The swarm acted as a single GitHub identity (vjeux's OAuth token) for everything: workers pushed
branches and opened PRs as vjeux, reviewers posted the faithfulness-gate status and merged as vjeux.
GitHub will not let an account review its own pull request, so reviewers could never use the real
review system — an ACCEPT was "merge it and leave a comment" and a REJECT was a red status plus a
comment. Nothing server-side distinguished a reviewed PR from an unreviewed one.

Two apps fix that at the identity layer:
  * WORKER app   — authors branches and pull requests.
  * REVIEWER app — posts the faithfulness-gate status, submits APPROVE / REQUEST_CHANGES reviews,
                   and merges. A different principal from the author, so GitHub accepts the review.

Creating a GitHub App cannot be done with an API token alone — it requires a signed-in browser.
This script uses GitHub's App Manifest flow to make that as close to zero-effort as possible: it
serves a page that POSTs a prepared manifest to GitHub, you click "Create GitHub App", and GitHub
redirects back here with a one-time code that this script exchanges for the app id, private key and
secrets automatically. You then click "Install" once per app; the script detects the installation
and writes the final config. No copy-pasting of keys.

USAGE
    python3 setup_apps.py                 # then open http://localhost:8765 and follow the two steps
    python3 setup_apps.py --port 9000
    python3 setup_apps.py --status        # show what is configured so far, then exit

Writes, per role, into $FCT_STATE_DIR/ghapp/ (default ~/.fct-pool/ghapp/):
    <role>.pem     the app private key, chmod 600  — TREAT AS A SECRET, it is not in git
    <role>.json    {app_id, installation_id, slug, private_key}
Both are consumed by app_token.sh. Nothing here is ever committed.
"""
import argparse, http.server, json, os, socketserver, subprocess, sys, threading, urllib.parse, urllib.request, webbrowser

POOL = os.environ.get("FCT_STATE_DIR", os.path.expanduser("~/.fct-pool"))
DIR = os.path.join(POOL, "ghapp")
REPO = os.environ.get("FCT_REPO", "vjeux/fcp-headless-transitions")
OWNER, REPO_NAME = REPO.split("/")
API = "https://api.github.com"

# Least privilege that still does the job.
#   worker   : push branches (contents), open PRs (pull_requests).
#   reviewer : post the faithfulness-gate commit status (statuses), submit reviews (pull_requests),
#              and merge (contents:write is what merging a PR requires).
PERMS = {
    "worker":   {"contents": "write", "pull_requests": "write", "metadata": "read"},
    "reviewer": {"contents": "write", "pull_requests": "write", "statuses": "write",
                 "checks": "write", "metadata": "read"},
}
DESC = {
    "worker":   "FCP raw-port swarm: authors port branches and pull requests.",
    "reviewer": "FCP raw-port swarm: posts the faithfulness-gate status, approves/rejects, merges.",
}

STATE = {"port": 8765, "login": None, "done": {}}


def gh_login():
    try:
        return subprocess.run(["gh", "api", "user", "-q", ".login"], capture_output=True,
                              text=True, timeout=30).stdout.strip() or "user"
    except Exception:
        return "user"


def cfg_path(role): return os.path.join(DIR, f"{role}.json")
def pem_path(role): return os.path.join(DIR, f"{role}.pem")


def load_cfg(role):
    try:
        with open(cfg_path(role)) as f: return json.load(f)
    except Exception:
        return None


def manifest(role):
    base = f"http://localhost:{STATE['port']}"
    return {
        "name": f"fcp-port-{role}-{STATE['login']}",   # app names are globally unique on GitHub
        "url": f"https://github.com/{REPO}",
        "description": DESC[role],
        "redirect_url": f"{base}/callback",
        "public": False,
        "default_permissions": PERMS[role],
        "default_events": [],
        # No webhook: the swarm polls its own disk-backed queues, so an inbound hook is dead weight
        # (and a laptop cannot receive one anyway).
        "hook_attributes": {"url": f"{base}/unused", "active": False},
    }


def api_json(url, data=None, headers=None, method=None):
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Accept", "application/vnd.github+json")
    for k, v in (headers or {}).items(): req.add_header(k, v)
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode())


def app_jwt(role):
    """Sign the app JWT with openssl (no PyJWT/cryptography on this box)."""
    import base64, time
    cfg = load_cfg(role)
    b64 = lambda b: base64.urlsafe_b64encode(b).rstrip(b"=")
    now = int(time.time())
    hdr = b64(json.dumps({"alg": "RS256", "typ": "JWT"}).encode())
    pay = b64(json.dumps({"iat": now - 60, "exp": now + 540, "iss": cfg["app_id"]}).encode())
    signing_input = hdr + b"." + pay
    p = subprocess.run(["openssl", "dgst", "-sha256", "-sign", cfg["private_key"]],
                       input=signing_input, capture_output=True)
    if p.returncode != 0:
        raise RuntimeError(f"openssl sign failed: {p.stderr.decode()[:200]}")
    return (signing_input + b"." + b64(p.stdout)).decode()


def find_installation(role):
    """After the user installs the app, look up its installation id for this repo."""
    jwt = app_jwt(role)
    try:
        inst = api_json(f"{API}/repos/{REPO}/installation", headers={"Authorization": f"Bearer {jwt}"})
        return inst.get("id")
    except Exception:
        return None


def save_installation(role, inst_id):
    cfg = load_cfg(role) or {}
    cfg["installation_id"] = inst_id
    with open(cfg_path(role), "w") as f: json.dump(cfg, f, indent=2)
    os.chmod(cfg_path(role), 0o600)


PAGE = """<!doctype html><meta charset=utf-8><title>FCP swarm — GitHub App setup</title>
<style>
 body{{font:15px/1.55 -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:760px;margin:44px auto;padding:0 18px;color:#1f2328}}
 h1{{font-size:22px}} h2{{font-size:17px;margin-top:30px}}
 .card{{border:1px solid #d0d7de;border-radius:8px;padding:16px 18px;margin:14px 0}}
 .ok{{color:#1a7f37;font-weight:600}} .todo{{color:#9a6700;font-weight:600}}
 a.btn{{display:inline-block;background:#1f883d;color:#fff;padding:9px 16px;border-radius:6px;
        text-decoration:none;font-weight:600;margin-top:8px}}
 a.btn.grey{{background:#6e7781}}
 code{{background:#f6f8fa;padding:2px 6px;border-radius:4px;font-size:13px}}
</style>
<h1>FCP raw-port swarm — GitHub App setup</h1>
<p>Two apps give the swarm separate identities, so reviewers can use GitHub's real
<b>Approve / Request changes</b> instead of leaving comments as the PR author.</p>
{body}
"""


def role_card(role):
    cfg = load_cfg(role)
    created = bool(cfg and cfg.get("app_id"))
    installed = bool(cfg and cfg.get("installation_id"))
    title = f"{role.capitalize()} app"
    if installed:
        return (f'<div class=card><h2>{title} <span class=ok>&#10003; ready</span></h2>'
                f'<p>App <code>{cfg.get("slug")}</code> (id {cfg["app_id"]}), '
                f'installation <code>{cfg["installation_id"]}</code>.</p></div>')
    if created:
        return (f'<div class=card><h2>{title} <span class=todo>step 2 of 2</span></h2>'
                f'<p>Created as <code>{cfg.get("slug")}</code>. Now install it on '
                f'<code>{REPO}</code> — choose <b>Only select repositories</b> and pick that repo.</p>'
                f'<a class=btn href="https://github.com/apps/{cfg.get("slug")}/installations/new" '
                f'target=_blank>Install {cfg.get("slug")}</a> '
                f'<a class=btn.grey href="/finish/{role}" style="background:#6e7781">'
                f'I installed it &rarr; finish</a></div>')
    return (f'<div class=card><h2>{title} <span class=todo>step 1 of 2</span></h2>'
            f'<p>Permissions: <code>{json.dumps(PERMS[role])}</code></p>'
            f'<a class=btn href="/create/{role}">Create {role} app</a></div>')


class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a): pass

    def _send(self, body, code=200, ctype="text/html; charset=utf-8"):
        b = body.encode()
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def do_GET(self):
        u = urllib.parse.urlparse(self.path)
        q = urllib.parse.parse_qs(u.query)

        if u.path == "/":
            body = role_card("worker") + role_card("reviewer")
            if load_cfg("worker") and load_cfg("reviewer") and \
               load_cfg("worker").get("installation_id") and load_cfg("reviewer").get("installation_id"):
                body += ('<div class=card><h2 class=ok>Both apps ready</h2>'
                         '<p>You can close this page and stop the script (Ctrl-C).</p></div>')
            return self._send(PAGE.format(body=body))

        if u.path.startswith("/create/"):
            role = u.path.rsplit("/", 1)[1]
            if role not in PERMS: return self._send("unknown role", 404)
            m = json.dumps(manifest(role))
            # GitHub's manifest flow: POST the manifest as a form field to /settings/apps/new.
            return self._send(
                "<!doctype html><meta charset=utf-8><body>"
                "<p>Redirecting to GitHub&hellip; click <b>Create GitHub App</b> there.</p>"
                f"<form id=f method=post action='https://github.com/settings/apps/new?state={role}'>"
                f"<input type=hidden name=manifest value='{m.replace(chr(39), '&#39;')}'>"
                "</form><script>document.getElementById('f').submit()</script></body>")

        if u.path == "/callback":
            code = (q.get("code") or [""])[0]
            role = (q.get("state") or [""])[0]
            if not code or role not in PERMS:
                return self._send(PAGE.format(body="<div class=card>Missing code/state.</div>"), 400)
            try:
                conv = api_json(f"{API}/app-manifests/{code}/conversions", data=b"", method="POST")
            except Exception as e:
                return self._send(PAGE.format(body=f"<div class=card>Conversion failed: {e}</div>"), 500)
            os.makedirs(DIR, exist_ok=True)
            pem = pem_path(role)
            fd = os.open(pem, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
            os.write(fd, conv["pem"].encode()); os.close(fd)
            cfg = {"app_id": conv["id"], "slug": conv["slug"], "private_key": pem,
                   "client_id": conv.get("client_id"), "installation_id": None}
            with open(cfg_path(role), "w") as f: json.dump(cfg, f, indent=2)
            os.chmod(cfg_path(role), 0o600)
            print(f"  [{role}] created app '{conv['slug']}' (id {conv['id']}), key -> {pem}")
            return self._send(PAGE.format(body=role_card(role) +
                              '<p><a href="/">&larr; back to both steps</a></p>'))

        if u.path.startswith("/finish/"):
            role = u.path.rsplit("/", 1)[1]
            if role not in PERMS: return self._send("unknown role", 404)
            inst = find_installation(role)
            if not inst:
                return self._send(PAGE.format(body=(
                    f'<div class=card><h2 class=todo>{role}: not installed yet</h2>'
                    f'<p>GitHub does not report an installation of this app on <code>{REPO}</code>. '
                    f'Install it, then click finish again.</p>'
                    f'<a class=btn href="https://github.com/apps/{(load_cfg(role) or {}).get("slug")}'
                    f'/installations/new" target=_blank>Install</a> '
                    f'<a class=btn href="/finish/{role}" style="background:#6e7781">Retry</a></div>')))
            save_installation(role, inst)
            print(f"  [{role}] installation id {inst} on {REPO}")
            return self._send(PAGE.format(body=role_card(role) + '<p><a href="/">&larr; back</a></p>'))

        return self._send("not found", 404)


def status():
    print(f"GitHub App config in {DIR} (repo {REPO}):")
    for role in ("worker", "reviewer"):
        c = load_cfg(role)
        if not c: print(f"  {role:<9} NOT CONFIGURED")
        elif not c.get("installation_id"):
            print(f"  {role:<9} app {c.get('slug')} created (id {c['app_id']}) — NOT INSTALLED")
        else:
            print(f"  {role:<9} READY  app={c.get('slug')} id={c['app_id']} installation={c['installation_id']}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=8765)
    ap.add_argument("--status", action="store_true")
    a = ap.parse_args()
    os.makedirs(DIR, exist_ok=True)
    if a.status: return status()
    STATE["port"] = a.port
    STATE["login"] = gh_login()
    socketserver.TCPServer.allow_reuse_address = True
    url = f"http://localhost:{a.port}/"
    with socketserver.TCPServer(("127.0.0.1", a.port), Handler) as srv:
        print(f"setup_apps: open {url}")
        print("  step 1: click 'Create <role> app'  -> GitHub shows a pre-filled creation page")
        print("  step 2: click 'Install'            -> pick ONLY the repo " + REPO)
        print("  repeat for both roles, then Ctrl-C here.\n")
        try: webbrowser.open(url)
        except Exception: pass
        try: srv.serve_forever()
        except KeyboardInterrupt: print("\nsetup_apps: stopped."); status()


if __name__ == "__main__":
    main()
