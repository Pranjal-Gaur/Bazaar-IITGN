'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ListingCard from '@/components/ListingCard';
import { Listing, Category, Condition, HOSTELS } from '@/types';
import Link from 'next/link';


const CATEGORIES: Category[] = ['Electronics', 'Books', 'Cycles', 'Hostel Gear', 'Sports', 'Clothing', 'Others'];
const CONDITIONS: Condition[] = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

function ListingsContent() {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [category, setCategory] = useState<string>(searchParams.get('category') ?? '');
  const [hostel, setHostel] = useState<string>(searchParams.get('hostel') ?? '');
  const [condition, setCondition] = useState<string>('');
  const [urgent, setUrgent] = useState(searchParams.get('urgent') === 'true');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    setSearch(searchParams.get('q') ?? '');
    setCategory(searchParams.get('category') ?? '');
    setHostel(searchParams.get('hostel') ?? '');
    setUrgent(searchParams.get('urgent') === 'true');
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/listings?status=all&limit=50')
      .then((r) => r.json())
      .then((data) => setAllListings(data.listings ?? []))
      .finally(() => setFetching(false));
  }, []);

  const filtered = useMemo(() => {
    let results = [...allListings];

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (l) => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q) || l.tags.some((t: string) => t.includes(q))
      );
    }
    if (category) results = results.filter((l) => l.category === category);
    if (hostel) results = results.filter((l) => l.hostel === hostel);
    if (condition) results = results.filter((l) => l.condition === condition);
    if (urgent) results = results.filter((l) => l.isUrgent);
    if (minPrice) results = results.filter((l) => l.price >= parseInt(minPrice));
    if (maxPrice) results = results.filter((l) => l.price <= parseInt(maxPrice));

    switch (sort) {
      case 'price-asc': results.sort((a, b) => a.price - b.price); break;
      case 'price-desc': results.sort((a, b) => b.price - a.price); break;
      case 'oldest': results.sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()); break;
      default: results.sort((a, b) => (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0) || new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
    }

    return results;
  }, [allListings, search, category, hostel, condition, urgent, minPrice, maxPrice, sort]);

  const clearFilters = () => {
    setCategory(''); setHostel(''); setCondition('');
    setUrgent(false); setMinPrice(''); setMaxPrice('');
  };

  const activeFilters = [category, hostel, condition, urgent ? 'Urgent' : ''].filter(Boolean).length;

  const FilterPanel = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Filters</h3>
        {activeFilters > 0 && (
          <button onClick={clearFilters} className="text-xs font-semibold" style={{ color: '#079BD8' }}>
            Clear all ({activeFilters})
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
          Category
        </label>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(category === cat ? '' : cat)}
              className="w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors"
              style={{
                backgroundColor: category === cat ? '#e8f4fd' : 'transparent',
                color: category === cat ? '#163850' : '#4b5563',
                fontWeight: category === cat ? 600 : 400,
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Hostel */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
          Hostel
        </label>
        <select
          value={hostel}
          onChange={(e) => setHostel(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
          style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        >
          <option value="">All Hostels</option>
          {HOSTELS.map((h) => <option key={h} value={h}>{h}</option>)}
        </select>
      </div>

      {/* Condition */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
          Condition
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CONDITIONS.map((c) => (
            <button
              key={c}
              onClick={() => setCondition(condition === c ? '' : c)}
              className="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
              style={{
                backgroundColor: condition === c ? '#163850' : 'white',
                color: condition === c ? 'white' : '#4b5563',
                borderColor: condition === c ? '#163850' : '#e2e8f0',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
          Price Range (₹)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => { if (/^\d*$/.test(e.target.value)) setMinPrice(e.target.value); }}
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
          <span style={{ color: 'var(--text-muted)' }}>—</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => { if (/^\d*$/.test(e.target.value)) setMaxPrice(e.target.value); }}
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Urgent toggle */}
      <div className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ backgroundColor: '#fff8f0' }}>
        <div>
          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>🔥 Urgent Only</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Graduating student deals</div>
        </div>
        <button
          onClick={() => setUrgent(!urgent)}
          className="relative w-10 h-5 rounded-full transition-colors"
          style={{ backgroundColor: urgent ? '#dc2626' : '#e5e7eb' }}
        >
          <span
            className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow"
            style={{ left: urgent ? '22px' : '2px' }}
          />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1" style={{ backgroundColor: 'var(--bg-page)' }}>
        {/* Page header */}
        <div className="py-8" style={{ backgroundColor: '#163850' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-white mb-4">All Listings</h1>

            {/* Search bar */}
            <div className="flex gap-3">
              <div className="relative flex-1 max-w-xl">
                <input
                  type="text"
                  placeholder="Search for anything..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(179,234,249,0.3)' }}
                />
                <svg className="absolute left-3 top-3 w-4 h-4" style={{ color: '#B3EAF9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-4 py-2.5 rounded-lg text-sm outline-none cursor-pointer"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(179,234,249,0.3)' }}
              >
                <option value="newest" style={{ color: 'var(--text-primary)' }}>Newest First</option>
                <option value="price-asc" style={{ color: 'var(--text-primary)' }}>Price: Low to High</option>
                <option value="price-desc" style={{ color: 'var(--text-primary)' }}>Price: High to Low</option>
                <option value="oldest" style={{ color: 'var(--text-primary)' }}>Oldest First</option>
              </select>

              {/* Mobile filter toggle */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(179,234,249,0.3)' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters {activeFilters > 0 && `(${activeFilters})`}
              </button>

              <Link href="/listings/new" className="btn-primary text-sm hidden sm:flex">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Post Item
              </Link>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <div className="rounded-xl p-5 shadow-sm border border-gray-100 sticky top-24">
                <FilterPanel />
              </div>
            </aside>

            {/* Listings grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {filtered.length} listing{filtered.length !== 1 ? 's' : ''} found
                </span>
              </div>

              {fetching ? (
                <div className="flex justify-center py-20">
                  <div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: '#079BD8', borderTopColor: 'transparent' }} />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No listings found</h3>
                  <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                    Try adjusting your filters or search query
                  </p>
                  <button onClick={clearFilters} className="btn-primary">
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.map((listing) => (
                    <ListingCard key={listing._id} listing={listing} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile filter drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Filters</h2>
              <button onClick={() => setSidebarOpen(false)}>
                <svg className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <FilterPanel />
            <button
              onClick={() => setSidebarOpen(false)}
              className="btn-navy w-full justify-center mt-6"
            >
              Show {filtered.length} Results
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense>
      <ListingsContent />
    </Suspense>
  );
}
