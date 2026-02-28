'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Settings, Bell, Shield, Info, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminSettingsPage() {
    const { user } = useAuth();
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [examAlerts, setExamAlerts] = useState(true);
    const [resultAlerts, setResultAlerts] = useState(false);

    const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
        <button onClick={onChange} className="flex-shrink-0">
            {value
                ? <ToggleRight className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                : <ToggleLeft className="w-8 h-8 text-slate-300 dark:text-slate-600" />}
        </button>
    );

    return (
        <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'ASSOCIATION_OFFICER']}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Settings</h1>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">Portal configuration and preferences</p>
                </div>

                {/* Portal Info */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors"
                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="font-bold text-slate-800 dark:text-slate-200">Portal Information</h2>
                    </div>
                    <div className="divide-y divide-slate-50 dark:divide-slate-800">
                        {[
                            { label: 'Portal Name', value: 'OGBA RA Portal' },
                            { label: 'Version', value: 'v1.0.0' },
                            { label: 'Environment', value: 'Production' },
                            { label: 'Your Role', value: user?.role?.replace(/_/g, ' ') ?? '—' },
                            { label: 'Your RA Number', value: user?.raNumber ?? '—' },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex items-center justify-between px-5 py-3.5">
                                <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors"
                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h2 className="font-bold text-slate-800 dark:text-slate-200">Notifications</h2>
                    </div>
                    <div className="divide-y divide-slate-50 dark:divide-slate-800">
                        {[
                            { label: 'Email Notifications', desc: 'Receive updates via email', value: emailNotifs, toggle: () => setEmailNotifs(!emailNotifs) },
                            { label: 'Exam Alerts', desc: 'Notify when new exams are published', value: examAlerts, toggle: () => setExamAlerts(!examAlerts) },
                            { label: 'Result Alerts', desc: 'Notify when results are released', value: resultAlerts, toggle: () => setResultAlerts(!resultAlerts) },
                        ].map(({ label, desc, value, toggle }) => (
                            <div key={label} className="flex items-center justify-between px-5 py-4">
                                <div>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{desc}</p>
                                </div>
                                <Toggle value={value} onChange={toggle} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Account */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors"
                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h2 className="font-bold text-slate-800 dark:text-slate-200">Account</h2>
                    </div>
                    <div className="divide-y divide-slate-50 dark:divide-slate-800">
                        <Link href="/dashboard/admin/profile"
                            className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <div>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Edit Profile</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Update your name, email, and phone</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </Link>
                        <Link href="/dashboard/admin/profile"
                            className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <div>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Change Password</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Update your login password</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </Link>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
