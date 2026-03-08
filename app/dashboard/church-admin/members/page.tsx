'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Users, Plus, X, Loader2, UserCheck, UserX,
    Search, Award, CheckCircle, Clock, Shield, BookOpen, Building2, ChevronRight, AlertCircle, List, UserPlus, MoreVertical, Ban
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Rank, User } from '@/lib/types';
import MemberDetailsModal from '@/components/MemberDetailsModal';
import BulkConfirmModal from '@/components/BulkConfirmModal';
import { useAuth } from '@/context/AuthContext';

const registerSchema = z.object({
    firstName: z.string().min(2, 'First name required'),
    lastName: z.string().min(2, 'Last name required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    rankId: z.string().optional(),
});
type RegisterForm = z.infer<typeof registerSchema>;

const roleColors: Record<string, string> = {
    RA: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    CHURCH_ADMIN: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const statusColors: Record<string, string> = {
    ACTIVE: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    SUSPENDED: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    PENDING_ACTIVATION: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
};

export default function ChurchMembersPage() {
    const { user: currentUser } = useAuth();
    const qc = useQueryClient();
    const toast = useToast();
    const [showRegister, setShowRegister] = useState(false);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'ALL' | 'ROLE'>('ALL');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showGlobalBulk, setShowGlobalBulk] = useState(false);
    const [bulkConfirmOptions, setBulkConfirmOptions] = useState<{
        isOpen: boolean;
        type: 'ACTIVE' | 'SUSPENDED';
        targetIds: string[];
    } | null>(null);

    const { data: members = [], isLoading } = useQuery<User[]>({
        queryKey: ['church-members'],
        queryFn: async () => {
            const res = await api.get('/users');
            // Show all members in the same church (backend already filters for church admins, but let's be safe and allow both RA and CHURCH_ADMIN to be visible)
            return res.data.data.users.filter((u: User) => u.role === 'RA' || u.role === 'CHURCH_ADMIN');
        },
    });

    const { data: ranks = [] } = useQuery<Rank[]>({
        queryKey: ['ranks'],
        queryFn: async () => {
            const res = await api.get('/ranks');
            return res.data.data.ranks;
        },
        enabled: showRegister
    });

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const registerMutation = useMutation({
        mutationFn: (data: RegisterForm) => {
            const payload: any = { ...data, role: 'RA' };
            if (!payload.rankId) payload.rankId = null;
            return api.post('/auth/signup', payload);
        },
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: ['church-members'] });
            setShowRegister(false);
            reset();
            toast.success('Member Registered', `${vars.firstName} ${vars.lastName} has been added to your church.`);
        },
        onError: (err: any) => {
            toast.error('Registration Failed', err?.response?.data?.message ?? 'Could not register member.');
        },
    });

    const bulkUpdateMutation = useMutation({
        mutationFn: ({ userIds, status }: { userIds: string[], status: 'ACTIVE' | 'SUSPENDED' }) =>
            api.patch('/users/bulk-status', { userIds, status }),
        onSuccess: (res, vars) => {
            qc.invalidateQueries({ queryKey: ['church-members'] });
            setShowGlobalBulk(false);
            setBulkConfirmOptions(null);
            const updatedCount = res.data?.data?.updatedCount;
            const count = updatedCount !== undefined ? updatedCount : vars.userIds.length;
            if (vars.status === 'ACTIVE') {
                toast.success('Bulk Update Complete', `Successfully activated ${count} members.`);
            } else {
                toast.error('Bulk Update Complete', `Successfully suspended ${count} members.`);
            }
        },
        onError: (err: any) => {
            toast.error('Bulk Update Failed', err?.response?.data?.message ?? 'Could not complete bulk update');
        }
    });

    const handleGlobalBulkAction = (status: 'ACTIVE' | 'SUSPENDED') => {
        // Find all RAs in this church, skip those already in target state
        const targetIds = members.filter(u => {
            if (u.role !== 'RA') return false;
            if (status === 'ACTIVE' && u.status === 'ACTIVE') return false;
            if (status === 'SUSPENDED' && u.status === 'SUSPENDED') return false;
            return true;
        }).map(u => u.id);

        if (targetIds.length === 0) return toast.error('No Targets', `No qualifying RA members found to ${status.toLowerCase()}.`);

        setBulkConfirmOptions({
            isOpen: true,
            type: status,
            targetIds
        });
        setShowGlobalBulk(false);
    };

    const executeBulkStatusUpdate = () => {
        if (!bulkConfirmOptions) return;
        bulkUpdateMutation.mutate({
            userIds: bulkConfirmOptions.targetIds,
            status: bulkConfirmOptions.type
        });
    };

    const filtered = members.filter(m =>
        search === '' ||
        `${m.firstName} ${m.lastName} ${m.raNumber}`.toLowerCase().includes(search.toLowerCase())
    );

    const rolesGrouped = [
        { id: 'CHURCH_ADMIN', label: 'Church Admins', icon: Shield, members: members.filter(u => u.role === 'CHURCH_ADMIN') },
        { id: 'RA', label: 'RA Members', icon: BookOpen, members: members.filter(u => u.role === 'RA') },
    ];

    const UserRow = ({ user }: { user: User }) => (
        <div
            onClick={() => setSelectedUser(user)}
            className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm"
                    style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                    {user.firstName[0]}{user.lastName[0]}
                </div>
                <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {user.firstName} {user.lastName}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
                        <span className="font-mono">{user.raNumber}</span>
                        {user.ranks && (
                            <>
                                <span className="hidden sm:inline">&bull;</span>
                                <span className="hidden sm:inline text-amber-600 dark:text-amber-500 flex items-center gap-1">
                                    <Award className="w-3 h-3" /> {user.ranks.name}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <span className={`hidden md:inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${roleColors[user.role]}`}>
                    {user.role === 'CHURCH_ADMIN' ? 'Church Admin' : 'RA Member'}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${statusColors[user.status]}`}>
                    {user.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    <span className="hidden sm:inline">{user.status}</span>
                </span>
                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
            </div>
        </div>
    );

    return (
        <ProtectedRoute allowedRoles={['CHURCH_ADMIN']}>
            <div className="space-y-6 max-w-7xl mx-auto pb-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Church Members</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage all {members.length} registered members in your church.</p>
                    </div>
                    <div className="flex items-center gap-3 relative">
                        <button onClick={() => { setShowRegister(true); reset(); }}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 active:scale-95 shadow-lg shadow-blue-500/25 sm:w-auto w-full"
                            style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                            <Plus className="w-4 h-4" />
                            Register Member
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[600px]">

                    {/* Tabs & Search Header */}
                    <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4">
                            {/* Role Based Tabs */}
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl self-start w-full md:w-auto overflow-x-auto custom-scrollbar">
                                <button
                                    onClick={() => setActiveTab('ALL')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'ALL'
                                        ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                        }`}
                                >
                                    All Members ({members.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('ROLE')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'ROLE'
                                        ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                        }`}
                                >
                                    By Role
                                </button>
                            </div>

                            {/* Search */}
                            <div className="relative w-full md:w-72 flex-shrink-0">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    value={search} onChange={e => { setSearch(e.target.value); setActiveTab('ALL'); }}
                                    placeholder="Search by name, RA#..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:text-slate-200 transition-all shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Renders Tabs Below */}
                    <div className="flex-1 bg-slate-50/30 dark:bg-slate-900 overflow-y-auto">
                        {isLoading ? (
                            <div className="h-full flex flex-col items-center justify-center p-12">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                                <p className="text-slate-500 font-medium">Loading network data...</p>
                            </div>
                        ) : members.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                                <Users className="w-16 h-16 text-slate-200 dark:text-slate-800 mb-4" />
                                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Members Found</h3>
                                <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm">There are no members registered in your church yet. Start by registering the first user.</p>
                            </div>
                        ) : activeTab === 'ALL' ? (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filtered.length === 0 ? (
                                    <div className="p-12 text-center text-slate-500">No users match your search.</div>
                                ) : (
                                    filtered.map(user => <UserRow key={user.id} user={user} />)
                                )}
                            </div>
                        ) : (
                            <div className="p-6 space-y-8">
                                {rolesGrouped.map(group => group.members.length > 0 && (
                                    <div key={group.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
                                                    <group.icon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                                                </div>
                                                <h3 className="font-bold text-slate-800 dark:text-slate-100">{group.label}</h3>
                                            </div>
                                            <span className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">
                                                {group.members.length}
                                            </span>
                                        </div>
                                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {group.members.map(user => <UserRow key={user.id} user={user} />)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Member Details Modal Slide-over */}
            {selectedUser && (
                <MemberDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />
            )}

            {/* Bulk Confirmation Modal */}
            {bulkConfirmOptions && (
                <BulkConfirmModal
                    isOpen={bulkConfirmOptions.isOpen}
                    onClose={() => setBulkConfirmOptions(null)}
                    onConfirm={executeBulkStatusUpdate}
                    actionType={bulkConfirmOptions.type}
                    targetCount={bulkConfirmOptions.targetIds.length}
                    isLoading={bulkUpdateMutation.isPending}
                    title={bulkConfirmOptions.type === 'SUSPENDED' ? 'Confirm Mass Suspension' : 'Confirm Mass Activation'}
                    description={`You are targeting all ${bulkConfirmOptions.targetIds.length} registered RAs in your church. This will not affect other Church Admins.`}
                />
            )}

            {/* Register Member Modal */}
            {showRegister && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 transition-colors">

                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20"
                                    style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                                    <UserPlus className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Add Member</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Register an RA in your church</p>
                                </div>
                            </div>
                            <button onClick={() => { setShowRegister(false); reset(); }}
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <form onSubmit={handleSubmit(d => registerMutation.mutate(d))} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">First Name <span className="text-red-500">*</span></label>
                                        <input {...register('firstName')} placeholder="e.g. Samuel"
                                            className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:text-slate-200 transition-all" />
                                        {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Last Name <span className="text-red-500">*</span></label>
                                        <input {...register('lastName')} placeholder="e.g. Adebayo"
                                            className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:text-slate-200 transition-all" />
                                        {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Previous Rank</label>
                                    <div className="relative">
                                        <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <select {...register('rankId')}
                                            className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none bg-white transition-all cursor-pointer dark:text-slate-200">
                                            <option value="">None / N/A (Candidate)</option>
                                            {ranks.map((r: Rank) => (
                                                <option key={r.id} value={r.id}>{r.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Initial Password <span className="text-red-500">*</span></label>
                                    <input {...register('password')} type="password" autoComplete="new-password" placeholder="Min. 6 characters"
                                        className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono dark:text-slate-200" />
                                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button type="button" onClick={() => { setShowRegister(false); reset(); }}
                                        className="flex-1 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isSubmitting || registerMutation.isPending}
                                        className="flex-[2] py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60 shadow-lg shadow-blue-500/25"
                                        style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                                        {(isSubmitting || registerMutation.isPending) ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserCheck className="w-5 h-5" />}
                                        Register
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </ProtectedRoute>
    );
}
