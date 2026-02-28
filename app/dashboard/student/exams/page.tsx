'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Exam, ExamAttempt } from '@/lib/types';
import { BookOpen, Clock, Award, CheckCircle, Play, Loader2, Lock } from 'lucide-react';
import Link from 'next/link';

export default function StudentExamsPage() {
    const qc = useQueryClient();

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
        onSuccess: () => qc.invalidateQueries({ queryKey: ['my-attempts'] }),
    });

    const getAttempt = (examId: string) => myAttempts.find(a => a.examId === examId);

    const isCompleted = (attempt?: ExamAttempt) => !!attempt?.submittedAt;
    const isStarted = (attempt?: ExamAttempt) => !!attempt && !attempt.submittedAt;

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

                            return (
                                <div key={exam.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors"
                                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                                    {/* Header */}
                                    <div className="p-5 border-b border-slate-50 dark:border-slate-800">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-50 dark:bg-blue-900/20">
                                                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-snug">{exam.title}</h3>
                                                {exam.ranks && (
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-1">
                                                        <Award className="w-3.5 h-3.5 text-yellow-500" />
                                                        {exam.ranks.name}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats */}
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

                                    {/* Action */}
                                    <div className="p-4">
                                        {completed ? (
                                            <div className="flex items-center justify-between">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${attempt?.passed ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    {attempt?.passed ? `Passed — ${attempt.score}%` : `Failed — ${attempt?.score ?? 0}%`}
                                                </span>
                                                <Link href="/dashboard/student/results"
                                                    className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                                                    View Results →
                                                </Link>
                                            </div>
                                        ) : started ? (
                                            <Link href={`/dashboard/student/exams/${exam.id}/take`}
                                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                                                style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
                                                <Play className="w-4 h-4" />
                                                Continue Exam
                                            </Link>
                                        ) : (
                                            <button onClick={() => startMutation.mutate(exam.id)}
                                                disabled={startMutation.isPending}
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
