'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');

    if (!userData || !token) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/images/dashboard-bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Navigation Bar */}
      <nav className="relative z-10 bg-white bg-opacity-90 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-bold text-gray-900">Galvan AI</h1>
              <div className="flex items-center space-x-4">
                <Link href="/home" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Home
                </Link>
                <Link href="/dashboard" className="text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto py-6 px-4">
        <div className="bg-white bg-opacity-95 backdrop-blur-sm overflow-hidden shadow-xl rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Galvan AI Dashboard
            </h1>
          </div>
          <div className="px-4 py-5">
            <div className="flex items-center space-x-4 mb-6">
              {user.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt="Profile"
                  className="h-16 w-16 rounded-full object-cover shadow-md"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold shadow-md">
                  {user.first_name?.[0] || ''}{user.last_name?.[0] || ''}
                </div>
              )}
              <h2 className="text-xl font-semibold text-gray-900">
                Welcome, {user.first_name} {user.last_name}!
              </h2>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800">Email</h3>
                <p className="text-lg text-gray-900 font-medium">{user.email}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800">Mobile</h3>
                <p className="text-lg text-gray-900 font-medium">{user.mobile_number}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800">Role</h3>
                <p className="text-lg text-gray-900 font-medium capitalize">{user.role}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800">Verified</h3>
                <p className="text-lg text-gray-900 font-medium">{user.is_verified ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}