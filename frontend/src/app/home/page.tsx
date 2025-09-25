'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{
        background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/images/home-bg.jpg')`,
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
              <Link href="/home" className="text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Login
              </Link>
              <Link href="/register" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Signup
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 text-center">
        <div className="bg-white bg-opacity-95 backdrop-blur-sm p-8 rounded-lg shadow-xl max-w-md mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Galvan AI
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Advanced Authentication System with Role-Based Access Control
          </p>

          <div className="space-y-4">
            <Link
              href="/login"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}