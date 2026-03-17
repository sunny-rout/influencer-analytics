import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';
import { Geist } from "next/font/google";
import Link from 'next/link';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'Influencer Analytics',
  description: 'Discover and analyze influencers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">

        {/* Navbar */}
        <nav style={{ borderBottom: '1px solid var(--border)' }}
          className="px-6 py-0 flex items-center h-14 gap-8 bg-background sticky top-0 z-50">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div style={{
              width: 28, height: 28,
              background: 'var(--brand-primary)',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"
                  fill="var(--brand-accent-yellow)" />
              </svg>
            </div>
            <span style={{
              fontWeight: 700,
              fontSize: 15,
              color: 'var(--brand-primary)',
              letterSpacing: '-0.01em',
            }}>
              Influx
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            <Link href="/search"
              className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors no-underline">
              Discover
            </Link>
            <Link href="/test-sync"
              className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors no-underline">
              Sync
            </Link>
          </div>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-3">
            <button style={{
              background: 'var(--brand-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}>
              Sign in
            </button>
          </div>
        </nav>

        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}