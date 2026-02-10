import { Link } from "react-router-dom";
import { Github, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer
      data-testid="main-footer"
      className="h-auto md:h-24 bg-white/[0.02] backdrop-blur-[14px] border-t border-white/[0.06]"
    >
      <div className="max-w-[1180px] mx-auto px-7 h-full flex flex-col md:flex-row items-center justify-between py-6 md:py-0 gap-4 md:gap-0">
        <nav className="flex items-center gap-6" data-testid="footer-links">
          <Link
            to="/careers"
            className="text-sm text-[#B9C7D6] hover:text-[#FF7A2A] transition-colors duration-200"
          >
            Careers
          </Link>
          <Link
            to="/apply"
            className="text-sm text-[#B9C7D6] hover:text-[#FF7A2A] transition-colors duration-200"
          >
            Contact
          </Link>
        </nav>

        <p className="text-xs text-[#9FB0C8]/60" data-testid="footer-copyright">
          &copy; 2025 <span className="font-semibold text-white/70">Project P</span> Innovations. All rights reserved.
        </p>

        <div className="flex items-center gap-4" data-testid="footer-social">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#B9C7D6]/50 hover:text-[#FF7A2A] transition-colors duration-200"
            aria-label="Twitter"
          >
            <Twitter size={16} />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#B9C7D6]/50 hover:text-[#FF7A2A] transition-colors duration-200"
            aria-label="LinkedIn"
          >
            <Linkedin size={16} />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#B9C7D6]/50 hover:text-[#FF7A2A] transition-colors duration-200"
            aria-label="GitHub"
          >
            <Github size={16} />
          </a>
        </div>
      </div>
    </footer>
  );
}
