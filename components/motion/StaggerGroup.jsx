"use client";

import { motion, useReducedMotion } from "motion/react";

const easeOut = [0.22, 1, 0.36, 1];

export default function StaggerGroup({
  children,
  delay = 0.12,
  stagger = 0.06,
  className,
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, y = 10 }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.45, ease: easeOut },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
