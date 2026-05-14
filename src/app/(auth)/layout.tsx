export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-5 box-border"
      style={{
        fontFamily: "'Inter', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
        background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 50%, #f3f4f6 100%)',
      }}
    >
      <div className="w-full flex flex-col items-center">
        {/* Logo above card */}
        <div className="mb-8 text-center">
          <a href="/" className="inline-block">
            <img
              src="/designer/img/y-icon.svg"
              alt="YPrint Logo"
              width={48}
              height={48}
              style={{ objectFit: 'contain' }}
            />
          </a>
        </div>
        {children}
      </div>
    </div>
  )
}
