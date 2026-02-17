import React from 'react'
import {Lock,PlayCircle} from 'lucide-react'
import Link from 'next/link'
import Header from '../../../components/header'


const page = () => {
  return (
    <div className="bg-white dark:bg-background-dark min-h-screen flex flex-col">
     <Header/>
      
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-[#04062d] rounded-xl shadow-xl overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-8 border-b border-slate-100 dark:border-slate-800 text-center">
              <div className="inline-flex bg-white p-4 rounded-full mb-4">
                <span className="material-symbols-outlined text-[#a46838] text-4xl"><Lock></Lock></span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Exam ID</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                Please enter the identification code provided by your instructor to begin your assessment.
              </p>
            </div>
            
            <div className="p-8">
              <form  className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Enter Exam ID</label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-4 text-slate-400">key</span>
                    <input 
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-xl font-mono tracking-widest text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 uppercase" 
                      placeholder="XXXX-XXXX" 
                      type="text"
                     
                    />
                  </div>
                </div>
           <Link href="/exam">     <button 
                  className="w-full bg-[#946119] hover:bg-green-900 text-white font-bold py-4 rounded-lg shadow-lg shadow-accent-gold/20 transition-all flex items-center justify-center gap-3 text-lg uppercase tracking-wide" 
                  type="submit"
                >
                  <span>Start Exam</span>
                  <span className="material-symbols-outlined"><PlayCircle></PlayCircle></span>
                </button></Link>
              </form>
              
              <div className="mt-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
                <h4 className="text-xs font-bold text-primary dark:text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">info</span>
                  Important Note
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Once you click "Start Exam", the timer will begin. Ensure you have a stable internet connection before proceeding.
                </p>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  )
}

export default page