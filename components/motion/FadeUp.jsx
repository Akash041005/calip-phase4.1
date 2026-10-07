"use client";

import { motion, useReducedMotion } from "motion/react";

export default function FadeUp({
  children,
  delay = 0,
  y = 8,
  duration = 0.4,
  className,
  as = "div",
}) {
  const reduced = useReducedMotion();

  const Component = motion[as] || motion.div;

  if (reduced) {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Component>
  );
}
