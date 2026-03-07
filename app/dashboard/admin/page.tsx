'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardStats } from '@/lib/types';
import { Users, Church, BookOpen, BarChart3, TrendingUp, Award, ArrowUpRight, Plus, Shield, Crown } from 'lucide-react';
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

interface DashboardData extends DashboardStats {
    totalChurchAdmins?: number;
    totalMembers?: number;
    rankBreakdown?: { id: string; name: string; level: number; count: number }[];
}

export default function AdminDashboardPage() {
    const { data, isLoading } = useQuery<DashboardData>({
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

                {/* Members Hub */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors"
                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        <h2 className="font-bold text-slate-800 dark:text-slate-200">Members Hub</h2>
                    </div>
                    {isLoading ? (
                        <div className="p-6 grid grid-cols-3 gap-4">
                            {[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
                        </div>
                    ) : (
                        <div className="p-6 space-y-6">
                            {/* Role Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="rounded-2xl p-4 bg-gradient-to-br from-blue-600 to-blue-800 text-white relative overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(37,99,235,0.2)' }}>
                                    <div className="absolute -right-3 -top-3 w-14 h-14 rounded-full bg-white/10" />
                                    <Users className="w-5 h-5 text-white/70 mb-2" />
                                    <p className="text-3xl font-black">{data?.totalRAs ?? 0}</p>
                                    <p className="text-white/70 text-xs mt-1 font-medium">Regular Ambassadors (RAs)</p>
                                </div>
                                <div className="rounded-2xl p-4 bg-gradient-to-br from-amber-500 to-orange-600 text-white relative overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(245,158,11,0.2)' }}>
                                    <div className="absolute -right-3 -top-3 w-14 h-14 rounded-full bg-white/10" />
                                    <Shield className="w-5 h-5 text-white/70 mb-2" />
                                    <p className="text-3xl font-black">{data?.totalChurchAdmins ?? 0}</p>
                                    <p className="text-white/70 text-xs mt-1 font-medium">Church Administrators</p>
                                </div>
                                <div className="rounded-2xl p-4 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white relative overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(16,185,129,0.2)' }}>
                                    <div className="absolute -right-3 -top-3 w-14 h-14 rounded-full bg-white/10" />
                                    <Crown className="w-5 h-5 text-white/70 mb-2" />
                                    <p className="text-3xl font-black">{data?.totalMembers ?? 0}</p>
                                    <p className="text-white/70 text-xs mt-1 font-medium">Total Members</p>
                                </div>
                            </div>
                            {/* Rank Breakdown */}
                            {(data?.rankBreakdown?.length ?? 0) > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">RA Members by Rank</h3>
                                    <div className="space-y-2">
                                        {data!.rankBreakdown!.map(rank => (
                                            <div key={rank.id} className="flex items-center gap-3">
                                                <div className="flex items-center gap-2 w-40 flex-shrink-0">
                                                    <span className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-black flex items-center justify-center">{rank.level}</span>
                                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{rank.name}</span>
                                                </div>
                                                <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700"
                                                        style={{ width: `${data!.totalRAs! > 0 ? Math.round((rank.count / data!.totalRAs!) * 100) : 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 w-8 text-right">{rank.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

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
