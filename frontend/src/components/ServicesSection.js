import { motion } from "framer-motion";
import { Cpu, Zap, Users, ArrowUpRight } from "lucide-react";

const services = [
  {
    icon: Cpu,
    title: "AI Products",
    description:
      "From concept to production — we design and build intelligent products powered by cutting-edge AI. Custom LLMs, computer vision, recommendation engines, and more.",
    cta: "Learn more",
  },
  {
    icon: Zap,
    title: "AI Solutions & Automation",
    description:
      "Streamline operations and unlock efficiency with tailored AI automation. We integrate intelligent workflows, data pipelines, and predictive analytics into your business.",
    cta: "Learn more",
  },
  {
    icon: Users,
    title: "Talent & Hiring Consultancy",
    description:
      "Find and retain exceptional AI talent. Our consultancy helps you build world-class teams with strategic hiring, skills assessment, and workforce planning.",
    cta: "Learn more",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6, ease: [0.22, 0.8, 0.2, 1] },
};

export default function ServicesSection() {
  return (
    <section data-testid="services-section" className="py-24 md:py-32 relative">
      <div className="max-w-[1180px] mx-auto px-7">
        <motion.div {...fadeUp} className="mb-16">
          <p className="text-[#FF7A2A] text-sm font-medium tracking-widest uppercase mb-4">
            What We Do
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            Our Services
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: [0.22, 0.8, 0.2, 1],
              }}
              data-testid={`service-card-${i}`}
              className="glass-card glass-card-hover p-7 flex flex-col justify-between group"
              style={{ minHeight: "280px" }}
            >
              <div>
                <div className="p-3 rounded-xl bg-[#FF7A2A]/10 w-fit mb-6">
                  <service.icon size={28} className="text-[#FF7A2A]" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-[#FF7A2A] transition-colors duration-200">
                  {service.title}
                </h3>
                <p className="text-sm text-[#B9C7D6] leading-relaxed">
                  {service.description}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.04]">
                <span className="inline-flex items-center gap-1.5 text-sm text-[#FF7A2A] font-medium cursor-pointer hover:gap-2.5 transition-all duration-200">
                  {service.cta}
                  <ArrowUpRight size={14} />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
