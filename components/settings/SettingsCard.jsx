export default function SettingsCard({ className = "", children }) {
  return (
    <div
      className={`relative w-full rounded-2xl border border-white/[0.08] bg-[#111318] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.35)] ${className}`}
    >
      {children}
    </div>
  );
}
