export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-5 box-border"
      style={{
        fontFamily: "'Inter', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
        backgroundColor: '#f3f4f6',
      }}
    >
      <div className="w-full flex flex-col items-center">
        {/* Logo above card */}
        <div className="mb-8 text-center">
          <a href="/" className="inline-block">
            <img
              src="/logo.png"
              alt="yprint Logo"
              width={100}
              height={40}
              style={{ objectFit: 'contain' }}
            />
          </a>
        </div>
        {children}
      </div>
    </div>
  )
}
