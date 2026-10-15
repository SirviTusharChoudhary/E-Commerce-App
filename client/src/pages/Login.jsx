import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { axiosInstance } from "../axiosCalls/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("Please fill in both email and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await axiosInstance.post("/customer/login", form);
      setUser(response.data.userData);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-zinc-950 font-['Plus_Jakarta_Sans',sans-serif] text-black dark:text-zinc-100 antialiased flex flex-col justify-center items-center px-4 py-8 relative transition-colors duration-200">
      {/* THEME TOGGLE TOP RIGHT */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm animate-fade-in">
        {/* BRAND LOGO */}
        <Link to="/" className="text-xl font-black tracking-tighter text-black dark:text-white flex items-center justify-center gap-1.5 mb-6 hover:opacity-90 transition-opacity">
          <span className="bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 rounded text-sm font-black tracking-normal">B</span>
          <span>BAZR</span>
        </Link>

        {/* AUTH CARD (COMPACT) */}
        <div className="bg-white dark:bg-zinc-900 border border-neutral-300 dark:border-zinc-800 rounded-lg p-6 shadow-2xs transition-colors">
          <div className="border-b border-neutral-200 dark:border-zinc-800 pb-3 mb-4">
            <h1 className="font-black text-lg text-black dark:text-white tracking-tight uppercase">
              Sign In
            </h1>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              Access your marketplace orders & wishlist
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Email Address
              </label>
              <div className="flex items-center border border-neutral-300 dark:border-zinc-700 focus-within:border-black dark:focus-within:border-zinc-400 rounded px-3 py-1.5 bg-white dark:bg-zinc-900 transition-colors">
                <Mail size={15} className="text-neutral-400 dark:text-zinc-500 mr-2 shrink-0" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className="w-full outline-none text-xs text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-zinc-500 bg-transparent"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Password
                </label>
              </div>
              <div className="flex items-center border border-neutral-300 dark:border-zinc-700 focus-within:border-black dark:focus-within:border-zinc-400 rounded px-3 py-1.5 bg-white dark:bg-zinc-900 transition-colors">
                <Lock size={15} className="text-neutral-400 dark:text-zinc-500 mr-2 shrink-0" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  className="w-full outline-none text-xs text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-zinc-500 bg-transparent"
                />
              </div>
            </div>

            {error && (
              <div className="text-[11px] font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-2 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-wider py-2.5 rounded hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              {loading ? "Authenticating…" : "Continue to Store"}
            </button>
          </form>

          <div className="border-t border-neutral-200 dark:border-zinc-800 mt-4 pt-4 text-center">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              New to marketplace?{" "}
              <Link
                to="/signup"
                className="font-bold text-black dark:text-white underline underline-offset-4 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center text-[11px] text-neutral-400 dark:text-neutral-500">
          <span>Protected by 256-bit encrypted marketplace authentication</span>
        </div>
      </div>
    </div>
  );
}