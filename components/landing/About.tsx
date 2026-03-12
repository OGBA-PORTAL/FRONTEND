'use client';

import React from 'react';
import { motion } from 'motion/react';
import { BookOpen } from 'lucide-react';

export const About = () => {
    return (
        <section id="about" className="relative py-32 px-6 md:px-10 bg-slate-50 overflow-hidden">
            {/* Decorative background Elements */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-yellow-400/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="text-yellow-600 font-bold tracking-wider uppercase text-sm mb-3 block">Who We Are</span>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">About Us</h2>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="bg-white rounded-3xl p-8 md:p-14 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative"
                >
                    {/* Accent Line */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-b-full" />

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">

                        <div className="md:col-span-4 flex flex-col items-center text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                                <BookOpen size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-4 font-serif italic text-center leading-relaxed">
                                “Train up a child in the way he should go: and when he is old, he will not depart from it.”
                            </h3>
                            <p className="text-slate-500 font-semibold tracking-wide">— Proverbs 22:6</p>
                        </div>

                        <div className="md:col-span-8 flex flex-col gap-6">
                            <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-light">
                                As part of the vision of the <strong className="font-semibold text-slate-800">Royal Ambassadors of Nigeria</strong>, we focus on nurturing young ambassadors to know Christ, live disciplined lives, and develop a passion for missions.
                            </p>
                            <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-light">
                                Through programs such as leadership training, camping, parade competitions, sports, and mission outreach, we equip members with the values and skills needed to become responsible leaders in the church and society.
                            </p>
                            <div className="mt-4 pt-6 border-t border-slate-100">
                                <p className="text-xl font-medium text-blue-950 leading-relaxed">
                                    Our mission is to guide young ambassadors to grow spiritually, lead faithfully, and make a positive impact in their communities and beyond.
                                </p>
                            </div>
                        </div>

                    </div>

                </motion.div>
            </div>
        </section>
    );
};
