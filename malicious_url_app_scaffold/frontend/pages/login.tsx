import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

export default function Login() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await login(username, password);
            setSuccess('Login successful! Redirecting...');
            setTimeout(() => router.push('/'), 1200);
        } catch (err: any) {
            setError(err?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#6a11cb] to-[#2575fc] relative overflow-hidden">
            {/* Background image overlay (optional) */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80')] bg-cover bg-center opacity-30 z-0"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-[#6a11cb]/80 to-[#2575fc]/80 z-0"></div>
            <div className="relative z-10 w-full max-w-md mx-auto">
                <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-lg p-10 rounded-3xl shadow-2xl flex flex-col items-center">
                    {/* Logo/avatar */}
                    <img src="/logo.png" alt="Logo" className="w-16 h-16 mb-4 rounded-full shadow-lg" onError={e => (e.currentTarget.style.display='none')} />
                    <h1 className="text-4xl font-extrabold mb-2 text-center text-[#2575fc] tracking-tight">Welcome Back</h1>
                    <p className="mb-6 text-center text-gray-500 text-lg">Sign in to your account</p>
                    {error && <div className="mb-4 text-red-500 text-center w-full">{error}</div>}
                    {success && <div className="mb-4 text-green-500 text-center w-full">{success}</div>}
                    <div className="mb-4 w-full">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="p-4 border border-gray-300 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#2575fc] text-lg bg-white"
                            required
                        />
                    </div>
                    <div className="mb-6 w-full">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="p-4 border border-gray-300 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#2575fc] text-lg bg-white"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-[#6a11cb] to-[#2575fc] text-white p-4 rounded-xl w-full font-bold text-lg shadow-lg hover:scale-105 transition-transform duration-150"
                        disabled={loading}
                    >
                        {loading ? <span className="animate-spin mr-2 inline-block w-6 h-6 border-2 border-t-2 border-[#2575fc] rounded-full"></span> : 'Sign In'}
                    </button>
                    <div className="mt-6 text-center text-base text-gray-600 w-full">
                        Don't have an account? <a href="/register" className="text-[#2575fc] font-semibold hover:underline">Sign Up</a>
                    </div>
                </form>
            </div>
        </div>
    );
}
