"use client";

import { motion, useReducedMotion } from "motion/react";

export default function MotionButton({
  children,
  className,
  onClick,
  type = "button",
  disabled,
  ariaLabel,
  whileHoverScale = 1.0,
  whileTapScale = 0.98,
  ...rest
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        className={className}
        {...rest}
      >
        {children}
      </button>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={className}
      whileHover={{ scale: whileHoverScale }}
      whileTap={{ scale: whileTapScale }}
      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
