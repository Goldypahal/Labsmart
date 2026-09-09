import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import UIExplorer from '../components/UIExplorer';

export default function Layout() {
    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0a0e1a] transition-colors duration-200 relative">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden relative">
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
                    <Outlet />
                </main>
            </div>
            <UIExplorer />
        </div>
    );
}

