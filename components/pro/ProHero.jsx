export default function ProHero() {
  return (
    <section className="relative">
      <div className="pt-[20px]">
        <h1 className="text-[24px] font-semibold leading-none text-black dark:text-white">
          For Founders
        </h1>
        <p className="mt-[11px] text-[14px] leading-none text-[#4b5563] dark:text-[#9ca3af]">
          Latest startup funding, market trends, and AI-generated summaries.
        </p>
      </div>

      <svg
        className="absolute right-[68px] top-[240px]"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M15.8333 17.5L10 14.1667L4.16667 17.5V4.16667C4.16667 3.72464 4.34226 3.30072 4.65482 2.98816C4.96738 2.67559 5.39131 2.5 5.83333 2.5H14.1667C14.6087 2.5 15.0326 2.67559 15.3452 2.98816C15.6577 3.30072 15.8333 3.72464 15.8333 4.16667V17.5Z"
          stroke="#9CA3AF"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="mt-[60px] sm:mt-[80px] lg:mt-[117px] text-center">
        <h2 className="mx-auto max-w-[720px] w-full text-[28px] sm:text-[36px] lg:text-[48px] font-bold leading-[1.15] text-[#6051b4] dark:text-[#818cf8]">
          Unlock the full power of investing with upgrading to Calip Pro
        </h2>
        <p className="mx-auto mt-[30px] sm:mt-[40px] lg:mt-[55px] max-w-[520px] w-full text-[16px] sm:text-[18px] lg:text-[20px] font-bold leading-[1.35] text-[#4b5563] dark:text-[#b0b5bf]">
          Get AI-powered analysis, advanced portfolio analytics, and priority
          access to the best deals on Calip.
        </p>
      </div>
    </section>
  );
}
