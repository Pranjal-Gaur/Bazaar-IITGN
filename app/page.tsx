'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import CategoryGrid from '@/components/CategoryGrid';
import ListingCard from '@/components/ListingCard';
import Link from 'next/link';
import { Listing } from '@/types';

export default function Home() {
  const [urgentListings, setUrgentListings] = useState<Listing[]>([]);
  const [recentListings, setRecentListings] = useState<Listing[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/listings?urgent=true&limit=4').then((r) => r.json()),
      fetch('/api/listings?sort=newest&limit=8').then((r) => r.json()),
    ]).then(([urgentData, recentData]) => {
      setUrgentListings(urgentData.listings ?? []);
      setRecentListings((recentData.listings ?? []).filter((l: Listing) => !l.isUrgent));
    }).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <CategoryGrid />

        {/* Urgent Listings */}
        {urgentListings.length > 0 && (
          <section className="py-10" style={{ backgroundColor: '#fff8f0' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔥</span>
                  <h2 className="text-2xl font-bold" style={{ color: '#163850' }}>Urgent Sales</h2>
                  <span className="badge ml-2 text-white" style={{ backgroundColor: '#dc2626' }}>
                    Graduating students
                  </span>
                </div>
                <Link href="/listings?urgent=true" className="text-sm font-semibold" style={{ color: '#079BD8' }}>
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {urgentListings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Recent Listings */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#163850' }}>Recent Listings</h2>
                <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Freshly posted by your campus peers</p>
              </div>
              <Link href="/listings" className="text-sm font-semibold hidden sm:block" style={{ color: '#079BD8' }}>
                View all listings →
              </Link>
            </div>

            {recentListings.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🛍️</div>
                <p className="font-semibold" style={{ color: '#163850' }}>No listings yet</p>
                <p className="text-sm mt-1 mb-6" style={{ color: '#6b7280' }}>Be the first to post something!</p>
                <Link href="/listings/new" className="btn-primary">Post an Item</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {recentListings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} />
                ))}
              </div>
            )}

            {recentListings.length > 0 && (
              <div className="mt-10 text-center">
                <Link href="/listings" className="btn-navy px-8 py-3 text-sm">
                  View All Listings
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-16" style={{ background: 'linear-gradient(135deg, #163850 0%, #079BD8 100%)' }}>
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Have something to sell?</h2>
            <p className="text-lg mb-8" style={{ color: '#B3EAF9' }}>
              Post your listing in under 2 minutes and reach the entire IITGN community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/listings/new" className="btn-primary px-8 py-3 text-base">
                Post a Listing
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </Link>
              <Link href="/auth/signin" className="px-8 py-3 text-base rounded-lg font-semibold border-2 text-white transition-colors" style={{ borderColor: 'rgba(179,234,249,0.6)' }}>
                Sign in with IITGN
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-14 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-center mb-10" style={{ color: '#163850' }}>How Bazaar Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '1', icon: '🔐', title: 'Sign In Securely', desc: 'Login with your @iitgn.ac.in Google account. Verified students only.' },
                { step: '2', icon: '📸', title: 'Post or Browse', desc: 'List your item with photos, or search by category, hostel, and price.' },
                { step: '3', icon: '🤝', title: 'Negotiate & Trade', desc: 'Chat in-app, make offers, and confirm the handshake to complete the trade.' },
              ].map(({ step, icon, title, desc }) => (
                <div key={step} className="text-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4" style={{ backgroundColor: '#e8f4fd' }}>
                    {icon}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#079BD8' }}>Step {step}</div>
                  <h3 className="font-bold mb-2" style={{ color: '#163850' }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
