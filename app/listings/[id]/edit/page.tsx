'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImageUpload from '@/components/ImageUpload';
import { HOSTELS, Category, Condition } from '@/types';

const CATEGORIES: Category[] = ['Electronics', 'Books', 'Cycles', 'Hostel Gear', 'Sports', 'Clothing', 'Others'];
const CONDITIONS: Condition[] = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
const PICKUP_SPOTS = ['Tea Post', 'Panchangan', 'Panchayat Circle', 'Jaiwal Mess', 'Bhopal Mess', 'Central Arcade', 'Other'];

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    title: '', description: '', price: '', originalPrice: '',
    category: '' as Category | '',
    condition: '' as Condition | '',
    hostel: '', wing: '', preferredPickup: '',
    isUrgent: false, tags: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === 'unauthenticated') { signIn(); return; }
    if (status !== 'authenticated') return;

    fetch(`/api/listings/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.seller?.email !== session?.user?.email) {
          router.push(`/listings/${id}`);
          return;
        }
        setForm({
          title: data.title ?? '',
          description: data.description ?? '',
          price: data.price?.toString() ?? '',
          originalPrice: data.originalPrice?.toString() ?? '',
          category: data.category ?? '',
          condition: data.condition ?? '',
          hostel: data.hostel ?? '',
          wing: data.wing ?? '',
          preferredPickup: data.preferredPickup ?? '',
          isUrgent: data.isUrgent ?? false,
          tags: (data.tags ?? []).join(', '),
        });
        setImages(data.images ?? []);
        setLoading(false);
      })
      .catch(() => router.push('/listings'));
  }, [id, session, status, router]);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.price) e.price = 'Price is required';
    if (!form.category) e.category = 'Category is required';
    if (!form.condition) e.condition = 'Condition is required';
    if (!form.hostel) e.hostel = 'Hostel is required';
    return e;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
          category: form.category,
          condition: form.condition,
          hostel: form.hostel,
          wing: form.wing,
          preferredPickup: form.preferredPickup,
          isUrgent: form.isUrgent,
          images,
          tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error('Failed to update');
      router.push(`/listings/${id}`);
    } catch {
      setErrors({ form: 'Failed to save changes. Try again.' });
    } finally {
      setSaving(false);
    }
  }

  const set = (field: string, val: unknown) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: '#079BD8', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1" style={{ backgroundColor: '#f8fafc' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#163850' }}>Edit Listing</h1>
          <p className="text-sm mb-8" style={{ color: '#6b7280' }}>Update your listing details below.</p>

          {errors.form && (
            <div className="mb-6 p-3 rounded-lg text-sm" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>{errors.form}</div>
          )}

          <form onSubmit={submit} className="space-y-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <label className="block font-semibold mb-3" style={{ color: '#163850' }}>Photos</label>
              <ImageUpload images={images} onChange={setImages} maxImages={5} />
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-semibold" style={{ color: '#163850' }}>Item Details</h3>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>Title *</label>
                <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} maxLength={120}
                  className="w-full px-4 py-2.5 rounded-lg border outline-none text-sm"
                  style={{ borderColor: errors.title ? '#dc2626' : '#e2e8f0', color: '#163850' }} />
                {errors.title && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>Category *</label>
                  <select value={form.category} onChange={(e) => set('category', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                    style={{ borderColor: errors.category ? '#dc2626' : '#e2e8f0', color: '#163850' }}>
                    <option value="">Select…</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.category}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>Condition *</label>
                  <select value={form.condition} onChange={(e) => set('condition', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                    style={{ borderColor: errors.condition ? '#dc2626' : '#e2e8f0', color: '#163850' }}>
                    <option value="">Select…</option>
                    {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.condition && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.condition}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>Description *</label>
                <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
                  rows={4} maxLength={2000} className="w-full px-4 py-2.5 rounded-lg border resize-none outline-none text-sm"
                  style={{ borderColor: errors.description ? '#dc2626' : '#e2e8f0', color: '#163850' }} />
                {errors.description && <p className="text-xs" style={{ color: '#dc2626' }}>{errors.description}</p>}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-semibold" style={{ color: '#163850' }}>Pricing</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>Asking Price (₹) *</label>
                  <input type="number" value={form.price} onChange={(e) => set('price', e.target.value)} min={0}
                    className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none font-bold"
                    style={{ borderColor: errors.price ? '#dc2626' : '#e2e8f0', color: '#163850' }} />
                  {errors.price && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.price}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>Original Price (₹)</label>
                  <input type="number" value={form.originalPrice} onChange={(e) => set('originalPrice', e.target.value)} min={0}
                    className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
                    style={{ borderColor: '#e2e8f0', color: '#163850' }} />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: '#fff8f0' }}>
                <div>
                  <div className="font-semibold text-sm" style={{ color: '#163850' }}>🔥 Urgent Sale</div>
                  <div className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>Gets priority placement</div>
                </div>
                <button type="button" onClick={() => set('isUrgent', !form.isUrgent)}
                  className="relative w-11 h-6 rounded-full transition-colors"
                  style={{ backgroundColor: form.isUrgent ? '#dc2626' : '#e5e7eb' }}>
                  <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ left: form.isUrgent ? '22px' : '2px' }} />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-semibold" style={{ color: '#163850' }}>Location</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>Hostel *</label>
                  <select value={form.hostel} onChange={(e) => set('hostel', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                    style={{ borderColor: errors.hostel ? '#dc2626' : '#e2e8f0', color: '#163850' }}>
                    <option value="">Select hostel…</option>
                    {HOSTELS.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                  {errors.hostel && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.hostel}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>Wing</label>
                  <input type="text" value={form.wing} onChange={(e) => set('wing', e.target.value)} placeholder="e.g. A-Wing"
                    className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
                    style={{ borderColor: '#e2e8f0', color: '#163850' }} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>Preferred Pickup Spot</label>
                <select value={form.preferredPickup} onChange={(e) => set('preferredPickup', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                  style={{ borderColor: '#e2e8f0', color: '#163850' }}>
                  <option value="">Select spot…</option>
                  {PICKUP_SPOTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <label className="block font-semibold mb-1" style={{ color: '#163850' }}>Tags</label>
              <p className="text-xs mb-3" style={{ color: '#9ca3af' }}>Comma-separated keywords</p>
              <input type="text" value={form.tags} onChange={(e) => set('tags', e.target.value)}
                placeholder="e.g. laptop, dell, 8gb"
                className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
                style={{ borderColor: '#e2e8f0', color: '#163850' }} />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => router.push(`/listings/${id}`)}
                className="flex-1 py-3 rounded-xl font-semibold border text-sm"
                style={{ borderColor: '#e2e8f0', color: '#6b7280' }}>
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary px-8 py-3 text-base w-full justify-center">
                {saving ? 'Saving…' : '💾 Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
