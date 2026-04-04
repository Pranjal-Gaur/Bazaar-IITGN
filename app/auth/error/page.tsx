import Link from 'next/link';

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #163850, #079BD8)' }}>
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
        <div className="text-4xl mb-4">🚫</div>
        <h1 className="text-xl font-bold mb-2" style={{ color: '#163850' }}>Access Denied</h1>
        <p className="text-sm mb-6" style={{ color: '#6b7280' }}>
          Only <strong>@iitgn.ac.in</strong> email addresses can access Bazaar@IITGN.
        </p>
        <Link href="/auth/signin" className="btn-primary w-full justify-center">
          Try Again
        </Link>
      </div>
    </div>
  );
}
