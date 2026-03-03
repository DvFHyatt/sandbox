import './globals.css';
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA">
      <body>
        <main>
          <header style={{ marginBottom: 18 }}>
            <Link href="/home" style={{ textDecoration: 'none', color: '#1d1d1d' }}>
              <h1 style={{ margin: 0, fontSize: 24 }}>Learning & Development Tracker</h1>
            </Link>
            <p style={{ color: '#67635f', marginTop: 6 }}>Millat-Owned Hyatt Hotels · SAST (UTC+2)</p>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
