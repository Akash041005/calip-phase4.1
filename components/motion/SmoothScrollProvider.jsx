"use client";

import { useEffect } from "react";
import Lenis from "lenis";

let lenisInstance = null;

export function getLenis() {
  return lenisInstance;
}

export function stopScroll() {
  if (lenisInstance) {
    lenisInstance.stop();
  }
}

export function startScroll() {
  if (lenisInstance) {
    lenisInstance.start();
  }
}

function shouldUseSmoothScroll() {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  // Data-saver users explicitly asked for less work — respect it.
  if (navigator.connection?.saveData) return false;
  // Touch phones/tablets scroll faster natively; Lenis's rAF loop + lerp
  // adds input latency and constant CPU/GPU work on weak hardware.
  if (window.matchMedia("(pointer: coarse)").matches) return false;
  if (window.matchMedia("(max-width: 768px)").matches) return false;
  // Low-RAM / few-core devices (Android Go, old phones, cheap laptops).
  const deviceMemory = navigator.deviceMemory;
  if (typeof deviceMemory === "number" && deviceMemory <= 4) return false;
  const cores = navigator.hardwareConcurrency;
  if (typeof cores === "number" && cores <= 4) return false;
  return true;
}

export default function SmoothScrollProvider({ children }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!shouldUseSmoothScroll()) return;

    const lenis = new Lenis({
      duration: 0.95,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 1.15,
      touchMultiplier: 1.1,
      lerp: 0.11,
    });

    lenisInstance = lenis;

    let rafId = 0;
    let running = true;
    function raf(time) {
      if (!running) return;
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    function startLoop() {
      if (running && rafId === 0) {
        rafId = requestAnimationFrame(raf);
      }
    }
    function stopLoop() {
      if (rafId !== 0) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    }
    startLoop();

    // Pause the rAF loop while the tab is hidden — otherwise it burns CPU in
    // the background and causes a scroll jump on return.
    const handleVisibility = () => {
      if (document.hidden) {
        stopLoop();
      } else {
        startLoop();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    document.documentElement.classList.add("lenis", "lenis-smooth");

    return () => {
      running = false;
      stopLoop();
      document.removeEventListener("visibilitychange", handleVisibility);
      document.documentElement.classList.remove("lenis", "lenis-smooth");
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return children;
}
