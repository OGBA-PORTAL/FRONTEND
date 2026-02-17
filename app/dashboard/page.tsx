'use client'
import React from 'react';
import { 
  UserCircle, 
  User, 
  FileEdit, 
  Github, 
  Linkedin, 
  Facebook ,
  LogOut
} from 'lucide-react';
import Link from "next/link"
import Header from '../../components/header';

const StudentPortal = () => {
  return (
    <>    <Header/>
   <div className="min-h-screen flex flex-col">
      
      
      <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-4xl w-full">
          <div className="mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 text-black mb-4">
              Welcome to your dashboard
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400">
              Royal Ambassadors of Ogbomoso Goshen Baptist Association Student Portal
            </p>
          </div>
          
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl  backdrop-blur-sm">
            <div className="bg-primary/5 p-8 rounded-full mb-6 animate-bounce">
              <svg className="w-32 h-32 text-primary/20 dark:text-primary/10" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M42.1739 20.1739L27.8261 5.82609C29.1366 7.13663 28.3989 10.1876 26.2002 13.7654C24.8538 15.9564 22.9595 18.3449 20.6522 20.6522C18.3449 22.9595 15.9564 24.8538 13.7654 26.2002C10.1876 28.3989 7.13663 29.1366 5.82609 27.8261L20.1739 42.1739C21.4845 43.4845 24.5355 42.7467 28.1133 40.548C30.3042 39.2016 32.6927 37.3073 35 35C37.3073 32.6927 39.2016 30.3042 40.548 28.1133C42.7467 24.5355 43.4845 21.4845 42.1739 20.1739Z" fill="currentColor"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-slate-400 text-black mb-2">Ready to begin?</h2>
            <p className="text-slate-400 text-black max-w-sm mx-auto">
              Please select an option from the navigation menu above to manage your profile or take your exams.
            </p>
          </div>
        </div>
      </main>
      
   
    </div>
    </>

  );
};

export default StudentPortal;