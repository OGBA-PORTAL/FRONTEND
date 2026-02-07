'use client'
import { useState } from 'react'
import Image from "next/image"
import logo from '../assets/ralogo.png'

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle login logic here
    console.log('Login submitted:', { email, password, rememberMe })
  }

  return (
    <div className="min-h-screen w-full gradient-blue flex items-center justify-center p-4 animate-fade-in relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-300/5 rounded-full blur-3xl"></div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="glass-effect rounded-3xl shadow-2xl p-8 md:p-10 border border-white/30">
          {/* Logo Section */}
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="absolute -inset-1 gradient-gold rounded-full blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-white rounded-full p-2 shadow-lg">
                <Image
                  src={logo}
                  alt="Royal Ambassadors logo"
                  width={120}
                  height={120}
                  className="rounded-full"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-slate-600 text-sm md:text-base">
              Sign in to access your Royal Ambassadors portal
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer w-full px-4 py-3 bg-white/50 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300 placeholder-transparent"
                placeholder="Email address"
                required
              />
              <label
                htmlFor="email"
                className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-blue-700 font-medium transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-500 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-700 peer-focus:bg-white"
              >
                Email Address
              </label>
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="peer w-full px-4 py-3 bg-white/50 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300 placeholder-transparent pr-12"
                placeholder="Password"
                required
              />
              <label
                htmlFor="password"
                className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-blue-700 font-medium transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-500 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-700 peer-focus:bg-white"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-700 transition-colors duration-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <span className="ml-2 text-slate-700 group-hover:text-blue-700 transition-colors duration-200">
                  Remember me
                </span>
              </label>
              <a
                href="#"
                className="text-blue-700 hover:text-yellow-600 font-medium transition-colors duration-200 hover:underline"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full gradient-gold text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-yellow-300/50"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">New to Royal Ambassadors?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <a
              href="#"
              className="text-blue-700 hover:text-yellow-600 font-semibold transition-colors duration-200 hover:underline"
            >
              Create an account
            </a>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-white/90 text-sm mt-6 drop-shadow-lg">
          © 2026 Royal Ambassadors. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default LoginPage