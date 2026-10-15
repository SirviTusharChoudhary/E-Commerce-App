import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ showLabel = false, className = "" }) {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`group relative flex items-center justify-center gap-1.5 p-1.5 rounded border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-neutral-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-zinc-600 active:scale-95 transition-all duration-200 cursor-pointer shadow-2xs ${className}`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme mode"
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun size={15} className="text-amber-400 rotate-0 transition-transform duration-300 group-hover:rotate-45" />
        ) : (
          <Moon size={15} className="text-neutral-700 rotate-0 transition-transform duration-300 group-hover:-rotate-12" />
        )}
      </div>

      {showLabel && (
        <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:inline">
          {isDark ? "Light" : "Dark"}
        </span>
      )}
    </button>
  );
}
