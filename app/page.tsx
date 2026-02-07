import Image from "next/image"
import Link from "next/link"
import logo from './assets/ralogo.png'

export default function Home() {
    return (
        <div className="min-h-screen w-full gradient-blue flex items-center justify-center p-4 animate-fade-in relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl animate-pulse delay-700"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-300/5 rounded-full blur-3xl"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center max-w-4xl mx-auto animate-slide-up">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <div className="relative group">
                        <div className="absolute -inset-2 gradient-gold rounded-full blur-lg opacity-30 group-hover:opacity-50 transition duration-300"></div>
                        <div className="relative bg-white rounded-full p-4 shadow-2xl">
                            <Image
                                src={logo}
                                alt="Royal Ambassadors logo"
                                width={150}
                                height={150}
                                className="rounded-full"
                                priority
                            />
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
                    Royal Ambassadors
                </h1>

                <p className="text-xl md:text-2xl text-white/90 mb-4 drop-shadow-lg">
                    Welcome to the Portal
                </p>

                <p className="text-base md:text-lg text-white/80 mb-12 max-w-2xl mx-auto drop-shadow-lg">
                    Empowering leaders, building communities, and creating lasting impact together.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link
                        href="/login"
                        className="w-full sm:w-auto gradient-gold text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-yellow-300/50"
                    >
                        Sign In to Portal
                    </Link>

                    <Link
                        href="#"
                        className="w-full sm:w-auto glass-effect-dark text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-white/30"
                    >
                        Learn More
                    </Link>
                </div>

                {/* Footer */}
                <p className="text-white/70 text-sm mt-16 drop-shadow-lg">
                    © 2026 Royal Ambassadors. All rights reserved.
                </p>
            </div>
        </div>
    )
}
