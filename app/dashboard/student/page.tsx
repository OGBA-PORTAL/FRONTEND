'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ExamAttempt } from '@/lib/types';
import { BookOpen, Award, CheckCircle, Clock, AlertCircle, ArrowRight, ShieldCheck, PlayCircle } from 'lucide-react';
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
    const submitted = attempts.filter(a => a.status !== 'STARTED');
    const released = submitted.filter(a => a.exams?.resultsReleased);
    
    // Calculate pass rate purely from released scores
    const passedAttempts = released.filter(a => 
        a.score !== null && a.exams?.passMark !== undefined 
            ? a.score >= a.exams.passMark 
            : !!a.passed
    );
    const passed = passedAttempts.length;

    // Circular Progress Math
    const passRate = released.length > 0 ? Math.round((passed / released.length) * 100) : 0;
    const strokeDashoffset = 251.2 - (251.2 * passRate) / 100;

    const statusIcon = (status: string) => {
        if (status === 'GRADED') return <CheckCircle className="w-4 h-4 text-emerald-500" />;
        if (status === 'SUBMITTED') return <Clock className="w-4 h-4 text-amber-500" />;
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
    };

    const statusLabel = (status: string) => {
        if (status === 'GRADED') return 'Graded';
        if (status === 'SUBMITTED') return 'Awaiting Results';
        return 'In Progress';
    };

    return (
        <ProtectedRoute>
            <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Advanced Premium Welcome Banner */}
                <div className="relative overflow-hidden rounded-3xl p-8 sm:p-10 shadow-xl"
                    style={{
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
                    }}>
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-4">
                            <div>
                                <p className="text-blue-200/80 font-medium tracking-wide text-sm mb-1 uppercase">Welcome back to the portal</p>
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                                    {user?.firstName} {user?.lastName}
                                </h1>
                                <p className="text-blue-100/70 font-mono mt-1.5 text-sm">{user?.raNumber}</p>
                            </div>

                            {user?.ranks && (
                                <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2 mt-2 shadow-inner">
                                    <div className="w-8 h-8 rounded-full bg-yellow-400/20 flex items-center justify-center border border-yellow-400/30">
                                        <Award className="w-4 h-4 text-yellow-300" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-blue-200/80 font-medium uppercase tracking-wider leading-none">Current Rank</span>
                                        <span className="text-white font-bold tracking-wide mt-1">
                                            {user.ranks.name} <span className="text-white/60 font-medium ml-1">Lvl {user.ranks.level}</span>
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Interactive Action Button for empty state inside banner */}
                        {attempts.length === 0 && !isLoading && (
                            <Link href="/dashboard/student/exams"
                                className="group inline-flex items-center gap-2 bg-white text-blue-900 px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-white/10 hover:shadow-white/20 hover:scale-105 transition-all duration-300">
                                <PlayCircle className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                                Start Your First Exam
                            </Link>
                        )}
                    </div>
                </div>

                {/* Dashboard Stats (Premium Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Activity Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/60 dark:border-slate-800/60 transition-all hover:shadow-md group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold tracking-wide uppercase">Activity Check</p>
                                <div className="mt-4 flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">{submitted.length}</span>
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">exams taken</span>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <BookOpen className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    {/* Progress Circle Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/60 dark:border-slate-800/60 transition-all hover:shadow-md group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
                        <div className="flex items-center justify-between h-full">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold tracking-wide uppercase">Performance</p>
                                <div className="mt-4 flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">{passed}</span>
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">passed</span>
                                </div>
                            </div>

                            {/* Animated SVG Ring */}
                            <div className="relative flex items-center justify-center w-24 h-24">
                                <svg className="w-24 h-24 transform -rotate-90">
                                    {/* Track */}
                                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                                        className="text-slate-100 dark:text-slate-800" />
                                    {/* Progress */}
                                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                                        strokeDasharray="251.2"
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        className="text-emerald-500 dark:text-emerald-400 transition-all duration-1000 ease-out" />
                                </svg>
                                <div className="absolute flex flex-col items-center justify-center">
                                    <span className="text-lg font-bold text-slate-800 dark:text-white">{passRate}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Exam History Section */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 transition-colors overflow-hidden relative">
                    <div className="flex items-center justify-between p-6 sm:px-8 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Exam History</h2>
                        </div>
                        <Link href="/dashboard/student/exams"
                            className="group flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl">
                            All Exams
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="p-8 space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : attempts.length === 0 ? (
                        <div className="p-16 text-center max-w-md mx-auto">
                            <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mx-auto mb-5 border border-slate-100 dark:border-slate-700">
                                <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">No active history</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">Your exam attempts and results will appear directly here once you start taking exams.</p>
                            <Link href="/dashboard/student/exams"
                                className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl text-sm font-bold shadow-lg hover:scale-105 transition-all">
                                Browse Available Exams
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 p-2">
                            {attempts.slice(0, 5).map((attempt) => (
                                <div key={attempt.id}
                                    className="group flex flex-col sm:flex-row sm:items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-2xl transition-all hover:scale-[1.01] cursor-default">
                                    <div className="w-12 h-12 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:shadow-md transition-all">
                                        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[15px] font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {attempt.exams?.title ?? 'Exam'}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                            <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                                {attempt.exams?.resultsReleased ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : statusIcon(attempt.status)}
                                                {attempt.exams?.resultsReleased ? 'Graded' : statusLabel(attempt.status)}
                                            </span>
                                            <span>
                                                {new Date(attempt.startedAt).toLocaleString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>

                                    {attempt.status === 'STARTED' && (
                                        <Link href={`/dashboard/student/exams/${attempt.examId}/take`}
                                            className="sm:ml-auto w-full sm:w-auto text-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold text-sm rounded-xl transition-colors">
                                            Resume
                                        </Link>
                                    )}

                                    {attempt.score !== null && attempt.exams?.resultsReleased && (
                                        <div className="sm:ml-auto flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Score</span>
                                                <div className={`px-3 py-1 rounded-lg text-sm font-black border ${attempt.passed ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'}`}>
                                                    {attempt.score} <span className="opacity-50 font-medium">%</span>
                                                </div>
                                            </div>
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
