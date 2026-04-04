import Link from 'next/link';

const CATEGORIES = [
  {
    name: 'Electronics',
    icon: '💻',
    description: 'Laptops, tablets, cables, components',
    count: 48,
    color: '#dbeafe',
    accent: '#1d4ed8',
  },
  {
    name: 'Books',
    icon: '📚',
    description: 'Textbooks, novels, course material',
    count: 73,
    color: '#dcfce7',
    accent: '#15803d',
  },
  {
    name: 'Cycles',
    icon: '🚲',
    description: 'Bicycles, accessories, gear',
    count: 21,
    color: '#fef9c3',
    accent: '#a16207',
  },
  {
    name: 'Hostel Gear',
    icon: '🏠',
    description: 'Coolers, kettles, mattresses, furniture',
    count: 62,
    color: '#fce7f3',
    accent: '#be185d',
  },
  {
    name: 'Sports',
    icon: '⚽',
    description: 'Equipment, shoes, sportswear',
    count: 19,
    color: '#ffedd5',
    accent: '#c2410c',
  },
  {
    name: 'Clothing',
    icon: '👕',
    description: 'Clothes, accessories, footwear',
    count: 34,
    color: '#f3e8ff',
    accent: '#7c3aed',
  },
  {
    name: 'Others',
    icon: '📦',
    description: 'Miscellaneous items & everything else',
    count: 27,
    color: '#f1f5f9',
    accent: '#475569',
  },
];

export default function CategoryGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#163850' }}>Browse by Category</h2>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Find exactly what you need</p>
        </div>
        <Link href="/listings" className="text-sm font-semibold hidden sm:block" style={{ color: '#079BD8' }}>
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {CATEGORIES.map((cat) => (
          <Link key={cat.name} href={`/listings?category=${encodeURIComponent(cat.name)}`}>
            <div
              className="rounded-xl p-5 card-hover cursor-pointer h-full"
              style={{ backgroundColor: cat.color, border: `1px solid ${cat.color}` }}
            >
              <div className="text-3xl mb-3">{cat.icon}</div>
              <h3 className="font-bold text-sm" style={{ color: cat.accent }}>
                {cat.name}
              </h3>
              <p className="text-xs mt-1 leading-snug" style={{ color: '#4b5563' }}>
                {cat.description}
              </p>
              <div className="mt-3 text-xs font-semibold" style={{ color: cat.accent }}>
                {cat.count} listings
              </div>
            </div>
          </Link>
        ))}

        {/* Sell CTA card */}
        <Link href="/listings/new">
          <div
            className="rounded-xl p-5 card-hover cursor-pointer h-full flex flex-col items-center justify-center text-center"
            style={{
              background: 'linear-gradient(135deg, #163850, #079BD8)',
              minHeight: '140px',
            }}
          >
            <div className="text-3xl mb-2">✨</div>
            <h3 className="font-bold text-sm text-white">Sell an Item</h3>
            <p className="text-xs mt-1" style={{ color: '#B3EAF9' }}>
              Post your listing in 2 minutes
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
}
