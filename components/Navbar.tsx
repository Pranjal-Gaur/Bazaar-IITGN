'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

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
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg"
              style={{ backgroundColor: '#079BD8', color: 'white' }}
            >
              B
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-white font-bold text-lg tracking-tight">Bazaar</span>
              <span className="text-xs font-medium" style={{ color: '#B3EAF9' }}>@IITGN</span>
            </div>
          </Link>

          {/* Center search — desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search listings, items, hostels..."
                className="w-full pl-10 pr-4 py-2 rounded-lg text-sm outline-none focus:ring-2"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '1px solid rgba(179,234,249,0.3)',
                }}
                onFocus={(e) => (e.target.style.backgroundColor = 'rgba(255,255,255,0.15)')}
                onBlur={(e) => (e.target.style.backgroundColor = 'rgba(255,255,255,0.1)')}
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4" style={{ color: '#B3EAF9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Right links — desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/listings" className="text-sm font-medium transition-colors" style={{ color: '#B3EAF9' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#B3EAF9')}
            >
              Browse
            </Link>
            <Link href="/listings/new" className="btn-primary text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Post Item
            </Link>
            <Link
              href="/auth/signin"
              className="text-sm font-semibold px-4 py-2 rounded-lg border transition-colors"
              style={{ color: 'white', borderColor: 'rgba(179,234,249,0.5)' }}
            >
              Sign In
            </Link>
          </div>

          {/* Hamburger — mobile */}
          <button
            className="md:hidden p-2 rounded-lg"
            style={{ color: '#B3EAF9' }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t px-4 py-4 space-y-3" style={{ backgroundColor: '#0e2535', borderColor: 'rgba(179,234,249,0.2)' }}>
          <input
            type="text"
            placeholder="Search listings..."
            className="w-full px-4 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(179,234,249,0.3)' }}
          />
          <Link href="/listings" className="block text-sm font-medium py-2" style={{ color: '#B3EAF9' }} onClick={() => setMenuOpen(false)}>
            Browse Listings
          </Link>
          <Link href="/listings/new" className="block btn-primary text-sm w-full text-center justify-center" onClick={() => setMenuOpen(false)}>
            Post an Item
          </Link>
          <Link href="/auth/signin" className="block text-sm font-semibold py-2 text-center rounded-lg border" style={{ color: 'white', borderColor: 'rgba(179,234,249,0.5)' }} onClick={() => setMenuOpen(false)}>
            Sign In with IITGN
          </Link>
        </div>
      )}
    </nav>
  );
}
