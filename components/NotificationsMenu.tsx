import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Bell, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: string;
}

export function NotificationsMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const qc = useQueryClient();
    const toast = useToast();

    // Fetch Notifications
    const { data: notifications = [], isLoading } = useQuery<Notification[]>({
        queryKey: ['notifications'],
        queryFn: async () => (await api.get('/notifications')).data.data.notifications,
        refetchInterval: 30000, // Poll every 30 seconds
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    // Mutate Single Read
    const markAsRead = useMutation({
        mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    // Mutate All Read
    const markAllAsRead = useMutation({
        mutationFn: () => api.patch('/notifications/read-all'),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['notifications'] });
            toast.success('Done', 'All notifications marked as read.');
            setIsOpen(false);
        }
    });

    // Handle clicking outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const timeAgo = (dateStr: string) => {
        const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000);
        if (diff < 1) return 'Just now';
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return `${Math.floor(diff / 1440)}d ago`;
    };

    return (
        <div className="relative z-50" ref={menuRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="Notifications"
            >
                <Bell className="w-[18px] h-[18px]" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-100 dark:border-slate-800" />
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 animate-slide-down">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => markAllAsRead.mutate()}
                                disabled={markAllAsRead.isPending}
                                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto custom-scrollbar p-1">
                        {isLoading ? (
                            <div className="flex items-center justify-center p-6 text-slate-400">
                                <Loader2 className="w-5 h-5 animate-spin" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-6 text-center">
                                <p className="text-sm text-slate-500 dark:text-slate-400">You have no notifications.</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {notifications.map(n => (
                                    <button
                                        key={n.id}
                                        onClick={() => {
                                            if (!n.read) markAsRead.mutate(n.id);
                                        }}
                                        className={`w-full text-left p-3 rounded-xl transition-colors ${n.read
                                            ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50 opacity-70'
                                            : 'bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-900/10 dark:hover:bg-blue-900/20'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm truncate ${n.read ? 'font-medium text-slate-700 dark:text-slate-300' : 'font-bold text-slate-900 dark:text-white'}`}>
                                                    {n.title}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                                    {n.message}
                                                </p>
                                                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-2 uppercase tracking-wider">
                                                    {timeAgo(n.createdAt)}
                                                </p>
                                            </div>
                                            {!n.read && (
                                                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 pt-2 text-center border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Real-time Activity</span>
                    </div>
                </div>
            )}
        </div>
    );
}
