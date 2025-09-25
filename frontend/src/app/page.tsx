'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');

    if (token && user) {
      try {
        const userData = JSON.parse(user);
        if (userData.role === 'super_admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } catch (error) {
        // If there's an error parsing user data, redirect to home
        router.push('/home');
      }
    } else {
      // If no authentication, redirect to home page
      router.push('/home');
    }
  }, [router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: "url('/images/home-bg.jpg')"
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative z-10 text-center">
        <div className="bg-white bg-opacity-90 backdrop-blur-sm p-6 rounded-lg shadow-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-700">Redirecting...</p>
        </div>
      </div>
    </div>
  );
}