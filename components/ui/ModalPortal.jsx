"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { stopScroll, startScroll } from "../motion/SmoothScrollProvider";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Universal Modal Portal
 * - Mounts directly to document.body via createPortal (outside any page transforms/perspectives)
 * - Locks body scroll and pauses Lenis smooth scroll while open
 * - Supports ESC key closing and backdrop click closing
 * - Applies data-lenis-prevent so inner dialog scrolling is isolated
 */
export default function ModalPortal({
  isOpen = true,
  onClose,
  children,
  // NOTE: no backdrop-blur — blurring a fullscreen overlay is one of the most
  // expensive GPU ops on low-end mobile chips and caused visible lag.
  backdropClassName = "fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4",
  closeOnBackdrop = true,
  closeOnEsc = true,
  ariaLabel,
}) {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // Ref decouples the effect from inline onClose identities: previously every
  // parent render created a new onClose arrow -> effect teardown/setup ->
  // body overflow toggle + listener churn (flicker).
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen || !mounted) return;

    // Lock body scrolling and stop Lenis wheel interception
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    stopScroll();

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && closeOnEsc && onCloseRef.current) {
        e.preventDefault();
        onCloseRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      startScroll();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, mounted, closeOnEsc]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      className={backdropClassName}
      onClick={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <div data-lenis-prevent className="contents">
        {children}
      </div>
    </div>,
    document.body
  );
}
