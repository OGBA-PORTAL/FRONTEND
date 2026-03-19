'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ExamAttempt } from '@/lib/types';
import { useState } from 'react';
import { BarChart3, CheckCircle, XCircle, Clock, Trophy, Loader2, Eye, X } from 'lucide-react';

export default function StudentResultsPage() {
    const { data: attempts = [], isLoading } = useQuery<ExamAttempt[]>({
        queryKey: ['my-attempts'],
        queryFn: async () => {
            const res = await api.get('/results/my');
            return res.data.data.results;
        },
    });

    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

    const { data: detailedResult, isLoading: isReviewLoading } = useQuery<any>({
        queryKey: ['student-result-detail', selectedAttemptId],
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

    const completed = attempts.filter(a => a.submittedAt || a.completedAt);
    const released = completed.filter(a => a.exams?.resultsReleased);
    const pendingReview = completed.filter(a => !a.exams?.resultsReleased);
    
    const passed = released.filter(a => {
        return a.score !== null && a.exams?.passMark !== undefined
            ? a.score >= a.exams.passMark
            : !!a.passed;
    }).length;
    const passRate = released.length > 0 ? Math.round((passed / released.length) * 100) : 0;

    return (
        <ProtectedRoute allowedRoles={['RA']}>
            <div className="space-y-5 max-w-4xl mx-auto">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">My Results</h1>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">Your exam history and performance</p>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        { label: 'Exams Taken', value: completed.length, icon: BarChart3, color: 'from-blue-600 to-blue-800' },
                        { label: 'Exams Pending Review', value: pendingReview.length, icon: Clock, color: 'from-slate-600 to-slate-800' },
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
                                <div key={attempt.id} className="px-5 py-4 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-50 dark:bg-blue-900/30">
                                            <CheckCircle className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                                                {attempt.exams?.title ?? 'Exam'}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                                    Submitted
                                                </span>
                                                {(attempt.submittedAt || attempt.completedAt) && (
                                                    <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(attempt.submittedAt ?? attempt.completedAt!).toLocaleString('en-NG', {
                                                            day: 'numeric', month: 'short', year: 'numeric',
                                                            hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        {attempt.exams?.resultsReleased ? (
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl font-bold text-slate-800 dark:text-slate-200">
                                                        {attempt.score}%
                                                    </span>
                                                    {attempt.score !== null && attempt.exams?.passMark !== undefined && attempt.score >= attempt.exams.passMark ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                            <Trophy className="w-3 h-3" />
                                                            PASSED
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                            <XCircle className="w-3 h-3" />
                                                            FAILED
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                                                    Pass Mark: {attempt.exams?.passMark}%
                                                </span>
                                                <button
                                                    onClick={() => handleReview(attempt.id)}
                                                    className="mt-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline flex items-center gap-1 transition-colors"
                                                >
                                                    <Eye className="w-3 h-3" /> View Breakdown
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                                <Clock className="w-3 h-3" />
                                                Awaiting Result
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

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
                                        <p className="text-slate-500 text-sm">Loading your answers...</p>
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
        </ProtectedRoute>
    );
}
