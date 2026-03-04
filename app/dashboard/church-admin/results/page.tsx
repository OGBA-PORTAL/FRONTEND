'use client';
// Church Admin Results — same as student results but protected for CHURCH_ADMIN

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Award, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

export default function ChurchAdminResultsPage() {
    const { data: results = [], isLoading } = useQuery<any[]>({
        queryKey: ['church-admin-results'],
        queryFn: async () => (await api.get('/results/my')).data.data.results,
    });

    const completed = results.filter(r => r.submittedAt);

    return (
        <ProtectedRoute allowedRoles={['CHURCH_ADMIN']}>
            <div className="space-y-5 max-w-4xl mx-auto">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">My Results</h1>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">Your completed exam results</p>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
                ) : completed.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-16 text-center border border-slate-100 dark:border-slate-800">
                        <Award className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">No results yet</p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Complete an exam to see your results here</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {completed.map((result: any) => (
                            <div key={result.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex items-center gap-4 transition-colors"
                                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${result.passed ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                    {result.passed
                                        ? <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                        : <XCircle className="w-6 h-6 text-red-500 dark:text-red-400" />
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">
                                        {result.exams?.title ?? 'Exam'}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                                        <span className={`text-xs font-semibold ${result.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                                            {result.passed ? 'Passed' : 'Failed'} — {result.score ?? 0}%
                                        </span>
                                        {result.submittedAt && (
                                            <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                                                <Clock className="w-3 h-3" />
                                                {new Date(result.submittedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className={`text-2xl font-black flex-shrink-0 ${result.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                                    {result.score ?? 0}%
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
