'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  mobile_number: string;
  role: string;
  is_verified: boolean;
  created_at: string;
  profile_picture?: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [admin, setAdmin] = useState<any>(null);
  const router = useRouter();

  const [newUser, setNewUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    mobile_number: '',
    profile_picture: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');

    if (!userData || !token) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== 'super_admin') {
      router.push('/dashboard');
      return;
    }

    setAdmin(user);
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:5000/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:5000/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        setNewUser({
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          mobile_number: '',
          profile_picture: ''
        });
        setShowCreateForm(false);
        fetchUsers();
        setError('');
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to create user');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:5000/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchUsers();
        setError('');
      } else {
        setError('Failed to delete user');
      }
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!admin) {
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
        background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/images/admin-bg.jpg')`,
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
                <Link href="/admin" className="text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-900">Welcome, {admin.first_name}</span>
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
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200 shadow-md"
          >
            {showCreateForm ? 'Cancel' : 'Create New User'}
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-white bg-opacity-95 backdrop-blur-sm p-6 rounded-lg shadow-xl mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Create New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">First Name</label>
                  <input
                    type="text"
                    placeholder="First Name"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                    value={newUser.first_name}
                    onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Last Name</label>
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                    value={newUser.last_name}
                    onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                  value={newUser.mobile_number}
                  onChange={(e) => setNewUser({...newUser, mobile_number: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Profile Picture URL (optional)</label>
                <input
                  type="url"
                  placeholder="Profile Picture URL (optional)"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                  value={newUser.profile_picture}
                  onChange={(e) => setNewUser({...newUser, profile_picture: e.target.value})}
                />
              </div>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
              >
                Create User
              </button>
            </form>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 bg-opacity-95 backdrop-blur-sm">
            {error}
          </div>
        )}

        <div className="bg-white bg-opacity-95 backdrop-blur-sm shadow-xl overflow-hidden rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <h3 className="text-lg font-semibold text-gray-900 mt-2">Users ({users.length})</h3>
          </div>

          {loading ? (
            <div className="p-4">Loading users...</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {users.map((user) => (
                <li key={user.id} className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        {user.profile_picture ? (
                          <img
                            src={user.profile_picture}
                            alt={`${user.first_name} ${user.last_name}`}
                            className="h-10 w-10 rounded-full object-cover shadow-md"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                            {user.first_name?.[0] || ''}{user.last_name?.[0] || ''}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-sm text-gray-700">{user.email}</p>
                          <p className="text-sm text-gray-700">{user.mobile_number}</p>
                        </div>
                        <div className="ml-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.is_verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_verified ? 'Verified' : 'Not Verified'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}