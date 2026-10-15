import React from "react";
import { Link } from "react-router-dom";
import { Zap, RotateCcw, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle.jsx";

const categories = [
  "Sneakers",
  "Gadgets",
  "Home & Living",
  "Beauty",
  "Books",
  "Outdoors",
  "Fashion",
  "Electronics",
];

const highlights = [
  { label: "Performance Footwear", price: "from ₹2,499", tag: "Sneakers" },
  { label: "Acoustics & Sound", price: "from ₹1,899", tag: "Audio" },
  { label: "Artisan Ceramics", price: "from ₹699", tag: "Living" },
  { label: "Everyday Tech", price: "from ₹999", tag: "Gadgets" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-['Plus_Jakarta_Sans',sans-serif] text-black dark:text-zinc-100 antialiased flex flex-col transition-colors duration-200">
      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .marquee-track { animation: marquee 22s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
        }
      `}</style>

      {/* TOP ANNOUNCEMENT RIBBON */}
      <div className="bg-black dark:bg-zinc-900 text-white text-[11px] font-semibold tracking-wider uppercase py-1.5 px-4 text-center flex items-center justify-center gap-3 border-b border-neutral-800">
        <span className="flex items-center gap-1.5">
          <Sparkles size={12} className="text-amber-400" />
          AUTHENTIC MARKETPLACE DIRECT
        </span>
        <span className="text-zinc-600">•</span>
        <span className="text-zinc-300 dark:text-zinc-400">EXPRESS SHIPPING NATIONWIDE ON ORDERS OVER ₹999</span>
      </div>

      {/* COMPACT NAV */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-neutral-200 dark:border-zinc-800 px-4 sm:px-6 py-2.5 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-black tracking-tighter text-black dark:text-white flex items-center gap-1.5 hover:opacity-90 transition-opacity">
            <span className="bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 rounded text-sm font-black tracking-normal">B</span>
            <span>BAZR</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-4 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
            <Link to="/products" className="hover:text-black dark:hover:text-white transition-colors">Catalog (70+ Items)</Link>
            <Link to="/signup" className="hover:text-black dark:hover:text-white transition-colors">New Arrivals</Link>
          </nav>
        </div>

        <nav className="flex items-center gap-2">
          <ThemeToggle />

          <Link
            to="/login"
            className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-zinc-300 hover:text-black dark:hover:text-white px-3 py-1.5 rounded transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="text-xs font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black rounded px-4 py-1.5 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-2xs active:scale-95"
          >
            Sign up
          </Link>
        </nav>
      </header>

      {/* COMPACT HERO SECTION */}
      <section className="border-b border-neutral-200 dark:border-zinc-800 bg-neutral-50/60 dark:bg-zinc-900/40 px-4 sm:px-6 py-10 sm:py-14 transition-colors">
        <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-black dark:bg-white text-white dark:text-black text-[10px] font-extrabold uppercase tracking-widest shadow-2xs">
              <span>Verified Direct Marketplace</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-black dark:text-white leading-[1.1]">
              Everyday Essentials.
              <br />
              <span className="text-neutral-500 dark:text-neutral-400 font-semibold">
                Direct from verified makers.
              </span>
            </h1>

            <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm max-w-lg leading-relaxed">
              Discover curated footwear, contemporary gadgets, lifestyle home goods, and certified tech accessories. Over 70+ authentic products with honest pricing and express delivery.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-2xs active:scale-95"
              >
                Start Shopping
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-neutral-300 dark:border-zinc-700 text-black dark:text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded hover:border-black dark:hover:border-zinc-500 transition-colors"
              >
                Browse Catalog
              </Link>
            </div>
          </div>

          {/* HIGH-DENSITY MARKETPLACE PREVIEW CARDS */}
          <div className="md:col-span-5 grid grid-cols-2 gap-2.5">
            {highlights.map((h) => (
              <div
                key={h.label}
                className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg p-3 shadow-2xs flex flex-col justify-between hover:border-black dark:hover:border-zinc-600 hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  {h.tag}
                </span>
                <p className="font-bold text-xs text-black dark:text-white mt-1 line-clamp-1">
                  {h.label}
                </p>
                <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-[11px] font-black text-black dark:text-white">{h.price}</span>
                  <span className="text-neutral-400">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPACT CATEGORY MARQUEE */}
      <div className="bg-white dark:bg-zinc-950 border-b border-neutral-200 dark:border-zinc-800 overflow-hidden py-2.5 transition-colors">
        <div className="marquee-track flex gap-4 w-max">
          {[...categories, ...categories, ...categories].map((c, i) => (
            <span
              key={i}
              className="whitespace-nowrap border border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900 text-neutral-800 dark:text-zinc-200 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded"
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* COMPACT TRUST / FEATURES STRIP */}
      <section className="px-4 sm:px-6 py-10 max-w-6xl mx-auto w-full">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 border border-neutral-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 flex items-start gap-3 transition-colors">
            <div className="p-2 rounded bg-black dark:bg-white text-white dark:text-black shrink-0">
              <Zap size={16} />
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-black dark:text-white">Fast 1-Click Checkout</h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-[11px] mt-1 leading-relaxed">
                Save details once for seamless re-orders. 256-bit encrypted transactions.
              </p>
            </div>
          </div>

          <div className="p-4 border border-neutral-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 flex items-start gap-3 transition-colors">
            <div className="p-2 rounded bg-black dark:bg-white text-white dark:text-black shrink-0">
              <ShieldCheck size={16} />
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-black dark:text-white">100% Verified Quality</h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-[11px] mt-1 leading-relaxed">
                Every listed product passes strict material and authentic origin inspections.
              </p>
            </div>
          </div>

          <div className="p-4 border border-neutral-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 flex items-start gap-3 transition-colors">
            <div className="p-2 rounded bg-black dark:bg-white text-white dark:text-black shrink-0">
              <RotateCcw size={16} />
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-black dark:text-white">30-Day Easy Returns</h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-[11px] mt-1 leading-relaxed">
                Hassle-free pickups with instant refund turnaround on all eligible returns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* COMPACT CALL TO ACTION STRIP */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-10 w-full">
        <div className="bg-black dark:bg-zinc-900 text-white rounded-lg p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 border border-neutral-800">
          <div>
            <h2 className="font-black text-xl tracking-tight">
              Ready to explore verified marketplace goods?
            </h2>
            <p className="text-neutral-400 text-xs mt-1">
              Create a free account to unlock express delivery privileges and member pricing.
            </p>
          </div>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-white text-black font-extrabold text-xs uppercase tracking-wider px-5 py-2.5 rounded hover:bg-neutral-100 transition-all shrink-0 active:scale-95 shadow-2xs"
          >
            Join BAZR
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* COMPACT FOOTER */}
      <footer className="mt-auto border-t border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900 px-4 sm:px-6 py-4 transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="font-black text-black dark:text-white">BAZR Marketplace</span>
            <span>• © {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-4">
            <Link to="/products" className="hover:text-black dark:hover:text-white transition-colors">Catalog</Link>
            <Link to="/login" className="hover:text-black dark:hover:text-white transition-colors">Member Sign In</Link>
            <Link to="/signup" className="hover:text-black dark:hover:text-white transition-colors">Register Account</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}