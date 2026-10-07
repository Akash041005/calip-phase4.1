export function CalipLogo() {
  return (
    <svg
      width="36"
      height="46"
      viewBox="0 0 36 46"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M18 0L36 11.5V34.5L18 46L0 34.5V11.5L18 0Z"
        fill="url(#calip-gradient)"
      />
      <path
        d="M18 8L28 14.5V27.5L18 34L8 27.5V14.5L18 8Z"
        fill="white"
        fillOpacity="0.35"
      />
      <defs>
        <linearGradient
          id="calip-gradient"
          x1="0"
          y1="0"
          x2="36"
          y2="46"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#A78BFA" />
          <stop offset="1" stopColor="#6366F1" />
        </linearGradient>
      </defs>
    </svg>
  );
}
