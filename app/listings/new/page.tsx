'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImageUpload from '@/components/ImageUpload';
import { HOSTELS, Category, Condition } from '@/types';

const CATEGORIES: Category[] = ['Electronics', 'Books', 'Cycles', 'Hostel Gear', 'Sports', 'Clothing', 'Others'];
const CONDITIONS: Condition[] = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
const PICKUP_SPOTS = ['Tea Post', 'Panchangan', 'Panchayat Circle', 'Jaiwal Mess', 'Bhopal Mess', 'Central Arcade', 'Other'];

export default function NewListingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '' as Category | '',
    condition: '' as Condition | '',
    hostel: session?.user?.hostel ?? '',
    wing: '',
    preferredPickup: '',
    isUrgent: false,
    tags: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (status === 'unauthenticated') {
    signIn();
    return null;
  }
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: '#079BD8', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.price) e.price = 'Price is required';
    else if (Number(form.price) < 0) e.price = 'Price must be positive';
    if (!form.category) e.category = 'Category is required';
    if (!form.condition) e.condition = 'Condition is required';
    if (!form.hostel) e.hostel = 'Hostel is required';
    return e;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
          images,
          tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
          seller: {
            name: session!.user?.name,
            email: session!.user?.email,
            hostel: form.hostel,
            karmaScore: session!.user?.karmaScore ?? 0,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/listings/${data._id}`);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Failed to create listing' });
    } finally {
      setLoading(false);
    }
  }

  const set = (field: string, val: unknown) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Post an Item</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Fill in the details below — good photos and descriptions sell faster!</p>

          {errors.form && (
            <div className="mb-6 p-3 rounded-lg text-sm" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>{errors.form}</div>
          )}

          <form onSubmit={submit} className="space-y-6">
            {/* Photos */}
            <div className="rounded-2xl p-5 shadow-sm">
              <label className="block font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Photos</label>
              <ImageUpload images={images} onChange={setImages} maxImages={5} />
            </div>

            {/* Basic info */}
            <div className="rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Item Details</h3>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="e.g. Dell Inspiron Laptop, 8GB RAM"
                  maxLength={120}
                  className="w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 text-sm"
                  style={{ borderColor: errors.title ? '#dc2626' : '#e2e8f0', color: 'var(--text-primary)' }}
                />
                {errors.title && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => set('category', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                    style={{ borderColor: errors.category ? '#dc2626' : '#e2e8f0', color: form.category ? '#163850' : '#9ca3af' }}
                  >
                    <option value="">Select…</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Condition *</label>
                  <select
                    value={form.condition}
                    onChange={(e) => set('condition', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                    style={{ borderColor: errors.condition ? '#dc2626' : '#e2e8f0', color: form.condition ? '#163850' : '#9ca3af' }}
                  >
                    <option value="">Select…</option>
                    {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.condition && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.condition}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Describe the item — age, usage, any defects, what's included…"
                  rows={4}
                  maxLength={2000}
                  className="w-full px-4 py-2.5 rounded-lg border resize-none outline-none text-sm"
                  style={{ borderColor: errors.description ? '#dc2626' : '#e2e8f0', color: 'var(--text-primary)' }}
                />
                <div className="flex justify-between mt-0.5">
                  {errors.description && <p className="text-xs" style={{ color: '#dc2626' }}>{errors.description}</p>}
                  <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>{form.description.length}/2000</span>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Pricing</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Asking Price (₹) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => set('price', e.target.value)}
                    placeholder="0"
                    min={0}
                    className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none font-bold"
                    style={{ borderColor: errors.price ? '#dc2626' : '#e2e8f0', color: 'var(--text-primary)' }}
                  />
                  {errors.price && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.price}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Original Price (₹)</label>
                  <input
                    type="number"
                    value={form.originalPrice}
                    onChange={(e) => set('originalPrice', e.target.value)}
                    placeholder="Optional MRP"
                    min={0}
                    className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              {/* Urgent toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: '#fff8f0' }}>
                <div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>🔥 Urgent Sale</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Graduating? Gets priority placement + badge</div>
                </div>
                <button
                  type="button"
                  onClick={() => set('isUrgent', !form.isUrgent)}
                  className="relative w-11 h-6 rounded-full transition-colors"
                  style={{ backgroundColor: form.isUrgent ? '#dc2626' : '#e5e7eb' }}
                >
                  <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ left: form.isUrgent ? '22px' : '2px' }} />
                </button>
              </div>
            </div>

            {/* Location */}
            <div className="rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Location</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Hostel *</label>
                  <select
                    value={form.hostel}
                    onChange={(e) => set('hostel', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                    style={{ borderColor: errors.hostel ? '#dc2626' : '#e2e8f0', color: form.hostel ? '#163850' : '#9ca3af' }}
                  >
                    <option value="">Select hostel…</option>
                    {HOSTELS.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                  {errors.hostel && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.hostel}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Wing (optional)</label>
                  <input
                    type="text"
                    value={form.wing}
                    onChange={(e) => set('wing', e.target.value)}
                    placeholder="e.g. A-Wing"
                    className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Preferred Pickup Spot</label>
                <select
                  value={form.preferredPickup}
                  onChange={(e) => set('preferredPickup', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                  style={{ borderColor: 'var(--border)', color: form.preferredPickup ? '#163850' : '#9ca3af' }}
                >
                  <option value="">Select spot…</option>
                  {PICKUP_SPOTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="rounded-2xl p-5 shadow-sm">
              <label className="block font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Tags</label>
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Comma-separated keywords to help people find this item</p>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => set('tags', e.target.value)}
                placeholder="e.g. laptop, dell, 8gb, portable"
                className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-3 rounded-xl font-semibold border text-sm"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-2 btn-primary px-8 py-3 text-base w-full justify-center"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'white', borderTopColor: 'transparent' }} />
                    Posting…
                  </span>
                ) : '✨ Post Listing'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
