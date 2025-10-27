import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';  // matches export above
import Link from 'next/link';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(username.trim(), password, password2);
      router.push('/dashboard');
    } catch (err: any) {
      const d = err?.response?.data;
      const msg = d?.error || d?.detail || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-semibold mb-4">Create account</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Username</label>
            <input className="w-full input-field" value={username} onChange={e=>setUsername(e.target.value)} required autoComplete="username" />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input className="w-full input-field" type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={8} required autoComplete="new-password" />
          </div>
          <div>
            <label className="block text-sm mb-1">Confirm password</label>
            <input className="w-full input-field" type="password" value={password2} onChange={e=>setPassword2(e.target.value)} minLength={8} required autoComplete="new-password" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Creating…' : 'Create account'}</button>
        </form>
        <p className="mt-4 text-sm">Already have an account? <Link href="/login" className="text-teal-600">Log in</Link></p>
      </div>
    </div>
  );
}