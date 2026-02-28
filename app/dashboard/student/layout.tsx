'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard, BookOpen, Award, User,
    LogOut, ChevronRight, Menu, X, Bell, ChevronDown,
    PanelLeftClose, PanelLeftOpen, UserCircle
} from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import logo from '@/app/assets/ralogo.png';
import { ThemeToggle } from '@/components/ThemeToggle';

const navItems = [
    { href: '/dashboard/student', label: 'My Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/dashboard/student/exams', label: 'My Exams', icon: BookOpen },
    { href: '/dashboard/student/results', label: 'My Results', icon: Award },
    { href: '/dashboard/student/profile', label: 'My Profile', icon: User },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const isActive = (href: string, exact?: boolean) =>
        exact ? pathname === href : pathname.startsWith(href);

    const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();
    const currentPage = navItems.find(n => isActive(n.href, n.exact))?.label ?? 'Dashboard';

    return (
        <div className="flex h-screen bg-[#f0f4ff] dark:bg-slate-950 overflow-hidden transition-colors">
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)} />
            )}

            {/* ─── Sidebar ─── */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-30 flex flex-col
                    transition-all duration-300 ease-in-out
                    lg:relative lg:translate-x-0
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
                    ${collapsed ? 'lg:w-[72px]' : 'lg:w-64'}
                    w-64
                `}
                style={{
                    background: 'linear-gradient(160deg, #0f2d7a 0%, #1a3fa8 45%, #1e3a8a 100%)',
                    boxShadow: '4px 0 24px rgba(0,0,0,0.25)'
                }}
            >
                {/* Logo + Collapse Toggle */}
                <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
                    {!collapsed && (
                        <>
                            <div className="relative flex-shrink-0">
                                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 opacity-60 blur-sm" />
                                <div className="relative bg-white rounded-full p-1 shadow-lg">
                                    <Image src={logo} alt="RA Logo" width={36} height={36} className="rounded-full" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-bold text-sm leading-tight">OGBA Portal</p>
                                <p className="text-blue-300 text-xs">Member Portal</p>
                            </div>
                        </>
                    )}
                    {collapsed && (
                        <div className="relative">
                            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 opacity-60 blur-sm" />
                            <div className="relative bg-white rounded-full p-1 shadow-lg">
                                <Image src={logo} alt="RA Logo" width={32} height={32} className="rounded-full" />
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setMobileOpen(false)} className="lg:hidden text-white/50 hover:text-white p-1 flex-shrink-0">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* User Card */}
                {!collapsed ? (
                    <div className="px-4 pt-4 pb-3">
                        <div className="bg-white/10 rounded-2xl px-3 py-3 border border-white/10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm text-white"
                                    style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                                    {initials}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-white font-semibold text-sm truncate">{user?.firstName} {user?.lastName}</p>
                                    <p className="text-blue-300 text-xs truncate">{user?.raNumber}</p>
                                </div>
                            </div>
                            {user?.ranks && (
                                <div className="flex items-center gap-2 bg-yellow-400/15 border border-yellow-400/30 rounded-xl px-2.5 py-1.5">
                                    <span className="text-yellow-300 text-sm">🏅</span>
                                    <div>
                                        <p className="text-yellow-200 text-xs font-semibold">{user.ranks.name}</p>
                                        <p className="text-yellow-300/60 text-[10px]">Level {user.ranks.level}</p>
                                    </div>
                                </div>
                            )}
                            {user?.churches && (
                                <p className="text-blue-300/70 text-[10px] mt-2 truncate">⛪ {user.churches.name}</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center pt-4 pb-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white"
                            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                            title={`${user?.firstName} ${user?.lastName}`}>
                            {initials}
                        </div>
                    </div>
                )}

                {!collapsed && (
                    <p className="px-5 text-[10px] font-semibold uppercase tracking-widest text-blue-400 mb-2">Menu</p>
                )}

                {/* Nav */}
                <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
                    {navItems.map((item) => {
                        const active = isActive(item.href, item.exact);
                        return (
                            <Link key={item.href} href={item.href}
                                onClick={() => setMobileOpen(false)}
                                title={collapsed ? item.label : undefined}
                                className={`
                                    flex items-center gap-3 rounded-xl
                                    transition-all duration-200 group relative
                                    ${collapsed ? 'justify-center px-2 py-3' : 'px-3 py-2.5'}
                                    ${active
                                        ? 'bg-white text-blue-900 shadow-lg shadow-blue-900/20'
                                        : 'text-blue-200 hover:bg-white/10 hover:text-white'
                                    }
                                `}
                            >
                                {active && !collapsed && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-yellow-400 rounded-r-full" />
                                )}
                                <item.icon style={{ width: '18px', height: '18px', flexShrink: 0 }}
                                    className={active ? 'text-blue-700' : 'text-blue-300 group-hover:text-white'} />
                                {!collapsed && (
                                    <>
                                        <span className={`text-sm font-medium flex-1 ${active ? 'text-blue-900' : ''}`}>{item.label}</span>
                                        {active && <ChevronRight className="w-3.5 h-3.5 text-blue-400" />}
                                    </>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="px-2 pb-5 pt-3 border-t border-white/10 mt-2">
                    <button onClick={logout}
                        title={collapsed ? 'Sign Out' : undefined}
                        className={`w-full flex items-center gap-3 rounded-xl text-blue-200 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200
                            ${collapsed ? 'justify-center px-2 py-3' : 'px-3 py-2.5'}`}>
                        <LogOut style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                        {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* ─── Main ─── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f0f4ff] dark:bg-slate-950 transition-colors">
                <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 py-3.5 flex items-center gap-3 flex-shrink-0 transition-colors"
                    style={{ boxShadow: '0 1px 12px rgba(0,0,0,0.06)' }}>
                    <button onClick={() => setMobileOpen(true)}
                        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2 text-sm min-w-0">
                        <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">Portal</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 hidden sm:inline" />
                        <span className="text-slate-700 dark:text-slate-200 font-semibold truncate">{currentPage}</span>
                    </div>

                    <div className="ml-auto flex items-center gap-2 sm:gap-3">
                        <ThemeToggle />

                        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <Bell style={{ width: '18px', height: '18px' }} />
                        </button>

                        <div className="relative">
                            <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2 pl-1 pr-2 sm:pr-3 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                    style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                                    {initials}
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="text-slate-800 dark:text-slate-200 text-sm font-semibold leading-tight">{user?.firstName} {user?.lastName}</p>
                                    <p className="text-slate-400 dark:text-slate-500 text-xs">{user?.ranks?.name ?? 'Member'}</p>
                                </div>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            </button>

                            {userMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-slide-down">
                                        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                                            <p className="text-xs text-slate-400">RA Number</p>
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{user?.raNumber}</p>
                                        </div>
                                        <Link href="/dashboard/student/profile" onClick={() => setUserMenuOpen(false)}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            <UserCircle className="w-4 h-4 text-slate-400" />
                                            My Profile
                                        </Link>
                                        <button onClick={() => { setUserMenuOpen(false); logout(); }}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f0f4ff] dark:bg-slate-950 transition-colors">
                    {children}
                </main>
            </div>
        </div>
    );
}
