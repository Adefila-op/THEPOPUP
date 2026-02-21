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

createRoot(document.getElementById("root")!).render(
  <MiniKitProvider>
    <App />
  </MiniKitProvider>
);
