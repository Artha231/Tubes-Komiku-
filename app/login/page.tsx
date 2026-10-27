
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Github,
  Chrome,
} from "lucide-react";
import pb from "@/lib/pocketbase";

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    try {
      setLoading(true);

      await pb.collection("users").authWithPassword(email, password);

      setMessage("Login berhasil!");
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Login gagal. Periksa email dan kata sandi.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setMessage("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    if (password.length < 8) {
      setMessage("Kata sandi minimal 8 karakter.");
      return;
    }

    try {
      setLoading(true);

      await pb.collection("users").create({
        name,
        email,
        password,
        passwordConfirm: confirmPassword,
      });

      await pb.collection("users").authWithPassword(email, password);

      setMessage("Registrasi berhasil!");
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Register error:", error);
      setMessage(
        "Registrasi gagal. Periksa email, kata sandi, atau field wajib."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-md">
        <div className="flex justify-center text-2xl font-bold text-white">
          <Link href="/" className="hover:underline">
            KomikuApp
          </Link>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setMessage("");
            }}
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
            onClick={() => {
              setMode("register");
              setMessage("");
            }}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              mode === "register"
                ? "bg-white/30 text-white"
                : "bg-transparent text-gray-300 hover:bg-white/20"
            }`}
          >
            Register
          </button>
        </div>

        {message && (
          <p role="status" className="text-center text-sm text-white">
            {message}
          </p>
        )}

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                name="email"
                type="email"
                placeholder="Email"
                autoComplete="email"
                required
                className="w-full rounded-md bg-gray-800/50 py-2 pl-10 pr-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Kata sandi"
                autoComplete="current-password"
                required
                className="w-full rounded-md bg-gray-800/50 py-2 pl-10 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
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
              disabled={loading}
              className="w-full rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                name="name"
                type="text"
                placeholder="Nama Lengkap"
                autoComplete="name"
                required
                className="w-full rounded-md bg-gray-800/50 py-2 pl-10 pr-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                name="email"
                type="email"
                placeholder="E-mail"
                autoComplete="email"
                required
                className="w-full rounded-md bg-gray-800/50 py-2 pl-10 pr-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Kata sandi (min. 8 karakter)"
                autoComplete="new-password"
                minLength={8}
                required
                className="w-full rounded-md bg-gray-800/50 py-2 pl-10 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
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

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Konfirmasi Kata sandi"
                autoComplete="new-password"
                minLength={8}
                required
                className="w-full rounded-md bg-gray-800/50 py-2 pl-10 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
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
              disabled={loading}
              className="w-full rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Daftar"}
            </button>
          </form>
        )}

        <div className="flex flex-col gap-3 pt-4">
          <button
            type="button"
            onClick={() => setMessage("Login Google belum dikonfigurasi.")}
            className="flex items-center justify-center gap-2 rounded-md bg-gray-800/60 px-4 py-2 text-gray-200 hover:bg-gray-800/80"
          >
            <Chrome size={20} />
            <span>Masuk dengan Google</span>
          </button>

          <button
            type="button"
            onClick={() => setMessage("Login GitHub belum dikonfigurasi.")}
            className="flex items-center justify-center gap-2 rounded-md bg-gray-800/60 px-4 py-2 text-gray-200 hover:bg-gray-800/80"
          >
            <Github size={20} />
            <span>Masuk dengan GitHub</span>
          </button>
        </div>
      </div>
    </div>
  );
}
