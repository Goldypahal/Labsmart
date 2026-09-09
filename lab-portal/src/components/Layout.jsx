import {
    Home,
    TestTube,
    FileText,
    Receipt,
    Settings,
    LogOut,
    Bell,
    UserCircle
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import UIExplorer from './UIExplorer';

const sidebarMenus = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Orders Queue', path: '/orders', icon: TestTube },
    { name: 'Result Entry', path: '/results', icon: FileText },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Billing', path: '/billing', icon: Receipt },
];

export default function Layout({ onLogout }) {
    return (
        <div className="flex h-screen bg-[var(--color-background)] overflow-hidden relative">
            {/* Sidebar - 240px Fixed Left */}
            <aside className="w-[240px] bg-white border-r border-[var(--color-border)] flex flex-col fixed inset-y-0 z-10 transition-transform">
                <div className="h-16 flex items-center px-6 border-b border-[var(--color-border)]">
                    {/* Logo Placeholder */}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded shrink-0 bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-xl leading-none">
                            D
                        </div>
                        <span className="font-[var(--font-heading)] font-bold text-lg text-[var(--color-dark)] tracking-tight">
                            PDC (Pahal Diagnostic Center)
                        </span>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {sidebarMenus.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${isActive
                                    ? 'bg-[var(--color-background)] text-[var(--color-primary)]'
                                    : 'text-[var(--color-muted)] hover:bg-gray-50 hover:text-[var(--color-dark)]'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--color-primary)] rounded-r-md"></span>
                                    )}
                                    <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-[var(--color-primary)]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                    {item.name}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-[var(--color-border)]">
                    <button
                        onClick={onLogout}
                        className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--color-muted)] hover:bg-gray-50 hover:text-red-600 transition-colors"
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col ml-[240px] relative min-w-0">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-[var(--color-border)] flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
                    <h1 className="text-xl font-[var(--font-heading)] font-semibold text-[var(--color-dark)]">
                        City Central Lab
                    </h1>

                    <div className="flex items-center gap-6">
                        <button className="text-[var(--color-muted)] hover:text-[var(--color-dark)] relative transition-colors">
                            <Bell className="h-5 w-5" />
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-white"></span>
                            </span>
                        </button>
                        <div className="h-8 w-px bg-[var(--color-border)]"></div>
                        <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium text-[var(--color-dark)] leading-tight">Admin User</p>
                                <p className="text-xs text-[var(--color-muted)]">Lab Technician</p>
                            </div>
                            <UserCircle className="h-8 w-8 text-gray-400 group-hover:text-[var(--color-primary)] transition-colors" />
                        </div>
                    </div>
                </header>

                {/* Scrollable Page Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>
            </div>
            <UIExplorer />
        </div>
    );
}

