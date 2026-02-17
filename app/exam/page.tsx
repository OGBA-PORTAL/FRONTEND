import React from 'react'
import Link from 'next/link'

const page = () => {
  return (
      <div className="bg-background-light dark:bg-background-dark text-slate-900 min-h-screen">
      <div className="sticky top-0 z-50 bg-royal-blue text-[#f9d406] py-3 px-6 shadow-md border-b-4 border-[#f9d406]">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined">timer</span>
            <span className="text-sm font-semibold uppercase tracking-wider">Time Remaining</span>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold leading-none">3</span>
              <span className="text-[10px] uppercase font-medium text-white/70">Hours</span>
            </div>
            <div className="text-2xl font-bold">:</div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold leading-none">45</span>
              <span className="text-[10px] uppercase font-medium text-white/70">Mins</span>
            </div>
            <div className="text-2xl font-bold">:</div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold leading-none">50</span>
              <span className="text-[10px] uppercase font-medium text-white/70">Secs</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-white/10 px-4 py-1 rounded-full">
            <span className="material-symbols-outlined text-sm">cloud_done</span>
            <span className="text-xs text-white font-medium">Progress Auto-saved</span>
          </div>
        </div>
      </div>

      <div className="layout-container flex flex-col">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-end mb-4">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full">
                <div className="size-8 rounded-full bg-royal-blue flex items-center justify-center text-[#f9d406] border border-[#f9d406]/30">
                  <span className="material-symbols-outlined text-xl">person</span>
                </div>
                <span className="text-sm font-bold text-royal-blue dark:text-[#f9d406]">Peace</span>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-royal-blue rounded-lg flex items-center justify-center text-[#f9d406] shadow-sm">
                  <span className="material-symbols-outlined text-3xl">shield</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-royal-blue dark:text-white leading-tight">Royal Ambassadors of Nigeria</h1>
                  <p className="text-sm font-medium text-slate-500">Senior Level • End of Year Certificate Examination</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex justify-between w-full md:w-64 mb-1">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Exam Progress</span>
                  <span className="text-xs font-bold text-royal-blue dark:text-[#f9d406]">14 / 20 Completed</span>
                </div>
                <div className="w-full md:w-64 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-[#f9d406]" style={{ width: '70%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </header>

       

          <div className="flex items-center justify-center gap-2 mt-12 py-6">
            <button className="size-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-royal-blue hover:bg-slate-50">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="size-10 flex items-center justify-center rounded-lg border border-slate-200 bg-white dark:bg-slate-900 text-slate-600 font-semibold hover:border-[#f9d406]">1</button>
            <button className="size-10 flex items-center justify-center rounded-lg border border-slate-200 bg-white dark:bg-slate-900 text-slate-600 font-semibold hover:border-[#f9d406]">2</button>
            <button className="size-10 flex items-center justify-center rounded-lg border-2 border-royal-blue bg-royal-blue text-[#f9d406] font-bold">3</button>
            <button className="size-10 flex items-center justify-center rounded-lg border border-slate-200 bg-white dark:bg-slate-900 text-slate-600 font-semibold hover:border-[#f9d406]">4</button>
            <button className="size-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-royal-blue hover:bg-slate-50">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        

        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-8">
          <div className="max-w-xl mx-auto text-center">
            <p className="text-sm text-slate-500 mb-6 font-medium">Please review all your answers before submitting. Once submitted, you cannot change your responses.</p>
        <Link href="/exam/submit">    <button 
              className="w-full bg-[#f9d406] hover:bg-[#e6c405] text-royal-blue font-bold text-lg py-5 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined font-bold">send</span>
              SUBMIT FINAL EXAM
            </button></Link>
            <div className="mt-4 flex items-center justify-center gap-6">
              <button className="text-slate-500 text-sm font-semibold hover:text-royal-blue flex items-center gap-1">
                <span className="material-symbols-outlined text-lg">flag</span>
                Review Marked (2)
              </button>
              <button className="text-slate-500 text-sm font-semibold hover:text-royal-blue flex items-center gap-1">
                <span className="material-symbols-outlined text-lg">save</span>
                Save Draft
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default page