export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_24%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.1),transparent_20%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_56%,#dfeaf7_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-size-[48px_48px] opacity-[0.18]" />
      <div className="relative z-10 flex min-h-dvh items-center justify-center">
        {children}
      </div>
    </div>
  );
}