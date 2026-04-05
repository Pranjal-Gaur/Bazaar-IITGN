'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Hero() {
  const [stats, setStats] = useState({ activeListings: 0, communityMembers: 0, successfulTrades: 0, avgSavings: 0 });

  useEffect(() => {
    fetch('/api/stats').then((r) => r.json()).then(setStats).catch(() => {});
  }, []);

  const STATS = [
    { label: 'Active Listings', value: stats.activeListings > 0 ? `${stats.activeListings}` : '—' },
    { label: 'Community Members', value: stats.communityMembers > 0 ? `${stats.communityMembers}` : '—' },
    { label: 'Successful Trades', value: stats.successfulTrades > 0 ? `${stats.successfulTrades}` : '—' },
    { label: 'Avg. Savings', value: stats.avgSavings > 0 ? `${stats.avgSavings}%` : '—' },
  ];
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #163850 0%, #045F82 50%, #079BD8 100%)',
        minHeight: '480px',
      }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-10"
        style={{ background: '#B3EAF9', filter: 'blur(60px)' }}
      />
      <div
        className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full opacity-10"
        style={{ background: '#079BD8', filter: 'blur(40px)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Text block */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5"
              style={{ backgroundColor: 'rgba(179,234,249,0.2)', color: '#B3EAF9', border: '1px solid rgba(179,234,249,0.4)' }}>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Exclusive to @iitgn.ac.in
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              The Community<br />
              <span style={{ color: '#B3EAF9' }}>Exchange</span> at IITGN
            </h1>

            <p className="text-lg leading-relaxed mb-8 max-w-lg" style={{ color: '#7ecfec' }}>
              Buy, sell, and trade textbooks, hostel essentials, cycles, and more —
              all within the IITGN campus community.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="/listings" className="btn-primary text-base px-6 py-3">
                Browse Listings
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/listings/new"
                className="text-base px-6 py-3 rounded-lg font-semibold border-2 transition-colors text-white"
                style={{ borderColor: 'rgba(179,234,249,0.6)' }}
              >
                Sell Something
              </Link>
            </div>
          </div>

          {/* Search card */}
          <div className="w-full lg:w-80">
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <h3 className="font-bold text-base mb-4" style={{ color: '#163850' }}>
                Quick Search
              </h3>

              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="What are you looking for?"
                    className="w-full px-4 py-2.5 rounded-lg text-sm border outline-none focus:ring-2"
                    style={{ borderColor: '#e2e8f0', color: '#163850' }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select className="px-3 py-2.5 rounded-lg text-sm border outline-none cursor-pointer" style={{ borderColor: '#e2e8f0', color: '#163850' }}>
                    <option value="">Category</option>
                    <option>Electronics</option>
                    <option>Books</option>
                    <option>Cycles</option>
                    <option>Hostel Gear</option>
                    <option>Sports</option>
                  </select>

                  <select className="px-3 py-2.5 rounded-lg text-sm border outline-none cursor-pointer" style={{ borderColor: '#e2e8f0', color: '#163850' }}>
                    <option value="">Hostel</option>
                    {['Aibaan','Beauki','Chimair','Duven','Emiet','Firpeal','Griwiksh','Hiqom','Ijokha','Jurqia','Lekhaag'].map((h) => (
                      <option key={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <Link
                  href="/listings"
                  className="btn-primary w-full justify-center text-sm py-2.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </Link>
              </div>

              <p className="text-xs text-center mt-4" style={{ color: '#9ca3af' }}>
                Sign in with your IITGN Google account to post
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-14">
          {STATS.map(({ label, value }) => (
            <div
              key={label}
              className="text-center rounded-xl py-4 px-3"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(179,234,249,0.2)' }}
            >
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs mt-1" style={{ color: '#B3EAF9' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
