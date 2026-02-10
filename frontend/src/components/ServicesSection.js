import { motion } from "framer-motion";
import { Brain, Code2, Palette, LineChart, ArrowUpRight } from "lucide-react";

const services = [
  {
    icon: Brain,
    title: "AI Strategy",
    description: "Define your AI roadmap with data-driven insights and expert guidance for scalable growth.",
    cta: "Learn more",
  },
  {
    icon: Code2,
    title: "AI Development",
    description: "Custom AI solutions from prototyping to production — LLMs, computer vision, and beyond.",
    cta: "Learn more",
  },
  {
    icon: Palette,
    title: "Product Design",
    description: "Human-centered design for AI products that users love. From research to pixel-perfect interfaces.",
    cta: "Learn more",
  },
  {
    icon: LineChart,
    title: "Data & Analytics",
    description: "Transform raw data into actionable intelligence with modern pipelines and real-time dashboards.",
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
            Services
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.08,
                ease: [0.22, 0.8, 0.2, 1],
              }}
              data-testid={`service-card-${i}`}
              className="glass-card glass-card-hover p-6 flex flex-col justify-between"
              style={{ minHeight: "220px" }}
            >
              <div>
                <div className="p-2.5 rounded-xl bg-[#FF7A2A]/10 w-fit mb-5">
                  <service.icon size={28} className="text-[#FF7A2A]" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{service.title}</h3>
                <p className="text-sm text-[#B9C7D6] leading-relaxed line-clamp-2">
                  {service.description}
                </p>
              </div>
              <div className="mt-4">
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
