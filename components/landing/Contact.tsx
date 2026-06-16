'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Send, CheckCircle2 } from 'lucide-react';

export const Contact = () => {
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        setTimeout(() => setStatus('sent'), 1500);
    };

    return (
        <section id="contact" className="py-32 px-6 md:px-10 bg-slate-50 relative overflow-hidden">

            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-[-10%] w-[40%] h-[60%] bg-blue-100/50 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[40%] bg-yellow-100/50 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center">

                    {/* Left Side: Context */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="lg:col-span-5"
                    >
                        <span className="text-yellow-600 font-bold tracking-wider uppercase text-sm mb-3 block">Connect With Us</span>
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
                            Let's Start a <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-500">
                                Conversation
                            </span>
                        </h2>

                        <p className="text-lg md:text-xl text-slate-600 mb-12 leading-relaxed font-light">
                            Have questions about our programs, membership, or upcoming events? Reach out to us and we'll get back to you as soon as possible.
                        </p>

                        <div className="flex flex-col gap-8">
                            <motion.div
                                whileHover={{ x: 10 }}
                                className="flex items-center gap-6 p-6 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-transform cursor-pointer"
                            >
                                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                                    <Mail className="text-blue-600 w-8 h-8" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg mb-1">Email Us Directly</h4>
                                    <p className="text-slate-500">raogba012@gmail.com</p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Right Side: Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="lg:col-span-7 bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-[0_20px_60px_rgb(0,0,0,0.05)] relative overflow-hidden"
                    >
                        {/* Top accent line */}
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-blue-400 to-yellow-400" />

                        <AnimatePresence mode="wait">
                            {status === 'sent' ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex flex-col items-center justify-center text-center py-16"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                                        className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-inner"
                                    >
                                        <CheckCircle2 size={48} />
                                    </motion.div>
                                    <h3 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Message Received!</h3>
                                    <p className="text-slate-500 text-lg max-w-sm mb-10 font-light">
                                        Thank you for reaching out to RA OGBA. We will review your inquiry and be in touch shortly.
                                    </p>
                                    <button
                                        onClick={() => setStatus('idle')}
                                        className="text-blue-600 font-bold hover:text-blue-700 transition-colors flex items-center gap-2 group"
                                    >
                                        Send another message
                                        <span className="transform transition-transform group-hover:translate-x-1">→</span>
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.form
                                    key="form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Full Name</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="John Doe"
                                                className="w-full h-14 px-5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 placeholder-slate-400"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Email Address</label>
                                            <input
                                                required
                                                type="email"
                                                placeholder="john@example.com"
                                                className="w-full h-14 px-5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 placeholder-slate-400"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Subject</label>
                                        <div className="relative">
                                            <select className="w-full h-14 px-5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 appearance-none cursor-pointer">
                                                <option>General Inquiry</option>
                                                <option>Programs & Events</option>
                                                <option>Donations</option>
                                                <option>Portal Support</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-slate-400">
                                                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Message</label>
                                        <textarea
                                            required
                                            rows={5}
                                            placeholder="How can we help you today?"
                                            className="w-full p-5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 placeholder-slate-400 resize-none"
                                        />
                                    </div>
                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={status === 'sending'}
                                            className="w-full h-14 flex items-center justify-center gap-3 rounded-xl bg-blue-950 text-white font-bold text-lg hover:bg-yellow-500 hover:text-blue-950 transition-colors shadow-lg shadow-blue-950/20 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                                        >
                                            <span className="relative z-10 flex items-center gap-2">
                                                {status === 'sending' ? 'Sending...' : 'Send Message'}
                                                {status !== 'sending' && <Send size={18} className="transform transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />}
                                            </span>
                                        </button>
                                    </div>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
