import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Phone } from "lucide-react";
import { axiosInstance } from "../axiosCalls/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function Signup() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fullName || !form.email || !form.password || !form.phone) {
      setError("Please fill in all fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password length must be at least 6 characters.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await axiosInstance.post("/customer/register", form);
      setUser(res.data.customer);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
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
              Create Account
            </h1>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              Join marketplace for direct member benefits
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Full Name
              </label>
              <div className="flex items-center border border-neutral-300 dark:border-zinc-700 focus-within:border-black dark:focus-within:border-zinc-400 rounded px-3 py-1.5 bg-white dark:bg-zinc-900 transition-colors">
                <User size={15} className="text-neutral-400 dark:text-zinc-500 mr-2 shrink-0" />
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="Alex Morgan"
                  value={form.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                  className="w-full outline-none text-xs text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-zinc-500 bg-transparent"
                />
              </div>
            </div>

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
                  placeholder="alex@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className="w-full outline-none text-xs text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-zinc-500 bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Phone Number
              </label>
              <div className="flex items-center border border-neutral-300 dark:border-zinc-700 focus-within:border-black dark:focus-within:border-zinc-400 rounded px-3 py-1.5 bg-white dark:bg-zinc-900 transition-colors">
                <Phone size={15} className="text-neutral-400 dark:text-zinc-500 mr-2 shrink-0" />
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  className="w-full outline-none text-xs text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-zinc-500 bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Password
              </label>
              <div className="flex items-center border border-neutral-300 dark:border-zinc-700 focus-within:border-black dark:focus-within:border-zinc-400 rounded px-3 py-1.5 bg-white dark:bg-zinc-900 transition-colors">
                <Lock size={15} className="text-neutral-400 dark:text-zinc-500 mr-2 shrink-0" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
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
              {loading ? "Registering…" : "Register Account"}
            </button>
          </form>

          <div className="border-t border-neutral-200 dark:border-zinc-800 mt-4 pt-4 text-center">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-black dark:text-white underline underline-offset-4 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center text-[11px] text-neutral-400 dark:text-neutral-500">
          <span>By continuing, you agree to marketplace Terms & Privacy Guidelines</span>
        </div>
      </div>
    </div>
  );
}