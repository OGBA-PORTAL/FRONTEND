'use client';

import React from 'react';
import { motion } from 'motion/react';
import background from '@/app/assets/background.png';
import Link from 'next/link';

export const Hero = () => {
    return (
        <section id="home" className="relative w-full min-h-screen flex items-center bg-blue-950 overflow-hidden pt-20">
            {/* Dynamic Background Elements */}
            <div className="absolute inset-0 z-0 bg-blue-950 pointer-events-none overflow-hidden">
                {/* 
                  Performance Optimization: 
                  - Replaced `mix-blend-luminosity` (which causes severe scroll jank on mobile) with a simple grayscale filter.
                  - Added `transform-gpu` and `will-change-transform` to push animations to the compositor thread.
                */}
                <div
                    className="absolute inset-0 bg-center bg-no-repeat bg-cover opacity-30 grayscale transition-opacity duration-1000 transform-gpu"
                    style={{ backgroundImage: `url("${background.src}")` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 via-blue-950/80 to-blue-950 transform-gpu" />

                {/* Animated Glow Blobs */}
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-600/30 rounded-full blur-[100px] will-change-transform transform-gpu"
                />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="absolute top-[20%] right-[0%] w-[40%] h-[60%] bg-yellow-500/10 rounded-full blur-[100px] will-change-transform transform-gpu"
                />
            </div>

            <div className="relative z-10 w-full px-6 md:px-10 max-w-7xl mx-auto">
                <div className="flex flex-col gap-8 max-w-3xl text-left">

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 border border-white/20 text-yellow-400 text-sm font-bold tracking-wider uppercase mb-6 shadow-xl backdrop-blur-md">
                            Royal Ambassadors Nigeria
                        </span>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tight text-white mb-6">
                            Raising Leaders, <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500">
                                Shaping Futures
                            </span> <br />
                            in Christ.
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="text-lg md:text-2xl font-light leading-relaxed text-blue-100 max-w-2xl"
                    >
                        Empowering young men through discipleship, missions, and leadership training to impact the world for Christ.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-col sm:flex-row flex-wrap gap-4 mt-4"
                    >
                        <a href="#programs" className="flex items-center justify-center rounded-xl h-14 px-8 bg-yellow-500 text-blue-950 hover:bg-yellow-400 transition-all font-bold text-lg shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:shadow-[0_0_40px_rgba(234,179,8,0.5)] transform hover:-translate-y-1">
                            Explore Programs
                        </a>
                        <Link href="/login" className="flex items-center justify-center rounded-xl h-14 px-8 bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-md transition-all font-bold text-lg transform hover:-translate-y-1">
                            Access Portal
                        </Link>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};
