'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import logo from '@/app/assets/ralogo.png';

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = ['Home', 'About', 'Programs', 'Officers', 'Hymns', 'Contact'];

    return (
        <header
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
                    ? 'bg-blue-950/80 backdrop-blur-xl border-b border-white/10 py-3 shadow-lg'
                    : 'bg-transparent py-5'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
                {/* Brand */}
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-400/50 shadow-[0_0_15px_rgba(250,204,21,0.3)]">
                        <Image src={logo} alt="RA OGBA Logo" fill className="object-cover" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-white drop-shadow-md">
                        RA <span className="text-yellow-400">OGBA</span>
                    </h2>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex flex-1 justify-end gap-8 items-center">
                    <div className="flex items-center gap-8 bg-white/5 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/10 shadow-sm">
                        {navLinks.map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="text-slate-200 hover:text-yellow-400 transition-colors text-sm font-semibold tracking-wide relative group"
                            >
                                {item}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full rounded-full"></span>
                            </a>
                        ))}
                    </div>
                    <Link
                        href="/login"
                        className="group relative overflow-hidden rounded-full px-7 py-2.5 bg-yellow-500 text-blue-950 text-sm font-bold shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:shadow-[0_0_25px_rgba(234,179,8,0.6)] transition-all transform hover:-translate-y-0.5"
                    >
                        <span className="relative z-10 flex items-center gap-2">Portal <span className="transition-transform group-hover:translate-x-1">→</span></span>
                        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-yellow-400 to-yellow-300 transform scale-x-0 origin-left transition-transform duration-300 ease-out group-hover:scale-x-100"></div>
                    </Link>
                </nav>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Mobile Nav */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="absolute top-full left-0 w-full bg-blue-950/95 backdrop-blur-2xl border-b border-white/10 md:hidden overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 flex flex-col gap-4">
                                {navLinks.map((item, index) => (
                                    <motion.a
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 + 0.1 }}
                                        key={item}
                                        href={`#${item.toLowerCase()}`}
                                        className="text-slate-200 text-lg font-medium py-2 border-b border-white/5 hover:text-yellow-400 hover:pl-2 transition-all"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {item}
                                    </motion.a>
                                ))}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="pt-4"
                                >
                                    <Link
                                        href="/login"
                                        className="flex justify-center w-full bg-yellow-500 text-blue-950 py-3.5 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform"
                                    >
                                        Access Portal
                                    </Link>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
};
