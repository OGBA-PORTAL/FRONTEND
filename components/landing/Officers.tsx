'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import director from '@/app/assets/director.png';
import vice from '@/app/assets/vice.png';
import rec from '@/app/assets/rec.png';
import treasurer from '@/app/assets/treasurer.png';
import mission1 from '@/app/assets/mission1.png';
import ranking from '@/app/assets/ranking.png';
import comm1 from '@/app/assets/comma1.png';
import comm2 from '@/app/assets/comm2.png';
import conference from '@/app/assets/conference.png';
import sec from '@/app/assets/sec.png';
import finan from '@/app/assets/finan.png';
import exofficio from '@/app/assets/exofficio.png';
import band from '@/app/assets/band.png';
import pro from '@/app/assets/pro.png';
import ex from '@/app/assets/ex.png';
import asvc from '@/app/assets/asvc.png';
import mission2 from '@/app/assets/mission2.png';

const officers = [
    { name: 'Amb. Ezekiel Ogunmola', role: 'Director', img: director.src },
    { name: 'Amb. Akande Damilola', role: 'Vice Director', img: vice.src },
    { name: 'Amb. Ogunesan Johnson', role: 'General Secretary', img:sec.src},
    { name: 'Amb. Adewale Idowu', role: 'Recording Secretary', img: rec.src },
    { name: 'Amb. Adegoke Damilare', role: 'Treasurer', img: treasurer.src },
    { name: 'Amb. Ige Kehinde', role: 'Financial Secretary', img:finan.src },
    { name: 'Amb. Samuel Adewale', role: 'Missions Coordinator 1', img: mission1.src },
    { name: 'Amb. Ajayi Christopher', role: 'Missions Coordinator 2',img:mission2.src  },
    { name: 'Amb. Sunday Damilare', role: 'Public Relations Officer', img:pro.src},
    { name: 'Amb. Aderemi Timothy', role: 'Ranking Coordinator', img: ranking.src },
    { name: 'Amb. Taiwo Adewuyi', role: 'Commander 1', img: comm1.src },
    { name: 'Amb. Owoade Ayomide', role: 'Commander 2', img: comm2.src },
    { name: 'Amb. Oladipupo Toyin', role: 'Sport/Band Major', img: band.src },
    { name: 'Amb. Bankole Ajibade', role: 'Custodian'},
    { name: 'Amb. Awolola Stephen', role: 'ASVC', img: asvc.src },
    { name: 'Coun. Oyelowo Ireti', role: 'Pleni. cord/IPD', img: exofficio.src },
    { name: 'Amb. Oyebode Isaiah', role: 'Ex officio', img: ex.src },
    { name: 'Coun. Oyeyinka Tobiloba', role: 'Conference Auditor', img: conference.src },
    { name: 'Coun. Moronkola Olaoluwa', role: 'Counselor', }
];

export const Officers = () => {
    const scrollRef = useRef<HTMLDivElement | null>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const { scrollLeft, clientWidth } = scrollRef.current;

        // Calculate the exact width of one card + gap to snap perfectly
        // 280px (w-72) + 24px (gap-6) = 304px
        const cardWidth = 304;

        const scrollTo = direction === 'left'
            ? Math.max(0, scrollLeft - cardWidth * 2)
            : scrollLeft + cardWidth * 2;

        scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    };

    return (
        <section id="officers" className="py-32 px-6 md:px-10 bg-white relative overflow-hidden">

            <div className="max-w-[1400px] mx-auto flex flex-col items-center">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="text-yellow-600 font-bold tracking-wider uppercase text-sm mb-3 block">Leadership</span>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Association Officers</h2>
                </motion.div>

                <div className="relative w-full mb-16 group">
                    {/* Navigation Buttons (visible on hover or focus) */}
                    <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-blue-900 border border-slate-100 hover:scale-110 active:scale-95 transition-all cursor-pointer opacity-0 group-hover:opacity-100 disabled:opacity-0 focus:opacity-100"
                    >
                        <ChevronLeft size={28} strokeWidth={2.5} />
                    </button>

                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-blue-900 border border-slate-100 hover:scale-110 active:scale-95 transition-all cursor-pointer opacity-0 group-hover:opacity-100 disabled:opacity-0 focus:opacity-100"
                    >
                        <ChevronRight size={28} strokeWidth={2.5} />
                    </button>

                    {/* Draggable Carousel */}
                    <motion.div
                        ref={scrollRef}
                        className="w-full overflow-x-auto flex gap-6 pb-12 pt-4 px-4 snap-x snap-mandatory hide-scrollbar cursor-grab active:cursor-grabbing"
                        whileTap={{ cursor: "grabbing" }}
                    >
                        {officers.map((officer, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "100px" }}
                                transition={{ duration: 0.5, delay: i * 0.05 }}
                                key={i}
                                className="snap-center shrink-0 w-72 flex flex-col items-center bg-slate-50 rounded-[2rem] p-8 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-300"
                            >
                                <div className="relative w-36 h-36 rounded-full overflow-hidden mb-6 p-1 bg-gradient-to-br from-yellow-400 to-blue-600 shadow-md">
                                    <div className="w-full h-full rounded-full bg-white overflow-hidden p-1 border border-white">
                                        <div className="w-full h-full bg-cover bg-slate-200 rounded-full" style={{ backgroundImage: `url('${officer.img}')`, backgroundPosition: 'center 10%' }}></div>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 text-center mb-1">{officer.name}</h3>
                                <p className="text-sm text-yellow-600 font-bold uppercase tracking-wider text-center">{officer.role}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Link href="/login" className="inline-flex cursor-pointer items-center justify-center rounded-2xl h-14 px-12 bg-blue-950 text-white hover:bg-yellow-500 hover:text-blue-950 transition-colors font-bold text-lg shadow-[0_8px_20px_rgb(0,0,0,0.1)] hover:-translate-y-1">
                        Sign In to Member Portal
                    </Link>
                </motion.div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
        </section>
    );
};
