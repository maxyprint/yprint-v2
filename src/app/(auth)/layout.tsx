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
              src="https://yprint.de/wp-content/uploads/2024/10/y-icon.svg"
              alt="YPrint Logo"
              width={48}
              height={48}
              style={{ objectFit: 'contain' }}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement
                target.style.display = 'none'
                const next = target.nextElementSibling as HTMLElement
                if (next) next.style.display = 'block'
              }}
            />
            <span
              style={{
                display: 'none',
                fontSize: '32px',
                fontWeight: 800,
                color: '#3b82f6',
                letterSpacing: '-0.5px',
              }}
            >
              y
            </span>
          </a>
        </div>
        {children}
      </div>
    </div>
  )
}
