import React from 'react';
import { AlertCircle, X, CheckCircle, Ban } from 'lucide-react';

interface BulkConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    actionType: 'ACTIVE' | 'SUSPENDED';
    targetCount: number;
    isLoading?: boolean;
}

export default function BulkConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    actionType,
    targetCount,
    isLoading = false
}: BulkConfirmModalProps) {
    if (!isOpen) return null;

    const isSuspension = actionType === 'SUSPENDED';
    const Icon = isSuspension ? Ban : CheckCircle;

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 transition-colors">
                <div className="p-6 pb-0 flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${isSuspension ? 'bg-red-50 dark:bg-red-900/30 shadow-red-500/20' : 'bg-emerald-50 dark:bg-emerald-900/30 shadow-emerald-500/20'}`}>
                        <Icon className={`w-6 h-6 ${isSuspension ? 'text-red-500' : 'text-emerald-500'}`} />
                    </div>
                    <button onClick={onClose} disabled={isLoading}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">
                        <X className="w-4 h-4 text-slate-500" />
                    </button>
                </div>

                <div className="p-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                        {description}
                    </p>

                    <div className={`mt-6 p-4 rounded-xl border flex items-start gap-4 ${isSuspension ? 'bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30' : 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30'}`}>
                        <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isSuspension ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
                        <div>
                            <p className={`text-sm font-bold ${isSuspension ? 'text-red-800 dark:text-red-300' : 'text-emerald-800 dark:text-emerald-300'}`}>
                                Impact Warning
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                You are about to <strong className="font-bold">{isSuspension ? 'suspend' : 'activate'} {targetCount} users</strong>. This will instantly affect their access to the portal starting immediately.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 pt-0 flex gap-3 mt-2">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50">
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-[2] px-4 py-3 rounded-xl text-white font-bold transition-all hover:opacity-90 disabled:opacity-60 shadow-lg flex items-center justify-center ${isSuspension ? 'bg-red-500 shadow-red-500/25' : 'bg-emerald-500 shadow-emerald-500/25'}`}>
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            isSuspension ? 'Yes, Suspend All' : 'Yes, Activate All'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
