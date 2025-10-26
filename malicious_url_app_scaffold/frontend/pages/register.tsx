import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

export default function Register() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

    const passwordStrength = () => {
        if (password.length < 6) return 'Weak';
        if (password.match(/[A-Z]/) && password.match(/[0-9]/) && password.length >= 8) return 'Strong';
        return 'Medium';
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await register(username, password);
            setSuccess('Registration successful! Redirecting...');
            setTimeout(() => router.push('/login'), 1500);
        } catch (err: any) {
            setError(err?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
            <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
                <h1 className="text-3xl font-bold mb-6 text-center text-purple-700">Sign Up</h1>
                {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
                {success && <div className="mb-4 text-green-500 text-center">{success}</div>}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-400"
                        required
                    />
                </div>
                <div className="mb-2 relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-400"
                        required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-500">
                        {showPassword ? 'Hide' : 'Show'}
                    </button>
                </div>
                <div className="mb-6 text-sm text-gray-600">Password strength: <span className={passwordStrength() === 'Strong' ? 'text-green-600' : passwordStrength() === 'Medium' ? 'text-yellow-600' : 'text-red-600'}>{passwordStrength()}</span></div>
                <button
                    type="submit"
                    className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-3 rounded-lg w-full font-semibold shadow-md hover:scale-105 transition-transform duration-150"
                    disabled={loading}
                >
                    {loading ? <span className="animate-spin mr-2 inline-block w-5 h-5 border-2 border-t-2 border-purple-500 rounded-full"></span> : 'Sign Up'}
                </button>
                <div className="mt-4 text-center text-sm text-gray-500">
                    Already have an account? <a href="/login" className="text-purple-600 font-semibold hover:underline">Sign In</a>
                </div>
            </form>
        </div>
    );
}
