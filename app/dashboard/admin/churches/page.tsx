'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Church } from '@/lib/types';
import { useState } from 'react';
import { Church as ChurchIcon, Search, Users, MapPin, Hash, Loader2, X } from 'lucide-react';

export default function AdminChurchesPage() {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Church | null>(null);

    const { data: churches = [], isLoading } = useQuery<Church[]>({
        queryKey: ['churches'],
        queryFn: async () => {
            const res = await api.get('/churches');
            return res.data.data.churches;
        },
    });

    const filtered = churches.filter(c =>
        search === '' ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'ASSOCIATION_OFFICER']}>
            <div className="space-y-5 max-w-7xl mx-auto">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Churches</h1>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">{churches.length} registered assemblies</p>
                </div>

                {/* Search */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 transition-colors"
                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search by church name or code..."
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 dark:text-slate-200 dark:placeholder-slate-500 transition-all"
                        />
                    </div>
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-16 text-center border border-slate-100 dark:border-slate-800 transition-colors">
                        <ChurchIcon className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">No churches found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.map(church => (
                            <button key={church.id} onClick={() => setSelected(church)}
                                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 text-left hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all group"
                                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                                {/* Icon */}
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors"
                                    style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)' }}>
                                    <ChurchIcon className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-snug mb-1 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                                    {church.name}
                                </h3>
                                <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mb-3">
                                    <Hash className="w-3 h-3" />
                                    <span className="font-mono">{church.code}</span>
                                </div>
                                {church.address && (
                                    <div className="flex items-start gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                                        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                        <span className="line-clamp-2">{church.address}</span>
                                    </div>
                                )}
                                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                    <Users className="w-3.5 h-3.5 text-blue-400" />
                                    <span>View members</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Church Detail Modal */}
            {selected && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md transition-colors">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                                    <ChurchIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">{selected.name}</h2>
                                    <p className="text-slate-400 dark:text-slate-500 text-xs font-mono">{selected.code}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelected(null)}
                                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {[
                                { label: 'Church Code', value: selected.code, mono: true },
                                { label: 'Address', value: selected.address ?? 'Not provided' },
                                { label: 'Phone', value: selected.phone ?? 'Not provided' },
                                { label: 'Email', value: selected.email ?? 'Not provided' },
                            ].map(({ label, value, mono }) => (
                                <div key={label} className="flex items-start justify-between gap-4 py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
                                    <span className="text-slate-400 dark:text-slate-500 text-sm flex-shrink-0">{label}</span>
                                    <span className={`text-slate-700 dark:text-slate-300 text-sm font-medium text-right ${mono ? 'font-mono' : ''}`}>{value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="px-6 pb-6">
                            <button onClick={() => setSelected(null)}
                                className="w-full py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ProtectedRoute>
    );
}
