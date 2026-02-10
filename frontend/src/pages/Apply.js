import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { Upload, FileText, X, CheckCircle, Loader2 } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 0.8, 0.2, 1] },
};

export default function Apply() {
  const { jobId } = useParams();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(jobId || "");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    axios.get(`${API}/jobs`).then((res) => setJobs(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (jobId) setSelectedJob(jobId);
  }, [jobId]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const validateFile = (f) => {
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["pdf", "doc", "docx"].includes(ext)) {
      toast.error("Invalid file type. Please upload PDF, DOC, or DOCX.");
      return false;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.");
      return false;
    }
    return true;
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0] && validateFile(e.dataTransfer.files[0])) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files?.[0] && validateFile(e.target.files[0])) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !file) {
      toast.error("Please fill in all required fields and upload a resume.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("message", form.message);
      if (selectedJob) formData.append("job_id", selectedJob);
      formData.append("resume", file);

      await axios.post(`${API}/apply`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSubmitted(true);
      toast.success("Application submitted successfully!");
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to submit application.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main data-testid="apply-page" className="pt-[72px] min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 text-center max-w-md mx-auto"
        >
          <CheckCircle size={48} className="text-[#FF7A2A] mx-auto mb-5" />
          <h2 className="text-2xl font-bold text-white mb-3" data-testid="success-message">
            Application Received
          </h2>
          <p className="text-[#B9C7D6] text-sm leading-relaxed">
            Thank you for your interest in{" "}
            <span className="font-semibold text-white">Project P</span> Innovations.
            We'll review your application and get back to you soon.
          </p>
        </motion.div>
      </main>
    );
  }

  return (
    <main data-testid="apply-page" className="pt-[72px] min-h-screen">
      {/* Page header */}
      <section className="hero-gradient relative py-20 md:py-24">
        <div className="absolute inset-0 grid-overlay pointer-events-none" />
        <div className="max-w-[1180px] mx-auto px-7 relative z-10">
          <motion.div {...fadeUp}>
            <p className="text-[#FF7A2A] text-sm font-medium tracking-widest uppercase mb-4">
              Get In Touch
            </p>
            <h1
              data-testid="apply-headline"
              className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4"
            >
              Work With Us
            </h1>
            <p className="text-base md:text-lg text-[#B9C7D6] max-w-xl font-light">
              Whether you're applying for a role or want to discuss a project, we'd love to hear
              from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form section */}
      <section className="py-16 md:py-20">
        <div className="max-w-[720px] mx-auto px-7">
          <motion.form
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 0.8, 0.2, 1] }}
            onSubmit={handleSubmit}
            data-testid="apply-form"
            className="glass-card p-8 md:p-10 space-y-6"
          >
            {/* Name */}
            <div>
              <label className="text-xs text-[#9FB0C8] uppercase tracking-wider mb-2 block">
                Name <span className="text-[#FF7A2A]">*</span>
              </label>
              <input
                data-testid="input-name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
                className="glass-input w-full px-4 py-3 text-sm"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-xs text-[#9FB0C8] uppercase tracking-wider mb-2 block">
                Email <span className="text-[#FF7A2A]">*</span>
              </label>
              <input
                data-testid="input-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="glass-input w-full px-4 py-3 text-sm"
              />
            </div>

            {/* Job selection */}
            <div>
              <label className="text-xs text-[#9FB0C8] uppercase tracking-wider mb-2 block">
                Position (Optional)
              </label>
              <select
                data-testid="input-job"
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="glass-input w-full px-4 py-3 text-sm"
              >
                <option value="">General Application</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} — {job.location}
                  </option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="text-xs text-[#9FB0C8] uppercase tracking-wider mb-2 block">
                Message
              </label>
              <textarea
                data-testid="input-message"
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tell us about yourself or your project..."
                className="glass-input w-full px-4 py-3 text-sm resize-none"
              />
            </div>

            {/* File upload */}
            <div>
              <label className="text-xs text-[#9FB0C8] uppercase tracking-wider mb-2 block">
                Resume <span className="text-[#FF7A2A]">*</span>
              </label>
              <div
                data-testid="file-dropzone"
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors duration-200 cursor-pointer ${
                  dragActive
                    ? "border-[#FF7A2A] bg-[#FF7A2A]/5"
                    : file
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
                style={{ minHeight: "120px" }}
                onClick={() => document.getElementById("file-input").click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  data-testid="file-input"
                />
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText size={20} className="text-green-400" />
                    <span className="text-sm text-white">{file.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="p-1 rounded-full hover:bg-white/10"
                      data-testid="remove-file"
                    >
                      <X size={14} className="text-[#9FB0C8]" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={24} className="text-[#9FB0C8]/60" />
                    <p className="text-sm text-[#9FB0C8]">
                      Drop your resume here or{" "}
                      <span className="text-[#FF7A2A] font-medium">browse</span>
                    </p>
                    <p className="text-xs text-[#9FB0C8]/50">PDF, DOC, DOCX — Max 5MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              data-testid="submit-application"
              className="w-full py-3.5 bg-[#FF7A2A] text-white font-medium text-sm rounded-full hover:scale-[1.02] transition-transform duration-[180ms] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#FF7A2A]/20 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </button>
          </motion.form>
        </div>
      </section>
    </main>
  );
}
