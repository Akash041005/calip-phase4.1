export const easeOut = [0.22, 1, 0.36, 1];

export const pageTransition = {
  initial: { opacity: 0, scale: 0.988, y: 6 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.988, y: -2 },
  transition: {
    duration: 0.32,
    ease: easeOut,
  },
};

export const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: easeOut },
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.06,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: easeOut },
  },
};

export const cardHover = {
  rest: { y: 0, scale: 1 },
  hover: { y: -2, scale: 1, transition: { duration: 0.2, ease: easeOut } },
};

export const buttonTap = {
  whileTap: { scale: 0.98 },
  transition: { duration: 0.12, ease: easeOut },
};
