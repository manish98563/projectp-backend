import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Shield } from "lucide-react";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Careers", path: "/careers" },
  { name: "Work With Us", path: "/apply" },
];

const Logo = () => (
  <Link to="/" className="flex items-center gap-3 group" data-testid="logo-link">
    <svg width="36" height="40" viewBox="0 0 36 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18 2L33.5885 10V26L18 34L2.41154 26V10L18 2Z"
        stroke="#FF7A2A"
        strokeWidth="2.5"
        fill="none"
      />
      <text x="11" y="24" fill="white" fontSize="16" fontWeight="700" fontFamily="Inter, sans-serif">P</text>
    </svg>
    <span className="text-lg tracking-tight">
      <span className="font-semibold text-white">Project P</span>{" "}
      <span className="font-light text-[#9FB0C8]">Innovations</span>
    </span>
  </Link>
);

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header
      data-testid="main-header"
      className={`fixed top-0 left-0 right-0 z-50 h-[72px] md:h-[72px] transition-colors duration-300 ${
        scrolled
          ? "bg-[#071020]/80 backdrop-blur-[14px] border-b border-white/[0.06]"
          : "bg-transparent border-b border-white/[0.03]"
      }`}
    >
      <div className="max-w-[1180px] mx-auto px-7 h-full flex items-center justify-between">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8" data-testid="desktop-nav">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              data-testid={`nav-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
              className={`text-sm tracking-wide transition-colors duration-200 hover:text-[#FF7A2A] ${
                location.pathname === link.path
                  ? "text-[#FF7A2A] font-medium"
                  : "text-[#B9C7D6]"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center">
          <Link
            to="/admin/login"
            data-testid="admin-login-icon"
            className="p-2 rounded-lg text-[#B9C7D6]/50 hover:text-[#B9C7D6] hover:bg-white/[0.04] transition-colors duration-200"
            title="Admin"
          >
            <Shield size={18} />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          data-testid="mobile-menu-toggle"
          className="md:hidden p-2 text-[#B9C7D6] hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            data-testid="mobile-menu"
            className="md:hidden bg-[#071020]/95 backdrop-blur-[14px] border-b border-white/[0.06]"
          >
            <nav className="flex flex-col px-7 py-4 gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm py-2 transition-colors duration-200 ${
                    location.pathname === link.path
                      ? "text-[#FF7A2A] font-medium"
                      : "text-[#B9C7D6]"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/admin/login"
                className="text-sm py-2 text-[#B9C7D6]/50 hover:text-[#B9C7D6] flex items-center gap-2"
              >
                <Shield size={14} /> Admin
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
