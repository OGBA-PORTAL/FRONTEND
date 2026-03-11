
'use client'
import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link'
import { 
  ChevronLeft, 
  ChevronRight, 
  Music, 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  Menu,
  X
} from 'lucide-react';
import camp from '../app/assets/camp.png'
import parade from '../app/assets/parade.png'
import ltc from '../app/assets/ltc.png'
import sport from '../app/assets/sport.png'
import background from '../app/assets/background.png'
import director from '../app/assets/director.png'
import mission1 from '../app/assets/mission1.png'
import treasurer from '../app/assets/treasurer.png'
import rec from '../app/assets/rec.png'
import ranking from '../app/assets/ranking.png'
// --- Components ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 bg-blue-900 backdrop-blur-md px-6 md:px-10 py-4">
      <div className="flex items-center gap-3 text-yellow-500">
        <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">RA OGBA</h2>
      </div>

      {/* Desktop Nav */}
      <nav className="hidden md:flex flex-1 justify-end gap-8 items-center">
        <div className="flex items-center gap-9">
          {['Home', 'About', 'Programs', 'Officers', 'Hymns', 'Contact'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`} 
              className="text-white hover:text-primary transition-colors text-sm font-medium leading-normal"
            >
              {item}
            </a>
          ))}
        </div>
        <Link  href="/login" className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-yellow-500 text-white  hover:text-blue-900 transition-colors text-sm font-bold leading-normal tracking-[0.015em]">Portal</Link>
      </nav>

      {/* Mobile Menu Toggle */}
      <button className="md:hidden text-secondary" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Nav */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 w-full bg-white border-b border-slate-200 p-6 flex flex-col gap-4 md:hidden shadow-xl"
        >
          {['Home', 'About', 'Programs', 'Officers', 'Hymns', 'Contact'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`} 
              className="text-slate-700 text-lg font-medium"
              onClick={() => setIsOpen(false)}
            >
              {item}
            </a>
          ))}
          <Link href="/login" className="w-20 bg-yellow-500 text-white p-4 rounded-lg font-bold" >Portal</Link>
        </motion.div>
      )}
    </header>
  );
};

const Hero = () => (
  <section id="home" className="relative w-full bg-blue-900 text-white overflow-hidden">
    <div className="absolute inset-0 z-0">
      <div 
        className="w-full h-full bg-center bg-no-repeat bg-cover opacity-30" 
        style={{ backgroundImage: `url("${background.src}")` }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-r from-secondary/80 to-transparent"></div>
    </div>
    <div className="relative z-10 flex flex-col gap-6 px-6 md:px-10 py-24 md:py-40 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col gap-6 max-w-2xl text-left"
      >
        <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] md:text-7xl text-white">
          Raising Leaders, Shaping Futures in Christ.
        </h1>
        <p className="text-lg md:text-xl font-normal leading-relaxed text-slate-200">
          Empowering young men through discipleship, missions, and leadership training to impact the world for Christ.
        </p>
        <div className="flex flex-wrap gap-4 mt-4">
          <button className="hidden flex cursor-pointer items-center justify-center rounded-lg h-12 px-8 lg:block md:block md:bg-yellow-500 lg:bg-yellow-500 text-white hover:bg-primary/90 transition-colors font-bold text-base">
            Programs
          </button>
           <button className="flex cursor-pointer items-center justify-center rounded-lg h-12 px-8 bg-yellow-500 lg:hidden md:hidden text-white hover:bg-primary/90 transition-colors font-bold text-base">
            Portal
          </button>
        </div>
      </motion.div>
    </div>
  </section>
);

const About = () => (
  <section id="about" className="py-24 px-6 md:px-10 bg-white">
    <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
      <h2 className="text-3xl md:text-4xl font-bold leading-tight tracking-[-0.015em] text-black mb-8">About Us</h2>
      <p className="text-lg md:text-xl font-normal leading-relaxed text-slate-600 mb-12">
       “Train up a child in the way he should go: and when he is old, he will not depart from it.” — Proverbs 22:6 📖 <br /> 
       As part of the vision of the Royal Ambassadors of Nigeria, we focus on nurturing young ambassadors to know Christ, live disciplined lives, and develop a passion for missions. Through programs such as leadership training, camping, parade competitions, sports, and mission outreach, we equip members with the values and skills needed to become responsible leaders in the church and society.

Our mission is to guide young ambassadors to grow spiritually, lead faithfully, and make a positive impact in their communities and beyond.
      </p>
    </div>
  </section>
);

const ProgramCard = ({ title, description, image }: { title: string, description: string, image: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="flex flex-col gap-6 items-stretch bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 h-full"
  >
    <div className="w-full">
      <div
        className="w-full aspect-[4/3] rounded-xl shadow-md bg-cover bg-center"
        style={{ backgroundImage: `url("${image}")` }}
      ></div>
    </div>

    <div className="w-full flex flex-col gap-4">
      <h3 className="text-2xl font-bold text-black">{title}</h3>
      <p className="text-base text-slate-600 leading-relaxed">
        {description}
      </p>
    </div>
  </motion.div>
);

const Programs = () => (
  <section id="programs" className="py-24 px-6 md:px-10 bg-blue-900">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold leading-tight tracking-[-0.015em] text-white mb-16 text-center">Our Programs</h2>

      {/* Pyramid layout: 3 on top row, 2 centered below */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
        <div>
          <ProgramCard 
            title="Missions Training"
            description="Mission Outreach is a program where Royal Ambassadors actively share love and serve their communities. Through visits, support, and evangelism, members learn the importance of compassion, service, and spreading the message of Christ. "
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuAzuzv6XE3sA_kSfqIAhTIE9Uo2P1yh2G65Qv6alzqJ7z3sMNCXW3Eo-rbP9E49zOPNZs__tTmzozI9hGgn79eDMdcZLzJ1z6e4pRDDRkdBmpE-yOm7XQeTaFflwO8bbN4gLGAdyNUjmL5Hv8OoBCHa84q-WpHwuTQxkl-1S-7nF6YWkl7VVzrBbv3C0f7HmOPZpS1IWH1dlnhpks0dDOX6l50LwjyGAJE4WwNmDSNPQwCdVdgNTEtB7N23x5EmJwSY4FYyfrhqpsVF"
          />
        </div>

        <div>
          <ProgramCard 
            title="Leadership Development"
            description="Leadership Training equips Royal Ambassadors with the knowledge and character needed to lead with confidence and responsibility. Through mentorship, learning sessions, and practical activities, members develop strong leadership skills, discipline, and a heart for service."
            image={ltc.src}        />
        </div>

        <div>
          <ProgramCard 
            title="Camps & Conferences"
            description="Camp is a special time where Royal Ambassadors gather to learn, grow, and build stronger friendships. Through outdoor activities, devotion, and teamwork, members develop courage, discipline, and a deeper relationship with God in a fun and memorable environment."
            image={camp.src}
          />
        </div>

        {/* Bottom row: span all 3 columns and center two cards */}
        <div className="md:col-span-3 flex justify-center gap-10">
          <div className="w-full md:w-[45%]">
            <ProgramCard 
              title="Parade Competition"
              description="The Parade Competition showcases the discipline and unity of Royal Ambassadors. Through well-coordinated marching and commands, members demonstrate teamwork, leadership, and dedication. It is a program that builds confidence, orderliness, and pride in being an ambassador."
              image={parade.src}
            />
          </div>

          <div className="w-full md:w-[45%]">
            <ProgramCard 
              title="Sport Competition"
              description="The Sports Competition is one of our most exciting programs. It creates an atmosphere of energy, teamwork, and friendship as Royal Ambassadors come together to compete in different sporting activities. Beyond winning, it teaches discipline, unity, and the spirit of brotherhood while keeping our bodies strong and active."
              image={sport.src}
            />
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Officers = () => {
  const officers = [
    { name: 'Amb. Ezekiel Ogunmola', role: 'Director', img:director.src},
    { name: 'David Smith', role: 'Vice Director', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3Dkrl6cuX4Y7lHDJg_B0VwzY4_EY_8RqlNkU_Dsgv9Erx82Uz1MEsi7icqNllEYh7N34HFxhcXGF9oytOT_u-PMzEhTI623t5HFuxZrlwX0fnHQZtrRpTMETlRJLkLw_hoZL4t117Je-UQtueDM9Gnfpkz836UKfHP-8QQkmaqt1R195GWyfhJKOBYZV5ObJbiDAz9QllzazmeR0zsbB_tR4_7Num_JgiDc5_fDKwLBaxK6Im-1aHLOMsj5wOESKA_ulQz_F3fwb3' },
    { name: 'Emmanuel Okoro', role: 'General Secretary', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBakGOPh2RBtnA0Gskr0hrUdb0FSf7FlpDvXI6kDmJ6oV4QyaU6_4vZm61mP_jnPZvPEvG0gQVdwDfpXgLhu3iIm2en7gOPYuFyO4UZYu8ZYl-koCSqJZBm4mTkRiN33E_ziZviBj7wqkSslLZrAgILsJcfwlorysY1mw4gsXze04F2uIb6zYqByiC_jc7L4AZXSjLEkIi8ycOHkL-DGXzRsf91ezw63XfP9r09VfWP8lvowxrhy7fCSPbyKGINgUZr4B2YOqydCPxU' },
    { name: 'Amb. Adewale Idowu', role: 'Recording Secretary', img:rec.src},
    { name: 'Amb. Adegoke Damilare', role: 'Treasurer', img:treasurer.src},
    { name: 'Peter Chinedu', role: 'Financial Secretary', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDm2rDC0_T5gThmlpc3_kWgw-JZcS3zdcaZvxZnj6_FjfZ-1xtSUSUejQ94ycbzpTe8ASD0sgOEib8u1AbNtDO9DhGd4A0K8-p2UwsBtwlq5qukmxf7CRHgvKlw0BLSfhwgYvxPgLukhycrCfuyTP13xV5tvdn0YPP2LCddcSKJnho2APHhY7aAROYKcL6JjwLqWTPJ_UVndwr-1KCJmz4DVckXxUfYM-OuzmCr0SuhJW2wCv7OMTIwBRed26k4M_gRl3XrHgKj-zBb' },
    { name: 'Amb. Samuel Adewale', role: 'Missions Coordinator 1', img:mission1.src},
    { name: 'Isaac Oluwaseun', role: 'Public Relations Officer', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMLXUG1ZatCSbgty6Hu6PNefzUCBgdBHRgbeNyriK7yFtfXsLJcHd6oxpRclSL76ogb-mUKF56cFKbtc8JhL6bXeiJUoMOui7ld6XEa6AvcaQsJXA1ta1pzmeTueKyl1SqtK3_JUkQu_issjtgMDUnu4BKPC_YTYmIyKDiqHvGI4iKYT0-_A9_XPeoxaLeNa8R6CR_-SmYxhKRotS4WU9r3ddRcsKZ8hluLDqO2UGNCm4JlvKDg9Gaj4wqsz_iUWSog9r5FCt0PXkm' },
    { name: 'Amb. Aderemi Timothy', role: 'Ranking Coordinator', img:ranking.src },
    { name: 'Stephen Abiodun', role: 'Commander 1', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWsbMymgVl_AKb563opNqWCv5H3VKrUgiEhYHx0igTVCeeRBKwcw_G0ga-F7VYCn-J0dr_Wsux-xZWRgU1Hrh_Fdw3CJj-1CGwZPIy9CCEXGJYATnxN3WElXYFwotbxpI3-dZhSFthwIO6L7kJnSkqAsYol_9ZdY_OdlTzOUnT4zBJtlfOC245vDfLsfxMRgxRT2h3IJdmdUdkleX-hB7VPZw60PqHs1JTf5p6onZ92ZtNg6TGDNOddEmRfy_xNmaNuLRC4wI7RSGi' },
    { name: 'Paul Akpan', role: 'Commander 2', img: 'https://picsum.photos/seed/paul/200/200' },
    { name: 'James Ibrahim', role: 'Custodian', img: 'https://picsum.photos/seed/james/200/200' },
    { name: 'Gabriel Uzor', role: 'Sport Director', img: 'https://picsum.photos/seed/gabriel/200/200' },
    { name: 'Matthew Balogun', role: '', img: 'https://picsum.photos/seed/matthew/200/200' },
    { name: 'Luke Eze', role: 'Organizing Secretary', img: 'https://picsum.photos/seed/luke/200/200' },
    { name: 'Mark Okon', role: 'Ex-Officio', img: 'https://picsum.photos/seed/mark/200/200' },
  ];

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
    scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
  };

  return (
    <section id="officers" className="py-24 px-6 md:px-10 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        <h2 className="text-3xl md:text-4xl font-bold leading-tight tracking-[-0.015em] text-black mb-16 text-center">National Officers</h2>
        <div className="relative w-full mb-10 group">
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 z-10 size-12 flex items-center justify-center rounded-full bg-white shadow-lg text-secondary border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 z-10 size-12 flex items-center justify-center rounded-full bg-white shadow-lg text-secondary border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ChevronRight size={24} />
          </button>
          <div 
            ref={scrollRef}
            className="w-full overflow-x-auto snap-x snap-mandatory flex gap-6 pb-6 pt-2 hide-scrollbar"
          >
            {officers.map((officer, i) => (
              <div key={i} className="snap-start shrink-0 w-[260px] md:w-[280px] flex flex-col items-center bg-background-light rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="size-32 rounded-full overflow-hidden mb-4 border-4 border-primary shadow-inner">
                  <div className="w-full h-full bg-cover bg-cover" style={{ backgroundImage: `url('${officer.img}')` , backgroundPosition:'center 10%',}}></div>
                </div>
                <h3 className="text-lg font-bold text-black text-center">{officer.name}</h3>
                <p className="text-sm text-black font-semibold text-center mt-1">{officer.role}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center gap-2.5 mb-10">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((dot) => (
            <div key={dot} className={`size-3 rounded-full ${dot === 1 ? 'bg-primary' : 'bg-slate-300'} cursor-pointer transition-colors`}></div>
          ))}
        </div>
        <button className="flex cursor-pointer items-center justify-center rounded-lg h-12 px-12 bg-primary text-white hover:bg-primary/90 transition-colors font-bold text-base shadow-md">
          Portal
        </button>
      </div>
    </section>
  );
};

const HymnAndPledge = () => (
  <section id="hymns" className="py-24 px-6 md:px-10 bg-blue-900">
    <div className="max-w-6xl mx-auto flex flex-col items-center">
      <h2 className="text-3xl md:text-4xl font-bold leading-tight tracking-[-0.015em] text-white mb-16 text-center">Our Hymn & Pledge</h2>
      <div className="flex flex-col md:flex-row w-full gap-10">
        <div className="flex-1 flex flex-col items-center bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-slate-100 text-center">
          <div className="flex items-center gap-3 mb-6">
            <Music className="text-primary" size={32} />
            <h3 className="text-2xl font-bold text-secondary">Royal Ambassadors Hymn</h3>
          </div>
          <div className="flex-1 w-full text-slate-600 leading-loose mb-10 text-base space-y-4">
            <p>
              I am a stranger here, within a foreign land, <br />
              My home is far away, upon a golden strand, <br />
              Ambassadors to be of realms beyond the sea, <br />
              I’m here on business for my king.
            </p>

            <p className="font-bold">Chorus</p>

            <p>
              This is the message that I bring, <br />
              A message angels fain would sing; <br />
              “oh, be ye reconciled,” thus saith my lord and king, <br />
              “oh, be ye reconciled to God.
            </p>
          </div>
         
        </div>

      </div>
    </div>
  </section>
);

const ContactForm = () => {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setTimeout(() => setStatus('sent'), 1500);
  };

  return (
    <section id="contact" className="py-24 px-6 md:px-10 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6">Get in Touch</h2>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed">
              Have questions about our programs, membership, or upcoming events? Reach out to us and we'll get back to you as soon as possible.
            </p>
            
            <div className="space-y-6">
              
              <div className="flex items-start gap-4">
                <div className="size-12 rounded-lg bg-slate-50 flex items-center justify-center text-primary shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-secondary">Phone Number</h4>
                  <p className="text-slate-600">+234 (0) 800 123 4567</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="size-12 rounded-lg bg-slate-50 flex items-center justify-center text-primary shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-secondary">Email Address</h4>
                  <p className="text-slate-600">info@ranational.org</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-background-light p-8 md:p-10 rounded-3xl border border-slate-100 shadow-sm">
            {status === 'sent' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="size-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Send size={40} />
                </div>
                <h3 className="text-2xl font-bold text-secondary mb-2">Message Sent!</h3>
                <p className="text-slate-600 mb-8">Thank you for reaching out. We'll be in touch shortly.</p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="text-primary font-bold hover:underline"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-secondary">Full Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="John Doe"
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-secondary">Email Address</label>
                    <input 
                      required
                      type="email" 
                      placeholder="john@example.com"
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-secondary">Subject</label>
                  <select className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white">
                    <option>General Inquiry</option>
                    <option>Programs & Events</option>
                    <option>Donations</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-secondary">Message</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="How can we help you?"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className={`w-full h-12 rounded-xl bg-primary text-white font-bold ${status === 'sending' ? 'opacity-60 pointer-events-none' : ''}`}
                  >
                    {status === 'sending' ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

// Footer and page export
const Footer = () => (
  <footer className="bg-slate-900 text-slate-200 py-12">
    <div className="max-w-6xl mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="text-sm">&copy; {new Date().getFullYear()} Royal Ambassadors. All rights reserved.</div>
      <div className="flex gap-4">
        <a href="#" className="text-slate-400 hover:text-white">Privacy</a>
        <a href="#" className="text-slate-400 hover:text-white">Terms</a>
      </div>
    </div>
  </footer>
);

export default function Page() {
  return (
    <main className="scroll-smooth">
      <Navbar />
      <Hero />
      <About />
      <Programs />
      <Officers />
      <HymnAndPledge />
      <ContactForm />
      <Footer />
    </main>
  );
}
