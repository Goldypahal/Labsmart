import { useState } from 'react';
import axios from 'axios';
import { Microscope, LogIn } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function Login({ onLogin }) {
    const [email, setEmail] = useState('lab@diagconnect.com');
    const [password, setPassword] = useState('password123');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email, password });
            if (res.data.user.role !== 'LAB_ADMIN') {
                setError('This account does not have access to the laboratory portal.');
                return;
            }
            localStorage.setItem('token', res.data.token);
            onLogin(res.data.user);
        } catch (error) {
            setError(error.response?.data?.message || 'Login failed. Please check credentials.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-[var(--color-surface)] p-10 rounded-2xl shadow-xl shadow-[var(--color-border)] border border-[var(--color-border)]">
                <div>
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ccfbf1] mb-6 shadow-inner">
                        <Microscope className="h-8 w-8 text-[var(--color-primary)]" />
                    </div>
                    <h2 className="mt-2 text-center text-3xl font-extrabold font-[var(--font-heading)] text-[var(--color-dark)] tracking-tight">
                        PDC (Pahal Diagnostic Center)
                    </h2>
                    <p className="mt-2 text-center text-sm font-medium text-[var(--color-muted)] uppercase tracking-widest">
                        Laboratory Portal
                    </p>
                </div>
                <form className="mt-10 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <input
                                type="email"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-[var(--color-border)] placeholder-gray-400 text-[var(--color-dark)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all sm:text-sm"
                                placeholder="Lab Admin Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-[var(--color-border)] placeholder-gray-400 text-[var(--color-dark)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-[var(--color-primary)] hover:bg-[#0f766e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] shadow-lg shadow-teal-500/30 transition-all hover:-translate-y-0.5"
                        >
                            <LogIn className="h-5 w-5 opacity-80 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                            Access Portal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
