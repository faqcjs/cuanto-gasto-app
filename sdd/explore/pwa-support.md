## Exploration: PWA Support and Mobile Install Prompt

### Current State
The application is a React web app built with Vite, without current PWA capabilities. It serves an `index.html` referencing `vite.svg` but lacks a web app manifest and service worker. The app contains a main navigation layout (`Navbar.jsx`) and a settings view (`Settings.jsx`), which are potential locations for an install prompt.

### Affected Areas
- `public/manifest.json` — (New) To configure the PWA name, icons, colors, and display mode.
- `public/sw.js` (or integrated via `vite-plugin-pwa`) — (New) To cache assets and enable offline capability.
- `index.html` — To link the manifest and optionally register the service worker.
- `src/components/Settings.jsx` or `src/components/Navbar.jsx` — To add the UI logic to capture the `beforeinstallprompt` event and show an install button.

### Approaches
1. **Manual Implementation** — Add `manifest.json`, `sw.js`, and manual service worker registration in `index.html`. Add an install button in `Settings.jsx`.
   - Pros: Simple, full control over service worker logic.
   - Cons: Manual cache management can be error-prone.
   - Effort: Low

2. **Vite PWA Plugin (`vite-plugin-pwa`)** — Use the official Vite plugin to auto-generate the service worker and inject the manifest.
   - Pros: Follows Vite best practices, automatic asset caching, easy updates.
   - Cons: Adds a build dependency, requires slight config changes in `vite.config.js`.
   - Effort: Low/Medium

### Recommendation
**Approach 2: Vite PWA Plugin**. It integrates perfectly with the existing Vite build process, handles cache busting automatically, and simplifies service worker registration. The install prompt should be placed in `Settings.jsx` as a new section (e.g., "Instalar App") to avoid cluttering the main `Navbar.jsx`.

### Risks
- Caching stale assets if the service worker update strategy isn't configured correctly.
- Cross-browser compatibility with the `beforeinstallprompt` event (only works on Chromium-based browsers; iOS requires manual "Add to Home Screen" instructions).

### Ready for Proposal
Yes
