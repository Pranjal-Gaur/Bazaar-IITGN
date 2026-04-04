'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ListingCard from '@/components/ListingCard';
import { Listing } from '@/types';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  image?: string;
  hostel?: string;
  bio?: string;
  karmaScore: number;
  rating: number;
  ratingCount: number;
  totalSales: number;
  totalPurchases: number;
  isVerified: boolean;
  createdAt: string;
}

interface Review {
  _id: string;
  reviewer: { name: string };
  rating: number;
  comment?: string;
  role: 'buyer' | 'seller';
  createdAt: string;
}

function KarmaBadge({ score }: { score: number }) {
  let label = 'New Member';
  let color = '#6b7280';
  let bg = '#f1f5f9';
  if (score >= 100) { label = 'Community Hero'; color = '#854d0e'; bg = '#fef9c3'; }
  else if (score >= 50) { label = 'Trusted Trader'; color = '#065f46'; bg = '#d1fae5'; }
  else if (score >= 25) { label = 'Active Member'; color = '#1d4ed8'; bg = '#dbeafe'; }
  else if (score >= 10) { label = 'Verified'; color = '#6d28d9'; bg = '#ede9fe'; }

  return (
    <span className="badge" style={{ backgroundColor: bg, color }}>{label}</span>
  );
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= Math.round(rating) ? '#f59e0b' : '#e5e7eb', fontSize: '16px' }}>★</span>
      ))}
      <span className="text-sm font-semibold ml-1" style={{ color: '#163850' }}>{rating.toFixed(1)}</span>
      <span className="text-xs" style={{ color: '#9ca3af' }}>({count} reviews)</span>
    </div>
  );
}

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // id might be an email or mongo id — try both
    const isEmail = id.includes('@') || id.includes('%40');
    const decoded = decodeURIComponent(id);

    async function load() {
      try {
        // Try by mongo ID first, fall back to email query
        let res = await fetch(`/api/users/${decoded}`);
        if (!res.ok && isEmail) {
          // fall back: search by email
          const listRes = await fetch(`/api/listings?status=all`);
          const data = await listRes.json();
          const seller = data.listings?.find((l: Listing) => l.seller.email === decoded)?.seller;
          if (seller) {
            setUser({
              _id: '', name: seller.name, email: seller.email, hostel: seller.hostel,
              karmaScore: seller.karmaScore ?? 0, rating: 0, ratingCount: 0,
              totalSales: 0, totalPurchases: 0, isVerified: true,
              createdAt: new Date().toISOString(),
            } as UserProfile);
            setListings(data.listings.filter((l: Listing) => l.seller.email === decoded).slice(0, 8));
          }
          return;
        }

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setListings(data.listings ?? []);
          setReviews(data.reviews ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: '#079BD8', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <div className="text-5xl">🔍</div>
        <p className="font-bold" style={{ color: '#163850' }}>User not found</p>
      </div>
    );
  }

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1" style={{ backgroundColor: '#f8fafc' }}>
        {/* Profile header */}
        <div style={{ background: 'linear-gradient(135deg, #163850, #045F82)' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white flex-shrink-0"
                style={{ backgroundColor: '#079BD8' }}
              >
                {user.image ? (
                  <img src={user.image} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  user.name?.[0]?.toUpperCase()
                )}
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                  {user.isVerified && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: '#079BD8', color: 'white' }}>
                      ✓ IITGN
                    </span>
                  )}
                </div>

                {user.hostel && (
                  <p className="text-sm mt-1" style={{ color: '#B3EAF9' }}>📍 {user.hostel} · IIT Gandhinagar</p>
                )}

                {user.bio && (
                  <p className="text-sm mt-2 max-w-md" style={{ color: '#7ecfec' }}>{user.bio}</p>
                )}

                <div className="flex flex-wrap items-center gap-3 mt-3 justify-center sm:justify-start">
                  <KarmaBadge score={user.karmaScore} />
                  {user.ratingCount > 0 && <StarRating rating={user.rating} count={user.ratingCount} />}
                  <span className="text-xs" style={{ color: '#B3EAF9' }}>Joined {joinDate}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                { label: 'Karma Score', value: user.karmaScore },
                { label: 'Items Sold', value: user.totalSales },
                { label: 'Active Listings', value: listings.length },
              ].map(({ label, value }) => (
                <div key={label} className="text-center rounded-xl py-3" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#B3EAF9' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Listings */}
        {listings.length > 0 && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h2 className="text-xl font-bold mb-5" style={{ color: '#163850' }}>Active Listings</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {listings.map((l) => <ListingCard key={l._id} listing={l} />)}
            </div>
          </div>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <h2 className="text-xl font-bold mb-5" style={{ color: '#163850' }}>Reviews</h2>
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r._id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: '#163850' }}>
                        {r.reviewer.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <span className="text-sm font-semibold" style={{ color: '#163850' }}>{r.reviewer.name}</span>
                        <span className="text-xs ml-2" style={{ color: '#9ca3af' }}>{r.role === 'buyer' ? 'Buyer' : 'Seller'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} style={{ color: s <= r.rating ? '#f59e0b' : '#e5e7eb', fontSize: '14px' }}>★</span>
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="text-sm" style={{ color: '#4b5563' }}>{r.comment}</p>}
                  <p className="text-xs mt-2" style={{ color: '#9ca3af' }}>
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
