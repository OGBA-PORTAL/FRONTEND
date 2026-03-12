'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import logo from '@/app/assets/ralogo.png';

export const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-950 text-slate-300 py-16 md:py-24 border-t border-slate-900 overflow-hidden relative">

            {/* Decorative Blur behind logo */}
            <div className="absolute top-1/2 left-10 w-[30%] h-full bg-blue-900/10 rounded-full blur-[150px] pointer-events-none -translate-y-1/2" />

            <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">

                    {/* Brand Col */}
                    <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-yellow-400/30">
                                <Image src={logo} alt="RA OGBA Logo" fill className="object-cover" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-white">
                                RA <span className="text-yellow-400">OGBA</span>
                            </h2>
                        </div>
                        <p className="text-slate-400 font-light leading-relaxed max-w-sm">
                            Empowering young men through discipleship, missions, and leadership training to impact the world for Christ.
                        </p>
                    </div>

                    {/* Nav Col 1 */}
                    <div className="md:col-span-3 lg:col-span-2 lg:col-start-7 flex flex-col gap-4">
                        <h4 className="text-white font-bold tracking-wider uppercase text-sm mb-2">Explore</h4>
                        {['Home', 'About', 'Programs', 'Officers'].map(link => (
                            <a key={link} href={`#${link.toLowerCase()}`} className="text-slate-400 hover:text-yellow-400 transition-colors inline-block w-fit">
                                {link}
                            </a>
                        ))}
                    </div>

                    {/* Nav Col 2 */}
                    <div className="md:col-span-4 lg:col-span-3 lg:col-start-10 flex flex-col gap-4">
                        <h4 className="text-white font-bold tracking-wider uppercase text-sm mb-2">Connect & Access</h4>
                        <a href="#hymns" className="text-slate-400 hover:text-yellow-400 transition-colors inline-block w-fit">Hymn & Pledge</a>
                        <a href="#contact" className="text-slate-400 hover:text-yellow-400 transition-colors inline-block w-fit">Contact Us</a>
                        <Link href="/login" className="text-yellow-500 font-semibold hover:text-yellow-400 transition-colors inline-block w-fit mt-2">
                            Member Portal ↗
                        </Link>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-sm text-slate-500">
                        &copy; {currentYear} Royal Ambassadors. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Privacy Policy</a>
                        <a href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
