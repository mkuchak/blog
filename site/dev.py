"""
Local preview of the built site: python3 site/dev.py [port]   (default 4321)

Rebuilds dist/ whenever anything in site/ changes, serves it like Cloudflare Pages
would (directory index.html, 404.html, the simple _redirects rules), and disables caching.
"""

import http.server
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build  # noqa: E402

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 4321
_stamp = None


def source_stamp():
    latest = 0
    for root, _, files in os.walk(build.SITE):
        if "__pycache__" in root:
            continue
        for f in files:
            latest = max(latest, os.path.getmtime(os.path.join(root, f)))
    return latest


def ensure_built():
    global _stamp
    stamp = source_stamp()
    if stamp != _stamp:
        import importlib
        importlib.reload(build)
        build.build()
        _stamp = stamp


def redirect_for(path):
    rules = []
    for line in open(os.path.join(build.DIST, "_redirects"), encoding="utf-8"):
        parts = line.split()
        if len(parts) == 3 and not line.startswith("#"):
            rules.append(parts)
    for src, dst, code in rules:
        pattern = "^" + re.sub(r":(\w+)", r"(?P<\1>[^/]+)", re.escape(src).replace("\\:", ":")) + "$"
        m = re.match(pattern, path)
        if m:
            out = dst
            for k, v in m.groupdict().items():
                out = out.replace(":" + k, v)
            return out, int(code)
    return None


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=build.DIST, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        ensure_built()
        path = self.path.split("?")[0]
        hit = redirect_for(path)
        if hit:
            self.send_response(hit[1])
            self.send_header("Location", hit[0])
            self.end_headers()
            return
        super().do_GET()

    def send_error(self, code, message=None, explain=None):
        page = os.path.join(build.DIST, "404.html")
        if code == 404 and os.path.exists(page):
            body = open(page, "rb").read()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().send_error(code, message, explain)


if __name__ == "__main__":
    ensure_built()
    print(f"kuch.dev preview on http://localhost:{PORT}/  (official version: {build.OFFICIAL})", file=sys.stderr)
    http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
