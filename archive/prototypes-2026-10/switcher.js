/*
 * PROTOTYPE, throwaway. Floating bar that cycles landing variants.
 * Theme and language live in each variant's header (prefs.js), not here.
 * Each variant sets window.KUCH_VARIANT = { key: "A", name: "..." } before loading this file.
 * Never shown on the production domain.
 */
(function () {
  const VARIANTS = [
    { key: "A", file: "variant-a.html", name: "Agent runtime" },
    { key: "B", file: "variant-b.html", name: "Terminal OS" },
    { key: "C", file: "variant-c.html", name: "Editorial" },
    { key: "D", file: "variant-d.html", name: "Observability" },
    { key: "E", file: "variant-e.html", name: "Editorial + runtime" },
    { key: "F", file: "variant-f.html", name: "Runtime + editorial" },
  ];

  // Blog pages cycle between the blog versions instead (query like ?post= is kept).
  const BLOGS = [
    { key: "E", file: "blog-e.html", name: "Blog · Editorial + runtime" },
    { key: "F", file: "blog-f.html", name: "Blog · Runtime + editorial" },
  ];
  if (window.KUCH_VARIANT && window.KUCH_VARIANT.page === "blog") VARIANTS.splice(0, VARIANTS.length, ...BLOGS);

  const params = new URLSearchParams(location.search);
  const current = (window.KUCH_VARIANT && window.KUCH_VARIANT.key) || params.get("variant") || "A";
  const idx = Math.max(0, VARIANTS.findIndex((v) => v.key === current));

  function go(i) {
    const v = VARIANTS[(i + VARIANTS.length) % VARIANTS.length];
    const p = new URLSearchParams(location.search);
    p.set("variant", v.key);
    location.href = v.file + "?" + p.toString();
  }

  if (/(^|\.)kuch\.dev$/.test(location.hostname)) return;

  const bar = document.createElement("div");
  bar.setAttribute("data-prototype-switcher", "");
  bar.innerHTML = `
    <style>
      [data-prototype-switcher]{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:2147483647;
        display:flex;align-items:center;gap:4px;padding:6px;border-radius:999px;background:#fdbc16;color:#111;
        font:600 13px/1 ui-monospace,SFMono-Regular,Menlo,monospace;box-shadow:0 10px 30px rgba(0,0,0,.35),0 0 0 2px #111}
      [data-prototype-switcher] button{all:unset;cursor:pointer;padding:8px 11px;border-radius:999px}
      [data-prototype-switcher] button:hover{background:rgba(0,0,0,.12)}
      [data-prototype-switcher] button:focus-visible{outline:2px solid #111;outline-offset:1px}
      [data-prototype-switcher] .lbl{padding:0 8px;white-space:nowrap}
      @media print{[data-prototype-switcher]{display:none}}
    </style>
    <button data-act="prev" aria-label="Previous variant">←</button>
    <span class="lbl">${VARIANTS[idx].key} · ${VARIANTS[idx].name}</span>
    <button data-act="next" aria-label="Next variant">→</button>
  `;

  bar.addEventListener("click", (e) => {
    const act = e.target.closest("button")?.dataset.act;
    if (act === "prev") go(idx - 1);
    if (act === "next") go(idx + 1);
  });

  addEventListener("keydown", (e) => {
    const t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    if (t && t.closest && t.closest("[role=radiogroup]")) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (document.querySelector("dialog[open]")) return;
    if (e.key === "ArrowLeft") go(idx - 1);
    if (e.key === "ArrowRight") go(idx + 1);
  });

  const mount = () => document.body.appendChild(bar);
  document.body ? mount() : addEventListener("DOMContentLoaded", mount);
})();
