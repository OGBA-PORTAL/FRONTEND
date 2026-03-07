'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Exam, ExamAttempt } from '@/lib/types';
import { BookOpen, Play, Clock, CheckCircle, Award, Loader2, Users, Lock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

// ── Hourglass SVG (animated sand) ──────────────────────────────────────────
function HourglassIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 2h14" />
            <path d="M5 22h14" />
            <path d="M5 2c0 4.4 2.5 8.2 7 10C7.5 13.8 5 17.6 5 22" />
            <path d="M19 2c0 4.4-2.5 8.2-7 10 4.5 1.8 7 5.6 7 10" />
            {/* sand grains */}
            <line x1="8" y1="7" x2="16" y2="7" strokeWidth="1.5" opacity="0.5" />
            <line x1="9.5" y1="8.5" x2="14.5" y2="8.5" strokeWidth="1.5" opacity="0.35" />
            <line x1="11" y1="10" x2="13" y2="10" strokeWidth="1.5" opacity="0.2" />
        </svg>
    );
}

// ── Live countdown hook ─────────────────────────────────────────────────────
function useCountdown(targetDate: string | undefined) {
    const getTimeLeft = () => {
        if (!targetDate) return null;
        const target = new Date(targetDate);
        target.setHours(0, 0, 0, 0);
        const now = new Date();
        const diff = target.getTime() - now.getTime();
        if (diff <= 0) return null;
        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((diff % (1000 * 60)) / 1000),
        };
    };

    const [timeLeft, setTimeLeft] = useState(getTimeLeft);

    useEffect(() => {
        if (!targetDate) return;
        const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
        return () => clearInterval(id);
    }, [targetDate]);

    return timeLeft;
}

// ── Countdown panel shown inside locked exam cards ──────────────────────────
function CountdownPanel({ examDate }: { examDate: string }) {
    const t = useCountdown(examDate);

    if (!t) return null;

    const units = [
        { label: 'Days', value: t.days },
        { label: 'Hrs', value: t.hours },
        { label: 'Min', value: t.minutes },
        { label: 'Sec', value: t.seconds },
    ];

    return (
        <div className="mx-4 mt-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 overflow-hidden">
            {/* top label */}
            <div className="flex items-center gap-1.5 px-3 pt-2.5 pb-1">
                <HourglassIcon className="w-3.5 h-3.5 text-amber-500 animate-[spin_3s_linear_infinite]" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    Opens in
                </span>
            </div>
            {/* digit blocks */}
            <div className="flex items-center justify-center gap-1 px-3 pb-3 pt-0.5">
                {units.map(({ label, value }, i) => (
                    <div key={label} className="flex items-center gap-1">
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-700 flex items-center justify-center">
                                <span className="text-lg font-black tabular-nums text-amber-700 dark:text-amber-300 leading-none">
                                    {String(value).padStart(2, '0')}
                                </span>
                            </div>
                            <span className="text-[9px] font-semibold text-amber-500 dark:text-amber-500 mt-0.5 uppercase tracking-wider">
                                {label}
                            </span>
                        </div>
                        {i < 3 && (
                            <span className="text-amber-400 font-black text-lg mb-4 leading-none select-none">:</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function StudentExamsPage() {
    const { user } = useAuth();
    const qc = useQueryClient();
    const router = useRouter();
    const toast = useToast();

    const { data: exams = [], isLoading: examsLoading } = useQuery<Exam[]>({
        queryKey: ['student-exams'],
        queryFn: async () => {
            const res = await api.get('/exams/published');
            return res.data.data.exams;
        },
    });

    const { data: myAttempts = [] } = useQuery<ExamAttempt[]>({
        queryKey: ['my-attempts'],
        queryFn: async () => {
            const res = await api.get('/results/my');
            return res.data.data.results;
        },
    });

    const startMutation = useMutation({
        mutationFn: (examId: string) => api.post(`/exams/${examId}/attempt`),
        onSuccess: (_, examId) => {
            qc.invalidateQueries({ queryKey: ['my-attempts'] });
            setConfirmRepeatExam(null);
            toast.info('Exam Started', 'Good luck! Your time starts now.');
            router.push(`/dashboard/student/exams/${examId}/take`);
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.message ?? 'Could not start the exam. You may not be eligible yet.';
            toast.error('Cannot Start Exam', msg);
            setConfirmRepeatExam(null);
        },
    });

    const getAttempt = (examId: string) => myAttempts.find(a => a.examId === examId);
    const isCompleted = (attempt?: ExamAttempt) => !!attempt?.submittedAt;
    const isStarted = (attempt?: ExamAttempt) => !!attempt && !attempt.submittedAt;

    const userRankLevel = user?.ranks?.level ?? 0;

    const [confirmRepeatExam, setConfirmRepeatExam] = useState<Exam | null>(null);

    const handleStartClick = (exam: Exam) => {
        const examRankLevel = exam.ranks?.level ?? 1;
        // If the exam is for their current rank (or lower), warn them.
        if (examRankLevel <= userRankLevel) {
            setConfirmRepeatExam(exam);
        } else {
            // It's a promotion exam, proceed immediately
            startMutation.mutate(exam.id);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['RA']}>
            <div className="space-y-5 max-w-5xl mx-auto">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">My Exams</h1>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">Available exams for your rank</p>
                </div>

                {examsLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : exams.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-16 text-center border border-slate-100 dark:border-slate-800 transition-colors"
                        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        <BookOpen className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">No exams available</p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Check back later for upcoming exams</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {exams.map(exam => {
                            const attempt = getAttempt(exam.id);
                            const completed = isCompleted(attempt);
                            const started = isStarted(attempt);

                            const isFuture = (() => {
                                if (!exam.examDate) return false;
                                const d = new Date(exam.examDate);
                                d.setHours(0, 0, 0, 0);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return d > today;
                            })();

                            const isPaused = exam.status === 'PAUSED';
                            const examRankLevel = exam.ranks?.level ?? 1;
                            const isEligible = examRankLevel <= userRankLevel + 1;
                            const isLocked = !isEligible && !isPaused; // Don't show locked if it's paused

                            return (
                                <div key={exam.id}
                                    className={`bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden transition-colors ${isFuture ? 'border-amber-100 dark:border-amber-900/40' : (isPaused ? 'border-orange-200 dark:border-orange-900/50' : (isLocked ? 'border-slate-100 dark:border-slate-800 opacity-80' : 'border-slate-100 dark:border-slate-800'))}`}
                                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>

                                    {/* Header */}
                                    <div className={`p-5 border-b ${isFuture ? 'border-amber-50 dark:border-amber-900/30 bg-amber-50/40 dark:bg-amber-900/10' : (isPaused ? 'border-orange-100 dark:border-orange-900/30 bg-orange-50/30 dark:bg-orange-900/10' : 'border-slate-50 dark:border-slate-800')}`}>
                                        <div className="flex items-start gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isFuture ? 'bg-amber-100 dark:bg-amber-900/30' : (isPaused ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-blue-50 dark:bg-blue-900/20')}`}>
                                                {isFuture
                                                    ? <HourglassIcon className="w-5 h-5 text-amber-500" />
                                                    : <BookOpen className={`w-5 h-5 ${isPaused ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'}`} />
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-snug">{exam.title}</h3>
                                                <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 mt-1">
                                                    {exam.ranks && (
                                                        <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                                                            <Award className="w-3.5 h-3.5 text-yellow-500" />
                                                            {exam.ranks.name}
                                                        </div>
                                                    )}
                                                    {/* Student count badge */}
                                                    {typeof exam.attemptCount === 'number' && (
                                                        <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                                                            <Users className="w-3 h-3" />
                                                            {exam.attemptCount === 0
                                                                ? 'No attempts yet'
                                                                : `${exam.attemptCount} student${exam.attemptCount !== 1 ? 's' : ''}`}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats strip */}
                                    <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800">
                                        {[
                                            { icon: Clock, label: 'Duration', value: `${exam.duration}m` },
                                            { icon: BookOpen, label: 'Questions', value: exam.questionCount },
                                            { icon: CheckCircle, label: 'Pass Mark', value: `${exam.passMark}%` },
                                        ].map(({ icon: Icon, label, value }) => (
                                            <div key={label} className="p-3 text-center">
                                                <Icon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 mx-auto mb-1" />
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{value}</p>
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500">{label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Countdown (future exams only) */}
                                    {isFuture && exam.examDate && (
                                        <CountdownPanel examDate={exam.examDate} />
                                    )}

                                    {/* Action button */}
                                    <div className="p-4">
                                        {completed ? (
                                            <div className="flex items-center justify-between">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    Submitted for Grading
                                                </span>
                                            </div>
                                        ) : started ? (
                                            <Link href={`/dashboard/student/exams/${exam.id}/take`}
                                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                                                style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
                                                <Play className="w-4 h-4" />
                                                Continue Exam
                                            </Link>
                                        ) : isPaused ? (
                                            <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-semibold cursor-not-allowed select-none border border-orange-200 dark:border-orange-800">
                                                <Lock className="w-4 h-4" />
                                                Exam Paused by Admin
                                            </div>
                                        ) : isLocked ? (
                                            <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-sm font-semibold cursor-not-allowed select-none border border-slate-200 dark:border-slate-700">
                                                <Lock className="w-4 h-4" />
                                                Locked (Requires Rank)
                                            </div>
                                        ) : isFuture ? (
                                            <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-sm font-semibold cursor-not-allowed select-none">
                                                <HourglassIcon className="w-4 h-4" />
                                                Coming Soon
                                            </div>
                                        ) : (
                                            <button onClick={() => handleStartClick(exam)}
                                                disabled={startMutation.isPending}
                                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                                                style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                                                {startMutation.isPending && confirmRepeatExam?.id !== exam.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                                Start Exam
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Repeat Exam Confirmation Warning */}
                {confirmRepeatExam && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                            <div className="p-6">
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4">
                                    <AlertCircle className="w-6 h-6 text-amber-500" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Repeat Rank Exam?</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                    You are trying to attempt the <strong className="text-slate-700 dark:text-slate-300">"{confirmRepeatExam.title}"</strong>, which is designed for a rank you already hold (or lower).
                                </p>
                                <div className="mt-4 p-4 rounded-xl border bg-amber-50/50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30">
                                    <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                                        Was this a mistake? If you are looking for promotion, you should attempt the exam for your <strong>NEXT</strong> rank sequence instead.
                                    </p>
                                </div>
                            </div>
                            <div className="p-6 pt-0 flex gap-3">
                                <button
                                    onClick={() => !startMutation.isPending && setConfirmRepeatExam(null)}
                                    disabled={startMutation.isPending}
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50">
                                    Cancel
                                </button>
                                <button
                                    onClick={() => startMutation.mutate(confirmRepeatExam.id)}
                                    disabled={startMutation.isPending}
                                    className="flex-1 px-4 py-3 rounded-xl text-white font-bold transition-all hover:opacity-90 disabled:opacity-60 shadow-lg shadow-amber-500/25 flex items-center justify-center bg-amber-500 hover:bg-amber-600">
                                    {startMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Yes, Proceed'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
