"use client";

// Page transitions intentionally disabled: the previous scale/opacity motion
// (AnimatePresence + willChange wrapper around the whole page) caused a
// visible blur/zoom flash on every navigation and forced the entire page onto
// a compositor layer, which lagged on low-end devices. This component is kept
// as a passthrough so existing imports in app/layout.jsx keep working.
export default function PageTransition({ children }) {
  return <>{children}</>;
}
