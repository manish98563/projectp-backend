import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { Shield, Loader2, Eye, EyeOff } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_URL || ''}/api`;

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/admin/login`, { email, password });
      localStorage.setItem("admin_token", res.data.token);
      localStorage.setItem("admin_email", res.data.admin?.email || email);
      toast.success("Login successful!");
      navigate("/admin/dashboard");
    } catch (err) {
      const msg = err.response?.data?.detail || "Connection failed. Please try again.";
      setError(msg === "Invalid credentials" ? "Invalid email or password" : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      data-testid="admin-login-page"
      className="min-h-screen bg-[#071020] flex items-center justify-center px-4"
    >
      <div className="absolute inset-0 grid-overlay pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 0.8, 0.2, 1] }}
        className="glass-card w-full max-w-[480px] relative z-10"
        style={{ padding: "48px" }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <svg width="36" height="40" viewBox="0 0 36 40" fill="none">
              <path d="M18 2L33.5885 10V26L18 34L2.41154 26V10L18 2Z" stroke="white" strokeWidth="2" fill="none" />
            </svg>
            <span className="text-[15px]">
              <span className="font-semibold text-white">Project P</span>{" "}
              <span className="font-light text-[#9FB0C8] uppercase tracking-widest text-[11px]">Innovations</span>
            </span>
          </div>
        </div>

        <h1 className="text-xl font-bold text-white mb-8 text-center" data-testid="admin-login-title">
          Admin Login
        </h1>

        <form onSubmit={handleLogin} data-testid="admin-login-form" className="space-y-5">
          <div>
            <label htmlFor="email" className="text-xs text-[#9FB0C8] uppercase tracking-wider mb-2 block">
              Email
            </label>
            <input
              id="email"
              data-testid="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@projectpinnovations.com"
              className="glass-input w-full px-4 py-3 text-sm"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="text-xs text-[#9FB0C8] uppercase tracking-wider mb-2 block">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                data-testid="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="glass-input w-full px-4 py-3 pr-10 text-sm"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9FB0C8]/50 hover:text-[#9FB0C8]"
                data-testid="toggle-password"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            data-testid="admin-login-submit"
            className="w-full bg-[#FF7A2A] text-white font-medium text-sm rounded-xl hover:brightness-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#FF7A2A]/20 flex items-center justify-center gap-2"
            style={{ height: "48px" }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          {error && (
            <p data-testid="login-error" className="text-red-400 text-sm text-center mt-3">
              {error}
            </p>
          )}
        </form>
      </motion.div>
    </main>
  );
}
