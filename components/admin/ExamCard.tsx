import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Exam, Rank } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';
import {
    Clock, CheckCircle, Send, Eye, Users, Award, Trash2, AlertTriangle, PauseCircle, PlayCircle, Undo2, Loader2, FileText, Settings, X, Save
} from 'lucide-react';

const updateExamSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    duration: z.number().min(5).max(300),
    passMark: z.number().min(1).max(100),
    questionCount: z.number().min(1, 'Must be at least 1'),
    rankId: z.string().optional(),
});
type UpdateExamForm = z.infer<typeof updateExamSchema>;

interface ExamCardProps {
    exam: Exam;
    ranks: Rank[];
    statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }>;
}

export const ExamCard = ({ exam, ranks, statusConfig }: ExamCardProps) => {
    const qc = useQueryClient();
    const toast = useToast();
    const [isFlipped, setIsFlipped] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const cfg = statusConfig[exam.status] ?? statusConfig.DRAFT;
    const StatusIcon = cfg.icon;

    let statusClass = cfg.color;
    if (exam.status === 'DRAFT') statusClass = "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300";
    if (exam.status === 'PUBLISHED') statusClass = "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
    if (exam.status === 'PAUSED') statusClass = "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400";
    if (exam.status === 'COMPLETED') statusClass = "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400";

    const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateExamForm>({
        resolver: zodResolver(updateExamSchema),
        defaultValues: {
            title: exam.title,
            duration: exam.duration,
            passMark: exam.passMark,
            questionCount: exam.questionCount,
            rankId: exam.ranks?.id || '',
        },
    });

    const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-exams'] });

    const updateMutation = useMutation({
        mutationFn: (data: UpdateExamForm) => api.patch(`/exams/${exam.id}`, data),
        onSuccess: () => {
            invalidate();
            toast.success('Exam Updated', 'The exam properties have been saved.');
            setIsFlipped(false);
        },
        onError: (err: any) => toast.error('Update Failed', err?.response?.data?.message || 'Failed to update exam'),
    });

    const actionMutation = useMutation({
        mutationFn: ({ action }: { action: string }) => {
            if (action === 'delete') return api.delete(`/exams/${exam.id}`);
            if (action === 'release') return api.patch(`/exams/${exam.id}/release`);
            if (action === 'retract') return api.patch(`/exams/${exam.id}/retract`);
            // Custom status patches
            return api.patch(`/exams/${exam.id}/status`, { status: action });
        },
        onSuccess: (data, { action }) => {
            invalidate();
            if (action === 'delete') toast.success('Deleted', 'Exam permanently removed.');
            if (action === 'release') toast.success('Released', 'Results published to students.');
            if (action === 'retract') toast.success('Retracted', 'Results hidden.');
            if (action === 'PUBLISHED') toast.success('Published', 'Exam is now live.');
            if (action === 'PAUSED') toast.success('Paused', 'Exam is paused.');
            if (action === 'DRAFT') toast.success('Unpublished', 'Exam has been reverted to Draft.');
        },
        onError: (err: any) => toast.error('Action Failed', err?.response?.data?.message || 'Something went wrong'),
    });

    return (
        <div className="relative w-full h-[320px] perspective-1000">
            <motion.div
                className="w-full h-full relative preserve-3d transition-all"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
            >
                {/* --- FRONT OF CARD --- */}
                <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>

                    {/* Header */}
                    <div className="p-5 border-b border-slate-50 dark:border-slate-800 h-[100px]">
                        <div className="flex items-start justify-between gap-2 mb-3">
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-snug flex-1 line-clamp-2">{exam.title}</h3>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold flex-shrink-0 ${statusClass}`}>
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

                    {/* Stats Strip */}
                    <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800 h-[64px] shrink-0">
                        {[
                            { icon: Clock, label: 'Duration', value: `${exam.duration}m` },
                            { icon: Users, label: 'Questions', value: exam.questionCount },
                            { icon: CheckCircle, label: 'Pass Mark', value: `${exam.passMark}%` },
                        ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="p-2 flex flex-col items-center justify-center text-center">
                                <Icon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 mb-0.5" />
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{value}</p>
                                <p className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-end">
                        <div className="flex gap-2">
                            <Link href={`/dashboard/admin/exams/${exam.id}`}
                                className="flex-1 flex items-center justify-center py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <Eye className="w-3.5 h-3.5 mr-1" />
                                Manage
                            </Link>

                            <button onClick={() => setIsFlipped(true)}
                                className="w-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                title="Edit Settings">
                                <Settings className="w-4 h-4" />
                            </button>

                            {/* State-based main action button */}
                            {exam.status === 'DRAFT' && (
                                <button onClick={() => actionMutation.mutate({ action: 'PUBLISHED' })}
                                    disabled={actionMutation.isPending}
                                    className="flex-1 flex items-center justify-center py-2 rounded-xl text-white text-xs font-semibold transition-all hover:opacity-90"
                                    style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                                    <Send className="w-3 h-3 mr-1" /> Publish
                                </button>
                            )}
                            {exam.status === 'PUBLISHED' && !exam.resultsReleased && (
                                <button onClick={() => actionMutation.mutate({ action: 'PAUSED' })}
                                    disabled={actionMutation.isPending}
                                    className="flex-1 flex items-center justify-center py-2 rounded-xl bg-orange-100 text-orange-700 text-xs font-semibold">
                                    <PauseCircle className="w-3 h-3 mr-1" /> Pause
                                </button>
                            )}
                            {exam.status === 'PAUSED' && !exam.resultsReleased && (
                                <button onClick={() => actionMutation.mutate({ action: 'PUBLISHED' })}
                                    disabled={actionMutation.isPending}
                                    className="flex-1 flex items-center justify-center py-2 rounded-xl text-white text-xs font-semibold"
                                    style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                                    <PlayCircle className="w-3 h-3 mr-1" /> Resume
                                </button>
                            )}
                            {exam.status === 'PUBLISHED' && !exam.resultsReleased && (
                                <button onClick={() => actionMutation.mutate({ action: 'release' })}
                                    disabled={actionMutation.isPending}
                                    className="flex-1 flex items-center justify-center py-2 rounded-xl text-white text-xs font-semibold"
                                    style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                                    <CheckCircle className="w-3 h-3 mr-1" /> Release
                                </button>
                            )}
                            {exam.resultsReleased && (
                                <button onClick={() => actionMutation.mutate({ action: 'retract' })}
                                    disabled={actionMutation.isPending}
                                    className="flex-1 flex items-center justify-center py-2 rounded-xl bg-amber-50 text-amber-700 text-xs font-semibold">
                                    <Undo2 className="w-3 h-3 mr-1" /> Retract
                                </button>
                            )}

                            <button onClick={() => setConfirmDelete(!confirmDelete)}
                                className="w-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Unpublish — revert to DRAFT (only for PUBLISHED or PAUSED, no results released) */}
                        {(exam.status === 'PUBLISHED' || exam.status === 'PAUSED') && !exam.resultsReleased && (
                            <button
                                onClick={() => actionMutation.mutate({ action: 'DRAFT' })}
                                disabled={actionMutation.isPending}
                                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-[10px] font-semibold hover:border-slate-300 hover:text-slate-600 dark:hover:text-slate-400 transition-colors">
                                <Undo2 className="w-3 h-3" /> Unpublish (revert to Draft)
                            </button>
                        )}

                        {confirmDelete && (
                            <div className="absolute bottom-1 left-1 right-1 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-800 rounded-xl p-2 flex items-center justify-between z-10">
                                <span className="text-[10px] text-red-600 font-semibold px-1">Verify delete?</span>
                                <div className="flex gap-1">
                                    <button onClick={() => setConfirmDelete(false)} className="px-2 py-1 bg-white text-slate-600 rounded text-[10px] border">No</button>
                                    <button onClick={() => { setConfirmDelete(false); actionMutation.mutate({ action: 'delete' }); }}
                                        className="px-2 py-1 bg-red-600 text-white rounded text-[10px]">Yes</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- BACK OF CARD (Editor) --- */}
                <div className="absolute inset-0 bg-white dark:bg-slate-900 rounded-2xl border-2 border-blue-500/30 overflow-hidden flex flex-col"
                    style={{ transform: "rotateY(180deg)", backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', boxShadow: '0 8px 30px rgba(59, 130, 246, 0.15)' }}>

                    <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/30 flex justify-between items-center shrink-0">
                        <span className="text-xs font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5 shadow-sm">
                            <Settings className="w-3 h-3" /> Quick Edit Settings
                        </span>
                        <button onClick={() => setIsFlipped(false)} className="p-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800">
                            <X className="w-3.5 h-3.5 text-blue-500" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(d => updateMutation.mutate(d))} className="flex-1 p-3 flex flex-col gap-2.5 overflow-hidden">
                        <div>
                            <input {...register('title')} className="w-full px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded outline-none focus:border-blue-400 font-medium" placeholder="Title" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[9px] text-slate-500 ml-1">Questions</label>
                                <input {...register('questionCount', { valueAsNumber: true })} type="number" className="w-full px-2 py-1 border border-slate-200 dark:border-slate-700 rounded text-xs outline-none focus:border-blue-400 bg-transparent" />
                            </div>
                            <div>
                                <label className="text-[9px] text-slate-500 ml-1">Pass Mark %</label>
                                <input {...register('passMark', { valueAsNumber: true })} type="number" className="w-full px-2 py-1 border border-slate-200 dark:border-slate-700 rounded text-xs outline-none focus:border-blue-400 bg-transparent" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[9px] text-slate-500 ml-1">Limit (mins)</label>
                                <input {...register('duration', { valueAsNumber: true })} type="number" className="w-full px-2 py-1 border border-slate-200 dark:border-slate-700 rounded text-xs outline-none focus:border-blue-400 bg-transparent" />
                            </div>
                            <div>
                                <label className="text-[9px] text-slate-500 ml-1">Rank Level</label>
                                <select {...register('rankId')} className="w-full px-2 py-1 border border-slate-200 dark:border-slate-700 rounded text-xs outline-none focus:border-blue-400 bg-transparent">
                                    {ranks.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="mt-auto pt-1">
                            <button type="submit" disabled={updateMutation.isPending}
                                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                                {updateMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                Save Parameters
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};
