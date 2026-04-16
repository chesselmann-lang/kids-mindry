export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-4">
            <svg viewBox="0 0 40 40" className="w-9 h-9 text-white" fill="none">
              <circle cx="20" cy="14" r="6" fill="currentColor" opacity="0.9"/>
              <circle cx="10" cy="24" r="5" fill="currentColor" opacity="0.7"/>
              <circle cx="30" cy="24" r="5" fill="currentColor" opacity="0.7"/>
              <path d="M6 36 Q20 28 34 36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">KitaHub</h1>
          <p className="text-brand-200 text-sm mt-1">kids.mindry.de</p>
        </div>
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
