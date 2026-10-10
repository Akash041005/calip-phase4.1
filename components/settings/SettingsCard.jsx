export default function SettingsCard({ className = "", children }) {
  return (
    <div
      className={`relative w-full rounded-2xl border border-white/[0.08] bg-[#111723]/90 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
}
