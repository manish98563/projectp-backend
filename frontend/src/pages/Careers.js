import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  MapPin,
  Briefcase,
  ArrowRight,
  Filter,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_URL || ''}/api`;

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 0.8, 0.2, 1] },
};

export default function Careers() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationFilter, setLocationFilter] = useState("");
  const [seniorityFilter, setSeniorityFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API}/jobs`);
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const locations = [...new Set(jobs.map((j) => j.location))];
  const seniorities = [...new Set(jobs.map((j) => j.seniority))];

  const filtered = jobs.filter((job) => {
    if (locationFilter && job.location !== locationFilter) return false;
    if (seniorityFilter && job.seniority !== seniorityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        job.title.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q) ||
        job.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <main data-testid="careers-page" className="pt-[72px] min-h-screen">
      {/* Header area */}
      <section className="hero-gradient relative py-20 md:py-28">
        <div className="absolute inset-0 grid-overlay pointer-events-none" />
        <div className="max-w-[1180px] mx-auto px-7 relative z-10">
          <motion.div {...fadeUp}>
            <p className="text-[#FF7A2A] text-sm font-medium tracking-widest uppercase mb-4">
              Careers
            </p>
            <h1
              data-testid="careers-headline"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4"
            >
              Join our team
            </h1>
            <p className="text-base md:text-lg text-[#B9C7D6] max-w-xl font-light">
              Help us shape the future of AI. We're looking for exceptional people who want to make
              a difference.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-[1180px] mx-auto px-7">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar filters */}
            <aside className="lg:w-64 shrink-0">
              <div className="glass-card p-5 sticky top-[88px]">
                <button
                  data-testid="filter-toggle"
                  className="lg:hidden flex items-center justify-between w-full text-white font-medium text-sm mb-4"
                  onClick={() => setFilterOpen(!filterOpen)}
                >
                  <span className="flex items-center gap-2">
                    <Filter size={16} /> Filters
                  </span>
                  {filterOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                <div className={`${filterOpen ? "block" : "hidden"} lg:block space-y-5`}>
                  {/* Search */}
                  <div>
                    <label className="text-xs text-[#9FB0C8] uppercase tracking-wider mb-2 block">
                      Search
                    </label>
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9FB0C8]/50" />
                      <input
                        data-testid="search-input"
                        type="text"
                        placeholder="Search roles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="glass-input w-full pl-9 pr-3 py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  {/* Location filter */}
                  <div>
                    <label className="text-xs text-[#9FB0C8] uppercase tracking-wider mb-2 block">
                      Location
                    </label>
                    <select
                      data-testid="location-filter"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="glass-input w-full px-3 py-2.5 text-sm"
                    >
                      <option value="">All Locations</option>
                      {locations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Seniority filter */}
                  <div>
                    <label className="text-xs text-[#9FB0C8] uppercase tracking-wider mb-2 block">
                      Seniority
                    </label>
                    <select
                      data-testid="seniority-filter"
                      value={seniorityFilter}
                      onChange={(e) => setSeniorityFilter(e.target.value)}
                      className="glass-input w-full px-3 py-2.5 text-sm"
                    >
                      <option value="">All Levels</option>
                      {seniorities.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(locationFilter || seniorityFilter || searchQuery) && (
                    <button
                      data-testid="clear-filters"
                      onClick={() => {
                        setLocationFilter("");
                        setSeniorityFilter("");
                        setSearchQuery("");
                      }}
                      className="text-xs text-[#FF7A2A] hover:underline"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>
            </aside>

            {/* Job listings */}
            <div className="flex-1 max-w-[640px]">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="glass-card p-6 animate-pulse">
                      <div className="h-5 bg-white/10 rounded w-1/2 mb-3" />
                      <div className="h-3 bg-white/5 rounded w-1/3 mb-4" />
                      <div className="h-3 bg-white/5 rounded w-full" />
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="glass-card p-12 text-center" data-testid="no-jobs-message">
                  <p className="text-[#9FB0C8]">No positions match your criteria.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filtered.map((job, i) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.06 }}
                      data-testid={`job-card-${i}`}
                      className="glass-card glass-card-hover p-6 group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white group-hover:text-[#FF7A2A] transition-colors duration-200">
                          {job.title}
                        </h3>
                        <span className="text-xs font-medium text-[#FF7A2A] bg-[#FF7A2A]/10 px-2.5 py-1 rounded-full shrink-0 ml-3">
                          {job.seniority}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-[#9FB0C8] mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase size={12} /> {job.type || "Full-time"}
                        </span>
                      </div>

                      <p className="text-sm text-[#B9C7D6] leading-relaxed mb-4 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1.5">
                          {job.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-medium text-[#9FB0C8] bg-white/[0.04] px-2 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <Link
                          to={`/apply/${job.id}`}
                          data-testid={`apply-btn-${i}`}
                          className="inline-flex items-center gap-1.5 text-sm text-[#FF7A2A] font-medium hover:gap-2.5 transition-all duration-200"
                        >
                          Apply
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
