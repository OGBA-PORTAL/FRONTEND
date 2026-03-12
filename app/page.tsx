import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { About } from '@/components/landing/About';
import { Programs } from '@/components/landing/Programs';
import { Officers } from '@/components/landing/Officers';
import { HymnAndPledge } from '@/components/landing/HymnAndPledge';
import { Contact } from '@/components/landing/Contact';
import { Footer } from '@/components/landing/Footer';

export default function Page() {
  return (
    <main className="scroll-smooth bg-slate-50 antialiased selection:bg-yellow-400 selection:text-blue-950">
      <Navbar />
      <Hero />
      <About />
      <Programs />
      <Officers />
      <HymnAndPledge />
      <Contact />
      <Footer />
    </main>
  );
}
