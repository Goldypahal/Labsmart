import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import UIExplorer from '../components/UIExplorer';

export default function Layout() {
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden relative">
            <Sidebar />
            <div className="flex-1 overflow-auto rounded-tl-2xl border-t border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 mt-2 mr-2 mb-2 p-6 shadow-sm">
                <Outlet />
            </div>
            <UIExplorer />
        </div>
    );
}

