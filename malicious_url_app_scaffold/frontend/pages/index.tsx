
import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';

// MagicUI: animated spinner, toast
function Spinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentChecks, setRecentChecks] = useState<any[]>([]);
  const [stats, setStats] = useState<{ total: number; malicious: number; safe: number }>({ total: 0, malicious: 0, safe: 0 });
  const { token, logout, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch('http://localhost:8000/api/v1/predict/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setResult(data);
      setRecentChecks((prev) => [{ url, ...data, checkedAt: new Date().toISOString() }, ...prev.slice(0, 4)]);
      setStats((prev) => ({
        total: prev.total + 1,
        malicious: data.malicious ? prev.malicious + 1 : prev.malicious,
        safe: !data.malicious ? prev.safe + 1 : prev.safe,
      }));
      toast.success(data.malicious ? 'Malicious URL detected!' : 'URL is safe!');
      setError(null);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        toast.error(error.message);
      } else {
        setError('An unknown error occurred');
        toast.error('An unknown error occurred');
      }
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <Spinner />;
  }

  // Dashboard layout
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#6a11cb] to-[#2575fc] relative overflow-hidden">
      <Toaster position="top-right" />
      {/* Background image overlay (optional) */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80')] bg-cover bg-center opacity-30 z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-[#6a11cb]/80 to-[#2575fc]/80 z-0"></div>
      {/* Main card */}
      <div className="relative z-10 w-full max-w-2xl mx-auto">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 flex flex-col items-center">
          {/* Header */}
          <div className="w-full flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-extrabold text-[#2575fc] tracking-tight">Malicious URL Detector</h1>
              {/* User profile info */}
              {user && (
                <div className="flex items-center gap-2 ml-6">
                  <img src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=2575fc&color=fff`} alt="avatar" className="w-8 h-8 rounded-full" />
                  <span className="font-semibold text-[#2575fc]">{user?.username || 'User'}</span>
                </div>
              )}
            </div>
            <Button onClick={logout}>Logout</Button>
          </div>

          {/* Main panel */}
          <div className="w-full max-w-lg mx-auto mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">Check a URL</h2>
            <div className="flex items-center space-x-2 mb-6">
              <Input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-lg bg-white"
              />
              <Button onClick={handleSubmit} disabled={loading || !url} className="px-6 py-3 rounded-xl text-lg font-bold">
                {loading ? <Spinner /> : 'Check'}
              </Button>
            </div>

            {/* Result display */}
            {result && (
              <div className={`mt-6 p-4 rounded-xl border ${result.malicious ? 'bg-red-50 border-red-400' : 'bg-green-50 border-green-400'} shadow-md animate-fade-in`}>
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-lg ${result.malicious ? 'text-red-600' : 'text-green-600'}`}>{result.malicious ? 'Malicious' : 'Safe'}</span>
                  <span className="text-gray-500 text-sm">{result.model_version ? `Model: ${result.model_version}` : ''}</span>
                </div>
                <div className="mt-2 text-gray-700">
                  Probability: <span className="font-mono">{(result.malicious_prob * 100).toFixed(2)}%</span>
                </div>
                {result.cached && (
                  <div className="mt-2 text-xs text-blue-500">(Result from cache)</div>
                )}
              </div>
            )}

            {/* Error display */}
            {error && (
              <div className="mt-6 p-4 rounded-xl border bg-red-50 border-red-400 shadow-md animate-fade-in">
                <span className="text-red-600 font-bold">Error: {error}</span>
              </div>
            )}
          </div>

          {/* Dashboard widgets */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            {/* Stats widget */}
            <div className="bg-white/80 rounded-2xl shadow p-6 flex flex-col items-center">
              <h3 className="text-lg font-bold mb-2 text-[#2575fc]">Stats</h3>
              <div className="flex flex-col gap-1 text-gray-700">
                <span>Total checks: <span className="font-bold">{stats.total}</span></span>
                <span>Malicious: <span className="font-bold text-red-600">{stats.malicious}</span></span>
                <span>Safe: <span className="font-bold text-green-600">{stats.safe}</span></span>
              </div>
            </div>
            {/* Recent checks widget */}
            <div className="bg-white/80 rounded-2xl shadow p-6">
              <h3 className="text-lg font-bold mb-2 text-[#2575fc]">Recent Checks</h3>
              <ul className="space-y-2">
                {recentChecks.length === 0 && <li className="text-gray-500">No recent checks.</li>}
                {recentChecks.map((check, idx) => (
                  <li key={idx} className="flex flex-col border-b pb-2">
                    <span className="font-mono text-sm">{check.url}</span>
                    <span className={`text-xs font-bold ${check.malicious ? 'text-red-600' : 'text-green-600'}`}>{check.malicious ? 'Malicious' : 'Safe'}</span>
                    <span className="text-xs text-gray-400">{new Date(check.checkedAt).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="md:hidden flex justify-around bg-white/80 border-t py-2 rounded-b-2xl shadow-lg z-10">
        <Link href="/" className="text-[#2575fc] font-semibold">Dashboard</Link>
        <Link href="/register" className="text-[#2575fc]">Create Account</Link>
        <Link href="/login" className="text-[#2575fc]">Login</Link>
      </nav>
    </div>
  );
}
