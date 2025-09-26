'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '../utils/auth';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authService.post('/auth/login', formData);

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'super_admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div
    className="min-h-screen flex items-center justify-center relative"
    style={{
      background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/images/login-bg.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed'
    }}
  >
    {/* Navigation Bar */}
    <nav className="absolute top-0 w-full bg-white bg-opacity-90 backdrop-blur-sm shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Galvan AI</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/home" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Home
            </Link>
            <Link href="/login" className="text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Login
            </Link>
            <Link href="/register" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Signup
            </Link>
          </div>
        </div>
      </div>
    </nav>

    {/* Login Form */}
    <div className="relative z-10 max-w-md w-full mx-auto p-8">
      <div className="bg-white bg-opacity-95 backdrop-blur-sm p-8 rounded-lg shadow-xl">
        <div className="mb-6">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Sign in to Galvan AI
          </h2>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition duration-200"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/register" className="text-blue-600 hover:text-blue-500 font-medium">
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  </div>
);
}