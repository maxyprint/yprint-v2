import AppNav from '@/components/AppNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
        fontFamily: "'Inter', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <AppNav />
      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '30px 20px',
        }}
      >
        {children}
      </main>
    </div>
  )
}
