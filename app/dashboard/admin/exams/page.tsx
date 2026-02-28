'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Exam, Rank } from '@/lib/types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    BookOpen, Plus, Search, Loader2, X, Clock,
    CheckCircle, FileText, Send, Eye, Users, Award
} from 'lucide-react';
import Link from 'next/link';

const createExamSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    rankId: z.string().min(1, 'Rank is required'),
    duration: z.number().min(5, 'Min 5 minutes').max(300, 'Max 300 minutes'),
    passMark: z.number().min(1).max(100),
    questionCount: z.number().min(50, 'Minimum 50 questions required'),
    examDate: z.string().optional(),
});
type CreateExamForm = z.infer<typeof createExamSchema>;

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    DRAFT: { label: 'Draft', color: 'bg-slate-100 text-slate-600', icon: FileText },
    PUBLISHED: { label: 'Published', color: 'bg-blue-100 text-blue-700', icon: Send },
    COMPLETED: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
};

export default function AdminExamsPage() {
    const qc = useQueryClient();
    const [search, setSearch] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const { data: exams = [], isLoading } = useQuery<Exam[]>({
        queryKey: ['admin-exams'],
        queryFn: async () => {
            const res = await api.get('/exams');
            return res.data.data.exams;
        },
    });

    const { data: ranks = [] } = useQuery<Rank[]>({
        queryKey: ['ranks'],
        queryFn: async () => {
            const res = await api.get('/ranks');
            return res.data.data.ranks;
        },
    });

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateExamForm>({
        resolver: zodResolver(createExamSchema),
        defaultValues: { duration: 60, passMark: 50, questionCount: 50 },
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateExamForm) => api.post('/exams', data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-exams'] });
            setShowCreate(false);
            reset();
            setApiError(null);
        },
        onError: (err: any) => setApiError(err?.response?.data?.message ?? 'Failed to create exam'),
    });

    const publishMutation = useMutation({
        mutationFn: (id: string) => api.patch(`/exams/${id}/status`, { status: 'PUBLISHED' }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-exams'] }),
        onError: (err: any) => window.alert(err?.response?.data?.message ?? 'Failed to publish exam'),
    });

    const releaseMutation = useMutation({
        mutationFn: (id: string) => api.patch(`/exams/${id}/release`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-exams'] }),
    });

    const filtered = exams.filter(e =>
        search === '' || e.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'ASSOCIATION_OFFICER']}>
            <div className="space-y-5 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Exam Management</h1>
                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">{exams.length} exams total</p>
                    </div>
                    <button onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-95 self-start sm:self-auto"
                        style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                        <Plus className="w-4 h-4" />
                        Create Exam
                    </button>
                </div>

                {/* Search */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex gap-3 transition-colors"
                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search exams..."
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 dark:text-slate-200 placeholder-slate-400 transition-colors" />
                    </div>
                </div>

                {/* Exam Cards */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-16 text-center border border-slate-100 dark:border-slate-800 transition-colors">
                        <BookOpen className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">No exams yet</p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Create your first exam to get started</p>
                        <button onClick={() => setShowCreate(true)}
                            className="mt-4 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
                            style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                            Create Exam
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filtered.map(exam => {
                            const cfg = statusConfig[exam.status] ?? statusConfig.DRAFT;
                            const StatusIcon = cfg.icon;
                            // Need to handle badge colors for dark mode dynamically or use a helper
                            // For simplicity, I'll rely on the existing bg/text classes but might need overrides if they are too light/dark
                            // Actually, let's adjust the statusConfig usage to be more compatible or override here.
                            // The `cfg.color` strings like 'bg-slate-100 text-slate-600' might need dark variants.
                            // Since they are strings, I can't easily injection dark classes.
                            // Let's replace the span with specific conditional logic or just let it be for now and see.
                            // Actually, 'bg-slate-100' in dark mode is bright. I should map them.

                            let statusClass = cfg.color;
                            if (exam.status === 'DRAFT') statusClass = "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300";
                            if (exam.status === 'PUBLISHED') statusClass = "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
                            if (exam.status === 'COMPLETED') statusClass = "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400";

                            return (
                                <div key={exam.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-md transition-all"
                                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                                    {/* Card Header */}
                                    <div className="p-5 border-b border-slate-50 dark:border-slate-800">
                                        <div className="flex items-start justify-between gap-2 mb-3">
                                            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-snug flex-1">{exam.title}</h3>
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold flex-shrink-0 ${statusClass}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {cfg.label}
                                            </span>
                                        </div>
                                        {exam.ranks && (
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                                <Award className="w-3.5 h-3.5 text-yellow-500" />
                                                <span>{exam.ranks.name}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800">
                                        {[
                                            { icon: Clock, label: 'Duration', value: `${exam.duration}m` },
                                            { icon: Users, label: 'Questions', value: exam.questionCount },
                                            { icon: CheckCircle, label: 'Pass Mark', value: `${exam.passMark}%` },
                                        ].map(({ icon: Icon, label, value }) => (
                                            <div key={label} className="p-3 text-center">
                                                <Icon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 mx-auto mb-1" />
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{value}</p>
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500">{label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div className="p-4 flex gap-2">
                                        <Link href={`/dashboard/admin/exams/${exam.id}`}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                            <Eye className="w-3.5 h-3.5" />
                                            Manage
                                        </Link>
                                        {exam.status === 'DRAFT' && (
                                            <button onClick={() => publishMutation.mutate(exam.id)}
                                                disabled={publishMutation.isPending}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-white text-xs font-semibold transition-all hover:opacity-90"
                                                style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                                                <Send className="w-3.5 h-3.5" />
                                                Publish
                                            </button>
                                        )}
                                        {exam.status === 'PUBLISHED' && !exam.resultsReleased && (
                                            <button onClick={() => releaseMutation.mutate(exam.id)}
                                                disabled={releaseMutation.isPending}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-white text-xs font-semibold transition-all hover:opacity-90"
                                                style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                Release Results
                                            </button>
                                        )}
                                        {exam.resultsReleased && (
                                            <span className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                Results Released
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create Exam Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto transition-colors border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                                    <BookOpen className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Create New Exam</h2>
                                    <p className="text-slate-400 dark:text-slate-500 text-xs">Fill in the exam details</p>
                                </div>
                            </div>
                            <button onClick={() => { setShowCreate(false); reset(); setApiError(null); }}
                                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="p-6 space-y-4">
                            {apiError && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">{apiError}</div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Exam Title</label>
                                <input {...register('title')} placeholder="e.g. Torchbearer Rank Exam 2026"
                                    className="w-full px-3 py-2.5 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:text-slate-200 placeholder-slate-400 transition-colors" />
                                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description (optional)</label>
                                <textarea {...register('description')} rows={2} placeholder="Brief description of this exam..."
                                    className="w-full px-3 py-2.5 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 resize-none dark:text-slate-200 placeholder-slate-400 transition-colors" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Rank</label>
                                <select {...register('rankId')}
                                    className="w-full px-3 py-2.5 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:text-slate-200 transition-colors">
                                    <option value="">Select rank...</option>
                                    {ranks.map(r => (
                                        <option key={r.id} value={r.id}>{r.name} (Level {r.level})</option>
                                    ))}
                                </select>
                                {errors.rankId && <p className="text-xs text-red-500 mt-1">{errors.rankId.message}</p>}
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Duration (min)</label>
                                    <input {...register('duration', { valueAsNumber: true })} type="number" min={5} max={300}
                                        className="w-full px-3 py-2.5 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:text-slate-200 transition-colors" />
                                    {errors.duration && <p className="text-xs text-red-500 mt-1">{errors.duration.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Pass Mark (%)</label>
                                    <input {...register('passMark', { valueAsNumber: true })} type="number" min={1} max={100}
                                        className="w-full px-3 py-2.5 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:text-slate-200 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Questions</label>
                                    <input {...register('questionCount', { valueAsNumber: true })} type="number" min={50}
                                        className="w-full px-3 py-2.5 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:text-slate-200 transition-colors" />
                                    {errors.questionCount && <p className="text-xs text-red-500 mt-1">{errors.questionCount.message}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Exam Date (optional)</label>
                                <input {...register('examDate')} type="date"
                                    className="w-full px-3 py-2.5 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:text-slate-200 transition-colors" />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => { setShowCreate(false); reset(); setApiError(null); }}
                                    className="flex-1 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting || createMutation.isPending}
                                    className="flex-1 py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
                                    style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                                    {(isSubmitting || createMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    Create Exam
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </ProtectedRoute>
    );
}
