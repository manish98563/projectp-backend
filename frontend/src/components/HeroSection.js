import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Brain, Cpu, BarChart3, Layers, Sparkles, Zap } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 0.8, 0.2, 1] },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const miniCards = [
  { icon: Brain, label: "AI Strategy", delay: 0 },
  { icon: Cpu, label: "ML Pipelines", delay: 0.1 },
  { icon: BarChart3, label: "Data Analytics", delay: 0.2 },
  { icon: Layers, label: "Architecture", delay: 0.3 },
  { icon: Sparkles, label: "Gen AI", delay: 0.4 },
  { icon: Zap, label: "Automation", delay: 0.5 },
];

export default function HeroSection() {
  return (
    <section
      data-testid="hero-section"
      className="hero-gradient relative min-h-[calc(100vh-72px)] flex items-center overflow-hidden"
    >
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-overlay pointer-events-none" />

      {/* Subtle radial glow */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-[#FF7A2A]/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1180px] mx-auto px-7 py-20 md:py-0 w-full relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-8">
          {/* Left column - 55% */}
          <motion.div
            className="lg:w-[55%] w-full"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.h1
              variants={fadeUp}
              data-testid="hero-headline"
              className="text-[44px] md:text-[72px] lg:text-[96px] font-bold leading-[0.98] tracking-[-1px] text-white mb-8"
            >
              Design the
              <br />
              future of
              <br />
              <span className="text-[#FF7A2A]">AI products.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              data-testid="hero-subtext"
              className="text-base md:text-lg text-[#B9C7D6] max-w-[620px] mb-10 leading-relaxed font-light"
            >
              AI product services, AI solutions &amp; consultancy.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-[18px]">
              <Link
                to="/careers"
                data-testid="cta-explore-services"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#FF7A2A] text-white font-medium text-sm rounded-full hover:scale-[1.02] transition-transform duration-[180ms] shadow-lg shadow-[#FF7A2A]/20"
              >
                Explore Services
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/apply"
                data-testid="cta-work-with-us"
                className="inline-flex items-center gap-2 px-7 py-3.5 glass-card text-[#B9C7D6] font-medium text-sm rounded-full hover:text-white hover:bg-white/[0.08] transition-colors duration-200"
              >
                Work With Us
              </Link>
            </motion.div>
          </motion.div>

          {/* Right column - mini cards grid */}
          <div className="lg:w-[40%] w-full">
            <div className="grid grid-cols-2 gap-4">
              {miniCards.map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.3 + card.delay,
                    ease: [0.22, 0.8, 0.2, 1],
                  }}
                  data-testid={`mini-card-${i}`}
                  className={`glass-card glass-card-hover p-5 flex flex-col items-start gap-3 ${
                    i % 3 === 1 ? "mt-6" : ""
                  }`}
                  style={{ minHeight: "140px", minWidth: "0" }}
                >
                  <div className="p-2 rounded-lg bg-[#FF7A2A]/10">
                    <card.icon size={24} className="text-[#FF7A2A]" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-medium text-white/90">{card.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
