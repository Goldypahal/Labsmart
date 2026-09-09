import { NavLink } from 'react-router-dom';
import {
    Home,
    Users,
    FileText,
    Stethoscope,
    Calendar,
    MessageSquare,
    Bell,
    BarChart2,
    FolderOpen,
    ClipboardList,
    Video,
    Settings,
    User,
    LogOut,
    Moon,
    Sun,
    Activity
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar() {
    const { theme, toggleTheme } = useTheme();

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const navigation = [
        { name: 'Dashboard', href: '/', icon: Home },
        { name: 'Patient Management', href: '/patients', icon: Users },
        { name: 'My Reports', href: '/reports', icon: FileText },
        { name: 'Test Ordering', href: '/order', icon: Stethoscope },
        { name: 'Appointments', href: '/appointments', icon: Calendar },
        { name: 'Messaging', href: '/chat', icon: MessageSquare },
        { name: 'Alerts', href: '/notifications', icon: Bell },
        { name: 'Analytics', href: '/analytics', icon: BarChart2 },
        { name: 'Document Vault', href: '/emr', icon: FolderOpen },
        { name: 'Clinical Notes', href: '/notes', icon: ClipboardList },
        { name: 'Teleconsultation', href: '/teleconsult', icon: Video },
        { name: 'Prescriptions', href: '/prescriptions', icon: FileText },
        { name: 'My Profile', href: '/profile', icon: User },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 transition-colors duration-200 shrink-0">
            <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg w-8 h-8 mr-3 shadow-md">
                    <Activity className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent truncate tracking-tight">PDC</h1>
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden pt-4 pb-4">
                <nav className="flex-1 space-y-1 px-3">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) =>
                                `group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all ${isActive
                                    ? 'bg-emerald-600 text-white shadow-md border border-emerald-600 translate-x-1'
                                    : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-emerald-400 border border-transparent'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon
                                        className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'}`}
                                        aria-hidden="true"
                                    />
                                    <span className="truncate">{item.name}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 p-4 shrink-0">
                <button
                    onClick={toggleTheme}
                    className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-emerald-400 transition-colors"
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
                    onClick={handleLogout}
                    className="group flex w-full items-center rounded-md px-3 py-2 mt-1 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-800 transition-colors"
                >
                    <LogOut className="mr-3 h-5 w-5 text-red-500 group-hover:text-red-600 dark:group-hover:text-red-400" />
                    Logout
                </button>
            </div>
        </div>
    );
}
