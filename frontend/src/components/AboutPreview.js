import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Users, Rocket, Globe } from "lucide-react";

const stats = [
  { icon: Users, value: "50+", label: "AI Projects" },
  { icon: Rocket, value: "98%", label: "Client Satisfaction" },
  { icon: Globe, value: "12+", label: "Countries" },
];

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6, ease: [0.22, 0.8, 0.2, 1] },
};

export default function AboutPreview() {
  return (
    <section data-testid="about-section" className="py-24 md:py-32 relative">
      {/* Subtle glow */}
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#FF7A2A]/[0.02] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1180px] mx-auto px-7 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          {/* Left text */}
          <motion.div {...fadeUp} className="lg:w-1/2">
            <p className="text-[#FF7A2A] text-sm font-medium tracking-widest uppercase mb-4">
              About Us
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
              Building the next wave of AI innovation
            </h2>
            <p className="text-[#B9C7D6] text-base leading-relaxed mb-8 max-w-lg">
              <span className="font-semibold text-white">Project P</span> Innovations is a
              forward-thinking AI consultancy helping businesses design, build, and scale
              intelligent products. We combine deep technical expertise with human-centered design
              to deliver solutions that matter.
            </p>
            <Link
              to="/apply"
              data-testid="about-cta"
              className="inline-flex items-center gap-2 text-[#FF7A2A] text-sm font-medium hover:gap-3 transition-all duration-200"
            >
              Join our team
              <ArrowRight size={16} />
            </Link>
          </motion.div>

          {/* Right stats */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 0.8, 0.2, 1] }}
            className="lg:w-1/2"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  data-testid={`stat-card-${i}`}
                  className="glass-card p-6 text-center"
                >
                  <stat.icon size={28} className="text-[#FF7A2A] mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-sm text-[#9FB0C8]">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
