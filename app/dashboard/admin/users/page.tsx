'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { User, Church, Rank, UserRole } from '@/lib/types';
import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Users, Search, Filter,
    CheckCircle, XCircle, Loader2, X, UserPlus,
    Shield, BookOpen, Building2, ChevronRight, GraduationCap, AlertCircle, LayoutGrid, List, MoreVertical, Ban
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import MemberDetailsModal from '@/components/MemberDetailsModal';
import BulkConfirmModal from '@/components/BulkConfirmModal';

// Schema with conditional validation
const createUserSchema = z.object({
    firstName: z.string().min(1, 'First name required'),
    lastName: z.string().min(1, 'Last name required'),
    role: z.enum(['RA', 'CHURCH_ADMIN', 'ASSOCIATION_OFFICER', 'SYSTEM_ADMIN']),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    churchId: z.string().optional(),
    rankId: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.role === 'CHURCH_ADMIN' && !data.churchId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Church is required for Church Admin", path: ["churchId"] });
    }
    if (data.role === 'RA') {
        if (!data.rankId) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Rank is required for RA", path: ["rankId"] });
        }
    }
});

type CreateUserForm = z.infer<typeof createUserSchema>;

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

export default function AdminUsersPage() {
    const { user: currentUser } = useAuth();
    const qc = useQueryClient();
    const toast = useToast();
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'ALL' | 'ROLE' | 'CHURCH'>('ALL');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [expandedChurchId, setExpandedChurchId] = useState<string | null>(null);
    const [showGlobalBulk, setShowGlobalBulk] = useState(false);
    const [bulkConfirmOptions, setBulkConfirmOptions] = useState<{
        isOpen: boolean;
        type: 'ACTIVE' | 'SUSPENDED';
        targetIds: string[];
        isGlobal: boolean;
        churchName?: string;
    } | null>(null);

    // Queries
    const { data: users = [], isLoading } = useQuery<User[]>({
        queryKey: ['admin-users'],
        queryFn: async () => (await api.get('/users')).data.data.users,
    });

    const { data: churches = [] } = useQuery<Church[]>({
        queryKey: ['churches'],
        queryFn: async () => (await api.get('/churches')).data.data.churches,
    });

    const { data: ranks = [] } = useQuery<Rank[]>({
        queryKey: ['ranks'],
        queryFn: async () => (await api.get('/ranks')).data.data.ranks,
        enabled: showCreate
    });

    const allowedCreateRoles = useMemo(() => {
        if (!currentUser) return [];
        if (currentUser.role === 'SYSTEM_ADMIN') return ['ASSOCIATION_OFFICER', 'CHURCH_ADMIN', 'RA'];
        if (currentUser.role === 'ASSOCIATION_OFFICER') return ['CHURCH_ADMIN', 'RA'];
        if (currentUser.role === 'CHURCH_ADMIN') return ['RA'];
        return [];
    }, [currentUser]);

    const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<CreateUserForm>({
        resolver: zodResolver(createUserSchema),
        defaultValues: { role: 'RA' }
    });

    const selectedRole = watch('role');

    useEffect(() => {
        if (showCreate && allowedCreateRoles.length > 0) {
            if (currentUser?.role === 'CHURCH_ADMIN') setValue('role', 'RA');
            else if (currentUser?.role === 'SYSTEM_ADMIN') setValue('role', 'ASSOCIATION_OFFICER');
        }
    }, [showCreate, allowedCreateRoles, currentUser, setValue]);

    useEffect(() => {
        if (currentUser?.role === 'CHURCH_ADMIN' && currentUser.churchId) {
            setValue('churchId', currentUser.churchId);
        }
    }, [currentUser, setValue, showCreate]);

    const createMutation = useMutation({
        mutationFn: (data: CreateUserForm) => api.post('/auth/register', data),
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: ['admin-users'] });
            setShowCreate(false);
            reset();
            setApiError(null);
            const name = res?.data?.data?.user ? `${res.data.data.user.firstName} ${res.data.data.user.lastName}` : 'New member';
            toast.success('Member Registered', `${name}'s account has been created successfully.`);
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.message ?? 'Failed to create user';
            setApiError(msg);
            toast.error('Registration Failed', msg);
        },
    });

    const filtered = users.filter(u => {
        const matchSearch = search === '' ||
            `${u.firstName} ${u.lastName} ${u.raNumber}`.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === '' || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    const onSubmit = (data: CreateUserForm) => {
        if ((data.role === 'RA' || data.role === 'CHURCH_ADMIN') && !data.churchId && currentUser?.role !== 'CHURCH_ADMIN') {
            if (!data.churchId) return;
        }
        createMutation.mutate(data);
    };

    const bulkUpdateMutation = useMutation({
        mutationFn: ({ userIds, status }: { userIds: string[], status: 'ACTIVE' | 'SUSPENDED' }) =>
            api.patch('/users/bulk-status', { userIds, status }),
        onSuccess: (res, vars) => {
            qc.invalidateQueries({ queryKey: ['admin-users'] });
            setShowGlobalBulk(false);
            setBulkConfirmOptions(null);
            const count = res.data?.data?.updatedCount || vars.userIds.length;
            toast.success('Bulk Update Complete', `Successfully ${vars.status === 'ACTIVE' ? 'activated' : 'suspended'} ${count} members.`);
        },
        onError: (err: any) => {
            toast.error('Bulk Update Failed', err?.response?.data?.message ?? 'Could not complete bulk update');
        }
    });

    const handleGlobalBulkAction = (status: 'ACTIVE' | 'SUSPENDED') => {
        // Find all RAs
        const targetIds = users.filter(u => u.role === 'RA').map(u => u.id);
        if (targetIds.length === 0) return toast.error('No Targets', 'No RA members found to update.');

        setBulkConfirmOptions({
            isOpen: true,
            type: status,
            targetIds,
            isGlobal: true,
        });
        setShowGlobalBulk(false);
    };

    const handleChurchBulkAction = (churchId: string, status: 'ACTIVE' | 'SUSPENDED', e: React.MouseEvent) => {
        e.stopPropagation();
        const targetIds = users.filter(u => u.churchId === churchId && u.role === 'RA').map(u => u.id);
        if (targetIds.length === 0) return toast.error('No Targets', 'No RA members found in this church.');

        const church = churches.find(c => c.id === churchId);

        setBulkConfirmOptions({
            isOpen: true,
            type: status,
            targetIds,
            isGlobal: false,
            churchName: church?.name
        });
    };

    const executeBulkStatusUpdate = () => {
        if (!bulkConfirmOptions) return;
        bulkUpdateMutation.mutate({
            userIds: bulkConfirmOptions.targetIds,
            status: bulkConfirmOptions.type
        });
    };

    // Calculate church stats
    const churchStats = useMemo(() => {
        return churches.map(church => {
            const churchMembers = users.filter(u => u.churchId === church.id);
            const raCount = churchMembers.filter(u => u.role === 'RA').length;
            const adminCount = churchMembers.filter(u => u.role === 'CHURCH_ADMIN').length;
            return {
                ...church,
                members: churchMembers,
                total: churchMembers.length,
                raCount,
                adminCount
            };
        }).sort((a, b) => b.total - a.total);
    }, [churches, users]);

    // Roles grouping
    const rolesGrouped = [
        { id: 'SYSTEM_ADMIN', label: 'System Admins', icon: Shield, members: users.filter(u => u.role === 'SYSTEM_ADMIN') },
        { id: 'ASSOCIATION_OFFICER', label: 'Association Officers', icon: Building2, members: users.filter(u => u.role === 'ASSOCIATION_OFFICER') },
        { id: 'CHURCH_ADMIN', label: 'Church Admins', icon: Users, members: users.filter(u => u.role === 'CHURCH_ADMIN') },
        { id: 'RA', label: 'RA Members', icon: BookOpen, members: users.filter(u => u.role === 'RA') },
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
                        <span className="hidden sm:inline">&bull;</span>
                        <span className="hidden sm:inline">{user.churches?.name ?? 'System Level'}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <span className={`hidden md:inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${roleColors[user.role]}`}>
                    {user.role === 'SYSTEM_ADMIN' ? 'Sys Admin' : user.role === 'ASSOCIATION_OFFICER' ? 'Assoc. Officer' : user.role === 'CHURCH_ADMIN' ? 'Church Admin' : 'RA Member'}
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
        <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'ASSOCIATION_OFFICER']}>
            <div className="space-y-6 max-w-7xl mx-auto pb-10">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Members Hub</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage all {users.length} registered members across the portal.</p>
                    </div>
                    {(allowedCreateRoles.length > 0) && (
                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto relative">
                            <button onClick={() => { setShowCreate(true); setApiError(null); reset(); }}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 active:scale-95 shadow-lg shadow-blue-500/25 flex-1 sm:flex-none"
                                style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                                <UserPlus className="w-4 h-4" />
                                Register Member
                            </button>

                            {/* Global Bulk Actions Dropdown */}
                            <div className="relative flex-shrink-0">
                                <button
                                    onClick={() => setShowGlobalBulk(!showGlobalBulk)}
                                    className="flex items-center justify-center p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                                    <MoreVertical className="w-5 h-5" />
                                </button>

                                {showGlobalBulk && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setShowGlobalBulk(false)} />
                                        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-20 animate-in fade-in slide-in-from-top-2">
                                            <div className="px-3 pb-2 border-b border-slate-100 dark:border-slate-700 mb-2">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Global Actions</p>
                                            </div>
                                            <button onClick={() => handleGlobalBulkAction('ACTIVE')} disabled={bulkUpdateMutation.isPending}
                                                className="w-full text-left px-4 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex items-center gap-2 transition-colors">
                                                <CheckCircle className="w-4 h-4" /> Activate All RAs
                                            </button>
                                            <button onClick={() => handleGlobalBulkAction('SUSPENDED')} disabled={bulkUpdateMutation.isPending}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors">
                                                <Ban className="w-4 h-4" /> Suspend All RAs
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[600px]">

                    {/* Tabs & Search Header */}
                    <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4">
                            {/* Tabs */}
                            <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800 rounded-xl self-start w-full md:w-auto overflow-x-auto custom-scrollbar">
                                <button
                                    onClick={() => setActiveTab('ALL')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'ALL' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                    <List className="w-4 h-4" /> All Members
                                </button>
                                <button
                                    onClick={() => setActiveTab('ROLE')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'ROLE' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                    <Shield className="w-4 h-4" /> By Role
                                </button>
                                <button
                                    onClick={() => setActiveTab('CHURCH')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'CHURCH' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                    <Building2 className="w-4 h-4" /> By Church
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

                    {/* View Areas */}
                    <div className="flex-1 bg-slate-50/30 dark:bg-slate-900 overflow-y-auto">
                        {isLoading ? (
                            <div className="h-full flex flex-col items-center justify-center p-12">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                                <p className="text-slate-500 font-medium">Loading network data...</p>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                                <Users className="w-16 h-16 text-slate-200 dark:text-slate-800 mb-4" />
                                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Members Found</h3>
                                <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm">There are no members registered in the system yet. Start by registering the first user.</p>
                            </div>
                        ) : activeTab === 'ALL' ? (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filtered.length === 0 ? (
                                    <div className="p-12 text-center text-slate-500">No users match your search.</div>
                                ) : (
                                    filtered.map(user => <UserRow key={user.id} user={user} />)
                                )}
                            </div>
                        ) : activeTab === 'ROLE' ? (
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
                        ) : (
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {churchStats.map(church => (
                                    <div key={church.id} className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-300 overflow-hidden ${expandedChurchId === church.id ? 'border-blue-300 dark:border-blue-700 shadow-md ring-4 ring-blue-50 dark:ring-blue-900/20 md:col-span-2' : 'border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'}`}>

                                        {/* Church Card Summary */}
                                        <div
                                            onClick={() => setExpandedChurchId(expandedChurchId === church.id ? null : church.id)}
                                            className="p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                                                    <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">{church.name}</h3>
                                                    <p className="font-mono text-slate-500 dark:text-slate-400 text-sm mt-0.5">{church.code}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 sm:gap-8">
                                                <div className="text-center">
                                                    <p className="text-2xl font-black text-slate-800 dark:text-slate-200">{church.total}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
                                                </div>
                                                <div className="text-center mr-0 sm:mr-2">
                                                    <p className="text-lg font-bold text-amber-600 dark:text-amber-500">{church.adminCount}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admins</p>
                                                </div>

                                                {/* Church Bulk Actions */}
                                                <div className="flex items-center gap-1 sm:gap-2 border-l border-slate-200 dark:border-slate-700 pl-3 sm:pl-4">
                                                    <button
                                                        onClick={(e) => handleChurchBulkAction(church.id, 'ACTIVE', e)}
                                                        disabled={bulkUpdateMutation.isPending}
                                                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                                                        title="Activate All RAs in Church">
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleChurchBulkAction(church.id, 'SUSPENDED', e)}
                                                        disabled={bulkUpdateMutation.isPending}
                                                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                        title="Suspend All RAs in Church">
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-transform duration-300 ml-2 hidden sm:flex" style={{ transform: expandedChurchId === church.id ? 'rotate(90deg)' : 'rotate(0)' }}>
                                                    <ChevronRight className="w-4 h-4 text-slate-500" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Members List */}
                                        {expandedChurchId === church.id && (
                                            <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 max-h-[500px] overflow-y-auto custom-scrollbar">
                                                {church.members.length === 0 ? (
                                                    <div className="p-8 text-center text-slate-500 text-sm">No members registered in this church yet.</div>
                                                ) : (
                                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                                        {church.members.map(user => <UserRow key={user.id} user={user} />)}
                                                    </div>
                                                )}
                                            </div>
                                        )}
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
                    description={
                        bulkConfirmOptions.isGlobal
                            ? `You are targeting all ${bulkConfirmOptions.targetIds.length} registered RAs across the entire portal.`
                            : `You are targeting ${bulkConfirmOptions.targetIds.length} RAs located specifically in ${bulkConfirmOptions.churchName}.`
                    }
                />
            )}

            {/* Create User Modal (Retained Original Structure) */}
            {showCreate && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 transition-colors">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20"
                                    style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                                    <UserPlus className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Register New User</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Create a new account for the portal</p>
                                </div>
                            </div>
                            <button onClick={() => { setShowCreate(false); reset(); }}
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                {apiError && (
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-red-700 dark:text-red-400 text-sm mb-4 flex items-center gap-2">
                                        <XCircle className="w-4 h-4" />
                                        {apiError}
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-3">1. Account Type</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {allowedCreateRoles.map(role => {
                                            const isActive = selectedRole === role;
                                            return (
                                                <label key={role} className={`relative flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${isActive
                                                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 ring-1 ring-blue-500/20'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                    }`}>
                                                    <input type="radio" value={role} {...register('role')} className="sr-only" />
                                                    {role === 'RA' && <BookOpen className={`w-6 h-6 mb-2 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />}
                                                    {role === 'CHURCH_ADMIN' && <Building2 className={`w-6 h-6 mb-2 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />}
                                                    {role === 'ASSOCIATION_OFFICER' && <Shield className={`w-6 h-6 mb-2 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />}

                                                    <span className={`text-sm font-bold ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                                        {role === 'RA' ? 'RA Member' : role === 'CHURCH_ADMIN' ? 'Church Admin' : 'Assoc. Officer'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-1">
                                                        {role === 'RA' ? 'Student access' : role === 'CHURCH_ADMIN' ? 'Manages church members' : 'Manages entire zone'}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100 dark:bg-slate-800" />

                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-4">2. Personal Information</h3>
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
                                </div>

                                {(selectedRole === 'RA' || selectedRole === 'CHURCH_ADMIN') && (
                                    <>
                                        <div className="h-px bg-slate-100 dark:bg-slate-800" />
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-4">3. Assignment Details</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                {(currentUser?.role !== 'CHURCH_ADMIN') && (
                                                    <div className={selectedRole === 'CHURCH_ADMIN' ? 'sm:col-span-2' : ''}>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                                            Church Assignment <span className="text-red-500">*</span>
                                                        </label>
                                                        <div className="relative">
                                                            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                            <select {...register('churchId')}
                                                                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none bg-white transition-all cursor-pointer dark:text-slate-200">
                                                                <option value="">Select Church...</option>
                                                                {churches.map(c => (
                                                                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                                                                ))}
                                                            </select>
                                                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                                                <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                                                            </div>
                                                        </div>
                                                        {errors.churchId && <p className="text-xs text-red-500 mt-1">{errors.churchId.message}</p>}
                                                    </div>
                                                )}

                                                {(selectedRole === 'RA' || selectedRole === 'CHURCH_ADMIN') && (
                                                    <div className={currentUser?.role === 'CHURCH_ADMIN' ? 'sm:col-span-2' : ''}>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                                            Previous Rank (Already Attained) <span className="text-red-500">*</span>
                                                        </label>
                                                        <div className="relative">
                                                            <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                            <select {...register('rankId')}
                                                                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none bg-white transition-all cursor-pointer dark:text-slate-200">
                                                                <option value="">Select your previous rank...</option>
                                                                {ranks.map(r => (
                                                                    <option key={r.id} value={r.id}>{r.name}</option>
                                                                ))}
                                                            </select>
                                                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                                                <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                                                            </div>
                                                        </div>
                                                        {errors.rankId && <p className="text-xs text-red-500 mt-1">{errors.rankId.message}</p>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Initial Password <span className="text-red-500">*</span></label>
                                    <input {...register('password')} type="password" autoComplete="new-password" placeholder="Min. 6 characters"
                                        className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono dark:text-slate-200" />
                                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button type="button" onClick={() => { setShowCreate(false); reset(); }}
                                        className="flex-1 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isSubmitting || createMutation.isPending}
                                        className="flex-[2] py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60 shadow-lg shadow-blue-500/25"
                                        style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                                        {(isSubmitting || createMutation.isPending) ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                                        Create Account
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
