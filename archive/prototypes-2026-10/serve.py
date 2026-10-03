# PROTOTYPE, throwaway. Static server for the landing variants.
# Sends no-store so the browser never reuses another project's cached pages on the same port,
# redirects /variants/<x>.html (another prototype's layout) to /variant-<x>.html,
# and rebuilds posts/index.json + feed.xml from posts/*.md on every request for them.
import http.server
import os
import re
import sys

import build_posts

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 4321
ROOT = os.path.dirname(os.path.abspath(__file__))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        # Rebuild the blog index on demand, so a new posts/*.md shows up on refresh.
        if self.path.split("?")[0] in ("/posts/index.json", "/feed.xml"):
            build_posts.write()
        m = re.match(r"^/variants/([a-dA-D])\.html(\?.*)?$", self.path)
        if m:
            self.send_response(302)
            self.send_header("Location", f"/variant-{m.group(1).lower()}.html{m.group(2) or ''}")
            self.end_headers()
            return
        super().do_GET()


http.server.ThreadingHTTPServer(("", PORT), Handler).serve_forever()
