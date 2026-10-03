/*
 * PROTOTYPE, throwaway. Theme (light / dark / system) and language (EN / PT) preferences,
 * plus a header control every variant mounts with KUCH_PREFS.mount(el).
 *
 * Load in <head> after content.js and after window.KUCH_VARIANT is set, so the theme
 * class lands before first paint.
 *
 * Priority for both settings: URL param, then localStorage, then the default
 * (variant default theme, English).
 *
 * Events on window:
 *   "kuch:theme"  detail = "light" | "dark"   (resolved theme, fired on every change)
 */
(function () {
  const THEME_KEY = "kuch:theme";
  const LANG_KEY = "kuch:lang";
  const PREFS = ["light", "dark", "system"];
  const root = document.documentElement;
  const media = matchMedia("(prefers-color-scheme: dark)");
  const params = new URLSearchParams(location.search);
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  };

  const variantDefault = (window.KUCH_VARIANT && window.KUCH_VARIANT.defaultTheme) || "system";
  let pref = [params.get("theme"), store.get(THEME_KEY), variantDefault].find((v) => PREFS.includes(v));
  const lang = (window.KUCH && window.KUCH.lang) || "en";
  // A language or theme given in the URL counts as a choice, so it survives navigation to pages without params.
  if (params.get("lang") === "en" || params.get("lang") === "pt") store.set(LANG_KEY, params.get("lang"));
  if (PREFS.includes(params.get("theme"))) store.set(THEME_KEY, params.get("theme"));

  const resolve = (p) => (p === "system" ? (media.matches ? "dark" : "light") : p);

  function apply() {
    const t = resolve(pref);
    root.classList.toggle("dark", t === "dark");
    root.dataset.theme = t;
    root.dataset.themePref = pref;
    root.style.colorScheme = t;
    return t;
  }

  let resolved = apply();

  function emit() {
    window.dispatchEvent(new CustomEvent("kuch:theme", { detail: resolved }));
    document.querySelectorAll("[data-kuch-controls]").forEach(sync);
  }

  media.addEventListener("change", () => {
    if (pref !== "system") return;
    resolved = apply();
    emit();
  });

  function setTheme(next) {
    if (!PREFS.includes(next) || next === pref) return;
    pref = next;
    store.set(THEME_KEY, pref);
    const p = new URLSearchParams(location.search);
    p.set("theme", pref);
    history.replaceState(null, "", location.pathname + "?" + p.toString() + location.hash);
    const before = resolved;
    const run = () => { resolved = apply(); };
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (document.startViewTransition && !reduce && resolve(pref) !== before) {
      document.startViewTransition(run).finished.finally(emit);
    } else {
      run();
      emit();
    }
  }

  function setLang(next) {
    if (next !== "en" && next !== "pt") return;
    store.set(LANG_KEY, next);
    if (next === lang) return;
    const p = new URLSearchParams(location.search);
    p.set("lang", next);
    location.href = location.pathname + "?" + p.toString() + location.hash;
  }

  const I18N = {
    en: { language: "Language", theme: "Theme", light: "Light", dark: "Dark", system: "System" },
    pt: { language: "Idioma", theme: "Tema", light: "Claro", dark: "Escuro", system: "Sistema" },
  }[lang];

  const ICON = {
    light: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>',
    dark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/></svg>',
    system: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
  };

  const CSS = `
    .kc{--kc-h:34px;--kc-pad:3px;--kc-fg:currentColor;--kc-muted:color-mix(in srgb,currentColor 60%,transparent);
      --kc-border:color-mix(in srgb,currentColor 16%,transparent);--kc-bg:color-mix(in srgb,currentColor 5%,transparent);
      --kc-active-bg:#fdbc16;--kc-active-fg:#1b202b;
      display:inline-flex;align-items:center;gap:6px;font:600 12px/1 Inter,ui-sans-serif,system-ui,sans-serif;color:var(--kc-fg);flex:none}
    .kc-group{position:relative;display:inline-flex;align-items:center;height:var(--kc-h);padding:var(--kc-pad);gap:2px;
      border:1px solid var(--kc-border);border-radius:999px;background:var(--kc-bg)}
    .kc button{all:unset;box-sizing:border-box;cursor:pointer;display:inline-grid;place-items:center;
      height:calc(var(--kc-h) - 2*var(--kc-pad) - 2px);min-width:calc(var(--kc-h) - 2*var(--kc-pad) - 2px);padding:0 8px;
      border-radius:999px;color:var(--kc-muted);letter-spacing:.04em;transition:background .2s,color .2s,transform .15s}
    .kc button:hover{color:var(--kc-fg);background:color-mix(in srgb,currentColor 8%,transparent)}
    .kc button:active{transform:scale(.94)}
    .kc button:focus-visible{outline:2px solid #fdbc16;outline-offset:2px}
    .kc button[aria-checked=true]{background:var(--kc-active-bg);color:var(--kc-active-fg)}
    .kc-theme button{padding:0}
    .kc svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
    .kc-sm{--kc-h:30px;font-size:11px}.kc-sm svg{width:14px;height:14px}
    @media (prefers-reduced-motion:reduce){.kc button{transition:none}}
    ::view-transition{pointer-events:none}
  `;
  let cssDone = false;
  function injectCss() {
    if (cssDone) return;
    cssDone = true;
    const s = document.createElement("style");
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function radio(group, value, label, html, checked) {
    return `<button type="button" role="radio" data-kc="${group}" data-v="${value}" aria-checked="${checked}" tabindex="${checked ? 0 : -1}" aria-label="${label}" title="${label}">${html}</button>`;
  }

  function sync(el) {
    el.querySelectorAll("button[data-kc]").forEach((b) => {
      const on = b.dataset.v === (b.dataset.kc === "theme" ? pref : lang);
      b.setAttribute("aria-checked", String(on));
      b.tabIndex = on ? 0 : -1;
    });
  }

  /*
   * mount(el, { parts: ["lang", "theme"], size: "md" | "sm" })
   * Renders the control inside `el`. Colors follow currentColor; override the --kc-* vars per variant.
   */
  function mount(el, opts) {
    if (!el) return null;
    injectCss();
    const o = Object.assign({ parts: ["lang", "theme"], size: "md" }, opts);
    const groups = [];
    if (o.parts.includes("lang")) {
      groups.push(`<div class="kc-group kc-lang" role="radiogroup" aria-label="${I18N.language}">
        ${radio("lang", "en", "English", "EN", lang === "en")}${radio("lang", "pt", "Português", "PT", lang === "pt")}</div>`);
    }
    if (o.parts.includes("theme")) {
      groups.push(`<div class="kc-group kc-theme" role="radiogroup" aria-label="${I18N.theme}">
        ${PREFS.map((p) => radio("theme", p, I18N[p], ICON[p], p === pref)).join("")}</div>`);
    }
    el.classList.add("kc");
    if (o.size === "sm") el.classList.add("kc-sm");
    el.setAttribute("data-kuch-controls", "");
    el.innerHTML = groups.join("");
    el.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-kc]");
      if (!b) return;
      if (b.dataset.kc === "theme") setTheme(b.dataset.v);
      if (b.dataset.kc === "lang") setLang(b.dataset.v);
    });
    // Arrow keys move between options inside a radiogroup.
    el.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const b = e.target.closest("button[data-kc]");
      if (!b) return;
      e.preventDefault();
      e.stopPropagation();
      const sibs = [...b.parentElement.querySelectorAll("button")];
      const i = sibs.indexOf(b) + (e.key === "ArrowRight" ? 1 : -1);
      const n = sibs[(i + sibs.length) % sibs.length];
      n.focus();
      n.click();
    });
    return el;
  }

  window.KUCH_PREFS = {
    get theme() { return pref; },
    get resolved() { return resolved; },
    lang,
    setTheme,
    setLang,
    cycleTheme: () => setTheme(PREFS[(PREFS.indexOf(pref) + 1) % PREFS.length]),
    toggleLang: () => setLang(lang === "pt" ? "en" : "pt"),
    mount,
  };
})();
