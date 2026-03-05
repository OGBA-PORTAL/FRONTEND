'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState } from 'react';
import { Loader2, Printer, Search, Building2, MapPin, Award, FileText, Eye, X, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminReportsPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: report, isLoading } = useQuery({
        queryKey: ['global-report'],
        queryFn: async () => {
            const res = await api.get('/reports/global');
            return res.data.data.report;
        }
    });

    const churches = Object.keys(report || {});
    const filteredChurches = churches.filter(c => c.toLowerCase().includes(searchTerm.toLowerCase()));

    const [printTarget, setPrintTarget] = useState<string | null>(null);

    const handlePrint = (targetId: string | null = null) => {
        setPrintTarget(targetId);
        setTimeout(() => {
            window.print();
        }, 50);
    };

    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

    const { data: detailedResult, isLoading: isReviewLoading } = useQuery<any>({
        queryKey: ['admin-result-detail', selectedAttemptId],
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

    return (
        <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'ASSOCIATION_OFFICER']}>
            <div className="space-y-6 max-w-6xl mx-auto pb-12">
                {/* Header (Hidden in Print) */}
                <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Official Exam Reports</h1>
                        <p className="text-slate-500 text-sm mt-1">Hierarchical performance breakdown across all churches & exams.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search by church name..."
                                className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-300 w-full"
                            />
                        </div>
                        <button onClick={() => handlePrint(null)} className="flex items-center gap-2 bg-slate-800 dark:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors">
                            <Printer className="w-4 h-4" />
                            Print
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center p-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : filteredChurches.length === 0 ? (
                    <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 print:hidden">
                        <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium text-lg">No reporting data found.</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {filteredChurches.map(churchName => {
                            const churchId = `c/${churchName}`;
                            const showChurch = !printTarget || printTarget.startsWith(churchId);

                            return (
                                <div key={churchName} className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden print:border-none print:shadow-none print:break-inside-avoid ${!showChurch ? 'print:hidden' : ''}`}>
                                    {/* Church Header */}
                                    <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 print:bg-transparent print:border-b-2 print:border-black print:pb-2">
                                        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 uppercase tracking-wide">
                                            <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400 print:hidden" />
                                            <span className="flex-1">{churchName}</span>
                                            <button onClick={() => handlePrint(churchId)} className="print:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors" title={`Print ${churchName} Report`}>
                                                <Printer className="w-4 h-4" />
                                            </button>
                                        </h2>
                                    </div>

                                    <div className="p-6 space-y-8">
                                        {Object.keys(report[churchName]).map(examTitle => {
                                            const examId = `${churchId}/e/${examTitle}`;
                                            const showExam = !printTarget || printTarget === churchId || printTarget.startsWith(examId);

                                            return (
                                                <div key={examTitle} className={`space-y-6 print:break-inside-avoid ${!showExam ? 'print:hidden' : ''}`}>
                                                    {/* Exam Title */}
                                                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between border-l-4 border-blue-500 pl-3">
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="w-5 h-5 text-slate-400 print:hidden" />
                                                            {examTitle}
                                                        </div>
                                                        <button onClick={() => handlePrint(examId)} className="print:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors" title={`Print ${examTitle} for ${churchName}`}>
                                                            <Printer className="w-4 h-4" />
                                                        </button>
                                                    </h3>

                                                    {Object.keys(report[churchName][examTitle]).map(rankName => {
                                                        const rankId = `${examId}/r/${rankName}`;
                                                        const showRank = !printTarget || printTarget === churchId || printTarget === examId || printTarget === rankId;
                                                        const group = report[churchName][examTitle][rankName];

                                                        return (
                                                            <div key={rankName} className={`ml-4 space-y-4 ${!showRank ? 'print:hidden' : ''}`}>
                                                                {/* Rank Header + Aggregate Stats */}
                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl print:bg-transparent print:p-0 print:border-b print:border-slate-300">
                                                                    <div className="flex items-center gap-2">
                                                                        <Award className="w-5 h-5 text-amber-500 print:hidden" />
                                                                        <span className="font-bold text-slate-800 dark:text-slate-200 uppercase text-sm">{rankName} Rank</span>
                                                                        <button onClick={() => handlePrint(rankId)} className="print:hidden p-1.5 ml-2 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors" title={`Print ${rankName} for ${examTitle}`}>
                                                                            <Printer className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                    <div className="flex items-center gap-6 text-xs font-semibold uppercase tracking-wide">
                                                                        <span className="text-slate-500">Total: <span className="text-slate-800 dark:text-slate-200">{group.stats.total}</span></span>
                                                                        <span className="text-emerald-600 dark:text-emerald-400">Passed: {group.stats.passed}</span>
                                                                        <span className="text-red-600 dark:text-red-400">Failed: {group.stats.failed}</span>
                                                                        <span className="text-blue-600 dark:text-blue-400">Avg Score: {group.stats.avgScore}%</span>
                                                                    </div>
                                                                </div>

                                                                {/* Result Table */}
                                                                <div className="overflow-x-auto ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl print:ring-0">
                                                                    <table className="w-full text-sm text-left">
                                                                        <thead className="text-xs text-slate-600 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 uppercase print:bg-transparent print:border-black">
                                                                            <tr>
                                                                                <th className="px-4 py-3 font-semibold">RA Number</th>
                                                                                <th className="px-4 py-3 font-semibold">Name</th>
                                                                                <th className="px-4 py-3 font-semibold text-center">Score</th>
                                                                                <th className="px-4 py-3 font-semibold text-right">Result</th>
                                                                                <th className="px-4 py-3 font-semibold text-right print:hidden">Review</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-800 dark:text-slate-300">
                                                                            {group.members.map((member: any) => (
                                                                                <tr key={member.raNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 print:hover:bg-transparent">
                                                                                    <td className="px-4 py-3 font-mono text-xs">{member.raNumber}</td>
                                                                                    <td className="px-4 py-3 font-medium">{member.name}</td>
                                                                                    <td className="px-4 py-3 text-center font-bold">
                                                                                        {member.score !== null ? `${member.score}%` : 'N/A'}
                                                                                    </td>
                                                                                    <td className={`px-4 py-3 text-right font-bold ${member.passed ? 'text-emerald-600 dark:text-emerald-400 print:text-black' : 'text-red-600 dark:text-red-400 print:text-black'}`}>
                                                                                        {member.score !== null ? (member.passed ? 'PASSED' : 'FAILED') : 'PENDING'}
                                                                                    </td>
                                                                                    <td className="px-4 py-3 text-right print:hidden">
                                                                                        {member.attemptId ? (
                                                                                            <button onClick={() => handleReview(member.attemptId)}
                                                                                                className="p-1.5 inline-block rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
                                                                                                title="Review Answers">
                                                                                                <Eye className="w-4 h-4" />
                                                                                            </button>
                                                                                        ) : (
                                                                                            <span className="text-xs text-slate-400">N/A</span>
                                                                                        )}
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Detailed Review Modal Side-over */}
            {reviewModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm transition-opacity print:hidden">
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
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f0f4ff]/50 dark:bg-slate-950/50">
                            {isReviewLoading ? (
                                <div className="flex flex-col items-center justify-center h-40">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                                    <p className="text-slate-500 text-sm">Loading detailed answers...</p>
                                </div>
                            ) : detailedResult ? (
                                <>
                                    {/* Review Header Stats */}
                                    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
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
                                    <div className="space-y-4 pb-12">
                                        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm px-1">Questions & Answers</h3>
                                        {detailedResult.questions.map((q: any, i: number) => (
                                            <div key={q.id} className={`p-5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm ${q.isCorrect ? 'border-l-4 border-l-emerald-500 border-slate-200 dark:border-y-slate-800 dark:border-r-slate-800' : 'border-l-4 border-l-red-500 border-slate-200 dark:border-y-slate-800 dark:border-r-slate-800'}`}>
                                                <div className="flex justify-between gap-4 mb-4">
                                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                                                        <span className="font-bold text-slate-400 dark:text-slate-500 mr-2">{i + 1}.</span>
                                                        {q.text}
                                                    </p>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 self-start ${q.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                                                        {q.pointsText} pts
                                                    </span>
                                                </div>

                                                <div className="space-y-2.5">
                                                    {q.options.map((opt: any) => {
                                                        const isCorrectOption = opt.id === q.correctOptionId;
                                                        const isStudentOption = opt.id === q.studentAnswerId;

                                                        let borderClass = "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50";
                                                        let textClass = "text-slate-600 dark:text-slate-400";
                                                        let icon = <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600" />;

                                                        if (isCorrectOption) {
                                                            borderClass = "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/20";
                                                            textClass = "text-emerald-800 dark:text-emerald-300 font-medium";
                                                            icon = <CheckCircle className="w-4 h-4 text-emerald-500" />;
                                                        } else if (isStudentOption && !isCorrectOption) {
                                                            borderClass = "border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20";
                                                            textClass = "text-red-800 dark:text-red-300";
                                                            icon = <XCircle className="w-4 h-4 text-red-500" />;
                                                        }

                                                        return (
                                                            <div key={opt.id} className={`flex items-center gap-3 p-3.5 rounded-xl border transition-colors ${borderClass} ${textClass}`}>
                                                                <div className="w-5 flex justify-center flex-shrink-0">{icon}</div>
                                                                <span className="flex-1 text-sm">{opt.text}</span>
                                                                {isStudentOption && <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded">Selected</span>}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
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

            <style jsx global>{`
                @media print {
                    @page { margin: 1.5cm; }
                    body { background: white !important; color: black !important; }
                    nav, sidebar, header { display: none !important; }
                    .print\\:hidden { display: none !important; }
                    * {
                        box-shadow: none !important;
                        text-shadow: none !important;
                        background: transparent !important;
                    }
                }
            `}</style>
        </ProtectedRoute>
    );
}

