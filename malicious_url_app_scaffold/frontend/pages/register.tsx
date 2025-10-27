import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

/**
 * RegisterPage — handles new user signup.
 * Includes frontend validation + backend feedback.
 */
export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string | null>(null); // temporary debug

  /** Validate password strength before sending to server */
  const clientValidate = () => {
    const u = username.trim();
    if (!u) return 'Username is required';
    if (password !== password2) return 'Passwords do not match';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (/^\d+$/.test(password)) return 'Password cannot be entirely numeric';
    if (password.toLowerCase().includes(u.toLowerCase()))
      return 'Password is too similar to the username';
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDebug(null);

    const clientErr = clientValidate();
    if (clientErr) {
      setError(clientErr);
      return;
    }

    setLoading(true);
    try {
      await register(username.trim(), password, password2);
      router.push('/dashboard');
    } catch (err: any) {
      const d = err?.response?.data;
      const status = err?.response?.status;
      const reasons = Array.isArray(d?.reasons) ? d.reasons.join(', ') : '';
      const msg = d?.error || d?.detail || 'Registration failed';
      setError(reasons ? `${msg}: ${reasons}` : msg);
      setDebug(JSON.stringify({ status, data: d }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-semibold mb-4 text-teal-600">Create Account</h1>
        <p className="text-sm text-neutral-500 mb-6">
          Fill in the fields below to create a secure account.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm mb-1 text-neutral-700">Username</label>
            <input
              className="w-full input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              placeholder="Enter your username"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm mb-1 text-neutral-700">Password</label>
            <input
              className="w-full input-field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              autoComplete="new-password"
              placeholder="Create a strong password"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm mb-1 text-neutral-700">Confirm Password</label>
            <input
              className="w-full input-field"
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              minLength={8}
              required
              autoComplete="new-password"
              placeholder="Re-enter your password"
            />
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-4 text-sm text-center text-neutral-600">
          Already have an account?{' '}
          <Link href="/login" className="text-teal-600 font-semibold hover:underline">
            Log In
          </Link>
        </p>

        {/* Debug Payload (optional) */}
        {debug && (
          <pre className="mt-4 text-xs bg-neutral-100 p-2 rounded overflow-x-auto">
            {debug}
          </pre>
        )}
      </div>
    </div>
  );
}