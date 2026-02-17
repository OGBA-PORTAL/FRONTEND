'use client'
import React, { useState } from 'react'
import {Shield,User, CopyIcon, LogOut,Menu,X} from 'lucide-react'
import Link from 'next/link'

const Header = () => {
     const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigate = () => {
    setIsMobileMenuOpen(false);
  };
  return (
      <header className="sticky top-0 z-50 w-full  bg-[#00008B] border-b border-primary/10 shadow-sm">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" >
          <div className="size-8  rounded-lg flex items-center justify-center text-blue-900">
            <span className="material-symbols-outlined !text-xl text-white"><Shield></Shield></span>
          </div>
        <Link href="/dashboard">  <h2 className="text-yellow-400 text-xl font-bold leading-tight tracking-tight">RA OGBA</h2></Link>
        </div>
        
        <nav className="flex items-center gap-4 md:gap-8">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
           <Link href="/dashboard/profile"> <button className="flex text-white" >
              <span className="material-symbols-outlined text-[20px] text-white"><User></User></span>
              Profile
            </button></Link>
           <Link href="/exam/exam_id"><button className="flex text-white" >
              <span className="material-symbols-outlined text-[20px] text-white"><CopyIcon></CopyIcon></span>
              Exams
            </button></Link> 
          <Link href="/login">  <button className="flex text-white hover:text-red-600" >
              <span className="material-symbols-outlined text-white hover:text-red-600"><LogOut></LogOut></span>
              Exit
            </button></Link>
          </div>
          
          <div className="flex items-center gap-2">
            
            <button 
             >
              <span className="material-symbols-outlined" ></span>
            </button>
            
            {/* Mobile Menu Toggle Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex size-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">
                {isMobileMenuOpen ? <X/> : <Menu/>}
              </span>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Navigation Dropdown */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-background-dark ${isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
      >
        <div className="flex flex-col p-4 gap-2">
        <Link href="/dashboard">   <button 
                   >
           
            <span className="font-semibold">Dashboard</span>
          </button></Link>
         <Link href="/dashboard/profile"> <button 
               >
            
            <span className="font-semibold">Profile</span>
          </button></Link>
         <Link href="/exam/exam_id"> <button 
           
                     >
           
            <span className="font-semibold">Exams</span>
          </button></Link>
          <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
        <Link href="/login">  <button 
           
            className="flex items-center gap-3 p-3 rounded-lg text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <span className="material-symbols-outlined"><LogOut></LogOut></span>
            <span className="font-semibold">Exit Portal</span>
          </button></Link>
        </div>
      </div>
    </header>
  )
}

export default Header