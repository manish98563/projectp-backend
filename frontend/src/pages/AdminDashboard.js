import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import {
  Briefcase,
  Users,
  Mail,
  Plus,
  Trash2,
  Edit3,
  LogOut,
  FileText,
  Download,
  X,
  Loader2,
  ChevronDown,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function getAuthHeaders() {
  const token = localStorage.getItem("admin_token");
  return { Authorization: `Bearer ${token}` };
}

// --- Job Form Modal ---
function JobFormModal({ job, onClose, onSaved }) {
  const isEdit = !!job;
  const [form, setForm] = useState({
    title: job?.title || "",
    location: job?.location || "",
    seniority: job?.seniority || "Mid-Level",
    description: job?.description || "",
    tags: job?.tags?.join(", ") || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.location || !form.description) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        location: form.location,
        seniority: form.seniority,
        description: form.description,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      if (isEdit) {
        await axios.put(`${API}/admin/jobs/${job.id}`, payload, { headers: getAuthHeaders() });
        toast.success("Job updated!");
      } else {
        await axios.post(`${API}/admin/jobs`, payload, { headers: getAuthHeaders() });
        toast.success("Job created!");
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save job.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 w-full max-w-lg relative"
        data-testid="job-form-modal"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#9FB0C8] hover:text-white"
          data-testid="close-job-modal"
        >
          <X size={18} />
        </button>
        <h2 className="text-lg font-bold text-white mb-6">
          {isEdit ? "Edit Job" : "Create Job"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-[#9FB0C8] uppercase tracking-wider mb-1 block">
              Title *
            </label>
            <input
              data-testid="job-title-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="glass-input w-full px-4 py-2.5 text-sm"
              placeholder="e.g. Senior AI Engineer"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#9FB0C8] uppercase tracking-wider mb-1 block">
                Location *
              </label>
              <input
                data-testid="job-location-input"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="glass-input w-full px-4 py-2.5 text-sm"
                placeholder="e.g. Remote"
              />
            </div>
            <div>
              <label className="text-xs text-[#9FB0C8] uppercase tracking-wider mb-1 block">
                Seniority
              </label>
              <select
                data-testid="job-seniority-input"
                value={form.seniority}
                onChange={(e) => setForm({ ...form, seniority: e.target.value })}
                className="glass-input w-full px-4 py-2.5 text-sm"
              >
                <option value="Junior">Junior</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-[#9FB0C8] uppercase tracking-wider mb-1 block">
              Description *
            </label>
            <textarea
              data-testid="job-description-input"
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="glass-input w-full px-4 py-2.5 text-sm resize-none"
              placeholder="Job description..."
            />
          </div>
          <div>
            <label className="text-xs text-[#9FB0C8] uppercase tracking-wider mb-1 block">
              Tags (comma separated)
            </label>
            <input
              data-testid="job-tags-input"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="glass-input w-full px-4 py-2.5 text-sm"
              placeholder="Python, AI, React"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            data-testid="save-job-btn"
            className="w-full py-3 bg-[#FF7A2A] text-white font-medium text-sm rounded-full hover:scale-[1.02] transition-transform duration-[180ms] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isEdit ? (
              "Update Job"
            ) : (
              "Create Job"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// --- Main Dashboard ---
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("jobs");
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      const [jobsRes, appsRes, emailsRes] = await Promise.all([
        axios.get(`${API}/jobs`),
        axios.get(`${API}/admin/applications`, { headers }),
        axios.get(`${API}/admin/email-logs`, { headers }),
      ]);
      setJobs(jobsRes.data);
      setApplications(appsRes.data);
      setEmailLogs(emailsRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("admin_token");
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchData();
  }, [navigate, fetchData]);

  const deleteJob = async (id) => {
    if (!window.confirm("Delete this job posting?")) return;
    try {
      await axios.delete(`${API}/admin/jobs/${id}`, { headers: getAuthHeaders() });
      toast.success("Job deleted.");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete job.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
  };

  const tabs = [
    { id: "jobs", label: "Jobs", icon: Briefcase, count: jobs.length },
    { id: "applications", label: "Applications", icon: Users, count: applications.length },
    { id: "emails", label: "Email Logs", icon: Mail, count: emailLogs.length },
  ];

  return (
    <main data-testid="admin-dashboard" className="min-h-screen bg-[#071020]">
      {/* Admin header */}
      <header className="h-16 border-b border-white/[0.06] bg-[#071020]/90 backdrop-blur-[14px] flex items-center px-6 justify-between">
        <div className="flex items-center gap-3">
          <svg width="28" height="32" viewBox="0 0 36 40" fill="none">
            <path d="M18 2L33.5885 10V26L18 34L2.41154 26V10L18 2Z" stroke="#FF7A2A" strokeWidth="2.5" fill="none" />
            <text x="11" y="24" fill="white" fontSize="16" fontWeight="700" fontFamily="Inter, sans-serif">P</text>
          </svg>
          <span className="text-sm font-medium text-white">
            <span className="font-semibold">Project P</span>{" "}
            <span className="text-[#9FB0C8] font-light">Admin</span>
          </span>
        </div>
        <button
          data-testid="admin-logout"
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-[#B9C7D6] hover:text-white transition-colors duration-200"
        >
          <LogOut size={16} />
          Logout
        </button>
      </header>

      <div className="max-w-[1180px] mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {tabs.map((t) => (
            <div key={t.id} className="glass-card p-5" data-testid={`stat-${t.id}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#9FB0C8] uppercase tracking-wider">{t.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{t.count}</p>
                </div>
                <t.icon size={24} className="text-[#FF7A2A]/60" />
              </div>
            </div>
          ))}
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 mb-6 glass-card p-1 w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              data-testid={`tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
                tab === t.id
                  ? "bg-[#FF7A2A] text-white font-medium"
                  : "text-[#B9C7D6] hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="glass-card p-12 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-[#FF7A2A]" />
          </div>
        ) : (
          <>
            {/* Jobs tab */}
            {tab === "jobs" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Job Postings</h2>
                  <button
                    data-testid="add-job-btn"
                    onClick={() => {
                      setEditingJob(null);
                      setShowJobModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#FF7A2A] text-white text-sm font-medium rounded-full hover:scale-[1.02] transition-transform duration-[180ms]"
                  >
                    <Plus size={16} />
                    Add Job
                  </button>
                </div>
                <div className="space-y-3">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      data-testid={`admin-job-${job.id}`}
                      className="glass-card p-5 flex items-center justify-between"
                    >
                      <div>
                        <h3 className="text-sm font-semibold text-white">{job.title}</h3>
                        <p className="text-xs text-[#9FB0C8] mt-1">
                          {job.location} · {job.seniority} · {job.tags.join(", ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          data-testid={`edit-job-${job.id}`}
                          onClick={() => {
                            setEditingJob(job);
                            setShowJobModal(true);
                          }}
                          className="p-2 rounded-lg text-[#B9C7D6] hover:text-white hover:bg-white/[0.06] transition-colors duration-200"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          data-testid={`delete-job-${job.id}`}
                          onClick={() => deleteJob(job.id)}
                          className="p-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {jobs.length === 0 && (
                    <div className="glass-card p-8 text-center text-[#9FB0C8] text-sm">
                      No job postings yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Applications tab */}
            {tab === "applications" && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">Applications</h2>
                <div className="space-y-3">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      data-testid={`application-${app.id}`}
                      className="glass-card p-5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-white">{app.name}</h3>
                          <p className="text-xs text-[#9FB0C8] mt-0.5">{app.email}</p>
                          {app.job_title && (
                            <span className="inline-block text-xs text-[#FF7A2A] bg-[#FF7A2A]/10 px-2 py-0.5 rounded mt-2">
                              {app.job_title}
                            </span>
                          )}
                          {app.message && (
                            <p className="text-xs text-[#B9C7D6] mt-2 max-w-md">{app.message}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={`${API}/admin/download-resume/${app.resume_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-testid={`download-resume-${app.id}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#FF7A2A] bg-[#FF7A2A]/10 rounded-lg hover:bg-[#FF7A2A]/20 transition-colors duration-200"
                          >
                            <Download size={12} />
                            Resume
                          </a>
                        </div>
                      </div>
                      <p className="text-[10px] text-[#9FB0C8]/50 mt-3">
                        {new Date(app.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                  {applications.length === 0 && (
                    <div className="glass-card p-8 text-center text-[#9FB0C8] text-sm">
                      No applications received yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Email logs tab */}
            {tab === "emails" && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">
                  Email Logs <span className="text-xs text-[#9FB0C8] font-normal">(MOCKED)</span>
                </h2>
                <div className="space-y-3">
                  {emailLogs.map((log) => (
                    <div
                      key={log.id}
                      data-testid={`email-log-${log.id}`}
                      className="glass-card p-5"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Mail size={14} className="text-[#FF7A2A]" />
                        <span className="text-sm font-medium text-white">{log.subject}</span>
                      </div>
                      <p className="text-xs text-[#9FB0C8]">To: {log.to}</p>
                      <p className="text-xs text-[#B9C7D6] mt-2 whitespace-pre-line">{log.body}</p>
                      <p className="text-[10px] text-[#9FB0C8]/50 mt-2">
                        {new Date(log.sent_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                  {emailLogs.length === 0 && (
                    <div className="glass-card p-8 text-center text-[#9FB0C8] text-sm">
                      No emails sent yet.
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Job modal */}
      {showJobModal && (
        <JobFormModal
          job={editingJob}
          onClose={() => {
            setShowJobModal(false);
            setEditingJob(null);
          }}
          onSaved={() => {
            setShowJobModal(false);
            setEditingJob(null);
            fetchData();
          }}
        />
      )}
    </main>
  );
}
