'use client'
import React from 'react';
import { 
  UserCircle, 
  User, 
  FileEdit, 
  Github, 
  Linkedin, 
  Facebook,
  LogOut,
  Mail,
  Lock,
  Phone,
  Church,
  Award,
  Camera,
  CircleUser
} from 'lucide-react';
import Link from "next/link"
import Header from '@/components/header';

const ProfilePage = () => {
 

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#111318] min-h-screen">
      <Header/>
      
      <main className="min-h-[calc(100vh-64px)] flex flex-col items-center py-12 px-4">
        <div className="w-full max-w-[600px] bg-white dark:bg-slate-900 shadow-xl shadow-primary/5 rounded-2xl overflow-hidden">
          <div className="relative pt-12 pb-8 flex flex-col items-center bg-gradient-to-b from-primary/5 to-transparent">
            <div className="relative">
              <div className="size-44 rounded-full border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden bg-white">
                <CircleUser className="w-full h-full object-cover" />
              </div>
            
            </div>
            <div className="mt-6 text-center">
              <h1 className="text-3xl font-bold text-[#111318] dark:text-white">Ajala Peace</h1>
              <p className="text-slate-500 font-medium mt-1">Student Profile</p>
            </div>
          </div>
          
          <div className="px-10 pb-12 space-y-1">
           
              <div >
                <div className="flex items-center gap-4 border-2 border-white rounded-xl w-full ">
                  <div className="size-10 rounded-fullbg-primary/5 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary !text-xl text-white"><User></User></span>
                  </div>
                  <span className="text-white text-sm font-medium">Name :</span>
                  <span className='text-white'>AJALA PEACE OLAOLUWA</span>
                </div>

                  <div className="flex items-center gap-4 border-2 border-white rounded-xl w-full mt-5 ">
                  <div className="size-10 rounded-fullbg-primary/5 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary !text-xl text-white"> <Phone></Phone></span>
                  </div>
                  <span className="text-white text-sm font-medium">Phone Number</span>
                  <span className='text-white'>09169235010</span>
                </div>

                  <div className="flex items-center gap-4 border-2 border-white rounded-xl w-full mt-5 ">
                  <div className="size-10 rounded-fullbg-primary/5 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary !text-xl text-white"><Mail></Mail></span>
                  </div>
                  <span className="text-white text-sm font-medium">Email</span>
                  <span className='text-white'>peace@gmail.com</span>
                </div>

                  <div className="flex items-center gap-4 border-2 border-white rounded-xl w-full mt-5 ">
                  <div className="size-10 rounded-fullbg-primary/5 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary !text-xl text-white"><Church></Church></span>
                  </div>
                  <span className="text-white text-sm font-medium">Church</span>
                  <span className='text-white'>Divine Peace</span>
                </div>

                  <div className="flex items-center gap-4 border-2 border-white rounded-xl w-full mt-5 ">
                  <div className="size-10 rounded-fullbg-primary/5 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary !text-xl text-white"><Lock></Lock></span>
                  </div>
                  <span className="text-white text-sm font-medium">RAN Number:</span>
                  <span className='text-white'>4638299</span>
                </div>
               
              </div>
            
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800/50 px-10 py-6 text-center border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold flex items-center justify-center gap-2">
              <span className="material-symbols-outlined !text-sm">lock_person</span>
              Verified Student Information
            </p>
          </div>
        </div>
        
        <footer className="mt-12 text-center text-slate-500 text-sm pb-10">
          <div className="flex items-center justify-center gap-6 mb-4">
            <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <span className="size-1 bg-slate-300 rounded-full"></span>
            <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
            <span className="size-1 bg-slate-300 rounded-full"></span>
            <a className="hover:text-primary transition-colors" href="#">Help Center</a>
          </div>
          <p>© 2026 Royal Ambassadors of Nigeria. All Rights Reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default ProfilePage;