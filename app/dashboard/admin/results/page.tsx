'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ExamAttempt } from '@/lib/types';
import { useState } from 'react';
import { BarChart3, Search, Filter, Loader2, CheckCircle, XCircle, Clock, Trophy } from 'lucide-react';

export default function AdminResultsPage() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('');

    const { data: attempts = [], isLoading } = useQuery<ExamAttempt[]>({
        queryKey: ['admin-results'],
        queryFn: async () => {
            const res = await api.get('/results');
            return res.data.data.results;
        },
    });

    const filtered = attempts.filter(a => {
        const name = `${a.users?.firstName ?? ''} ${a.users?.lastName ?? ''} ${a.exams?.title ?? ''}`.toLowerCase();
        const matchSearch = search === '' || name.includes(search.toLowerCase());
        const matchFilter = filter === '' ||
            (filter === 'PASSED' && a.passed) ||
            (filter === 'FAILED' && !a.passed) ||
            (filter === 'PENDING' && !a.submittedAt);
        return matchSearch && matchFilter;
    });

    const totalPassed = attempts.filter(a => a.passed).length;
    const totalFailed = attempts.filter(a => a.submittedAt && !a.passed).length;
    const passRate = attempts.length > 0 ? Math.round((totalPassed / attempts.length) * 100) : 0;

    return (
        <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'ASSOCIATION_OFFICER']}>
            <div className="space-y-5 max-w-7xl mx-auto">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Results & Reports</h1>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">All exam attempts across the association</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Attempts', value: attempts.length, icon: BarChart3, color: 'from-blue-600 to-blue-800' },
                        { label: 'Passed', value: totalPassed, icon: CheckCircle, color: 'from-emerald-500 to-emerald-700' },
                        { label: 'Failed', value: totalFailed, icon: XCircle, color: 'from-red-500 to-red-700' },
                        { label: 'Pass Rate', value: `${passRate}%`, icon: Trophy, color: 'from-amber-500 to-orange-600' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className={`rounded-2xl p-5 text-white bg-gradient-to-br ${color} relative overflow-hidden`}
                            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
                            <div className="absolute -right-3 -top-3 w-16 h-16 rounded-full bg-white/10" />
                            <Icon className="w-5 h-5 text-white/70 mb-2" />
                            <p className="text-3xl font-bold">{value}</p>
                            <p className="text-white/70 text-xs mt-1">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 transition-colors"
                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search by member name or exam..."
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 dark:text-slate-200 dark:placeholder-slate-500 transition-all" />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select value={filter} onChange={e => setFilter(e.target.value)}
                            className="pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 appearance-none cursor-pointer dark:text-slate-200 transition-all">
                            <option value="">All Results</option>
                            <option value="PASSED">Passed</option>
                            <option value="FAILED">Failed</option>
                            <option value="PENDING">In Progress</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors"
                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    {isLoading ? (
                        <div className="p-12 text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
                            <p className="text-slate-400 text-sm">Loading results...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="p-12 text-center">
                            <BarChart3 className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                            <p className="text-slate-500 dark:text-slate-400 font-medium">No results found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Member</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Exam</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Score</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Result</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {filtered.map(attempt => (
                                        <tr key={attempt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                                        style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                                                        {attempt.users?.firstName?.[0]}{attempt.users?.lastName?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                                            {attempt.users?.firstName} {attempt.users?.lastName}
                                                        </p>
                                                        <p className="text-xs text-slate-400 dark:text-slate-500">{attempt.users?.raNumber}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 hidden md:table-cell">
                                                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{attempt.exams?.title ?? '—'}</p>
                                            </td>
                                            <td className="px-5 py-4">
                                                {attempt.submittedAt ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                                            <div className={`h-full rounded-full ${attempt.passed ? 'bg-emerald-500' : 'bg-red-400'}`}
                                                                style={{ width: `${attempt.score ?? 0}%` }} />
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{attempt.score ?? 0}%</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> In progress
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                {attempt.submittedAt ? (
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${attempt.passed ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                                        {attempt.passed ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                        {attempt.passed ? 'Passed' : 'Failed'}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                                                        <Clock className="w-3 h-3" /> Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 hidden lg:table-cell">
                                                <span className="text-sm text-slate-400 dark:text-slate-500">
                                                    {attempt.submittedAt
                                                        ? new Date(attempt.submittedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
                                                        : '—'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
