'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState } from 'react';
import raLogo from '@/app/assets/ralogo.png';
import { Loader2, Printer, Search, Award, FileText, Eye, X, CheckCircle, XCircle } from 'lucide-react';

export default function ChurchAdminReportsPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: report, isLoading } = useQuery({
        queryKey: ['church-report'],
        queryFn: async () => {
            const res = await api.get('/reports/church');
            return res.data.data.report;
        }
    });

    const exams = Object.keys(report || {});
    const filteredExams = exams.filter(e => e.toLowerCase().includes(searchTerm.toLowerCase()));

    const [printTarget, setPrintTarget] = useState<string | null>(null);

    const handlePrint = (targetId: string | null = null) => {
        setPrintTarget(targetId);
        // Temporarily force light mode so dark Tailwind classes don't hide text
        const htmlEl = document.documentElement;
        const wasDark = htmlEl.classList.contains('dark');
        if (wasDark) htmlEl.classList.remove('dark');
        setTimeout(() => {
            window.print();
            if (wasDark) htmlEl.classList.add('dark');
        }, 150);
    };

    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

    const { data: detailedResult, isLoading: isReviewLoading } = useQuery<any>({
        queryKey: ['church-result-detail', selectedAttemptId],
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

    const printDate = new Date().toLocaleDateString('en-GB', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const formatRank = (name: string) => {
        if (!name) return 'N/A (Candidate)';
        const l = name.trim().toLowerCase();
        if (l === 'unknown' || l === 'unknown rank' || l === 'n/a' || l === 'null') return 'N/A (Candidate)';
        return name;
    };

    return (
        <ProtectedRoute allowedRoles={['CHURCH_ADMIN']}>

            <style jsx global>{`
                @media print {
                    @page { size: A4 portrait; margin: 1.2cm 1cm; }
                    html, body { height: auto !important; overflow: visible !important; background: white !important; color: #1e293b !important; }
                    body > div, body > div > div,
                    [class*="flex"][class*="h-screen"],
                    [class*="overflow-hidden"],
                    [class*="overflow-y-auto"] {
                        height: auto !important; overflow: visible !important; max-height: none !important;
                    }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    aside, header, nav, [role="navigation"], .no-print { display: none !important; }
                    .rpt-letterhead { display: flex !important; }
                    .rpt-exam { page-break-before: always; break-before: page; }
                    .rpt-exam-first { page-break-before: auto; break-before: auto; }
                    .rpt-rank { page-break-inside: avoid; break-inside: avoid; }
                    /* Keep heading with its table — no orphaned titles */
                    h2, h3, h4 { page-break-after: avoid; break-after: avoid; }
                    /* Widow / orphan control */
                    tr { page-break-inside: avoid; break-inside: avoid; }
                    tbody { orphans: 3; widows: 3; }
                    * { box-shadow: none !important; border-radius: 0 !important; }
                }
            `}</style>

            {/* Letterhead */}
            <div className="rpt-letterhead" style={{ display: 'none', alignItems: 'center', gap: '16px', borderBottom: '4px solid #1e3a8a', paddingBottom: '12px', marginBottom: '20px', width: '100%' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={raLogo.src} alt="RA Logo" style={{ width: 68, height: 68, objectFit: 'contain' }} />
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '15px', fontWeight: 900, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Royal Ambassadors — OGBA Association</p>
                    <p style={{ fontSize: '11px', color: '#475569', marginTop: '2px', margin: 0 }}>Official Exam Performance Report — Church Summary</p>
                </div>
                <div style={{ textAlign: 'right', fontSize: '10px', color: '#64748b' }}>
                    <p style={{ fontWeight: 700, margin: 0 }}>Printed on</p>
                    <p style={{ margin: 0 }}>{printDate}</p>
                </div>
            </div>

            <div className="space-y-6 max-w-6xl mx-auto pb-12">

                {/* Screen Header */}
                <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Official Exam Reports</h1>
                        <p className="text-slate-500 text-sm mt-1">Released performance results grouped by rank.</p>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <div className="relative flex-1 min-w-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search by exam name..."
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-300" />
                        </div>
                        <button onClick={() => handlePrint(null)}
                            className="no-print flex items-center justify-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-800 transition-colors shadow-md shadow-blue-700/20 whitespace-nowrap">
                            <Printer className="w-4 h-4" /> Print All
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center p-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : filteredExams.length === 0 ? (
                    <div className="no-print text-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium text-lg">No reporting data available.</p>
                        <p className="text-slate-400 text-sm mt-1">Results appear here once released by system administrators.</p>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {filteredExams.map((examTitle, ei) => {
                            const examId = `e/${examTitle}`;
                            const showExam = !printTarget || printTarget.startsWith(examId);

                            return (
                                <div key={examTitle}
                                    className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm ${ei === 0 ? 'rpt-exam-first' : 'rpt-exam'} ${!showExam ? 'no-print' : ''}`}>

                                    {/* Exam header */}
                                    <div style={{ background: '#1e40af', color: 'white', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <FileText className="no-print w-5 h-5" style={{ opacity: 0.8 }} />
                                            <h3 style={{ fontWeight: 900, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{examTitle}</h3>
                                        </div>
                                        <button onClick={() => handlePrint(examId)}
                                            className="no-print text-xs font-bold px-3 py-1.5 rounded-lg"
                                            style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                                            <Printer className="w-3.5 h-3.5 inline mr-1" /> Print Exam
                                        </button>
                                    </div>

                                    <div className="p-5 space-y-8">
                                        {Object.keys(report[examTitle]).map(rankName => {
                                            const rankId = `${examId}/r/${rankName}`;
                                            const showRank = !printTarget || printTarget === examId || printTarget === rankId;
                                            const group = report[examTitle][rankName];
                                            const displayRank = formatRank(rankName);

                                            return (
                                                <div key={rankName} className={`rpt-rank ${!showRank ? 'no-print' : ''}`}>

                                                    {/* Rank stats bar */}
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 14px', marginBottom: 6 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <Award className="no-print w-4 h-4 text-amber-500" />
                                                            <span style={{ fontWeight: 900, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1e293b' }}>{displayRank}</span>
                                                            <button onClick={() => handlePrint(rankId)} className="no-print ml-1 p-1 rounded text-slate-400 hover:bg-slate-200 transition-colors">
                                                                <Printer className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: 16, fontSize: 11, fontWeight: 700 }}>
                                                            <span style={{ color: '#64748b' }}>Total: <strong style={{ color: '#1e293b' }}>{group.stats.total}</strong></span>
                                                            <span style={{ color: '#059669' }}>✓ Passed: {group.stats.passed}</span>
                                                            <span style={{ color: '#dc2626' }}>✗ Failed: {group.stats.failed}</span>
                                                            <span style={{ color: '#1d4ed8' }}>Avg: {group.stats.avgScore}%</span>
                                                        </div>
                                                    </div>

                                                    {/* Results table */}
                                                    <div className="overflow-x-auto" style={{ border: '1px solid #e2e8f0' }}>
                                                        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', textAlign: 'left' }}>
                                                            <thead>
                                                                <tr style={{ background: '#334155', color: 'white' }}>
                                                                    <th style={{ padding: '8px 10px', fontWeight: 700 }}>#</th>
                                                                    <th style={{ padding: '8px 10px', fontWeight: 700 }}>RA Number</th>
                                                                    <th style={{ padding: '8px 10px', fontWeight: 700 }}>Full Name</th>
                                                                    <th style={{ padding: '8px 10px', fontWeight: 700, textAlign: 'center' }}>Score</th>
                                                                    <th style={{ padding: '8px 10px', fontWeight: 700, textAlign: 'center' }}>Result</th>
                                                                    <th className="no-print" style={{ padding: '8px 10px', fontWeight: 700, textAlign: 'right' }}>Review</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {group.members.map((member: any, idx: number) => {
                                                                    const passed = member.score !== null && member.passed;
                                                                    const failed = member.score !== null && !member.passed;
                                                                    return (
                                                                        <tr key={member.raNumber} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                                                                            <td style={{ padding: '7px 10px', color: '#94a3b8', fontSize: 11, fontWeight: 600 }}>{idx + 1}</td>
                                                                            <td style={{ padding: '7px 10px', fontFamily: 'monospace', fontSize: 11, color: '#475569' }}>{member.raNumber}</td>
                                                                            <td style={{ padding: '7px 10px', fontWeight: 600, color: '#1e293b' }}>{member.name}</td>
                                                                            <td style={{ padding: '7px 10px', textAlign: 'center', fontWeight: 900, fontSize: 13, color: passed ? '#059669' : failed ? '#dc2626' : '#94a3b8' }}>
                                                                                {member.score !== null ? `${member.score}%` : '—'}
                                                                            </td>
                                                                            <td style={{ padding: '7px 10px', textAlign: 'center' }}>
                                                                                {member.score !== null ? (
                                                                                    <span style={{
                                                                                        display: 'inline-flex', alignItems: 'center', gap: 4,
                                                                                        padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 900, textTransform: 'uppercase',
                                                                                        background: passed ? '#d1fae5' : '#fee2e2',
                                                                                        color: passed ? '#065f46' : '#991b1b',
                                                                                    }}>
                                                                                        {passed ? '✓ Passed' : '✗ Failed'}
                                                                                    </span>
                                                                                ) : <span style={{ color: '#94a3b8', fontSize: 11 }}>Pending</span>}
                                                                            </td>
                                                                            <td className="no-print" style={{ padding: '7px 10px', textAlign: 'right' }}>
                                                                                {member.attemptId ? (
                                                                                    <button onClick={() => handleReview(member.attemptId)} className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                                                                        <Eye className="w-4 h-4" />
                                                                                    </button>
                                                                                ) : <span style={{ color: '#94a3b8', fontSize: 11 }}>—</span>}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                            <tfoot>
                                                                <tr style={{ background: '#f1f5f9', borderTop: '2px solid #cbd5e1' }}>
                                                                    <td colSpan={3} style={{ padding: '6px 10px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Summary</td>
                                                                    <td style={{ padding: '6px 10px', textAlign: 'center', fontSize: 11, fontWeight: 900, color: '#1d4ed8' }}>{group.stats.avgScore}% avg</td>
                                                                    <td style={{ padding: '6px 10px', textAlign: 'center', fontSize: 11, fontWeight: 900 }}>
                                                                        <span style={{ color: '#065f46' }}>{group.stats.passed} passed</span> / <span style={{ color: '#991b1b' }}>{group.stats.failed} failed</span>
                                                                    </td>
                                                                    <td className="no-print" />
                                                                </tr>
                                                            </tfoot>
                                                        </table>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div style={{ display: 'none', borderTop: '1px solid #cbd5e1', margin: '0 16px 12px', paddingTop: 6 }} className="rpt-footer">
                                        <p style={{ fontSize: 9, color: '#94a3b8', textAlign: 'right', margin: 0 }}>Royal Ambassadors OGBA — Confidential Exam Report — {printDate}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {reviewModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm no-print">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Result Review</h2>
                                <p className="text-sm text-slate-500">Detailed question breakdown</p>
                            </div>
                            <button onClick={() => setReviewModalOpen(false)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-200 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f0f4ff]/50">
                            {isReviewLoading ? (
                                <div className="flex flex-col items-center justify-center h-40">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                                    <p className="text-slate-500 text-sm">Loading detailed answers...</p>
                                </div>
                            ) : detailedResult ? (
                                <>
                                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                                        <div className="flex justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">{detailedResult.attempt.users?.firstName} {detailedResult.attempt.users?.lastName}</p>
                                                <p className="text-xs text-slate-500">{detailedResult.attempt.exams?.title}</p>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-500">Score</p>
                                                    <p className={`text-lg font-bold ${detailedResult.attempt.passed ? 'text-emerald-500' : 'text-red-500'}`}>{detailedResult.attempt.score}%</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-500">Result</p>
                                                    <p className={`text-lg font-bold ${detailedResult.attempt.passed ? 'text-emerald-500' : 'text-red-500'}`}>{detailedResult.attempt.passed ? 'PASSED' : 'FAILED'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4 pb-12">
                                        <h3 className="font-bold text-slate-800 text-sm">Questions & Answers</h3>
                                        {detailedResult.questions.map((q: any, i: number) => (
                                            <div key={q.id} className={`p-5 rounded-xl border bg-white shadow-sm ${q.isCorrect ? 'border-l-4 border-l-emerald-500 border-slate-200' : 'border-l-4 border-l-red-500 border-slate-200'}`}>
                                                <div className="flex justify-between gap-4 mb-4">
                                                    <p className="text-sm font-medium text-slate-800 leading-relaxed"><span className="font-bold text-slate-400 mr-2">{i + 1}.</span>{q.text}</p>
                                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md bg-slate-100 self-start ${q.isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>{q.pointsText} pts</span>
                                                </div>
                                                <div className="space-y-2.5">
                                                    {q.options.map((opt: any) => {
                                                        const isC = opt.id === q.correctOptionId, isS = opt.id === q.studentAnswerId;
                                                        let cls = 'border-slate-100 bg-slate-50 text-slate-600';
                                                        let icon = <div className="w-4 h-4 rounded-full border border-slate-300" />;
                                                        if (isC) { cls = 'border-emerald-200 bg-emerald-50 text-emerald-800 font-medium'; icon = <CheckCircle className="w-4 h-4 text-emerald-500" />; }
                                                        else if (isS) { cls = 'border-red-200 bg-red-50 text-red-800'; icon = <XCircle className="w-4 h-4 text-red-500" />; }
                                                        return (
                                                            <div key={opt.id} className={`flex items-center gap-3 p-3.5 rounded-xl border ${cls}`}>
                                                                <div className="w-5 flex justify-center flex-shrink-0">{icon}</div>
                                                                <span className="flex-1 text-sm">{opt.text}</span>
                                                                {isS && <span className="text-[10px] uppercase font-bold opacity-60 bg-black/5 px-2 py-0.5 rounded">Selected</span>}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-40">
                                    <p className="text-slate-500 text-sm">Failed to load answers.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </ProtectedRoute>
    );
}
