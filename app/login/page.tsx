"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Github,
  Chrome,
} from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Simple submit handlers (placeholder)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrate authentication logic
    console.log("login");
  };
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("register");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      {/* Card with glassmorphism */}
      <div className="w-full max-w-md space-y-6 rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-md shadow-xl">
        {/* Logo / title */}
        <div className="flex justify-center text-2xl font-bold text-white">
          <Link href="/" className="hover:underline">
            KomikuApp
          </Link>
        </div>

        {/* Tab toggle */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              mode === "login"
                ? "bg-white/30 text-white"
                : "bg-transparent text-gray-300 hover:bg-white/20"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              mode === "register"
                ? "bg-white/30 text-white"
                : "bg-transparent text-gray-300 hover:bg-white/20"
            }`}
          >
            Register
          </button>
        </div>

        {/* Forms */}
        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email / Username */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Email atau Username"
                required
                className="w-full rounded-md bg-gray-800/50 pl-10 pr-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Kata sandi"
                required
                className="w-full rounded-md bg-gray-800/50 pl-10 pr-10 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center space-x-2 text-gray-300">
                <input type="checkbox" className="form-checkbox h-4 w-4 rounded text-primary" />
                <span>Ingat Saya</span>
              </label>
              <Link href="#" className="text-primary hover:underline">
                Lupa Kata Sandi?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90"
            >
              Masuk
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name / Username */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Nama Lengkap / Username"
                required
                className="w-full rounded-md bg-gray-800/50 pl-10 pr-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                placeholder="E‑mail"
                required
                className="w-full rounded-md bg-gray-800/50 pl-10 pr-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Kata sandi"
                required
                className="w-full rounded-md bg-gray-800/50 pl-10 pr-10 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Konfirmasi Kata sandi"
                required
                className="w-full rounded-md bg-gray-800/50 pl-10 pr-10 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90"
            >
              Daftar
            </button>
          </form>
        )}

        {/* Social login */}
        <div className="flex flex-col gap-3 pt-4">
          <button className="flex items-center justify-center gap-2 rounded-md bg-gray-800/60 px-4 py-2 text-gray-200 hover:bg-gray-800/80">
            <Chrome size={20} />
            <span>Masuk dengan Google</span>
          </button>
          <button className="flex items-center justify-center gap-2 rounded-md bg-gray-800/60 px-4 py-2 text-gray-200 hover:bg-gray-800/80">
            <Github size={20} />
            <span>Masuk dengan GitHub</span>
          </button>
        </div>
      </div>
    </div>
  );
}
