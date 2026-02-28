"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="rounded-full p-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors opacity-0">
                <Sun className="h-[1.2rem] w-[1.2rem]" />
            </div>
        )
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
            {theme === "dark" ? (
                <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-500" />
            ) : (
                <Moon className="h-[1.2rem] w-[1.2rem] text-slate-600" />
            )}
            <span className="sr-only">Toggle theme</span>
        </button>
    )
}
