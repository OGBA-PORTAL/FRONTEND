'use client';
// Church Admin Exams — identical to student exams but protected for CHURCH_ADMIN
// Church Admins can also take rank exams like regular members

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Exam, ExamAttempt } from '@/lib/types';
import { BookOpen, Play, Clock, CheckCircle, Award, Loader2, CalendarDays, Lock, Users, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { useState, useEffect } from 'react';

function HourglassIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 2h14" /><path d="M5 22h14" />
            <path d="M5 2c0 4.4 2.5 8.2 7 10C7.5 13.8 5 17.6 5 22" />
            <path d="M19 2c0 4.4-2.5 8.2-7 10 4.5 1.8 7 5.6 7 10" />
        </svg>
    );
}

function useCountdown(targetDate: string | undefined) {
    const getTimeLeft = () => {
        if (!targetDate) return null;
        const target = new Date(targetDate);
        target.setHours(0, 0, 0, 0);
        const diff = target.getTime() - new Date().getTime();
        if (diff <= 0) return null;
        return {
            days: Math.floor(diff / 86400000),
            hours: Math.floor((diff % 86400000) / 3600000),
            minutes: Math.floor((diff % 3600000) / 60000),
            seconds: Math.floor((diff % 60000) / 1000),
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

function CountdownPanel({ examDate }: { examDate: string }) {
    const t = useCountdown(examDate);
    if (!t) return null;
    return (
        <div className="mx-4 mt-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 overflow-hidden">
            <div className="flex items-center gap-1.5 px-3 pt-2.5 pb-1">
                <HourglassIcon className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">Opens in</span>
            </div>
            <div className="flex items-center justify-center gap-1 px-3 pb-3 pt-0.5">
                {[{ label: 'Days', value: t.days }, { label: 'Hrs', value: t.hours }, { label: 'Min', value: t.minutes }, { label: 'Sec', value: t.seconds }].map(({ label, value }, i) => (
                    <div key={label} className="flex items-center gap-1">
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-700 flex items-center justify-center">
                                <span className="text-lg font-black tabular-nums text-amber-700 dark:text-amber-300 leading-none">{String(value).padStart(2, '0')}</span>
                            </div>
                            <span className="text-[9px] font-semibold text-amber-500 mt-0.5 uppercase tracking-wider">{label}</span>
                        </div>
                        {i < 3 && <span className="text-amber-400 font-black text-lg mb-4 leading-none">:</span>}
                    </div>
                ))}
            </div>
        </div>
    );
}

import { useAuth } from '@/context/AuthContext';

export default function ChurchAdminExamsPage() {
    const { user } = useAuth();
    const qc = useQueryClient();
    const router = useRouter();
    const toast = useToast();

    // Note: Church Admins use /dashboard/church-admin/exams/:examId/take for taking exams
    // But the exam take page is at student route — redirect them there
    const { data: exams = [], isLoading: examsLoading } = useQuery<Exam[]>({
        queryKey: ['church-admin-exams'],
        queryFn: async () => (await api.get('/exams/published')).data.data.exams,
    });

    const { data: myAttempts = [] } = useQuery<ExamAttempt[]>({
        queryKey: ['church-admin-attempts'],
        queryFn: async () => (await api.get('/results/my')).data.data.results,
    });

    const startMutation = useMutation({
        mutationFn: (examId: string) => api.post(`/exams/${examId}/attempt`),
        onSuccess: (_, examId) => {
            qc.invalidateQueries({ queryKey: ['church-admin-attempts'] });
            toast.info('Exam Started', 'Good luck! Your time starts now.');
            router.push(`/dashboard/student/exams/${examId}/take`);
        },
        onError: (err: any) => toast.error('Cannot Start Exam', err?.response?.data?.message ?? 'Could not start the exam.'),
    });

    const getAttempt = (examId: string) => myAttempts.find(a => a.examId === examId);
    const isCompleted = (a?: ExamAttempt) => !!a?.submittedAt;
    const isStarted = (a?: ExamAttempt) => !!a && !a.submittedAt;

    const userRankLevel = user?.ranks?.level ?? 0;

    return (
        <ProtectedRoute allowedRoles={['CHURCH_ADMIN']}>
            <div className="space-y-5 max-w-5xl mx-auto">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">My Exams</h1>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">Available exams for your rank</p>
                </div>

                {examsLoading ? (
                    <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
                ) : exams.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-16 text-center border border-slate-100 dark:border-slate-800">
                        <BookOpen className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">No exams available</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {exams.filter(exam => {
                            const lvl = exam.ranks?.level ?? 1;
                            return lvl === userRankLevel + 1; // Only show promotion exams
                        }).map(exam => {
                            const attempt = getAttempt(exam.id);
                            const completed = isCompleted(attempt);
                            const started = isStarted(attempt);
                            const isFuture = (() => {
                                if (!exam.examDate) return false;
                                const d = new Date(exam.examDate); d.setHours(0, 0, 0, 0);
                                const t = new Date(); t.setHours(0, 0, 0, 0);
                                return d > t;
                            })();

                            const isPaused = exam.status === 'PAUSED';

                            return (
                                <div key={exam.id} className={`bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden transition-colors ${isFuture ? 'border-amber-100 dark:border-amber-900/40' : (isPaused ? 'border-orange-200 dark:border-orange-900/50' : 'border-slate-100 dark:border-slate-800')}`}
                                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                                    <div className={`p-5 border-b ${isFuture ? 'border-amber-50 dark:border-amber-900/30 bg-amber-50/40 dark:bg-amber-900/10' : (isPaused ? 'border-orange-100 dark:border-orange-900/30 bg-orange-50/30 dark:bg-orange-900/10' : 'border-slate-50 dark:border-slate-800')}`}>
                                        <div className="flex items-start gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isFuture ? 'bg-amber-100 dark:bg-amber-900/30' : (isPaused ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-blue-50 dark:bg-blue-900/20')}`}>
                                                {isFuture ? <HourglassIcon className="w-5 h-5 text-amber-500" /> : <BookOpen className={`w-5 h-5 ${isPaused ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'}`} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-snug">{exam.title}</h3>
                                                <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 mt-1">
                                                    {exam.ranks && <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500"><Award className="w-3.5 h-3.5 text-yellow-500" />{exam.ranks.name}</div>}
                                                    {typeof exam.attemptCount === 'number' && <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500"><Users className="w-3 h-3" />{exam.attemptCount === 0 ? 'No attempts yet' : `${exam.attemptCount} student${exam.attemptCount !== 1 ? 's' : ''}`}</div>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800">
                                        {[{ icon: Clock, label: 'Duration', value: `${exam.duration}m` }, { icon: BookOpen, label: 'Questions', value: exam.questionCount }, { icon: CheckCircle, label: 'Pass Mark', value: `${exam.passMark}%` }].map(({ icon: Icon, label, value }) => (
                                            <div key={label} className="p-3 text-center">
                                                <Icon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 mx-auto mb-1" />
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{value}</p>
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500">{label}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {isFuture && exam.examDate && <CountdownPanel examDate={exam.examDate} />}
                                    <div className="p-4">
                                        {completed ? (
                                            exam.resultsReleased ? (
                                                <Link href="/dashboard/church-admin/results" className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 shadow-sm"
                                                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                                                    <Trophy className="w-4 h-4" />
                                                    View Result
                                                </Link>
                                            ) : (
                                                <div className="flex items-center justify-center w-full">
                                                    <span className="w-full justify-center inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                                                        <CheckCircle className="w-4 h-4" />
                                                        Submitted for Grading
                                                    </span>
                                                </div>
                                            )
                                        ) : started ? (
                                            <Link href={`/dashboard/student/exams/${exam.id}/take`}
                                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                                                style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
                                                <Play className="w-4 h-4" />Continue Exam
                                            </Link>
                                        ) : isPaused ? (
                                            <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-semibold cursor-not-allowed select-none border border-orange-200 dark:border-orange-800">
                                                <Lock className="w-4 h-4" /> Exam Paused by Admin
                                            </div>
                                        ) : isFuture ? (
                                            <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-sm font-semibold cursor-not-allowed select-none">
                                                <HourglassIcon className="w-4 h-4" />Coming Soon
                                            </div>
                                        ) : (
                                            <button onClick={() => startMutation.mutate(exam.id)} disabled={startMutation.isPending}
                                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                                                style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                                                {startMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                                Start Exam
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
