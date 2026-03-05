'use client';
// Church Admin Results — same as student results but protected for CHURCH_ADMIN

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState } from 'react';
import { Award, CheckCircle, XCircle, Clock, Loader2, Eye, X, Search, Filter } from 'lucide-react';
import { ExamAttempt } from '@/lib/types';

export default function ChurchAdminResultsPage() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('');
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

    const { data: attempts = [], isLoading } = useQuery<ExamAttempt[]>({
        queryKey: ['church-admin-results'],
        queryFn: async () => {
            const res = await api.get('/results/church');
            return res.data.data.results;
        }
    });

    const { data: detailedResult, isLoading: isReviewLoading } = useQuery<any>({
        queryKey: ['church-admin-result-detail', selectedAttemptId],
        queryFn: async () => {
            if (!selectedAttemptId) return null;
            const res = await api.get(`/results/${selectedAttemptId}`);
            return res.data.data;
        },
        enabled: !!selectedAttemptId && reviewModalOpen
    });

    const handleReview = (id: string) => {
        setSelectedAttemptId(id);
        setReviewModalOpen(true);
    };

    const filtered = attempts.filter((a: any) => {
        const name = `${a.users?.firstName ?? ''} ${a.users?.lastName ?? ''} ${a.exams?.title ?? ''}`.toLowerCase();
        const matchSearch = search === '' || name.includes(search.toLowerCase());
        const matchFilter = filter === '' ||
            (filter === 'PASSED' && a.passed) ||
            (filter === 'FAILED' && !a.passed);
        return matchSearch && matchFilter;
    });

    return (
        <ProtectedRoute allowedRoles={['CHURCH_ADMIN']}>
            <div className="space-y-5 max-w-4xl mx-auto">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">My Results</h1>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">Your completed exam results</p>
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
                        </select>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-16 text-center border border-slate-100 dark:border-slate-800">
                        <Award className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">No results found</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((result: any) => (
                            <div key={result.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex items-center gap-4 transition-colors"
                                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${result.passed ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                    {result.passed
                                        ? <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                        : <XCircle className="w-6 h-6 text-red-500 dark:text-red-400" />
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">
                                            {result.users?.firstName} {result.users?.lastName}
                                        </span>
                                        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                            {result.users?.raNumber}
                                        </span>
                                    </div>
                                    <p className="font-medium text-slate-600 dark:text-slate-400 text-xs truncate">
                                        {result.exams?.title ?? 'Exam'}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${result.passed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                            {result.passed ? 'Passed' : 'Failed'}
                                        </span>
                                        {result.submittedAt && (
                                            <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                                                <Clock className="w-3 h-3" />
                                                {new Date(result.submittedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-right flex-shrink-0">
                                    <div className={`text-2xl font-black ${result.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                                        {result.score ?? 0}%
                                    </div>
                                    <button
                                        onClick={() => handleReview(result.id)}
                                        className="p-2 ml-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                        title="Detailed Review"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Detailed Review Modal Side-over (Same as global admin) */}
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
                                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-800">
                                            <div className="flex flex-col sm:flex-row justify-between gap-4">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                                        {detailedResult.attempt.users?.firstName} {detailedResult.attempt.users?.lastName}
                                                    </p>
                                                    <p className="text-xs text-slate-500">{detailedResult.attempt.exams?.title}</p>
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="text-right">
                                                        <p className="text-xs text-slate-500">Score</p>
                                                        <p className={`text-lg font-bold ${detailedResult.attempt.passed ? 'text-emerald-500' : 'text-red-500'}`}>
                                                            {detailedResult.attempt.score}%
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-slate-500">Result</p>
                                                        <p className={`text-lg font-bold ${detailedResult.attempt.passed ? 'text-emerald-500' : 'text-red-500'}`}>
                                                            {detailedResult.attempt.passed ? 'PASSED' : 'FAILED'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

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
        </ProtectedRoute>
    );
}
