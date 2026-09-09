import { useState } from 'react';
import { ShieldAlert, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function Login() {
  const [email, setEmail] = useState('doctor@diagconnect.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventSetter;
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (res.data.user.role !== 'DOCTOR') {
        setError('This account does not have access to the doctor portal.');
        return;
      }
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            DiagConnect
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Sign in to your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="mt-2 text-center text-sm text-red-600 dark:red-400">{error}</p>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all hover:shadow-md"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="mr-2">Signing in...</span>
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M4 6h5a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" />
                    <path d="M16 19v-5a2 2 0 00-2-2h-2a2 2 0 00-2 2v5a2 2 0 002 2h2a2 2 0 002-2zm0-10V9a2 2 0 012 2h2a2 2 0 012-2v-5a2 2 0 01-2-2h-2a2 2 0 01-2 2z" />
                  </svg>
                </>
              ) : (
                <>
                  <span className="mr-2">Sign in</span>
                  <LogIn className="h-5 w-5 text-white" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
          <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} DiagConnect. All rights reserved.
          </p>
        </form>
      </div>
    </div>
  );
}