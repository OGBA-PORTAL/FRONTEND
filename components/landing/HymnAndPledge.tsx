'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Music, ShieldCheck } from 'lucide-react';

export const HymnAndPledge = () => {
    return (
        <section id="hymns" className="relative py-32 px-6 md:px-10 bg-blue-950 overflow-hidden">

            {/* Background patterns */}
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[length:20px_20px]" />

            <div className="max-w-6xl mx-auto flex flex-col items-center relative z-10">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="text-yellow-400 font-bold tracking-wider uppercase text-sm mb-3 block">Our Heritage</span>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Hymn & Pledge</h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-8 md:gap-12">

                    {/* Hymn Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="flex flex-col items-center bg-white/5 backdrop-blur-xl p-10 md:p-14 rounded-[2.5rem] shadow-2xl border border-white/10 text-center relative overflow-hidden group hover:bg-white/10 transition-colors duration-500"
                    >
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/5 to-transparent pointer-events-none" />

                        <div className="flex items-center gap-4 mb-8 relative">
                            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-blue-950 shadow-lg group-hover:scale-110 transition-transform duration-500">
                                <Music size={28} />
                            </div>
                            <h3 className="text-3xl font-bold text-white tracking-tight">RA Hymn</h3>
                        </div>

                        <div className="w-full text-blue-100/80 leading-loose text-lg space-y-6 relative font-light">
                            <p className="px-4">
                                I am a stranger here, within a foreign land, <br />
                                My home is far away, upon a golden strand, <br />
                                Ambassadors to be of realms beyond the sea, <br />
                                I’m here on business for my king.
                            </p>

                            <div className="flex items-center justify-center gap-4 py-2 opacity-50">
                                <div className="h-px bg-white/30 w-12" />
                                <p className="font-bold text-yellow-400 uppercase tracking-[0.2em] text-sm">Chorus</p>
                                <div className="h-px bg-white/30 w-12" />
                            </div>

                            <p className="px-4 italic font-serif text-white/90">
                                "This is the message that I bring, <br />
                                A message angels fain would sing; <br />
                                ‘oh, be ye reconciled,’ thus saith my lord and king, <br />
                                ‘oh, be ye reconciled to God.’"
                            </p>
                        </div>
                    </motion.div>

                    {/* Pledge Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="flex flex-col items-center bg-white/5 backdrop-blur-xl p-10 md:p-14 rounded-[2.5rem] shadow-2xl border border-white/10 text-center relative overflow-hidden group hover:bg-white/10 transition-colors duration-500"
                    >
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-400/5 to-transparent pointer-events-none" />

                        <div className="flex items-center gap-4 mb-8 relative">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500">
                                <ShieldCheck size={28} />
                            </div>
                            <h3 className="text-3xl font-bold text-white tracking-tight">RA Pledge</h3>
                        </div>

                        <div className="w-full text-blue-100/80 leading-loose text-lg space-y-6 relative font-light">
                            <p className="px-4">
                                As a Royal Ambassador I will do my best: <br />
                                To become a well-informed, responsible follower of Christ; <br />
                                To have a Christ-like concern for all people; <br />
                                To learn how to carry the message of Christ around the world; <br />
                                To work with others in sharing Christ; and <br />
                                To keep myself clean and healthy in mind and body.
                            </p>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};
