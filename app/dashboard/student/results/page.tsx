'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ExamAttempt } from '@/lib/types';
import { BarChart3, CheckCircle, XCircle, Clock, Trophy, Loader2 } from 'lucide-react';

export default function StudentResultsPage() {
    const { data: attempts = [], isLoading } = useQuery<ExamAttempt[]>({
        queryKey: ['my-attempts'],
        queryFn: async () => {
            const res = await api.get('/results/my');
            return res.data.data.results;
        },
    });

    const completed = attempts.filter(a => a.submittedAt || a.completedAt);
    const passed = completed.filter(a => a.passed).length;
    const passRate = completed.length > 0 ? Math.round((passed / completed.length) * 100) : 0;

    return (
        <ProtectedRoute allowedRoles={['RA']}>
            <div className="space-y-5 max-w-4xl mx-auto">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">My Results</h1>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">Your exam history and performance</p>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Exams Taken', value: completed.length, icon: BarChart3, color: 'from-blue-600 to-blue-800' },
                        { label: 'Passed', value: passed, icon: CheckCircle, color: 'from-emerald-500 to-emerald-700' },
                        { label: 'Failed', value: completed.length - passed, icon: XCircle, color: 'from-red-500 to-red-700' },
                        { label: 'Pass Rate', value: `${passRate}%`, icon: Trophy, color: 'from-amber-500 to-orange-600' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className={`rounded-2xl p-4 text-white bg-gradient-to-br ${color} relative overflow-hidden`}
                            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
                            <div className="absolute -right-2 -top-2 w-12 h-12 rounded-full bg-white/10" />
                            <Icon className="w-4 h-4 text-white/70 mb-2" />
                            <p className="text-2xl font-bold">{value}</p>
                            <p className="text-white/70 text-xs mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Results List */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors"
                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="font-bold text-slate-800 dark:text-slate-200">Exam History</h2>
                    </div>

                    {isLoading ? (
                        <div className="p-12 text-center">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
                        </div>
                    ) : completed.length === 0 ? (
                        <div className="p-12 text-center">
                            <BarChart3 className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                            <p className="text-slate-500 dark:text-slate-400 font-medium">No completed exams yet</p>
                            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Complete an exam to see your results here</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50 dark:divide-slate-800">
                            {completed.map(attempt => (
                                <div key={attempt.id} className="px-5 py-4 flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${attempt.passed ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                        {attempt.passed
                                            ? <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                            : <XCircle className="w-5 h-5 text-red-500 dark:text-red-400" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                                            {attempt.exams?.title ?? 'Exam'}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className={`text-xs font-semibold ${attempt.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                                                {attempt.passed ? 'Passed' : 'Failed'}
                                            </span>
                                            {(attempt.submittedAt || attempt.completedAt) && (
                                                <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(attempt.submittedAt ?? attempt.completedAt!).toLocaleDateString('en-NG', {
                                                        day: 'numeric', month: 'short', year: 'numeric'
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className={`text-2xl font-bold ${attempt.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                                            {attempt.score ?? 0}%
                                        </p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500">Score</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
