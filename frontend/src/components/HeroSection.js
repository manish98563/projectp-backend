import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 0.8, 0.2, 1] },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};

export default function HeroSection() {
  const prefersReduced = useReducedMotion();
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    // Check if video file exists
    const video = videoRef.current;
    if (video) {
      video.addEventListener("canplaythrough", () => setVideoLoaded(true));
      video.addEventListener("error", () => setVideoError(true));
    }
    return () => {
      if (video) {
        video.removeEventListener("canplaythrough", () => setVideoLoaded(true));
        video.removeEventListener("error", () => setVideoError(true));
      }
    };
  }, []);

  return (
    <section
      data-testid="hero-section"
      className="relative min-h-[calc(100vh-72px)] flex items-center overflow-hidden"
    >
      {/* === BACKGROUND LAYER === */}
      <div className="absolute inset-0 z-0">
        {/* Video background (loads if mp4 exists, otherwise CSS fallback shows) */}
        {!videoError && (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            data-testid="hero-video"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              videoLoaded ? "opacity-100" : "opacity-0"
            }`}
          >
            <source src="/videos/ai-background.mp4" type="video/mp4" />
          </video>
        )}

        {/* CSS Animated Gradient Fallback (always renders behind video) */}
        <div
          className={`absolute inset-0 hero-gradient-bg ${
            videoLoaded ? "opacity-0" : "opacity-100"
          } transition-opacity duration-1000`}
        />

        {/* Particle overlay */}
        <div className="absolute inset-0 hero-particles pointer-events-none" />

        {/* Floating orbs */}
        {!prefersReduced && (
          <>
            <div className="absolute top-[20%] left-[15%] w-[300px] h-[300px] bg-cyan-500/[0.03] rounded-full blur-[80px] animate-float-slow pointer-events-none" />
            <div className="absolute bottom-[25%] right-[20%] w-[250px] h-[250px] bg-[#FF7A2A]/[0.04] rounded-full blur-[100px] animate-float-slower pointer-events-none" />
            <div className="absolute top-[50%] right-[40%] w-[200px] h-[200px] bg-blue-500/[0.03] rounded-full blur-[60px] animate-float-reverse pointer-events-none" />
          </>
        )}

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-[#071020]/40" />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Vignette edges */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, transparent 50%, #071020 100%)`,
          }}
        />
      </div>

      {/* === CONTENT === */}
      <div className="max-w-[1180px] mx-auto px-7 py-20 md:py-0 w-full relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center lg:text-left lg:mx-0"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.h1
            variants={fadeUp}
            data-testid="hero-headline"
            className="text-[44px] md:text-[72px] lg:text-[96px] font-bold leading-[0.98] tracking-[-1px] text-white mb-8"
          >
            Design the{" "}
            <br className="hidden sm:block" />
            future of{" "}
            <br className="hidden sm:block" />
            <span className="text-[#FF7A2A]">AI products.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            data-testid="hero-subtext"
            className="text-base md:text-lg text-[#B9C7D6] max-w-[620px] mb-10 leading-relaxed font-light lg:mx-0 mx-auto"
          >
            AI product services, AI solutions &amp; consultancy.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center gap-[18px] justify-center lg:justify-start"
          >
            <Link
              to="/careers"
              data-testid="cta-explore-services"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#FF7A2A] text-white font-medium text-sm rounded-full hover:scale-[1.02] active:scale-[0.98] transition-transform duration-[180ms] shadow-lg shadow-[#FF7A2A]/25"
            >
              Explore Services
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/apply"
              data-testid="cta-work-with-us"
              className="inline-flex items-center gap-2 px-7 py-3.5 backdrop-blur-[14px] bg-white/[0.06] border border-white/[0.08] text-[#B9C7D6] font-medium text-sm rounded-full hover:text-white hover:bg-white/[0.10] hover:border-white/[0.12] transition-colors duration-200"
            >
              Work With Us
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
