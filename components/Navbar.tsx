'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { dark, toggle } = useTheme();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) router.push(`/listings?q=${encodeURIComponent(search.trim())}`);
  }

  return (
    <nav className="sticky top-0 z-50 shadow-md" style={{ backgroundColor: '#163850' }}>
      {/* Top micro-bar */}
      <div className="text-xs py-1 text-center font-medium" style={{ backgroundColor: '#0e2535', color: '#B3EAF9' }}>
        Exclusively for <strong>@iitgn.ac.in</strong> community
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg" style={{ backgroundColor: '#079BD8', color: 'white' }}>
              B
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-white font-bold text-lg tracking-tight">Bazaar</span>
              <span className="text-xs font-medium" style={{ color: '#B3EAF9' }}>@IITGN</span>
            </div>
          </Link>

          {/* Search — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search listings, items, hostels..."
                className="w-full pl-10 pr-4 py-2 rounded-lg text-sm outline-none"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(179,234,249,0.3)' }}
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4" style={{ color: '#B3EAF9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          {/* Right — desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/listings" className="text-sm font-medium transition-colors" style={{ color: '#B3EAF9' }}>
              Browse
            </Link>

            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#B3EAF9' }}
            >
              {dark ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {session ? (
              <>
                <Link href="/listings/new" className="btn-primary text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Post Item
                </Link>

                {/* User avatar dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg transition-colors"
                    style={{ backgroundColor: userMenuOpen ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                  >
                    {session.user?.image ? (
                      <img src={session.user.image} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white" style={{ backgroundColor: '#079BD8' }}>
                        {session.user?.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <svg className="w-3 h-3" style={{ color: '#B3EAF9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-52 rounded-xl shadow-xl z-20 overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
                        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                          <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{session.user?.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-xs" style={{ color: '#9ca3af' }}>⭐ {session.user?.karmaScore ?? 10} Karma</span>
                          </div>
                        </div>
                        {[
                          { label: 'Dashboard', href: '/dashboard', icon: '📊' },
                          { label: 'My Listings', href: '/dashboard?tab=listings', icon: '📦' },
                          { label: 'My Offers', href: '/dashboard?tab=offers', icon: '🤝' },
                          { label: 'Watchlist', href: '/dashboard?tab=watchlist', icon: '⭐' },
                          { label: 'My Profile', href: `/profile/${session.user?.id}`, icon: '👤' },
                        ].map(({ label, href, icon }) => (
                          <Link
                            key={label}
                            href={href}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            <span>{icon}</span> {label}
                          </Link>
                        ))}
                        <div className="border-t" style={{ borderColor: 'var(--border)' }}>
                          <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors hover:bg-red-50"
                            style={{ color: '#dc2626' }}
                          >
                            <span>🚪</span> Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/listings/new" className="btn-primary text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Post Item
                </Link>
                <button
                  onClick={() => signIn('google')}
                  className="text-sm font-semibold px-4 py-2 rounded-lg border transition-colors"
                  style={{ color: 'white', borderColor: 'rgba(179,234,249,0.5)' }}
                >
                  Sign In
                </button>
              </>
            )}
          </div>

          {/* Hamburger — mobile */}
          <button className="md:hidden p-2 rounded-lg" style={{ color: '#B3EAF9' }} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t px-4 py-4 space-y-3" style={{ backgroundColor: '#0e2535', borderColor: 'rgba(179,234,249,0.2)' }}>
          <form onSubmit={handleSearch}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search listings..."
              className="w-full px-4 py-2 rounded-lg text-sm outline-none"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(179,234,249,0.3)' }}
            />
          </form>
          <Link href="/listings" className="block text-sm font-medium py-2" style={{ color: '#B3EAF9' }} onClick={() => setMenuOpen(false)}>Browse Listings</Link>
          <button
            onClick={toggle}
            className="flex items-center gap-2 text-sm font-medium py-2 w-full text-left"
            style={{ color: '#B3EAF9' }}
          >
            {dark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <Link href="/listings/new" className="block btn-primary text-sm w-full text-center justify-center" onClick={() => setMenuOpen(false)}>Post an Item</Link>

          {session ? (
            <>
              <Link href="/dashboard" className="block text-sm font-medium py-2" style={{ color: '#B3EAF9' }} onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={() => signOut({ callbackUrl: '/' })} className="block text-sm font-medium py-2 w-full text-left" style={{ color: '#fca5a5' }}>Sign Out</button>
            </>
          ) : (
            <button onClick={() => signIn('google')} className="block text-sm font-semibold py-2 text-center rounded-lg border w-full" style={{ color: 'white', borderColor: 'rgba(179,234,249,0.5)' }}>
              Sign In with IITGN
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
