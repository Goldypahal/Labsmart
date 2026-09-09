import { NavLink } from 'react-router-dom';
import {
    Home,
    FileText,
    Map,
    Calendar,
    MessageSquare,
    Bell,
    Settings,
    User,
    History,
    Moon,
    Sun,
    LogOut,
    FlaskConical
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar() {
    const { theme, toggleTheme } = useTheme();
    const logout = () => {
        localStorage.removeItem('token');
        window.location.assign('/');
    };

    const navigation = [
        { name: 'Dashboard', href: '/', icon: Home },
        { name: 'My Reports', href: '/reports', icon: FileText },
        { name: 'Live Collection Map', href: '/live-map', icon: Map },
        { name: 'Book a Test', href: '/book-test', icon: FlaskConical },
        { name: 'Appointments', href: '/appointments', icon: Calendar },
        { name: 'Chat / Support', href: '/chat', icon: MessageSquare },
        { name: 'Notifications', href: '/notifications', icon: Bell },
        { name: 'Test History', href: '/history', icon: History },
        { name: 'Profile', href: '/profile', icon: User },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 transition-colors duration-200">
            <div className="flex h-16 shrink-0 items-center px-6">
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">PDC (Pahal Diagnostic Center)</h1>
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
                <nav className="flex-1 space-y-1 px-3">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) =>
                                `group flex items-center rounded-md px-3 py-2 text-sm font-medium ${isActive
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-gray-800 dark:text-emerald-400'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-emerald-400'
                                }`
                            }
                        >
                            <item.icon
                                className="mr-3 h-5 w-5 flex-shrink-0"
                                aria-hidden="true"
                            />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 p-4">
                <button
                    onClick={toggleTheme}
                    className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-emerald-400"
                >
                    {theme === 'dark' ? (
                        <>
                            <Sun className="mr-3 h-5 w-5 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                            Light Mode
                        </>
                    ) : (
                        <>
                            <Moon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                            Dark Mode
                        </>
                    )}
                </button>
                <button
                    onClick={logout}
                    className="group flex w-full items-center rounded-md px-3 py-2 mt-1 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-800"
                >
                    <LogOut className="mr-3 h-5 w-5 text-red-500" />
                    Logout
                </button>
            </div>
        </div>
    );
}
