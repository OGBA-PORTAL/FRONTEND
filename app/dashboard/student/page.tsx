'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ExamAttempt } from '@/lib/types';
import { BookOpen, Award, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboardPage() {
    const { user } = useAuth();

    const { data: attemptsData, isLoading } = useQuery({
        queryKey: ['my-results'],
        queryFn: async () => {
            const res = await api.get('/results/me');
            return res.data.data.results as ExamAttempt[];
        },
    });

    const attempts = attemptsData ?? [];
    const submitted = attempts.filter(a => a.status !== 'STARTED').length;
    const passed = attempts.filter(a => a.passed === true).length;

    const statusIcon = (status: string) => {
        if (status === 'GRADED') return <CheckCircle className="w-4 h-4 text-emerald-500" />;
        if (status === 'SUBMITTED') return <Clock className="w-4 h-4 text-yellow-500" />;
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
    };

    const statusLabel = (status: string) => {
        if (status === 'GRADED') return 'Graded';
        if (status === 'SUBMITTED') return 'Awaiting Results';
        return 'In Progress';
    };

    return (
        <ProtectedRoute>
            <div className="space-y-6">
                {/* Welcome Banner */}
                <div className="gradient-blue rounded-2xl p-6 text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                        <p className="text-blue-200 text-sm mb-1">Welcome back,</p>
                        <h1 className="text-2xl font-bold mb-1">{user?.firstName} {user?.lastName}</h1>
                        <p className="text-blue-200 text-sm">{user?.raNumber}</p>
                        {user?.ranks && (
                            <div className="mt-3 inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                                <Award className="w-4 h-4 text-yellow-300" />
                                <span className="text-sm font-medium">{user.ranks.name}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 text-center transition-colors">
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{submitted}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Exams Taken</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 text-center transition-colors">
                        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{passed}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Exams Passed</p>
                    </div>
                </div>

                {/* Recent Attempts */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                    <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">My Exam History</h2>
                        <Link href="/dashboard/student/exams" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors">
                            Take an Exam →
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="p-6 space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : attempts.length === 0 ? (
                        <div className="p-12 text-center">
                            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                            <p className="text-slate-500 dark:text-slate-400 font-medium">No exams taken yet</p>
                            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Check the Exams tab to see available exams.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {attempts.slice(0, 5).map((attempt) => (
                                <div key={attempt.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                        <BookOpen className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                                            {attempt.exams?.title ?? 'Exam'}
                                        </p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500">
                                            {new Date(attempt.startedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {statusIcon(attempt.status)}
                                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{statusLabel(attempt.status)}</span>
                                    </div>
                                    {attempt.score !== null && (
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${attempt.passed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {attempt.score}/{attempt.totalPoints}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
