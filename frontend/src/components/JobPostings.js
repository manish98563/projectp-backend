import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
import { MapPin, Briefcase, ArrowRight, Clock } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_URL || ''}/api`;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 0.8, 0.2, 1] },
  },
};

export default function JobPostings() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API}/jobs`)
      .then((res) => setJobs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-24 md:py-32">
        <div className="max-w-[1180px] mx-auto px-7">
          <div className="text-center mb-16">
            <div className="h-4 w-32 bg-white/5 rounded mx-auto mb-4 animate-pulse" />
            <div className="h-10 w-64 bg-white/5 rounded mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card p-8 animate-pulse" style={{ minHeight: "240px" }}>
                <div className="h-6 bg-white/5 rounded w-3/4 mb-4" />
                <div className="h-3 bg-white/5 rounded w-1/2 mb-6" />
                <div className="h-3 bg-white/5 rounded w-full mb-2" />
                <div className="h-3 bg-white/5 rounded w-5/6" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (jobs.length === 0) {
    return (
      <section data-testid="job-postings-section" className="py-24 md:py-32">
        <div className="max-w-[1180px] mx-auto px-7 text-center">
          <p className="text-[#FF7A2A] text-sm font-medium tracking-widest uppercase mb-4">Careers</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">Open Positions</h2>
          <p className="text-[#B9C7D6] text-base">No open positions at the moment. Check back soon!</p>
        </div>
      </section>
    );
  }

  const displayJobs = jobs.slice(0, 6);

  return (
    <section data-testid="job-postings-section" className="py-24 md:py-32 relative">
      <div className="max-w-[1180px] mx-auto px-7">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.22, 0.8, 0.2, 1] }}
          className="text-center mb-16"
        >
          <p className="text-[#FF7A2A] text-sm font-medium tracking-widest uppercase mb-4">
            Careers
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Open Positions
          </h2>
          <p className="text-base md:text-lg text-[#B9C7D6] max-w-2xl mx-auto font-light">
            Join our team and help shape the future of AI innovation
          </p>
        </motion.div>

        {/* Jobs grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {displayJobs.map((job) => (
            <motion.div
              key={job.id}
              variants={cardVariants}
              data-testid={`home-job-card-${job.id}`}
              className="glass-card p-7 flex flex-col group cursor-pointer hover:border-[#FF7A2A]/30 hover:translate-y-[-8px] hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)] transition-all duration-300"
              style={{ minHeight: "260px" }}
            >
              {/* Title + badge */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-lg font-semibold text-white group-hover:text-[#FF7A2A] transition-colors duration-200 leading-snug">
                  {job.title}
                </h3>
                <span className="shrink-0 inline-block bg-[#FF7A2A]/15 text-[#FF7A2A] px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider whitespace-nowrap">
                  {job.type || "Full-time"}
                </span>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-4 mb-4 text-xs text-[#9FB0C8]">
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} strokeWidth={1.5} /> {job.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase size={13} strokeWidth={1.5} /> {job.seniority}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-[#B9C7D6] leading-relaxed mb-5 line-clamp-2 flex-grow-0">
                {job.description}
              </p>

              {/* Tags */}
              {job.tags && job.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {job.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] text-[#9FB0C8] bg-white/[0.05] border border-white/[0.06] px-2.5 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Apply link */}
              <Link
                to={`/apply/${job.id}`}
                className="mt-auto w-full py-3 border border-[#FF7A2A]/30 text-[#FF7A2A] text-sm font-semibold rounded-lg text-center hover:bg-[#FF7A2A]/10 hover:border-[#FF7A2A] transition-all duration-200 flex items-center justify-center gap-2"
                data-testid={`home-job-apply-${job.id}`}
              >
                View Details
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* View all CTA */}
        <div className="text-center">
          <Link
            to="/careers"
            data-testid="view-all-openings"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF7A2A] text-white font-semibold text-sm rounded-xl hover:scale-[1.03] active:scale-[0.98] transition-transform duration-200 shadow-lg shadow-[#FF7A2A]/25"
          >
            View All Openings
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
