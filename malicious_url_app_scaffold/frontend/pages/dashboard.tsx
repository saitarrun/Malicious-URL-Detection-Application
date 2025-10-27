import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [ping, setPing] = useState<'ok' | 'fail' | 'idle'>('idle');
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        await api.get('/me/');
        setPing('ok');
      } catch {
        setPing('fail');
      }
    };
    run();
  }, []);

  const onCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setResult(null);
    try {
      const { data } = await api.post('/predict/', { url });
      setResult(data);
    } catch (e: any) {
      const msg = e?.response?.data?.detail || 'url-checker-service unavailable';
      setErr(msg);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-2">Dashboard</h1>
      <p className="mb-2">Protected ping {ping === 'ok' ? 'ok' : 'failed'}</p>
      <p className="mb-4">Signed in as {user?.username}</p>
      <button className="border px-3 py-1 rounded mb-6" onClick={logout}>Logout</button>

      <h2 className="text-lg font-medium mb-2">Check a URL</h2>
      <form onSubmit={onCheck} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <button className="border px-3 py-2 rounded" type="submit">Check</button>
      </form>

      {err && <p className="text-red-600 mt-3">{err}</p>}
      {result && (
        <pre className="mt-3 p-3 bg-gray-100 rounded text-sm overflow-x-auto">
{JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}