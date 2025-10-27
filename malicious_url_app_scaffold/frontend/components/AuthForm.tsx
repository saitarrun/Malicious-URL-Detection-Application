// frontend/components/AuthForm.tsx
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const isRegister = mode === 'register';
  const { login, register } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (isRegister) {
      if (password !== password2) { setErr('Passwords do not match'); return; }
      if (password.length < 8) { setErr('Password must be at least 8 characters'); return; }
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register(username, password, password2); // <-- THREE ARGS
      } else {
        await login(username, password);
      }
      router.push('/dashboard');
    } catch (e: any) {
      const d = e?.response?.data;
      const reasons = Array.isArray(d?.reasons) ? `: ${d.reasons.join(', ')}` : '';
      setErr(d?.error || d?.detail || ('Request failed' + reasons));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
      <div className="w-full max-w-2xl grid md:grid-cols-2 rounded-3xl shadow-2xl overflow-hidden">
        <aside className="hidden md:flex flex-col justify-center px-10 text-white"
          style={{ background: 'linear-gradient(135deg,#00bfa6,#009e8e)' }}>
          <h2 className="text-3xl font-extrabold">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="mt-3 text-white/90">
            {isRegister ? 'Join to start checking URLs securely.' : 'Sign in to continue.'}
          </p>
          <Link
            href={isRegister ? '/login' : '/register'}
            className="mt-8 inline-flex items-center justify-center h-11 px-6 rounded-full bg-white text-teal-600 font-semibold hover:opacity-90"
          >
            {isRegister ? 'Sign In' : 'Sign Up'}
          </Link>
        </aside>

        <main className="bg-white p-8 md:p-12">
          <h1 className="text-3xl font-bold text-teal-600">
            {isRegister ? 'Create account' : 'Sign in'}
          </h1>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm text-neutral-700">Username</span>
              <input
                className="mt-1 w-full h-11 rounded-xl border border-neutral-200 px-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </label>

            <label className="block">
              <span className="text-sm text-neutral-700">Password</span>
              <input
                type="password"
                className="mt-1 w-full h-11 rounded-xl border border-neutral-200 px-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={isRegister ? 8 : undefined}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
            </label>

            {isRegister && (
              <label className="block">
                <span className="text-sm text-neutral-700">Confirm password</span>
                <input
                  type="password"
                  className="mt-1 w-full h-11 rounded-xl border border-neutral-200 px-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </label>
            )}

            {err && <p className="text-sm text-red-600">{err}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full text-white font-semibold shadow-md hover:shadow-lg transition"
              style={{ background: 'linear-gradient(135deg,#00bfa6,#009e8e)' }}
            >
              {loading ? (isRegister ? 'Creating…' : 'Signing in…') : (isRegister ? 'Create account' : 'Sign in')}
            </button>

            <p className="text-sm text-neutral-600">
              {isRegister
                ? <>Already have an account? <Link href="/login" className="text-teal-600 font-semibold">Log in</Link></>
                : <>Don’t have an account? <Link href="/register" className="text-teal-600 font-semibold">Sign up</Link></>}
            </p>
          </form>
        </main>
      </div>
    </div>
  );
}