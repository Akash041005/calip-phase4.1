export default function SettingsCard({ className = "", children }) {
  return (
    <div
      className={`relative w-full rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#111318] transition-colors ${className}`}
    >
      {children}
    </div>
  );
}
