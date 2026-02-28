'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Exam, Question } from '@/lib/types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, Plus, Trash2, Loader2, BookOpen,
    Clock, Users, CheckCircle, Send, Award, X
} from 'lucide-react';
import Link from 'next/link';

const questionSchema = z.object({
    text: z.string().min(5, 'Question text required'),
    optionA: z.string().min(1, 'Option A required'),
    optionB: z.string().min(1, 'Option B required'),
    optionC: z.string().min(1, 'Option C required'),
    optionD: z.string().min(1, 'Option D required'),
    correctAnswer: z.enum(['A', 'B', 'C', 'D']),
    points: z.number().min(1),
});
type QuestionForm = z.infer<typeof questionSchema>;

export default function ExamDetailPage() {
    const params = useParams();
    const router = useRouter();
    const qc = useQueryClient();
    const examId = params.id as string;
    const [showAddQ, setShowAddQ] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const { data: exam, isLoading } = useQuery<Exam>({
        queryKey: ['exam', examId],
        queryFn: async () => {
            const res = await api.get(`/exams/${examId}`);
            return res.data.data.exam;
        },
    });

    const { data: questions = [], isLoading: qLoading } = useQuery<Question[]>({
        queryKey: ['exam-questions', examId],
        queryFn: async () => {
            const res = await api.get(`/exams/${examId}/questions`);
            return res.data.data.questions;
        },
    });

    const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<QuestionForm>({
        resolver: zodResolver(questionSchema),
        defaultValues: { correctAnswer: 'A', points: 1 },
    });

    const addQuestionMutation = useMutation({
        mutationFn: (data: QuestionForm) => api.post(`/exams/${examId}/questions`, {
            text: data.text,
            options: { A: data.optionA, B: data.optionB, C: data.optionC, D: data.optionD },
            correctAnswer: data.correctAnswer,
            points: data.points,
        }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['exam-questions', examId] });
            reset();
            setShowAddQ(false);
            setApiError(null);
        },
        onError: (err: any) => setApiError(err?.response?.data?.message ?? 'Failed to add question'),
    });

    const batchMutation = useMutation({
        mutationFn: (data: { questions: any[] }) => api.post(`/exams/${examId}/questions/batch`, data),
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: ['exam-questions', examId] });
            window.alert(`Successfully imported ${res.data.count} questions!`);
        },
        onError: (err: any) => window.alert(err?.response?.data?.message ?? 'Failed to import questions'),
    });

    const deleteQuestionMutation = useMutation({
        mutationFn: (qId: string) => api.delete(`/exams/${examId}/questions/${qId}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['exam-questions', examId] }),
    });

    const publishMutation = useMutation({
        mutationFn: () => api.patch(`/exams/${examId}/status`, { status: 'PUBLISHED' }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['exam', examId] }),
        onError: (err: any) => window.alert(err?.response?.data?.message ?? 'Failed to publish exam'),
    });

    const correctAnswer = watch('correctAnswer');
    const optionLabels = ['A', 'B', 'C', 'D'] as const;

    if (isLoading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
    );

    if (!exam) return (
        <div className="text-center py-20">
            <p className="text-slate-500">Exam not found</p>
            <Link href="/dashboard/admin/exams" className="text-blue-600 text-sm mt-2 inline-block">← Back to exams</Link>
        </div>
    );

    return (
        <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'ASSOCIATION_OFFICER']}>
            <div className="max-w-4xl mx-auto space-y-5">
                {/* Back + Header */}
                <div className="flex items-start gap-4">
                    <Link href="/dashboard/admin/exams"
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex-shrink-0 mt-0.5">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200 leading-tight">{exam.title}</h1>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${exam.status === 'PUBLISHED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                exam.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                }`}>
                                {exam.status}
                            </span>
                            {exam.ranks && (
                                <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                    <Award className="w-3.5 h-3.5 text-yellow-500" />
                                    {exam.ranks.name}
                                </span>
                            )}
                        </div>
                    </div>
                    {exam.status === 'DRAFT' && (
                        <button onClick={() => publishMutation.mutate()}
                            disabled={publishMutation.isPending || questions.length === 0}
                            title={questions.length === 0 ? 'Add questions before publishing' : ''}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50 flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                            {publishMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Publish
                        </button>
                    )}
                </div>

                {/* Exam Stats */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { icon: Clock, label: 'Duration', value: `${exam.duration} min` },
                        { icon: Users, label: 'Questions', value: `${questions.length} / ${exam.questionCount}` },
                        { icon: CheckCircle, label: 'Pass Mark', value: `${exam.passMark}%` },
                    ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 text-center transition-colors"
                            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                            <Icon className="w-5 h-5 text-blue-500 dark:text-blue-400 mx-auto mb-1.5" />
                            <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{value}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Questions Section */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors"
                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="font-bold text-slate-800 dark:text-slate-200">Questions ({questions.length})</h2>
                        </div>
                        {exam.status === 'DRAFT' && (
                            <div className="flex gap-2">
                                <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer">
                                    <input type="file" accept=".csv" className="hidden" onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const reader = new FileReader();
                                        reader.onload = (evt) => {
                                            const text = evt.target?.result as string;
                                            const lines = text.split('\n');
                                            const questions = [];
                                            for (let i = 0; i < lines.length; i++) {
                                                const line = lines[i].trim();
                                                if (!line) continue;
                                                const parts = line.split(',').map(p => p.trim());
                                                if (parts.length >= 7) {
                                                    const [text, A, B, C, D, ans, pts] = parts;
                                                    if (i === 0 && text.toLowerCase().includes('question')) continue;
                                                    if (['A', 'B', 'C', 'D'].includes(ans.toUpperCase())) {
                                                        questions.push({ text, options: { A, B, C, D }, correctAnswer: ans.toUpperCase(), points: parseInt(pts) || 1 });
                                                    }
                                                }
                                            }
                                            if (questions.length > 0 && confirm(`Import ${questions.length} questions?`)) {
                                                batchMutation.mutate({ questions });
                                            } else {
                                                alert('No valid questions found. Format: Question,A,B,C,D,Answer(A-D),Points');
                                            }
                                            e.target.value = '';
                                        };
                                        reader.readAsText(file);
                                    }} />
                                    <BookOpen className="w-3.5 h-3.5" />
                                    Import CSV
                                </label>
                                <button onClick={() => setShowAddQ(true)}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-xs font-semibold transition-all hover:opacity-90"
                                    style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Question
                                </button>
                            </div>
                        )}
                    </div>

                    {qLoading ? (
                        <div className="p-8 text-center">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
                        </div>
                    ) : questions.length === 0 ? (
                        <div className="p-12 text-center">
                            <BookOpen className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                            <p className="text-slate-500 dark:text-slate-400 font-medium">No questions yet</p>
                            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Add questions to this exam before publishing</p>
                            {exam.status === 'DRAFT' && (
                                <button onClick={() => setShowAddQ(true)}
                                    className="mt-4 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
                                    style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                                    Add First Question
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50 dark:divide-slate-800">
                            {questions.map((q, i) => (
                                <div key={q.id} className="px-5 py-4">
                                    <div className="flex items-start gap-3">
                                        <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                            {i + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">{q.text}</p>
                                            <div className="grid grid-cols-2 gap-1.5">
                                                {(['A', 'B', 'C', 'D'] as const).map(opt => (
                                                    <div key={opt} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${q.correctAnswer === opt
                                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold'
                                                        : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                                                        }`}>
                                                        <span className="font-bold">{opt}.</span>
                                                        <span>{(q.options as Record<string, string>)[opt]}</span>
                                                        {q.correctAnswer === opt && <CheckCircle className="w-3 h-3 ml-auto" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        {exam.status === 'DRAFT' && (
                                            <button onClick={() => deleteQuestionMutation.mutate(q.id)}
                                                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Question Modal */}
            {showAddQ && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto transition-colors border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Add Question</h2>
                            <button onClick={() => { setShowAddQ(false); reset(); setApiError(null); }}
                                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(d => addQuestionMutation.mutate(d))} className="p-6 space-y-4">
                            {apiError && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">{apiError}</div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Question Text</label>
                                <textarea {...register('text')} rows={3} placeholder="Enter the question..."
                                    className="w-full px-3 py-2.5 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 resize-none dark:text-slate-200 placeholder-slate-400 transition-colors" />
                                {errors.text && <p className="text-xs text-red-500 mt-1">{errors.text.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Options</label>
                                {optionLabels.map(opt => (
                                    <div key={opt} className="flex items-center gap-2">
                                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${correctAnswer === opt ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                            }`}>{opt}</span>
                                        <input
                                            {...register(`option${opt}` as 'optionA' | 'optionB' | 'optionC' | 'optionD')}
                                            placeholder={`Option ${opt}`}
                                            className="flex-1 px-3 py-2 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:text-slate-200 placeholder-slate-400 transition-colors" />
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Correct Answer</label>
                                    <select {...register('correctAnswer')}
                                        className="w-full px-3 py-2.5 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white dark:bg-slate-800 dark:text-slate-200 transition-colors">
                                        {optionLabels.map(opt => <option key={opt} value={opt}>Option {opt}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Points</label>
                                    <input {...register('points', { valueAsNumber: true })} type="number" min={1}
                                        className="w-full px-3 py-2.5 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:text-slate-200 transition-colors" />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => { setShowAddQ(false); reset(); setApiError(null); }}
                                    className="flex-1 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting || addQuestionMutation.isPending}
                                    className="flex-1 py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
                                    style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                                    {(isSubmitting || addQuestionMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    Add Question
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </ProtectedRoute>
    );
}
