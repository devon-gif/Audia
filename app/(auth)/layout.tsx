export const metadata = {
  title: 'Authentication | Audia',
  description: 'Sign in to Audia - Your AI curator for long-form audio',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500/30 overflow-x-hidden relative flex items-center justify-center">
      {/* Subtle Deep Orange Radial Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-orange-600/10 rounded-full blur-[150px]" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full px-6">
        {children}
      </div>
    </div>
  );
}
