'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
}

interface ToastContextType {
    showToast: (type: ToastType, title: string, message?: string) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const toastConfig: Record<ToastType, { icon: React.ElementType; bg: string; border: string; iconColor: string; titleColor: string }> = {
    success: {
        icon: CheckCircle,
        bg: 'bg-white dark:bg-slate-900',
        border: 'border-l-4 border-l-emerald-500',
        iconColor: 'text-emerald-500',
        titleColor: 'text-emerald-700 dark:text-emerald-400',
    },
    error: {
        icon: XCircle,
        bg: 'bg-white dark:bg-slate-900',
        border: 'border-l-4 border-l-red-500',
        iconColor: 'text-red-500',
        titleColor: 'text-red-700 dark:text-red-400',
    },
    warning: {
        icon: AlertTriangle,
        bg: 'bg-white dark:bg-slate-900',
        border: 'border-l-4 border-l-amber-500',
        iconColor: 'text-amber-500',
        titleColor: 'text-amber-700 dark:text-amber-400',
    },
    info: {
        icon: Info,
        bg: 'bg-white dark:bg-slate-900',
        border: 'border-l-4 border-l-blue-500',
        iconColor: 'text-blue-500',
        titleColor: 'text-blue-700 dark:text-blue-400',
    },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
    const config = toastConfig[toast.type];
    const Icon = config.icon;
    const [visible, setVisible] = React.useState(false);

    React.useEffect(() => {
        // Trigger entrance animation
        const raf = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(raf);
    }, []);

    const handleDismiss = () => {
        setVisible(false);
        setTimeout(() => onDismiss(toast.id), 300);
    };

    return (
        <div
            className={`
                flex items-start gap-3 p-4 rounded-xl shadow-2xl shadow-black/10
                ${config.bg} ${config.border}
                border border-slate-200 dark:border-slate-700
                min-w-[300px] max-w-[380px]
                transition-all duration-300 ease-out
                ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
            `}
        >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold leading-tight ${config.titleColor}`}>{toast.title}</p>
                {toast.message && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{toast.message}</p>
                )}
            </div>
            <button
                onClick={handleDismiss}
                className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    const dismiss = useCallback((id: string) => {
        clearTimeout(timers.current[id]);
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showToast = useCallback((type: ToastType, title: string, message?: string) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        setToasts(prev => [...prev, { id, type, title, message }]);
        timers.current[id] = setTimeout(() => dismiss(id), 4500);
    }, [dismiss]);

    const success = useCallback((title: string, msg?: string) => showToast('success', title, msg), [showToast]);
    const error = useCallback((title: string, msg?: string) => showToast('error', title, msg), [showToast]);
    const warning = useCallback((title: string, msg?: string) => showToast('warning', title, msg), [showToast]);
    const info = useCallback((title: string, msg?: string) => showToast('info', title, msg), [showToast]);

    return (
        <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
            {children}
            {/* Toast container — fixed top-right */}
            <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
                {toasts.map(toast => (
                    <div key={toast.id} className="pointer-events-auto">
                        <ToastItem toast={toast} onDismiss={dismiss} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}
