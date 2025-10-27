import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

type CheckItem = { url: string; result: string; at: string };

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const API_BASE =
    typeof window === 'undefined'
      ? process.env.SERVER_API_BASE || 'http://backend:8000'
      : process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

  const [hello, setHello] = useState<string>('');
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<CheckItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/v1/protected/`);
        setHello(`Hello ${res.data.user}`);
      } catch {
        setHello('Protected ping failed');
      }
    })();
  }, [API_BASE, token]);

  const onCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const u = new URL(url);
      if (!/^https?:/.test(u.protocol)) throw new Error();
    } catch {
      setError('Invalid URL');
      return;
    }

    setSubmitting(true);
    try {
      // expects your backend to expose POST /api/v1/predict/ {url}
      const res = await axios.post(`${API_BASE}/api/v1/predict/`, { url });
      const result = typeof res.data?.prediction === 'string' ? res.data.prediction : JSON.stringify(res.data);
      setHistory((h) => [{ url, result, at: new Date().toISOString() }, ...h].slice(0, 20));
      setUrl('');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Check failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <header className="max-w-5xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-neutral-600 mt-1">{hello}</p>
          <p className="text-sm text-neutral-600">Signed in as <span className="font-mono">{user?.username}</span></p>
        </div>
        <button onClick={logout} className="btn-primary">Logout</button>
      </header>

      <main className="max-w-5xl mx-auto mt-8 grid gap-6 md:grid-cols-[2fr,1fr]">
        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold">Check a URL</h2>
          <p className="text-sm text-neutral-600 mt-1">Enter a link to classify it as safe or malicious.</p>

          <form onSubmit={onCheck} className="mt-4 flex flex-col sm:flex-row gap-3">
            <input className="input-field flex-1" placeholder="https://example.com/suspicious" value={url} onChange={(e) => setUrl(e.target.value)} required />
            <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Checking…' : 'Check'}</button>
          </form>

          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        </section>

        <aside className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-semibold">Latest</h3>
          {history.length === 0 ? (
            <p className="text-sm text-neutral-600 mt-2">No checks yet.</p>
          ) : (
            <div className="mt-3 text-sm">
              <div className="font-medium break-all">{history[0].url}</div>
              <div className="mt-1">
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  /malicious/i.test(history[0].result) ? 'bg-red-100 text-red-700' :
                  /benign|safe/i.test(history[0].result) ? 'bg-emerald-100 text-emerald-700' :
                  'bg-yellow-100 text-yellow-800'
                }`}>{history[0].result}</span>
              </div>
              <div className="mt-1 text-xs text-neutral-500">{new Date(history[0].at).toLocaleString()}</div>
            </div>
          )}
        </aside>

        <section className="md:col-span-2 bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-semibold">History</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-neutral-500">
                  <th className="py-2 pr-4">Time</th>
                  <th className="py-2 pr-4">URL</th>
                  <th className="py-2">Result</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2 pr-4 whitespace-nowrap">{new Date(item.at).toLocaleString()}</td>
                    <td className="py-2 pr-4 break-all">{item.url}</td>
                    <td className="py-2">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        /malicious/i.test(item.result) ? 'bg-red-100 text-red-700' :
                        /benign|safe/i.test(item.result) ? 'bg-emerald-100 text-emerald-700' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>{item.result}</span>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr><td colSpan={3} className="py-4 text-neutral-500">Nothing yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}