'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ExamAttempt } from '@/lib/types';
import { useState } from 'react';
import { BarChart3, Search, Filter, Loader2, CheckCircle, XCircle, Clock, Trophy, Eye, Trash2, X, ShieldAlert, ShieldCheck, ClipboardCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminResultsPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('');

    // Modal states
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    // Queries
    const { data: attempts = [], isLoading } = useQuery<ExamAttempt[]>({
        queryKey: ['admin-results'],
        queryFn: async () => {
            const res = await api.get('/results');
            return res.data.data.results;
        },
    });

    const { data: detailedResult, isLoading: isReviewLoading } = useQuery<any>({
        queryKey: ['admin-result-detail', selectedAttemptId],
        queryFn: async () => {
            if (!selectedAttemptId) return null;
            const res = await api.get(`/results/${selectedAttemptId}`);
            return res.data.data;
        },
        enabled: !!selectedAttemptId && reviewModalOpen
    });

    // Mutations
    const withholdMutation = useMutation({
        mutationFn: async ({ id, isWithheld }: { id: string; isWithheld: boolean }) => {
            await api.patch(`/results/${id}/withhold`, { isWithheld });
        },
        onSuccess: (_, variables) => {
            toast.success(variables.isWithheld ? 'Result withheld' : 'Result released');
            queryClient.invalidateQueries({ queryKey: ['admin-results'] });
        },
        onError: (err: any) => {
            const msg = err.response?.data?.message || 'Failed to update withholding status';
            toast.error(msg);
        }
    });

    const bulkAssessmentMutation = useMutation({
        mutationFn: async (updates: any[]) => {
            await api.patch('/results/bulk-assessment', { updates });
        },
        onSuccess: () => {
            toast.success('All assessments updated successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-results'] });
            setBulkModalOpen(false);
        },
        onError: (err: any) => {
            const msg = err.response?.data?.message || 'Failed to update bulk assessments';
            toast.error(msg);
        }
    });

    const assessmentMutation = useMutation({
        mutationFn: async ({ id, ltcScore, hikingScore }: { id: string; ltcScore: number; hikingScore: number }) => {
            await api.patch(`/results/${id}/assessment`, { ltcScore, hikingScore });
        },
        onSuccess: () => {
            toast.success('Assessment scores updated');
            queryClient.invalidateQueries({ queryKey: ['admin-results'] });
            setAssessmentModalOpen(false);
        },
        onError: (err: any) => {
            const msg = err.response?.data?.message || 'Failed to update assessment';
            toast.error(msg);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/results/${id}`);
        },
        onSuccess: () => {
            toast.success('Exam result deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-results'] });
            setConfirmDeleteId(null);
        },
        onError: (err: any) => {
            const msg = err.response?.data?.message || 'Failed to delete result';
            toast.error(msg);
        }
    });

    const handleDelete = (id: string) => {
        setConfirmDeleteId(id);
    };

    const confirmDelete = () => {
        if (confirmDeleteId) {
            deleteMutation.mutate(confirmDeleteId);
        }
    };

    const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
    const [bulkModalOpen, setBulkModalOpen] = useState(false);
    const [bulkScores, setBulkScores] = useState<Record<string, { ltc: number; hiking: number }>>({});
    const [selectedAttempt, setSelectedAttempt] = useState<ExamAttempt | null>(null);

    // Filter results that have been submitted (ready for assessment)
    const submittableResults = attempts.filter(a => a.submittedAt || a.completedAt);

    const handleReview = (id: string) => {
        setSelectedAttemptId(id);
        setReviewModalOpen(true);
    };

    const filtered = attempts.filter(a => {
        const name = `${a.users?.firstName ?? ''} ${a.users?.lastName ?? ''} ${a.exams?.title ?? ''}`.toLowerCase();
        const matchSearch = search === '' || name.includes(search.toLowerCase());

        const isPassed = a.score !== null && a.exams?.passMark !== undefined
            ? a.score >= a.exams.passMark
            : !!a.passed;

        const matchFilter = filter === '' ||
            (filter === 'PASSED' && isPassed) ||
            (filter === 'FAILED' && !isPassed && a.submittedAt) ||
            (filter === 'PENDING' && !a.submittedAt);
        return matchSearch && matchFilter;
    });

    const totalPassed = attempts.filter(a => {
        return a.score !== null && a.exams?.passMark !== undefined
            ? a.score >= a.exams.passMark
            : !!a.passed;
    }).length;
    const totalFailed = attempts.filter(a => {
        if (!a.submittedAt) return false;
        return a.score !== null && a.exams?.passMark !== undefined
            ? a.score < a.exams.passMark
            : !a.passed;
    }).length;
    const passRate = attempts.length > 0 ? Math.round((totalPassed / attempts.length) * 100) : 0;

    const churchStats = attempts.reduce((acc, attempt) => {
        const churchId = attempt.users?.churchId;
        const churchName = attempt.users?.churches?.name;
        if (!churchId || !churchName) return acc;
        
        if (!acc[churchId]) {
            acc[churchId] = { id: churchId, name: churchName, passed: 0, failed: 0, total: 0 };
        }
        
        const isPassed = attempt.score !== null && attempt.exams?.passMark !== undefined
            ? attempt.score >= attempt.exams.passMark
            : !!attempt.passed;
            
        acc[churchId].total += 1;
        if (isPassed) {
            acc[churchId].passed += 1;
        } else if (attempt.submittedAt) {
            acc[churchId].failed += 1;
        }
        
        return acc;
    }, {} as Record<string, { id: string, name: string, passed: number, failed: number, total: number }>);

    const rankedChurches = Object.values(churchStats)
        .filter(c => c.total > 0)
        .map(c => ({
            ...c,
            passRate: Math.round((c.passed / c.total) * 100)
        }))
        .sort((a, b) => b.passRate - a.passRate || b.total - a.total);

    const topChurches = rankedChurches.slice(0, 3);
    const bottomChurches = [...rankedChurches].reverse().filter(c => c.passRate < 50 || rankedChurches.length <= 3).slice(0, 3);

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

                {/* Church Performance Hierarchy */}
                {rankedChurches.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-emerald-500" /> Top Performing Churches
                            </h3>
                            <div className="space-y-3">
                                {topChurches.map((church, idx) => (
                                    <div key={church.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{church.name}</p>
                                                <p className="text-xs text-slate-500">{church.passed} passed / {church.total} total</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{church.passRate}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-red-500" /> Needs Improvement
                            </h3>
                            <div className="space-y-3">
                                {bottomChurches.map((church, idx) => (
                                    <div key={church.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-xs font-bold">
                                                {rankedChurches.length - idx}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{church.name}</p>
                                                <p className="text-xs text-slate-500">{church.failed} failed / {church.total} total</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-red-600 dark:text-red-400">{church.passRate}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full md:w-auto overflow-x-auto hide-scrollbar">
                        {['', 'PASSED', 'FAILED', 'PENDING'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${filter === status 
                                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                {status === '' ? 'All Results' : status === 'PENDING' ? 'In Progress' : status.charAt(0) + status.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search name or exam..."
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 dark:text-slate-200 dark:placeholder-slate-500 transition-all shadow-sm" />
                    </div>
                    {submittableResults.length > 0 && (
                        <button
                            onClick={() => setBulkModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all whitespace-nowrap"
                        >
                            <ClipboardCheck className="w-4 h-4" /> Bulk Assessment Tool
                        </button>
                    )}
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
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Exam</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Grade (%)</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Result</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                                        <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {filtered.map(attempt => {
                                        const isPassed = attempt.score !== null && attempt.exams?.passMark !== undefined
                                            ? attempt.score >= attempt.exams.passMark
                                            : !!attempt.passed;

                                        return (
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
                                                <td className="px-5 py-4">
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{attempt.exams?.title ?? '—'}</p>
                                                </td>
                                                <td className="px-5 py-4">
                                                    {attempt.submittedAt ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                                                <div className={`h-full rounded-full ${isPassed ? 'bg-emerald-500' : 'bg-red-400'}`}
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
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${attempt.isWithheld ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : (isPassed ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400')}`}>
                                                            {attempt.isWithheld ? <ShieldAlert className="w-3 h-3" /> : (isPassed ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />)}
                                                            {attempt.isWithheld ? 'Withheld' : (isPassed ? 'Passed' : 'Failed')}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                                                            <Clock className="w-3 h-3" /> Pending
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="text-sm text-slate-400 dark:text-slate-500 whitespace-nowrap">
                                                        {attempt.submittedAt
                                                            ? new Date(attempt.submittedAt).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
                                                            : '—'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleReview(attempt.id)}
                                                            disabled={!attempt.submittedAt}
                                                            className="p-2 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Review Answers"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedAttempt(attempt);
                                                                setAssessmentModalOpen(true);
                                                            }}
                                                            disabled={!attempt.submittedAt}
                                                            className={`p-2 rounded-lg transition-colors ${(Number(attempt.ltcScore) > 0 || Number(attempt.hikingScore) > 0) ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                                            title="Manage Assessment (LTC/Hiking)"
                                                        >
                                                            <ClipboardCheck className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => withholdMutation.mutate({ id: attempt.id, isWithheld: !attempt.isWithheld })}
                                                            disabled={!attempt.submittedAt || withholdMutation.isPending}
                                                            className={`p-2 rounded-lg transition-colors ${attempt.isWithheld ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600'}`}
                                                            title={attempt.isWithheld ? "Release Result" : "Withhold Result"}
                                                        >
                                                            {withholdMutation.isPending && withholdMutation.variables?.id === attempt.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                attempt.isWithheld ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(attempt.id)}
                                                            className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
                                                            title="Delete Result"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                {confirmDeleteId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-xl border border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Delete Result?</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                                This will permanently remove this exam attempt. The student will be able to retake the exam. This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setConfirmDeleteId(null)}
                                    disabled={deleteMutation.isPending}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={confirmDelete}
                                    disabled={deleteMutation.isPending}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center gap-2">
                                    {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Detailed Review Modal Side-over */}
                {reviewModalOpen && (
                    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm transition-opacity">
                        <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Result Review</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Detailed question breakdown</p>
                                </div>
                                <button onClick={() => setReviewModalOpen(false)}
                                    className="p-2 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {isReviewLoading ? (
                                    <div className="flex flex-col items-center justify-center h-40">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                                        <p className="text-slate-500 text-sm">Loading detailed answers...</p>
                                    </div>
                                ) : detailedResult ? (
                                    <>
                                        {/* Review Header Stats */}
                                        {(() => {
                                            const isPassed = detailedResult.attempt.score !== null && detailedResult.attempt.exams?.passMark !== undefined
                                                ? detailedResult.attempt.score >= detailedResult.attempt.exams.passMark
                                                : !!detailedResult.attempt.passed;
                                            
                                            return (
                                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-800">
                                                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                                                <span>{detailedResult.attempt.users?.firstName} {detailedResult.attempt.users?.lastName}</span>
                                                                <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-[10px] font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
                                                                    {detailedResult.attempt.users?.ranks?.name || 'CANDIDATE (N/A)'}
                                                                </span>
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <p className="text-xs text-slate-500 font-medium">{detailedResult.attempt.exams?.title}</p>
                                                                {detailedResult.attempt.exams?.ranks?.name && (
                                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase">
                                                                        FOR {detailedResult.attempt.exams.ranks.name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-4">
                                                            <div className="text-right">
                                                                <p className="text-xs text-slate-500">Score</p>
                                                                <p className={`text-lg font-bold ${isPassed ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                    {detailedResult.attempt.score}%
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs text-slate-500">Result</p>
                                                                <p className={`text-lg font-bold ${isPassed ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                    {isPassed ? 'PASSED' : 'FAILED'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {/* Questions Breakdown */}
                                        <div className="space-y-4">
                                            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm px-1">Questions & Answers</h3>
                                            {detailedResult.questions.map((q: any, i: number) => (
                                                <div key={q.id} className={`p-5 rounded-xl border ${q.isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30' : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'}`}>
                                                    <div className="flex justify-between gap-4 mb-3">
                                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                            <span className="font-bold text-slate-500 dark:text-slate-400 mr-2">{i + 1}.</span>
                                                            {q.text}
                                                        </p>
                                                        <span className={`text-xs font-bold whitespace-nowrap ${q.isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>
                                                            {q.pointsText} pts
                                                        </span>
                                                    </div>

                                                    <div className="space-y-2 pl-6">
                                                        {q.options.map((opt: any) => {
                                                            const isCorrectOption = opt.id === q.correctOptionId;
                                                            const isStudentOption = opt.id === q.studentAnswerId;

                                                            let optClass = "p-3 rounded-lg text-sm border transition-colors ";
                                                            let icon = null;

                                                            if (isCorrectOption) {
                                                                optClass += "bg-emerald-100/50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-medium";
                                                                icon = <CheckCircle className="w-4 h-4 text-emerald-500" />;
                                                            } else if (isStudentOption && !isCorrectOption) {
                                                                optClass += "bg-red-100/50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300";
                                                                icon = <XCircle className="w-4 h-4 text-red-500" />;
                                                            } else {
                                                                optClass += "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400";
                                                            }

                                                            return (
                                                                <div key={opt.id} className={`flex items-center gap-3 ${optClass}`}>
                                                                    <div className="w-5 flex justify-center">{icon}</div>
                                                                    <span className="flex-1">{opt.text}</span>
                                                                    {isStudentOption && <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Selected</span>}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}

                                            {detailedResult.questions.length === 0 && (
                                                <p className="text-slate-500 text-center py-4">No answers found for this attempt.</p>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-40">
                                        <p className="text-slate-500 text-sm">Failed to load detailed answers.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Assessment Modal */}
            {assessmentModalOpen && selectedAttempt && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                                    <ClipboardCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Adjust Assessment</h3>
                                    <p className="text-xs text-slate-500">{selectedAttempt.users?.firstName} {selectedAttempt.users?.lastName}</p>
                                </div>
                            </div>
                            <button onClick={() => setAssessmentModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            assessmentMutation.mutate({
                                id: selectedAttempt.id,
                                ltcScore: Number(formData.get('ltcScore')),
                                hikingScore: Number(formData.get('hikingScore'))
                            });
                        }} className="p-6 space-y-6">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Raw Exam Percentage</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-200">{selectedAttempt.examScore || selectedAttempt.score}%</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Exam Core (80% Weight)</span>
                                    <span className="font-bold text-blue-600 dark:text-blue-400">{Math.round((selectedAttempt.examScore || selectedAttempt.score || 0) * 0.8)} pts</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex justify-between">
                                        LTC Assessment (Max 10)
                                        <span className="text-blue-600">points</span>
                                    </label>
                                    <input
                                        name="ltcScore"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="10"
                                        defaultValue={selectedAttempt.ltcScore || 0}
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex justify-between">
                                        Hiking Assessment (Max 10)
                                        <span className="text-blue-600">points</span>
                                    </label>
                                    <input
                                        name="hikingScore"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="10"
                                        defaultValue={selectedAttempt.hikingScore || 0}
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={assessmentMutation.isPending}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                            >
                                {assessmentMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Final Assessment'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Bulk Assessment Modal */}
            {bulkModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                            <div>
                                <h3 className="font-black text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2">
                                    <ClipboardCheck className="w-6 h-6 text-indigo-600" /> Bulk Assessment Entry
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">Easily update LTC and Hiking scores for all participants on one page.</p>
                            </div>
                            <button onClick={() => setBulkModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-0">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 z-10 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Candidate Details</th>
                                        <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] text-center">Exam Core (80%)</th>
                                        <th className="px-6 py-4 font-bold text-blue-600 uppercase tracking-wider text-[10px] text-center">LTC (10 pts)</th>
                                        <th className="px-6 py-4 font-bold text-emerald-600 uppercase tracking-wider text-[10px] text-center">Hiking (10 pts)</th>
                                        <th className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px] text-center">New Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {submittableResults.map((attempt) => {
                                        const examCore = Math.round((attempt.examScore || attempt.score || 0) * 0.8);
                                        const currentLtc = bulkScores[attempt.id]?.ltc ?? (attempt.ltcScore || 0);
                                        const currentHiking = bulkScores[attempt.id]?.hiking ?? (attempt.hikingScore || 0);
                                        const newTotal = Math.round(examCore + currentLtc + currentHiking);

                                        return (
                                            <tr key={attempt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-black text-slate-800 dark:text-slate-200">{attempt.users?.firstName} {attempt.users?.lastName}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{attempt.exams?.title}</p>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="font-black text-slate-600 dark:text-slate-400">{examCore}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="number" step="0.1" min="0" max="10"
                                                        value={currentLtc}
                                                        onChange={(e) => setBulkScores(prev => ({
                                                            ...prev,
                                                            [attempt.id]: { ...(prev[attempt.id] || { ltc: attempt.ltcScore || 0, hiking: attempt.hikingScore || 0 }), ltc: Number(e.target.value) }
                                                        }))}
                                                        className="w-20 mx-auto block px-3 py-1.5 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg text-center font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="number" step="0.1" min="0" max="10"
                                                        value={currentHiking}
                                                        onChange={(e) => setBulkScores(prev => ({
                                                            ...prev,
                                                            [attempt.id]: { ...(prev[attempt.id] || { ltc: attempt.ltcScore || 0, hiking: attempt.hikingScore || 0 }), hiking: Number(e.target.value) }
                                                        }))}
                                                        className="w-20 mx-auto block px-3 py-1.5 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-lg text-center font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className={`font-black text-lg ${newTotal >= (attempt.exams?.passMark || 50) ? 'text-emerald-600' : 'text-red-500'}`}>
                                                            {newTotal}%
                                                        </span>
                                                        <span className="text-[9px] font-bold uppercase tracking-tighter opacity-50">Estimated</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {submittableResults.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-20 text-center text-slate-400 font-medium">No results ready for assessment.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end gap-3">
                            <button onClick={() => setBulkModalOpen(false)} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
                            <button
                                onClick={() => {
                                    const updates = submittableResults.map(a => ({
                                        id: a.id,
                                        ltcScore: bulkScores[a.id]?.ltc ?? (a.ltcScore || 0),
                                        hikingScore: bulkScores[a.id]?.hiking ?? (a.hikingScore || 0)
                                    }));
                                    bulkAssessmentMutation.mutate(updates);
                                }}
                                disabled={bulkAssessmentMutation.isPending || submittableResults.length === 0}
                                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
                            >
                                {bulkAssessmentMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save All Assessments'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ProtectedRoute>
    );
}
