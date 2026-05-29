import React, { useState, FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, ShieldAlert } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate("/admin");
    } catch (err: any) {
      console.error(err);
      setError("Invalid credentials. Please double-check your admin email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] flex flex-col justify-center items-center px-4 relative selection:bg-[#C9A84C] selection:text-[#0D1117]">
      {/* Subtle Background Radial Gradient */}
      <div 
        className="absolute inset-0 opacity-25 pointer-events-none" 
        style={{ backgroundImage: "radial-gradient(circle at 50% 40%, rgba(201, 168, 76, 0.15) 0%, transparent 60%)" }}
      />

      <div className="w-full max-w-md z-10">
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-[#C9A84C] to-[#F0D080] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(201,168,76,0.5)] mb-4 animate-pulse">
            <span className="text-2xl">👑</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#F0D080] tracking-tight mb-1" style={{ fontFamily: "Georgia, serif" }}>
            KINGS DIAMONDS
          </h1>
          <p className="text-[10px] tracking-[0.3em] font-medium text-[#FAF6EE]/80 uppercase mb-4">
            Villas · Lonavala
          </p>
          <div className="h-[1px] w-12 bg-[#C9A84C]/30 mb-4" />
          <p className="text-sm text-[#FAF6EE]/60 font-serif italic">
            Admin Access — Authorized Personnel Only
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#141B26] border border-[#C9A84C]/25 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Email Field */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#FAF6EE]/60 font-bold mb-2">
                Admin Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#FAF6EE]/40">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="Enter authorized admin email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#C9A84C]/30 focus:border-[#C9A84C] text-[#FAF6EE] text-sm rounded-xl pl-10 pr-4 py-3.5 outline-none focus:ring-1 focus:ring-[#C9A84C] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#FAF6EE]/60 font-bold mb-2">
                Credentials Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#FAF6EE]/40">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter secure password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#C9A84C]/30 focus:border-[#C9A84C] text-[#FAF6EE] text-sm rounded-xl pl-10 pr-10 py-3.5 outline-none focus:ring-1 focus:ring-[#C9A84C] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#FAF6EE]/40 hover:text-[#C9A84C] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-[#E63946]/10 border border-[#E63946]/30 rounded-xl p-3 flex items-start gap-3.5 text-[#E63946] text-xs leading-relaxed animate-shake">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">Authentication Failure</h4>
                  <p className="opacity-90">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#C9A84C] to-[#F0D080] text-[#0D1117] font-bold py-4 rounded-xl shadow-lg shadow-[#C9A84C]/10 hover:shadow-[#C9A84C]/25 transition-all text-sm uppercase tracking-[0.2em] transform hover:scale-[1.01] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#0D1117] border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Access Dashboard</span>
              )}
            </button>
          </form>
        </div>

        {/* Back to Home Link */}
        <p className="text-center mt-6 text-xs text-[#FAF6EE]/40">
          Not authorized?{" "}
          <a href="/" className="text-[#C9A84C] hover:underline transition-all">
            Return to main reservation site
          </a>
        </p>
      </div>
    </div>
  );
}
