'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState, useMemo } from 'react';
import raLogo from '@/app/assets/ralogo.png';
import { Loader2, Printer, Search, Building2, Award, FileText, Eye, X, CheckCircle, XCircle, TrendingUp, Users, BarChart3, LayoutList, Presentation } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const RANK_ORDER = [
    'n/a (candidate)',
    'assistant intern',
    'intern',
    'observer',
    'explorer',
    'pioneer',
    'ambassador'
];

const getRankWeight = (name: string) => {
    const lower = name.toLowerCase();
    for (let i = 0; i < RANK_ORDER.length; i++) {
        if (lower.includes(RANK_ORDER[i])) return i;
    }
    return 99;
};

export default function AdminReportsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'church' | 'rank' | 'insights'>('church');

    const { data, isLoading } = useQuery({
        queryKey: ['global-report'],
        queryFn: async () => {
            const res = await api.get('/reports/global');
            return res.data.data;
        }
    });

    const report = data?.report || {};
    const rawData = data?.rawData || [];

    const churches = Object.keys(report || {});
    const filteredChurches = churches.filter(c => c.toLowerCase().includes(searchTerm.toLowerCase()));

    const [printTarget, setPrintTarget] = useState<string | null>(null);

    const handlePrint = (targetId: string | null = null) => {
        setPrintTarget(targetId);
        // Temporarily force light mode so dark-mode Tailwind classes don't hide text
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

    const printDate = new Date().toLocaleDateString('en-GB', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const formatRank = (name: string) => {
        if (!name) return 'N/A (Candidate)';
        const l = name.trim().toLowerCase();
        if (l === 'unknown' || l === 'unknown rank' || l === 'n/a' || l === 'null') return 'N/A (Candidate)';
        return name;
    };

    // --- ENHANCED GROUPING: BY RANK ---
    // Rank -> Exam -> Members
    const groupedByRank = useMemo(() => {
        if (!rawData.length) return {};
        const grouping: any = {};

        rawData.forEach((a: any) => {
            const rankName = formatRank(a.users?.ranks?.name);
            const examTitle = a.exams?.title || 'Unknown Exam';

            if (!grouping[rankName]) grouping[rankName] = {};
            if (!grouping[rankName][examTitle]) {
                grouping[rankName][examTitle] = {
                    members: [],
                    stats: { total: 0, passed: 0, failed: 0, totalScore: 0, avgScore: 0 }
                };
            }

            const group = grouping[rankName][examTitle];
            const didPass = a._livePassed; // from our backend fix

            group.members.push({
                attemptId: a.id,
                name: `${a.users.firstName} ${a.users.lastName}`,
                church: a.users?.churches?.name || 'Unknown Church',
                raNumber: a.users.raNumber,
                score: a.score,
                passed: didPass
            });

            group.stats.total++;
            if (didPass) group.stats.passed++;
            else group.stats.failed++;
            group.stats.totalScore += (a.score || 0);
            group.stats.avgScore = Math.round(group.stats.totalScore / group.stats.total);
        });
        return grouping;
    }, [rawData]);

    // Ranks array for the "By Rank" view
    const ranks = Object.keys(groupedByRank).sort((a, b) => getRankWeight(a) - getRankWeight(b));
    const filteredRanks = ranks.filter(r => r.toLowerCase().includes(searchTerm.toLowerCase()));

    // --- DEEP ANALYTICS / INSIGHTS ---
    const insights = useMemo(() => {
        if (!rawData.length) return null;

        let totalCandidates = rawData.length;
        let totalPassed = 0;
        let totalScore = 0;
        
        const churchStats: Record<string, { total: number, passed: number, score: number }> = {};
        const examStats: Record<string, { total: number, passed: number, score: number }> = {};
        const rankStats: Record<string, { total: number, passed: number, score: number, topPerformers: any[] }> = {};
        const topCandidates: any[] = [];

        rawData.forEach((a: any) => {
            const didPass = a._livePassed;
            if (didPass) totalPassed++;
            totalScore += (a.score || 0);

            const cName = a.users?.churches?.name || 'Unknown Church';
            if (!churchStats[cName]) churchStats[cName] = { total: 0, passed: 0, score: 0 };
            churchStats[cName].total++;
            if (didPass) churchStats[cName].passed++;
            churchStats[cName].score += (a.score || 0);

            const eName = a.exams?.title || 'Unknown Exam';
            if (!examStats[eName]) examStats[eName] = { total: 0, passed: 0, score: 0 };
            examStats[eName].total++;
            
            const rName = formatRank(a.users?.ranks?.name);
            if (!rankStats[rName]) rankStats[rName] = { total: 0, passed: 0, score: 0, topPerformers: [] };
            rankStats[rName].total++;
            if (didPass) rankStats[rName].passed++;
            rankStats[rName].score += (a.score || 0);
            if (didPass) examStats[eName].passed++;
            examStats[eName].score += (a.score || 0);

            // Keep top 100 for sorting later
            if (a.score !== null) {
                const performer = {
                    name: `${a.users?.firstName} ${a.users?.lastName}`,
                    church: cName,
                    exam: eName,
                    score: a.score,
                    raNumber: a.users?.raNumber
                };
                
                topCandidates.push(performer);
                
                // Also track for rank-specific leaderboards
                rankStats[rName].topPerformers.push(performer);
            }
        });

        // Calculate Rank Chart Data
        const chartRankData = Object.keys(rankStats).map(r => ({
            name: r,
            passed: rankStats[r].passed,
            failed: rankStats[r].total - rankStats[r].passed,
            passRate: Math.round((rankStats[r].passed / rankStats[r].total) * 100),
            total: rankStats[r].total
        })).sort((a, b) => b.total - a.total);

        // Calculate Exam Chart Data
        const chartExamData = Object.keys(examStats).map(e => ({
            name: e,
            passed: examStats[e].passed,
            failed: examStats[e].total - examStats[e].passed,
            passRate: Math.round((examStats[e].passed / examStats[e].total) * 100),
            total: examStats[e].total
        })).sort((a, b) => b.total - a.total);

        // Calculate Top Performer Per Rank
        const topPerformerPerRank = Object.keys(rankStats)
            .map(rName => {
                const candidatesForRank = rankStats[rName].topPerformers;
                candidatesForRank.sort((a, b) => b.score - a.score);
                if (candidatesForRank.length > 0) {
                    return {
                        rankName: rName,
                        ...candidatesForRank[0] // take highest
                    };
                }
                return null;
            })
            .filter(Boolean)
            .sort((a: any, b: any) => getRankWeight(a.rankName) - getRankWeight(b.rankName)); // Ascending hierarchical order

        const churchLeaderboard = Object.entries(churchStats)
            .map(([name, stats]) => ({
                name,
                passRate: Math.round((stats.passed / stats.total) * 100),
                avgScore: Math.round(stats.score / stats.total),
                total: stats.total
            }))
            .sort((a, b) => b.passRate - a.passRate || b.avgScore - a.avgScore);

        const toughestExams = Object.entries(examStats)
            .map(([name, stats]) => ({
                name,
                passRate: Math.round((stats.passed / stats.total) * 100),
                total: stats.total
            }))
            .sort((a, b) => a.passRate - b.passRate);

        topCandidates.sort((a, b) => b.score - a.score);

        return {
            overallPassRate: totalCandidates ? Math.round((totalPassed / totalCandidates) * 100) : 0, 
            overallAvgScore: totalCandidates ? Math.round(totalScore / totalCandidates) : 0, 
            totalCandidates,
            topChurches: churchLeaderboard.slice(0, 5),
            toughestExams: toughestExams.slice(0, 5),
            topPerformers: topCandidates.slice(0, 10),
            topPerformerPerRank,
            chartRankData,
            chartExamData
        };
    }, [rawData]);
    // Set of RA Numbers that are rank valedictorians
    const valedictorianRaNumbers = useMemo(() => {
        if (!insights?.topPerformerPerRank) return new Set<string>();
        return new Set(insights.topPerformerPerRank.map((p: any) => p.raNumber));
    }, [insights]);

    return (
        <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'ASSOCIATION_OFFICER']}>

            {/* ============================================================
                PRINT CSS — overrides dashboard layout overflow clipping
            ============================================================ */}
            <style jsx global>{`
                @media print {
                    @page { size: A4 portrait; margin: 1.2cm 1cm; }

                    /* Override the dashboard layout overflow-hidden / overflow-y-auto */
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
                    .rpt-church { page-break-before: always; break-before: page; }
                    .rpt-church-first { page-break-before: auto; break-before: auto; }
                    .rpt-rank { page-break-inside: avoid; break-inside: avoid; }
                    /* Keep heading with its table — no orphaned titles */
                    .rpt-exam-heading { page-break-after: avoid; break-after: avoid; }
                    h2, h3, h4 { page-break-after: avoid; break-after: avoid; }
                    /* Widow / orphan control on table content */
                    tr { page-break-inside: avoid; break-inside: avoid; }
                    tbody { orphans: 3; widows: 3; }
                    * { box-shadow: none !important; border-radius: 0 !important; }
                }
            `}</style>

            {/* ============================================================
                PRINT LETTERHEAD (screen: hidden, print: visible)
            ============================================================ */}
            <div className="rpt-letterhead" style={{ display: 'none', alignItems: 'center', gap: '16px', borderBottom: '4px solid #1e3a8a', paddingBottom: '12px', marginBottom: '20px', width: '100%' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={raLogo.src} alt="RA Logo" style={{ width: 68, height: 68, objectFit: 'contain' }} />
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '15px', fontWeight: 900, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Royal Ambassadors — OGBA Association</p>
                    <p style={{ fontSize: '11px', color: '#475569', marginTop: '2px', margin: 0 }}>Official Exam Performance Report</p>
                </div>
                <div style={{ textAlign: 'right', fontSize: '10px', color: '#64748b' }}>
                    <p style={{ fontWeight: 700, margin: 0 }}>Printed on</p>
                    <p style={{ margin: 0 }}>{printDate}</p>
                </div>
            </div>

            {/* ============================================================
                SCREEN PAGE
            ============================================================ */}
            <div className="space-y-6 max-w-6xl mx-auto pb-12">

                {/* Screen header — hidden in print */}
                <div className="no-print bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Official Exam Reports</h1>
                            <p className="text-slate-500 text-sm mt-1">Deep analytics and performance breakdowns.</p>
                        </div>
                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            {activeTab !== 'insights' && (
                                <div className="relative flex-1 min-w-0">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                        placeholder={`Search by ${activeTab}...`}
                                        className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-300" />
                                </div>
                            )}
                            {activeTab !== 'insights' && (
                                <button onClick={() => handlePrint(null)}
                                    className="no-print flex items-center justify-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-800 transition-colors shadow-md shadow-blue-700/20 whitespace-nowrap">
                                    <Printer className="w-4 h-4" /> Print {activeTab === 'church' ? 'All Churches' : 'All Ranks'}
                                </button>
                            )}
                            {activeTab === 'insights' && (
                                <button onClick={() => window.print()}
                                    className="no-print flex items-center justify-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-900 transition-colors shadow-md shadow-black/10 whitespace-nowrap">
                                    <Printer className="w-4 h-4" /> Print Dashboard
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex px-4 pt-4 gap-2 overflow-x-auto bg-slate-50/50 dark:bg-slate-900/50">
                        <button onClick={() => { setActiveTab('church'); setSearchTerm(''); }}
                            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'church' ? 'border-blue-600 text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-800/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                            <Building2 className="w-4 h-4" /> Group by Church
                        </button>
                        <button onClick={() => { setActiveTab('rank'); setSearchTerm(''); }}
                            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'rank' ? 'border-blue-600 text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-800/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                            <Award className="w-4 h-4" /> Group by Rank
                        </button>
                        <button onClick={() => setActiveTab('insights')}
                            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'insights' ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-800/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                            <TrendingUp className="w-4 h-4" /> Deep Insights
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center p-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : activeTab === 'church' ? (
                    filteredChurches.length === 0 ? (
                        <div className="no-print text-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium text-lg">No reporting data found.</p>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {filteredChurches.map((churchName, ci) => {
                                const churchId = `c/${churchName}`;
                                const showChurch = !printTarget || printTarget.startsWith(churchId);

                                return (
                                    <div key={churchName}
                                        className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm ${ci === 0 ? 'rpt-church-first' : 'rpt-church'} ${!showChurch ? 'no-print' : ''}`}>

                                        {/* Church header */}
                                        <div style={{ background: '#1e40af', color: 'white', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <Building2 className="no-print w-5 h-5" style={{ opacity: 0.8 }} />
                                                <div>
                                                    <h2 style={{ fontWeight: 900, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{churchName}</h2>
                                                    <p className="no-print" style={{ fontSize: 11, opacity: 0.75, margin: 0 }}>
                                                        {Object.keys(report[churchName]).length} exam(s)
                                                    </p>
                                                </div>
                                            </div>
                                            <button onClick={() => handlePrint(churchId)}
                                                className="no-print text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                                                style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                                                <Printer className="w-3.5 h-3.5 inline mr-1" /> Print Church
                                            </button>
                                        </div>

                                        <div className="p-5 space-y-8">
                                            {Object.keys(report[churchName]).map(examTitle => {
                                                const examId = `${churchId}/e/${examTitle}`;
                                                const showExam = !printTarget || printTarget === churchId || printTarget.startsWith(examId);

                                                return (
                                                    <div key={examTitle} className={!showExam ? 'no-print' : ''}>
                                                        {/* Exam title */}
                                                        <div className="rpt-exam-heading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '5px solid #2563eb', paddingLeft: 12, marginBottom: 16 }}>
                                                            <h3 style={{ fontWeight: 900, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1e293b', margin: 0 }}>{examTitle}</h3>
                                                            <button onClick={() => handlePrint(examId)}
                                                                className="no-print text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors">
                                                                <Printer className="w-3.5 h-3.5 inline mr-1" /> Print Exam
                                                            </button>
                                                        </div>

                                                        <div className="space-y-6">
                                                            {Object.keys(report[churchName][examTitle]).map(rankName => {
                                                                const rankId = `${examId}/r/${rankName}`;
                                                                const showRank = !printTarget || printTarget === churchId || printTarget === examId || printTarget === rankId;
                                                                const group = report[churchName][examTitle][rankName];
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
                                                                            <div style={{ display: 'flex', gap: 16, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
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
                                                                                                <td style={{ padding: '7px 10px', fontWeight: 600, color: '#1e293b' }}>
                                                                                                    {member.name}
                                                                                                    {valedictorianRaNumbers.has(`${rankName}-${member.raNumber}`) && (
                                                                                                        <span title="Valedictorian for this Rank"><Award className="w-3.5 h-3.5 text-amber-500 inline ml-1.5 align-text-bottom no-print" /></span>
                                                                                                    )}
                                                                                                </td>
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
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Print footer per church */}
                                        <div style={{ display: 'none', borderTop: '1px solid #cbd5e1', margin: '0 16px 12px', paddingTop: 6 }} className="rpt-footer">
                                            <p style={{ fontSize: 9, color: '#94a3b8', textAlign: 'right', margin: 0 }}>Royal Ambassadors OGBA Association — Confidential Exam Report — {printDate}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                ) : activeTab === 'rank' ? (
                    // ------------------------------------------------------------------------------------------------ //
                    // BY RANK TAB                                                                                      //
                    // ------------------------------------------------------------------------------------------------ //
                    filteredRanks.length === 0 ? (
                        <div className="no-print text-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium text-lg">No reporting data found.</p>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {filteredRanks.map((rankName, ri) => {
                                const rankId = `rk/${rankName}`;
                                const showRank = !printTarget || printTarget.startsWith(rankId);

                                return (
                                    <div key={rankName}
                                        className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm ${ri === 0 ? 'rpt-church-first' : 'rpt-church'} ${!showRank ? 'no-print' : ''}`}>

                                        {/* Rank header */}
                                        <div style={{ background: '#0f172a', color: 'white', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <Award className="no-print w-5 h-5 text-amber-500" style={{ opacity: 0.9 }} />
                                                <div>
                                                    <h2 style={{ fontWeight: 900, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, color: '#f59e0b' }}>{rankName}</h2>
                                                    <p className="no-print" style={{ fontSize: 11, opacity: 0.75, margin: 0 }}>
                                                        {Object.keys(groupedByRank[rankName]).length} church(es) participating
                                                    </p>
                                                </div>
                                            </div>
                                            <button onClick={() => handlePrint(rankId)}
                                                className="no-print text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                                                style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                                                <Printer className="w-3.5 h-3.5 inline mr-1" /> Print By Rank
                                            </button>
                                        </div>

                                        <div className="p-5 space-y-10">
                                            {Object.keys(groupedByRank[rankName]).map(examTitle => {
                                                const examId = `${rankId}/e/${examTitle}`;
                                                const group = groupedByRank[rankName][examTitle];

                                                return (
                                                    <div key={examTitle} className={`rpt-rank`}>
                                                        {/* Exam stats bar */}
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 14px', marginBottom: 6 }}>
                                                            <span style={{ fontWeight: 900, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1e293b' }}>{examTitle}</span>
                                                            <div style={{ display: 'flex', gap: 16, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
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
                                                                        <th style={{ padding: '8px 10px', fontWeight: 700 }}>Church</th>
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
                                                                                <td style={{ padding: '7px 10px', fontWeight: 600, color: '#1e293b' }}>
                                                                                    {member.name}
                                                                                    {valedictorianRaNumbers.has(`${rankName}-${member.raNumber}`) && (
                                                                                        <span title="Valedictorian for this Rank"><Award className="w-3.5 h-3.5 text-amber-500 inline ml-1.5 align-text-bottom no-print" /></span>
                                                                                    )}
                                                                                </td>
                                                                                <td style={{ padding: '7px 10px', fontSize: 11, color: '#475569', maxWidth: 180 }} className="truncate" title={member.church}>{member.church}</td>
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
                                                            </table>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Print footer */}
                                        <div style={{ display: 'none', borderTop: '1px solid #cbd5e1', margin: '0 16px 12px', paddingTop: 6 }} className="rpt-footer">
                                            <p style={{ fontSize: 9, color: '#94a3b8', textAlign: 'right', margin: 0 }}>Royal Ambassadors OGBA Association — Rank Performance Report — {printDate}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                ) : (
                    // ------------------------------------------------------------------------------------------------ //
                    // DEEP INSIGHTS DASHBOARD TAB                                                                      //
                    // ------------------------------------------------------------------------------------------------ //
                    insights && (
                        <div className="space-y-6">
                            {/* Dashboard Print Header (only shows in print) */}
                            <div className="hidden print:block mb-8 border-b-2 border-slate-800 pb-4">
                                <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Executive Analytics Dashboard</h1>
                                <p className="text-slate-500 font-medium">Royal Ambassadors OGBA Association — Generated {printDate}</p>
                            </div>

                            {/* Top Stats Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                                        <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Candidates</p>
                                        <p className="text-4xl font-black text-slate-800 dark:text-slate-100 mt-1">{insights.totalCandidates}</p>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Overall Pass Rate</p>
                                        <p className="text-4xl font-black text-emerald-600 dark:text-emerald-500 mt-1">{insights.overallPassRate}%</p>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
                                        <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg Global Score</p>
                                        <p className="text-4xl font-black text-slate-800 dark:text-slate-100 mt-1">{insights.overallAvgScore}%</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                {/* Pass/Fail Breakdown per Rank Bar Chart */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm overflow-hidden page-break-inside-avoid h-[400px] flex flex-col">
                                    <div className="mb-4">
                                        <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                            <BarChart3 className="w-5 h-5 text-blue-500" /> Pass/Fail Breakdown by Rank
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-1">Total candidates per rank alongside their outcome</p>
                                    </div>
                                    <div className="flex-1 w-full relative min-h-0">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={insights.chartRankData.slice(0, 10)} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} barSize={30}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                                <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} />
                                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                                <Bar dataKey="passed" name="Passed" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                                                <Bar dataKey="failed" name="Failed" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Pass Rate Distribution Pie Chart */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm overflow-hidden page-break-inside-avoid h-[400px] flex flex-col">
                                    <div className="mb-4">
                                        <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                            <Presentation className="w-5 h-5 text-purple-500" /> Exam Pass Rates
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-1">Relative total success of top exams</p>
                                    </div>
                                    <div className="flex-1 w-full relative min-h-0 flex items-center justify-center">
                                        {insights.chartExamData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={insights.chartExamData.filter(d => d.passed > 0).slice(0, 6)}
                                                        cx="50%"
                                                        cy="45%"
                                                        innerRadius={60}
                                                        outerRadius={95}
                                                        paddingAngle={5}
                                                        dataKey="passed"
                                                        nameKey="name"
                                                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
                                                            const RADIAN = Math.PI / 180;
                                                            const mAngle = midAngle || 0;
                                                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                                            const x = cx + radius * Math.cos(-mAngle * RADIAN);
                                                            const y = cy + radius * Math.sin(-mAngle * RADIAN);
                                                            return (
                                                                <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12" fontWeight="bold">
                                                                    {`${(percent * 100).toFixed(0)}%`}
                                                                </text>
                                                            );
                                                        }}
                                                    >
                                                        {insights.chartExamData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#14b8a6'][index % 6]} />
                                                        ))}
                                                    </Pie>
                                                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} />
                                                    <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <p className="text-slate-400 text-sm">No exam data to display</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Church Leaderboard */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col page-break-inside-avoid">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 border-b border-slate-200 dark:border-slate-800">
                                        <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                            <Award className="w-5 h-5 text-blue-500" /> Top Performing Churches
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-1">Ranked by global pass rate & average score</p>
                                    </div>
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800 flex-1">
                                        {insights.topChurches.map((c, i) => (
                                            <div key={c.name} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 text-sm flex-shrink-0">
                                                    #{i + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{c.name}</p>
                                                    <p className="text-xs text-slate-500">{c.total} candidates</p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="font-black text-blue-600 dark:text-blue-400 text-lg">{c.passRate}%</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Pass Rate</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Toughest Exams */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col page-break-inside-avoid">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 border-b border-slate-200 dark:border-slate-800">
                                        <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-red-500 rotate-180" /> Toughest Exams
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-1">Exams with the lowest overall pass rates</p>
                                    </div>
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800 flex-1">
                                        {insights.toughestExams.map((e, i) => (
                                            <div key={e.name} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                    {i + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{e.name}</p>
                                                    <p className="text-xs text-slate-500">{e.total} attempts globally</p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="font-black text-red-600 dark:text-red-500 text-lg">{e.passRate}%</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Pass Rate</p>
                                                </div>
                                            </div>
                                        ))}
                                        {insights.toughestExams.length === 0 && (
                                            <div className="p-10 text-center text-slate-500 text-sm">Not enough data.</div>
                                        )}
                                    </div>
                                </div>

                                {/* Top 10 Performers Association-Wide */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm lg:col-span-2 page-break-inside-avoid">
                                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-5">
                                        <h3 className="font-black text-white flex items-center gap-2 text-lg drop-shadow-sm">
                                            <Award className="w-6 h-6 text-amber-100" /> Association Top Performers (Roll of Honor)
                                        </h3>
                                        <p className="text-xs text-amber-100 mt-1 font-medium">The highest scoring individuals across all churches and all exams.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
                                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {insights.topPerformers.slice(0, 5).map((p, i) => (
                                                <div key={i} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 shadow-sm ${i === 0 ? 'bg-amber-400 text-amber-900 border-2 border-amber-200' : i === 1 ? 'bg-slate-300 text-slate-800' : i === 2 ? 'bg-orange-300 text-orange-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                                        {i + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{p.name}</p>
                                                        <p className="text-[11px] font-semibold text-slate-500 truncate uppercase mt-0.5">{p.church}</p>
                                                        <p className="text-xs text-slate-400 truncate">{p.exam}</p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="font-black text-amber-600 dark:text-amber-500 text-xl">{p.score}%</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {insights.topPerformers.slice(5, 10).map((p, i) => (
                                                <div key={i + 5} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                        {i + 6}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{p.name}</p>
                                                        <p className="text-[11px] font-semibold text-slate-500 truncate uppercase mt-0.5">{p.church}</p>
                                                        <p className="text-xs text-slate-400 truncate">{p.exam}</p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="font-black text-amber-600 dark:text-amber-500 text-xl">{p.score}%</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {insights.topPerformers.length === 0 && (
                                        <div className="p-10 text-center text-slate-500 text-sm">No passed attempts yet.</div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Top Performer Per Rank (New Deep Insight Section) */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm page-break-inside-avoid mt-6">
                                <div className="bg-slate-800 text-white p-5 border-b border-slate-700">
                                    <h3 className="font-black flex items-center gap-2 text-lg">
                                        <Award className="w-5 h-5 text-indigo-400" /> Best in Rank (Valedictorians)
                                    </h3>
                                    <p className="text-xs text-slate-300 mt-1">The single highest-scoring individual for every active rank category.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
                                    {insights.topPerformerPerRank.map((p: any, i: number) => (
                                        <div key={p.rankName} className="p-5 flex flex-col hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors border-b lg:border-b-0 border-slate-100 dark:border-slate-800 last:border-b-0">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
                                                    {p.rankName}
                                                </span>
                                                <span className="font-black text-slate-800 dark:text-slate-100 text-xl">{p.score}%</span>
                                            </div>
                                            <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1">{p.name}</p>
                                            <p className="text-[11px] font-semibold text-slate-500 uppercase truncate" title={p.church}>{p.church}</p>
                                            <p className="text-[10px] text-slate-400 mt-2 truncate" title={p.exam}>{p.exam}</p>
                                        </div>
                                    ))}
                                    {insights.topPerformerPerRank.length === 0 && (
                                        <div className="p-10 text-center text-slate-500 text-sm col-span-full">No rank data available yet.</div>
                                    )}
                                </div>
                            </div>

                        </div>
                    )
                )}
            </div>

            {/* ============================================================
                REVIEW MODAL
            ============================================================ */}
            {reviewModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm no-print">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Result Review</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Detailed question breakdown</p>
                            </div>
                            <button onClick={() => setReviewModalOpen(false)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f0f4ff]/50 dark:bg-slate-950/50">
                            {isReviewLoading ? (
                                <div className="flex flex-col items-center justify-center h-40">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                                    <p className="text-slate-500 text-sm">Loading detailed answers...</p>
                                </div>
                            ) : detailedResult ? (
                                <>
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
                                        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm px-1">Questions & Answers</h3>
                                        {detailedResult.questions.map((q: any, i: number) => (
                                            <div key={q.id} className={`p-5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm ${q.isCorrect ? 'border-l-4 border-l-emerald-500 border-slate-200' : 'border-l-4 border-l-red-500 border-slate-200'}`}>
                                                <div className="flex justify-between gap-4 mb-4">
                                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                                                        <span className="font-bold text-slate-400 mr-2">{i + 1}.</span>{q.text}
                                                    </p>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap px-2 py-1 rounded-md bg-slate-100 self-start ${q.isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>
                                                        {q.pointsText} pts
                                                    </span>
                                                </div>
                                                <div className="space-y-2.5">
                                                    {q.options.map((opt: any) => {
                                                        const isCorrect = opt.id === q.correctOptionId;
                                                        const isStudent = opt.id === q.studentAnswerId;
                                                        let cls = 'border-slate-100 bg-slate-50 text-slate-600';
                                                        let icon = <div className="w-4 h-4 rounded-full border border-slate-300" />;
                                                        if (isCorrect) { cls = 'border-emerald-200 bg-emerald-50 text-emerald-800 font-medium'; icon = <CheckCircle className="w-4 h-4 text-emerald-500" />; }
                                                        else if (isStudent) { cls = 'border-red-200 bg-red-50 text-red-800'; icon = <XCircle className="w-4 h-4 text-red-500" />; }
                                                        return (
                                                            <div key={opt.id} className={`flex items-center gap-3 p-3.5 rounded-xl border ${cls}`}>
                                                                <div className="w-5 flex justify-center flex-shrink-0">{icon}</div>
                                                                <span className="flex-1 text-sm">{opt.text}</span>
                                                                {isStudent && <span className="text-[10px] uppercase font-bold opacity-60 bg-black/5 px-2 py-0.5 rounded">Selected</span>}
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
