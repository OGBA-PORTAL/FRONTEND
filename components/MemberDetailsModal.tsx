import React, { useState } from 'react';
import { User, UserRole, Church, Rank } from '@/lib/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { X, Shield, Building2, BookOpen, CheckCircle, XCircle, AlertCircle, Trash2, UserCog, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface MemberDetailsModalProps {
    user: User;
    onClose: () => void;
}

const roleColors: Record<string, string> = {
    RA: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    CHURCH_ADMIN: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    ASSOCIATION_OFFICER: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    SYSTEM_ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const statusColors: Record<string, string> = {
    ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    PENDING_ACTIVATION: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    SUSPENDED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function MemberDetailsModal({ user, onClose }: MemberDetailsModalProps) {
    const { user: currentUser } = useAuth();
    const qc = useQueryClient();
    const toast = useToast();

    // Local State for confirmations inside the modal
    const [confirmAction, setConfirmAction] = useState<'SUSPEND' | 'ACTIVATE' | 'DELETE' | null>(null);
    const [isChangingRole, setIsChangingRole] = useState(false);

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            api.patch(`/users/${id}/status`, { status }),
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: ['admin-users'] });
            qc.invalidateQueries({ queryKey: ['church-users'] });
            const action = vars.status === 'ACTIVE' ? 'Activated' : 'Suspended';
            toast.success(`Account ${action}`, `The user account has been ${action.toLowerCase()} successfully.`);
            setConfirmAction(null);
            onClose(); // Close modal on success
        },
        onError: (err: any) => {
            toast.error('Action Failed', err?.response?.data?.message ?? 'Could not update account status.');
            setConfirmAction(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/users/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-users'] });
            qc.invalidateQueries({ queryKey: ['church-users'] });
            toast.success('Account Deleted', 'The user account has been permanently deleted.');
            onClose();
        },
        onError: (err: any) => {
            toast.error('Deletion Failed', err?.response?.data?.message ?? 'Failed to delete user.');
            setConfirmAction(null);
        }
    });

    const changeRoleMutation = useMutation({
        mutationFn: ({ id, role }: { id: string; role: string }) =>
            api.patch(`/users/${id}/role`, { role }),
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: ['admin-users'] });
            qc.invalidateQueries({ queryKey: ['church-users'] });
            setIsChangingRole(false);
            const roleLabel = vars.role === 'RA' ? 'RA Member' : vars.role === 'CHURCH_ADMIN' ? 'Church Admin' : 'Assoc. Officer';
            toast.success('Role Updated', `User role has been changed to ${roleLabel}.`);
            onClose();
        },
        onError: (err: any) => {
            toast.error('Role Change Failed', err?.response?.data?.message ?? 'Failed to change role.');
            setIsChangingRole(false);
        }
    });

    // Permission Checkers
    const canManageStatus = (() => {
        if (currentUser?.id === user.id) return false;
        if (currentUser?.role === 'SYSTEM_ADMIN') return true;
        if (currentUser?.role === 'ASSOCIATION_OFFICER') return user.role !== 'SYSTEM_ADMIN';
        if (currentUser?.role === 'CHURCH_ADMIN') return user.role === 'RA';
        return false;
    })();

    const canDeleteUser = (targetRole: string) => {
        if (currentUser?.id === user.id) return false;
        const allowedDeletions: Record<string, string[]> = {
            SYSTEM_ADMIN: ['ASSOCIATION_OFFICER', 'CHURCH_ADMIN', 'RA'],
            ASSOCIATION_OFFICER: ['CHURCH_ADMIN', 'RA'],
            CHURCH_ADMIN: [],
        };
        return (allowedDeletions[currentUser?.role ?? ''] ?? []).includes(targetRole);
    };

    const getRoleOptions = (targetRole: string): { value: string; label: string }[] => {
        if (currentUser?.id === user.id) return [];
        const allOptions = [
            { value: 'RA', label: 'RA Member' },
            { value: 'CHURCH_ADMIN', label: 'Church Admin' },
            { value: 'ASSOCIATION_OFFICER', label: 'Assoc. Officer' },
        ];
        const manageable: Record<string, string[]> = {
            SYSTEM_ADMIN: ['RA', 'CHURCH_ADMIN', 'ASSOCIATION_OFFICER'],
            ASSOCIATION_OFFICER: ['RA', 'CHURCH_ADMIN'],
            CHURCH_ADMIN: [],
        };
        const allowed = manageable[currentUser?.role ?? ''] ?? [];
        if (!allowed.includes(targetRole)) return [];
        return allOptions.filter(o => o.value !== targetRole && allowed.includes(o.value));
    };

    const roleOptions = getRoleOptions(user.role);
    const dateJoined = new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 max-h-[90vh]">

                {/* Header (Banner & Avatar) */}
                <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-600 flex-shrink-0">
                    <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors backdrop-blur-md">
                        <X className="w-4 h-4" />
                    </button>
                    <div className="absolute -bottom-12 left-6">
                        <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 p-1.5 shadow-xl">
                            <div className="w-full h-full rounded-xl flex items-center justify-center text-white text-3xl font-bold"
                                style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                                {user.firstName[0]}{user.lastName[0]}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body Content */}
                <div className="pt-16 pb-8 px-6 sm:px-8 overflow-y-auto custom-scrollbar flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{user.firstName} {user.lastName}</h2>
                            <p className="text-sm font-mono text-slate-500 dark:text-slate-400 mt-1">{user.raNumber}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${statusColors[user.status] ?? 'bg-slate-100 text-slate-600'}`}>
                            {user.status === 'ACTIVE' ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                            {user.status}
                        </span>
                    </div>

                    <div className="space-y-6">
                        {/* Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 mb-1">
                                    <Shield className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</span>
                                </div>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold ${roleColors[user.role]}`}>
                                    {user.role === 'SYSTEM_ADMIN' ? 'System Admin' : user.role === 'ASSOCIATION_OFFICER' ? 'Assoc. Officer' : user.role === 'CHURCH_ADMIN' ? 'Church Admin' : 'RA Member'}
                                </span>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 mb-1">
                                    <Building2 className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Church</span>
                                </div>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-300">
                                    {user.churches ? `${user.churches.name} (${user.churches.code})` : 'System Level'}
                                </p>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 mb-1">
                                    <BookOpen className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rank</span>
                                </div>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-300">
                                    {user.ranks ? user.ranks.name : 'N/A'}
                                </p>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 mb-1">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</span>
                                </div>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-300">
                                    {dateJoined}
                                </p>
                            </div>
                        </div>

                        {/* Actions Section */}
                        {currentUser?.id !== user.id && (canManageStatus || canDeleteUser(user.role) || roleOptions.length > 0) && (
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-4">Quick Actions</h3>

                                <div className="flex flex-wrap gap-2">
                                    {/* Role Change */}
                                    {roleOptions.length > 0 && (
                                        <div className="relative z-10">
                                            <button
                                                onClick={() => setIsChangingRole(!isChangingRole)}
                                                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
                                                <UserCog className="w-4 h-4" /> Change Role
                                            </button>

                                            {isChangingRole && (
                                                <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                                    {roleOptions.map(opt => (
                                                        <button
                                                            key={opt.value}
                                                            onClick={() => changeRoleMutation.mutate({ id: user.id, role: opt.value })}
                                                            disabled={changeRoleMutation.isPending}
                                                            className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex flex-col gap-0.5">
                                                            <span className="font-semibold">{opt.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Status Switcher */}
                                    {canManageStatus && (
                                        user.status === 'ACTIVE' ? (
                                            <button
                                                onClick={() => setConfirmAction('SUSPEND')}
                                                className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl text-sm font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors">
                                                <AlertCircle className="w-4 h-4" /> Suspend
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setConfirmAction('ACTIVATE')}
                                                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors">
                                                <CheckCircle className="w-4 h-4" /> Activate
                                            </button>
                                        )
                                    )}

                                    {/* Delete */}
                                    {canDeleteUser(user.role) && (
                                        <button
                                            onClick={() => setConfirmAction('DELETE')}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors ml-auto sm:ml-0">
                                            <Trash2 className="w-4 h-4" /> Delete
                                        </button>
                                    )}
                                </div>

                                {/* Inline Confirmation Panels */}
                                {confirmAction && (
                                    <div className={`mt-4 p-4 rounded-xl border ${confirmAction === 'DELETE' ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30' : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-3">
                                            {confirmAction === 'DELETE' && 'Are you sure you want to permanently delete this user?'}
                                            {confirmAction === 'SUSPEND' && 'Are you sure you want to suspend this user? They will lose access to the portal immediately.'}
                                            {confirmAction === 'ACTIVATE' && 'Are you sure you want to restore access for this user?'}
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setConfirmAction(null)}
                                                className="flex-1 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirmAction === 'DELETE') deleteMutation.mutate(user.id);
                                                    if (confirmAction === 'SUSPEND') statusMutation.mutate({ id: user.id, status: 'SUSPENDED' });
                                                    if (confirmAction === 'ACTIVATE') statusMutation.mutate({ id: user.id, status: 'ACTIVE' });
                                                }}
                                                disabled={deleteMutation.isPending || statusMutation.isPending}
                                                className={`flex-1 flex justify-center items-center py-2 rounded-lg text-white text-sm font-semibold transition shadow-sm ${confirmAction === 'DELETE' ? 'bg-red-600 hover:bg-red-700' : confirmAction === 'SUSPEND' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                                                {(deleteMutation.isPending || statusMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
