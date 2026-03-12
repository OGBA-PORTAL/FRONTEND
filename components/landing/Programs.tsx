'use client';

import React from 'react';
import { motion } from 'motion/react';
import camp from '@/app/assets/camp.png';
import parade from '@/app/assets/parade.png';
import ltc from '@/app/assets/ltc.png';
import sport from '@/app/assets/sport.png';

interface ProgramCardProps {
    title: string;
    description: string;
    image: string;
    index: number;
}

const ProgramCard = ({ title, description, image, index }: ProgramCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            whileHover={{ y: -8 }}
            className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-slate-100 transition-all duration-300 h-full"
        >
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-100">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url("${image}")` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-blue-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <div className="p-8 md:p-10 flex flex-col flex-1 relative bg-white">
                <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent transform -translate-y-px" />
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-700 transition-colors">{title}</h3>
                <p className="text-slate-600 leading-relaxed font-light">
                    {description}
                </p>
            </div>
        </motion.div>
    );
};

export const Programs = () => {
    return (
        <section id="programs" className="relative py-32 px-6 md:px-10 bg-slate-50">

            {/* Background Layering */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-50 to-white z-0 pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-20"
                >
                    <span className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-3 block">What We Do</span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight">Our Core Programs</h2>
                    <p className="mt-6 text-xl text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
                        Discover the activities that forge character, build strength, and deepen faith within the Royal Ambassadors.
                    </p>
                </motion.div>

                {/* 3-column top row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 mb-8 md:mb-10 items-stretch">
                    <ProgramCard
                        index={0}
                        title="Missions Training"
                        description="Mission Outreach is a program where Royal Ambassadors actively share love and serve their communities. Through visits, support, and evangelism, members learn the importance of compassion, service, and spreading the message of Christ."
                        image="https://lh3.googleusercontent.com/aida-public/AB6AXuAzuzv6XE3sA_kSfqIAhTIE9Uo2P1yh2G65Qv6alzqJ7z3sMNCXW3Eo-rbP9E49zOPNZs__tTmzozI9hGgn79eDMdcZLzJ1z6e4pRDDRkdBmpE-yOm7XQeTaFflwO8bbN4gLGAdyNUjmL5Hv8OoBCHa84q-WpHwuTQxkl-1S-7nF6YWkl7VVzrBbv3C0f7HmOPZpS1IWH1dlnhpks0dDOX6l50LwjyGAJE4WwNmDSNPQwCdVdgNTEtB7N23x5EmJwSY4FYyfrhqpsVF"
                    />
                    <ProgramCard
                        index={1}
                        title="Leadership Development"
                        description="Equips members with the knowledge and character needed to lead. Through mentorship, learning sessions, and practical activities, members develop strong leadership skills, discipline, and a heart for service."
                        image={ltc.src}
                    />
                    <ProgramCard
                        index={2}
                        title="Camps & Conferences"
                        description="A special time where RAs gather to learn, grow, and build stronger friendships. Through outdoor activities, devotion, and teamwork, members develop courage, discipline, and a deeper relationship with God."
                        image={camp.src}
                    />
                </div>

                {/* 2-column bottom row, centered visually via grid logic */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 md:gap-10 items-stretch">
                    <div className="lg:col-start-3 lg:col-span-4 h-full">
                        <ProgramCard
                            index={3}
                            title="Parade Competition"
                            description="Showcases discipline and unity. Through well-coordinated marching and commands, members demonstrate teamwork, leadership, and dedication. It builds confidence, orderliness, and pride."
                            image={parade.src}
                        />
                    </div>
                    <div className="lg:col-span-4 h-full">
                        <ProgramCard
                            index={4}
                            title="Sport Competition"
                            description="One of our most exciting programs. It creates an atmosphere of energy, teamwork, and friendship. Beyond winning, it teaches unity and the spirit of brotherhood while keeping our bodies strong."
                            image={sport.src}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};
