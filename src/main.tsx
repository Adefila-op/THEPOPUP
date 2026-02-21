import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { MiniKitProvider } from "./components/MiniKitProvider.tsx";

// Try to notify Farcaster frame that the miniapp is ready.
// This is a fallback in case index.html inline script is not preserved by the build.
;(async () => {
  try {
    const mod = await import('@farcaster/miniapp-sdk');
    if (mod?.sdk?.actions?.ready) {
      await mod.sdk.actions.ready();
    }
  } catch (e) {
    // not running inside Farcaster miniapp or module not available — ignore
  }
})();

// Initialize theme: default is dark (existing design). If the user has a stored
// preference of 'light' we enable the light theme by adding `html.light`.
(function initTheme() {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'light') {
      document.documentElement.classList.add('light');
    } else if (stored === 'dark') {
      document.documentElement.classList.remove('light');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      document.documentElement.classList.add('light');
    }
  } catch (e) {
    // ignore if storage not available
  }
})();

createRoot(document.getElementById("root")!).render(
  <MiniKitProvider>
    <App />
  </MiniKitProvider>
);
