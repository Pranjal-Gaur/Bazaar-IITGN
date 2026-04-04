import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#163850', color: '#B3EAF9' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg" style={{ backgroundColor: '#079BD8', color: 'white' }}>
                B
              </div>
              <div>
                <div className="text-white font-bold text-lg leading-tight">Bazaar</div>
                <div className="text-xs" style={{ color: '#B3EAF9' }}>@IITGN</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#7ecfec' }}>
              The official peer-to-peer marketplace for the IIT Gandhinagar community.
            </p>
            <p className="text-xs mt-3" style={{ color: '#5ba8c5' }}>
              Restricted to @iitgn.ac.in accounts only.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Browse</h4>
            <ul className="space-y-2 text-sm">
              {['Electronics', 'Books', 'Cycles', 'Hostel Gear', 'Sports', 'All Listings'].map((cat) => (
                <li key={cat}>
                  <Link href={`/listings?category=${cat}`} className="transition-colors hover:text-white" style={{ color: '#7ecfec' }}>
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hostels */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Hostels</h4>
            <ul className="space-y-2 text-sm">
              {['Aibaan', 'Beauki', 'Chimair', 'Duven', 'Emiet', 'Firaki'].map((hostel) => (
                <li key={hostel}>
                  <Link href={`/listings?hostel=${hostel}`} className="transition-colors hover:text-white" style={{ color: '#7ecfec' }}>
                    {hostel}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Account</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Sign In', href: '/auth/signin' },
                { label: 'My Listings', href: '/dashboard/listings' },
                { label: 'My Offers', href: '/dashboard/offers' },
                { label: 'Watchlist', href: '/dashboard/watchlist' },
                { label: 'Post an Item', href: '/listings/new' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="transition-colors hover:text-white" style={{ color: '#7ecfec' }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t" style={{ borderColor: 'rgba(179,234,249,0.15)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs" style={{ color: '#5ba8c5' }}>
          <span>© {new Date().getFullYear()} Bazaar@IITGN. Built for the IITGN community.</span>
          <div className="flex items-center gap-1">
            <span>A project of</span>
            <a href="https://iitgn.ac.in" target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-white transition-colors" style={{ color: '#B3EAF9' }}>
              IIT Gandhinagar
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
