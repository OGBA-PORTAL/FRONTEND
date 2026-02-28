'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardStats } from '@/lib/types';
import { Users, Church, BookOpen, BarChart3, TrendingUp, Award, ArrowUpRight, Plus } from 'lucide-react';
import Link from 'next/link';

interface StatCardProps {
    label: string;
    value: number | string;
    icon: React.ElementType;
    gradient: string;
    iconBg: string;
    change?: string;
}

const StatCard = ({ label, value, icon: Icon, gradient, iconBg, change }: StatCardProps) => (
    <div className={`relative rounded-2xl p-6 overflow-hidden text-white ${gradient}`}
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
        {/* Background decoration */}
        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute -right-2 -bottom-6 w-16 h-16 rounded-full bg-white/5" />

        <div className="relative z-10 flex items-start justify-between">
            <div>
                <p className="text-white/70 text-sm font-medium mb-1">{label}</p>
                <p className="text-4xl font-bold tracking-tight">{value}</p>
                {change && (
                    <div className="flex items-center gap-1 mt-2">
                        <TrendingUp className="w-3.5 h-3.5 text-white/70" />
                        <span className="text-white/70 text-xs">{change}</span>
                    </div>
                )}
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
    </div>
);

export default function AdminDashboardPage() {
    const { data, isLoading } = useQuery<DashboardStats>({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const res = await api.get('/results/dashboard/stats');
            return res.data.data;
        },
    });

    return (
        <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'ASSOCIATION_OFFICER']}>
            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Dashboard Overview</h1>
                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">
                            {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <Link href="/dashboard/admin/exams/new"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
                        style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                        <Plus className="w-4 h-4" />
                        New Exam
                    </Link>
                </div>

                {/* Stats Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-36 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            label="Total Members"
                            value={data?.totalRAs ?? 0}
                            icon={Users}
                            gradient="bg-gradient-to-br from-blue-600 to-blue-800"
                            iconBg="bg-white/20"
                            change="Registered RAs"
                        />
                        <StatCard
                            label="Churches"
                            value={data?.totalChurches ?? 0}
                            icon={Church}
                            gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
                            iconBg="bg-white/20"
                            change="Active assemblies"
                        />
                        <StatCard
                            label="Active Exams"
                            value={data?.activeExams ?? 0}
                            icon={BookOpen}
                            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                            iconBg="bg-white/20"
                            change="Published & running"
                        />
                        <StatCard
                            label="Exams Taken"
                            value={data?.examsTaken ?? 0}
                            icon={BarChart3}
                            gradient="bg-gradient-to-br from-purple-600 to-purple-800"
                            iconBg="bg-white/20"
                            change="Total attempts"
                        />
                    </div>
                )}

                {/* Quick Actions + Info */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Quick Actions */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 transition-colors"
                        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                { href: '/dashboard/admin/exams/new', label: 'Create New Exam', icon: BookOpen, color: 'blue' },
                                { href: '/dashboard/admin/results', label: 'View Results', icon: TrendingUp, color: 'emerald' },
                                { href: '/dashboard/admin/users', label: 'Manage Members', icon: Award, color: 'purple' },
                            ].map(({ href, label, icon: Icon, color }) => (
                                <Link key={href} href={href}
                                    className={`group flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-dashed transition-all duration-200
                                        border-${color}-200 dark:border-${color}-800/50 hover:border-${color}-400 dark:hover:border-${color}-500 hover:bg-${color}-50 dark:hover:bg-${color}-900/20`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${color}-100 dark:bg-${color}-900/30 group-hover:bg-${color}-200 dark:group-hover:bg-${color}-900/50 transition-colors`}>
                                        <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
                                    </div>
                                    <span className={`text-sm font-semibold text-slate-600 dark:text-slate-300 group-hover:text-${color}-700 dark:group-hover:text-${color}-300 text-center`}>{label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* System Info */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 transition-colors"
                        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4">System Info</h2>
                        <div className="space-y-3">
                            {[
                                { label: 'Portal Version', value: 'v1.0.0' },
                                { label: 'Environment', value: 'Production' },
                                { label: 'Association', value: 'OGBA' },
                                { label: 'Year', value: new Date().getFullYear().toString() },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
                                    <span className="text-slate-400 dark:text-slate-500 text-sm">{label}</span>
                                    <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold">{value}</span>
                                </div>
                            ))}
                        </div>
                        <Link href="/dashboard/admin/results"
                            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                            View Full Report
                            <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
