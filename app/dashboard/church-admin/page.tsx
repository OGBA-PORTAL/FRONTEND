'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Users, Shield, BookOpen, Award, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ChurchAdminHomePage() {
    const { user } = useAuth();

    const { data: members = [] } = useQuery<any[]>({
        queryKey: ['church-members'],
        queryFn: async () => {
            const res = await api.get('/users');
            return res.data.data.users;
        },
    });

    const raMembers = members.filter((m: any) => m.role === 'RA');
    const activeMembers = raMembers.filter((m: any) => m.status === 'ACTIVE');

    const stats = [
        {
            label: 'Total Members',
            value: raMembers.length,
            icon: Users,
            color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
            iconBg: 'bg-blue-100 dark:bg-blue-900/40',
        },
        {
            label: 'Active Members',
            value: activeMembers.length,
            icon: Award,
            color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
            iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
        },
    ];

    return (
        <ProtectedRoute allowedRoles={['CHURCH_ADMIN']}>
            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Welcome */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 transition-colors"
                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </div>
                        <div>
                            <p className="text-slate-400 dark:text-slate-500 text-sm">Welcome back,</p>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{user?.firstName} {user?.lastName}</h1>
                            <div className="flex items-center gap-1.5 mt-1">
                                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Church Admin</span>
                                {user?.churches && (
                                    <span className="text-xs text-slate-400 dark:text-slate-500">— {user.churches.name}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    {stats.map(({ label, value, icon: Icon, color, iconBg }) => (
                        <div key={label} className={`rounded-2xl p-5 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors`}
                            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                            <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-3`}>
                                <Icon className={`w-5 h-5 ${color.split(' ').slice(2).join(' ')}`} />
                            </div>
                            <p className="text-2xl font-black text-slate-800 dark:text-slate-200">{value}</p>
                            <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link href="/dashboard/church-admin/members"
                        className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all group"
                        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Church Members</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">Register &amp; manage members</p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </Link>

                    <Link href="/dashboard/church-admin/exams"
                        className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all group"
                        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">My Exams</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">Take your rank exams</p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </Link>
                </div>
            </div>
        </ProtectedRoute>
    );
}
