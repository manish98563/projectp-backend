import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { Shield, Loader2, Eye, EyeOff } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/admin/login`, { email, password });
      localStorage.setItem("admin_token", res.data.token);
      toast.success("Login successful!");
      navigate("/admin");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Invalid credentials.");
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
        className="glass-card p-8 md:p-10 w-full max-w-md relative z-10"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-[#FF7A2A]/10">
            <Shield size={24} className="text-[#FF7A2A]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white" data-testid="admin-login-title">
              Admin Login
            </h1>
            <p className="text-xs text-[#9FB0C8]">
              <span className="font-semibold text-white/80">Project P</span> Innovations
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} data-testid="admin-login-form" className="space-y-5">
          <div>
            <label className="text-xs text-[#9FB0C8] uppercase tracking-wider mb-2 block">
              Email
            </label>
            <input
              data-testid="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@projectpinnovations.com"
              className="glass-input w-full px-4 py-3 text-sm"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-xs text-[#9FB0C8] uppercase tracking-wider mb-2 block">
              Password
            </label>
            <div className="relative">
              <input
                data-testid="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="glass-input w-full px-4 py-3 pr-10 text-sm"
                autoComplete="current-password"
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
            className="w-full py-3.5 bg-[#FF7A2A] text-white font-medium text-sm rounded-full hover:scale-[1.02] transition-transform duration-[180ms] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#FF7A2A]/20 flex items-center justify-center gap-2"
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
        </form>
      </motion.div>
    </main>
  );
}
