export default function SettingsCard({ className = "", children }) {
  return (
    <div
      className={`relative w-full rounded-[20px] border border-[#e5e7eb] dark:border-[#2a2e3e] bg-[#f4f5f7] dark:bg-[#181c28] ${className}`}
    >
      {children}
    </div>
  );
}
