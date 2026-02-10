import { Link } from "react-router-dom";
import { Github, Linkedin, Twitter, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer
      data-testid="main-footer"
      className="bg-white/[0.02] backdrop-blur-[14px] border-t border-white/[0.06]"
    >
      <div className="max-w-[1180px] mx-auto px-7 py-10">
        {/* Top row: Logo + Contact */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8 pb-8 border-b border-white/[0.04]">
          {/* Logo + tagline */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <svg width="28" height="32" viewBox="0 0 36 40" fill="none">
                <path d="M18 2L33.5885 10V26L18 34L2.41154 26V10L18 2Z" stroke="white" strokeWidth="2" fill="none" />
              </svg>
              <span className="text-sm">
                <span className="font-semibold text-white">Project P</span>{" "}
                <span className="font-light text-[#9FB0C8] uppercase tracking-widest text-[10px]">Innovations</span>
              </span>
            </div>
            <p className="text-xs text-[#9FB0C8]/60 max-w-xs leading-relaxed">
              AI product services, AI solutions &amp; consultancy. Designing the future of intelligent products.
            </p>
          </div>

          {/* Contact numbers */}
          <div className="flex flex-col sm:flex-row gap-6" data-testid="footer-contact-numbers">
            <div className="flex items-start gap-2.5">
              <Phone size={14} className="text-[#FF7A2A] mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-[#9FB0C8]/50 uppercase tracking-wider mb-0.5">United Kingdom</p>
                <a href="tel:+447717206215" className="text-sm text-[#B9C7D6] hover:text-[#FF7A2A] transition-colors duration-200">
                  +44 7717 206215
                </a>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Phone size={14} className="text-[#FF7A2A] mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-[#9FB0C8]/50 uppercase tracking-wider mb-0.5">India</p>
                <a href="tel:+919000242484" className="text-sm text-[#B9C7D6] hover:text-[#FF7A2A] transition-colors duration-200">
                  +91 9000 242484
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row: Links + Copyright + Social */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <nav className="flex items-center gap-6" data-testid="footer-links">
            <Link
              to="/"
              className="text-xs text-[#B9C7D6]/70 hover:text-[#FF7A2A] transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              to="/careers"
              className="text-xs text-[#B9C7D6]/70 hover:text-[#FF7A2A] transition-colors duration-200"
            >
              Careers
            </Link>
            <Link
              to="/apply"
              className="text-xs text-[#B9C7D6]/70 hover:text-[#FF7A2A] transition-colors duration-200"
            >
              Contact
            </Link>
          </nav>

          <p className="text-xs text-[#9FB0C8]/50" data-testid="footer-copyright">
            &copy; 2025 <span className="font-semibold text-white/60">Project P</span> Innovations. All rights reserved.
          </p>

          <div className="flex items-center gap-4" data-testid="footer-social">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#B9C7D6]/40 hover:text-[#FF7A2A] transition-colors duration-200"
              aria-label="Twitter"
            >
              <Twitter size={15} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#B9C7D6]/40 hover:text-[#FF7A2A] transition-colors duration-200"
              aria-label="LinkedIn"
            >
              <Linkedin size={15} />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#B9C7D6]/40 hover:text-[#FF7A2A] transition-colors duration-200"
              aria-label="GitHub"
            >
              <Github size={15} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
