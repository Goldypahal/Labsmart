import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  FileText,
  CreditCard,
  ShieldCheck,
  LogOut,
  Microscope,
  Menu,
  X,
  Clock,
  Activity,
} from 'lucide-react';
import { labApi } from '../services/api';
import DemoEnvironmentBanner from './ui/DemoEnvironmentBanner';

export default function Layout({ onLogout }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = labApi.getCurrentUser();

  const handleLogout = () => {
    labApi.logout();
    if (onLogout) onLogout();
    navigate('/login');
  };

  const navItems = [
    { name: 'LIMS Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Accessioning & Orders', href: '/orders', icon: Layers },
    { name: 'Result Entry', href: '/results', icon: FileSpreadsheet },
    { name: 'Result Verification', href: '/verification', icon: CheckCircle2 },
    { name: 'Official Reports', href: '/reports', icon: FileText },
    { name: 'Billing & Invoicing', href: '/billing', icon: CreditCard },
    { name: 'Quality Control (QC)', href: '/quality', icon: ShieldCheck },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-150">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 select-none">
        {/* Brand */}
        <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <Microscope className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white tracking-tight leading-none block">
                Labsmart LIMS
              </span>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold tracking-wider uppercase block">
                Central Laboratory
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User bar */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 flex items-center justify-center font-bold text-xs shrink-0">
                CL
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {user?.name ?? 'Signed out'}
                </p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email ?? ''}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DemoEnvironmentBanner />
        {/* Top Navbar */}
        <header className="h-16 px-4 md:px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Central Pathology & Biochemistry Unit</span>
              <span>•</span>
              <span className="text-teal-600 font-medium">NABL ISO 15189:2022 Certified</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Analyzer Online (Port 5001)</span>
            </div>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 bg-white dark:bg-slate-900 h-full flex flex-col z-10 shadow-xl">
            <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Microscope className="w-5 h-5 text-teal-600" />
                <span className="font-bold text-slate-900 dark:text-white">Labsmart LIMS</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-md text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                        isActive
                          ? 'bg-teal-50 text-teal-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
