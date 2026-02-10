import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import ParticleBackground from "@/components/ParticleBackground";

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
    const video = videoRef.current;
    if (video) {
      const onCanPlay = () => setVideoLoaded(true);
      const onError = () => setVideoError(true);
      video.addEventListener("canplaythrough", onCanPlay);
      video.addEventListener("error", onError);
      return () => {
        video.removeEventListener("canplaythrough", onCanPlay);
        video.removeEventListener("error", onError);
      };
    }
  }, []);

  return (
    <section
      data-testid="hero-section"
      className="relative min-h-[calc(100vh-72px)] flex items-center overflow-hidden"
    >
      {/* === BACKGROUND LAYERS === */}
      <div className="absolute inset-0 z-0">
        {/* Base gradient (always renders) */}
        <div className="absolute inset-0 hero-gradient-bg" />

        {/* Video background (loads if mp4 exists) */}
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
            style={{ zIndex: 1 }}
          >
            <source src="/videos/ai-background.mp4" type="video/mp4" />
          </video>
        )}

        {/* Canvas particle system — renders OVER gradient, UNDER content */}
        {!videoLoaded && <ParticleBackground />}

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            zIndex: 2,
          }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, transparent 40%, #071020 100%)",
            zIndex: 3,
          }}
        />

        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 bg-[#071020]/20 pointer-events-none" style={{ zIndex: 4 }} />
      </div>

      {/* === CONTENT === */}
      <div className="max-w-[1180px] mx-auto px-7 py-20 md:py-0 w-full relative" style={{ zIndex: 10 }}>
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
