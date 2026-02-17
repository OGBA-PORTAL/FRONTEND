import React from 'react'
import { CheckCircle, Shield } from 'lucide-react'
import Header from '../../../components/header'
import Link from 'next/link'

const page = () => {
  return (
     <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-gray-100 dark:border-neutral-800 overflow-hidden text-center p-8 md:p-16 relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-royal-blue via-[#f9d406] to-royal-blue"></div>
          
          <div className="mb-8 inline-flex items-center justify-center size-24 bg-[#f9d406]/10 rounded-full border-4 border-[#f9d406]/20">
            <span className="material-symbols-outlined text-6xl text-[#f9d406] font-bold"><CheckCircle></CheckCircle></span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-royal-blue dark:text-[#f9d406] mb-4">Exam Submitted Successfully</h2>
          <div className="w-16 h-1 bg-[#f9d406] mx-auto mb-6 rounded-full"></div>
          
          <div className="space-y-4 mb-10 max-w-md mx-auto">
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
              Well done, Ambassador! Your responses have been securely stored in our central records.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
         <Link href="/dashboard">   <button 
              className="w-full sm:w-auto px-8 py-4 bg-[#f9d406] text-royal-blue font-bold rounded-lg shadow-lg hover:shadow-[#f9d406]/30 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined"><Shield></Shield></span>
              Back to Dashboard
            </button></Link>
          </div>
        </div>
      </main>
      
      <footer className="w-full py-8 border-t border-gray-200 dark:border-gray-800 text-center">
        <p className="text-xs text-gray-500 font-medium">
          © 2026 Royal Ambassadors of Nigeria. All Rights Reserved.
        </p>
      </footer>
    </div>
  )
}

export default page