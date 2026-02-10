import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  Download,
  X,
  Loader2,
  LayoutDashboard,
  FileText,
  ChevronRight,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_URL || ''}/api`;

function getAuthHeaders() {
  const token = localStorage.getItem("admin_token");
  return { Authorization: `Bearer ${token}` };
}

// ============ JOB FORM MODAL ============
function JobFormModal({ job, onClose, onSaved }) {
  const isEdit = !!job;
  const [form, setForm] = useState({
    title: job?.title || "",
    location: job?.location || "",
    type: job?.type || "Full-time",
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
        type: form.type,
        seniority: form.seniority,
        description: form.description,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      };
      if (isEdit) {
        await axios.put(`${API}/admin/jobs/${job.id}`, payload, { headers: getAuthHeaders() });
        toast.success("Job updated successfully!");
      } else {
        await axios.post(`${API}/admin/jobs`, payload, { headers: getAuthHeaders() });
        toast.success("Job created successfully!");
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save job.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card p-8 w-full max-w-[720px] relative max-h-[90vh] overflow-y-auto"
        data-testid="job-form-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">
            {isEdit ? "Edit Job" : "Create New Job"}
          </h2>
          <button onClick={onClose} className="text-[#9FB0C8] hover:text-white p-1" data-testid="close-job-modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs text-[#9FB0C8] uppercase tracking-wider mb-1.5 block">Job Title *</label>
            <input
              data-testid="job-title-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="glass-input w-full px-4 py-3 text-sm"
              placeholder="e.g., Senior AI Engineer"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#9FB0C8] uppercase tracking-wider mb-1.5 block">Location *</label>
              <input
                data-testid="job-location-input"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="glass-input w-full px-4 py-3 text-sm"
                placeholder="e.g., Remote / London"
                required
              />
            </div>
            <div>
              <label className="text-xs text-[#9FB0C8] uppercase tracking-wider mb-1.5 block">Type *</label>
              <select
                data-testid="job-type-input"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="glass-input w-full px-4 py-3 text-sm"
                required
              >
                <option value="">Select type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-[#9FB0C8] uppercase tracking-wider mb-1.5 block">Seniority *</label>
            <select
              data-testid="job-seniority-input"
              value={form.seniority}
              onChange={(e) => setForm({ ...form, seniority: e.target.value })}
              className="glass-input w-full px-4 py-3 text-sm"
              required
            >
              <option value="">Select seniority</option>
              <option value="Junior">Junior</option>
              <option value="Mid-Level">Mid-Level</option>
              <option value="Senior">Senior</option>
              <option value="Lead">Lead</option>
              <option value="Principal">Principal</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-[#9FB0C8] uppercase tracking-wider mb-1.5 block">Job Description *</label>
            <textarea
              data-testid="job-description-input"
              rows={6}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="glass-input w-full px-4 py-3 text-sm resize-none"
              placeholder="Detailed job description, responsibilities, requirements..."
              required
            />
          </div>

          <div>
            <label className="text-xs text-[#9FB0C8] uppercase tracking-wider mb-1.5 block">Tags (comma-separated)</label>
            <input
              data-testid="job-tags-input"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="glass-input w-full px-4 py-3 text-sm"
              placeholder="e.g., Python, TensorFlow, NLP, AWS"
            />
            <p className="text-[10px] text-[#9FB0C8]/50 mt-1">Separate tags with commas</p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-sm text-[#B9C7D6] bg-white/[0.04] border border-white/[0.06] rounded-xl hover:bg-white/[0.08] transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              data-testid="save-job-btn"
              className="flex-1 py-3 bg-[#FF7A2A] text-white font-medium text-sm rounded-xl hover:brightness-110 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : isEdit ? "Update Job" : "Create Job"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ============ SIDEBAR ============
function AdminSidebar({ activeSection, onNavigate }) {
  const navigate = useNavigate();
  const adminEmail = localStorage.getItem("admin_email") || "Admin";

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_email");
    navigate("/admin/login");
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "jobs", label: "Job Postings", icon: Briefcase },
    { id: "applications", label: "Applications", icon: FileText },
    { id: "emails", label: "Email Logs", icon: Mail },
  ];

  return (
    <aside
      data-testid="admin-sidebar"
      className="fixed left-0 top-0 bottom-0 w-[280px] bg-white/[0.03] border-r border-white/[0.06] flex flex-col z-40"
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/[0.04]">
        <Link to="/" className="flex items-center gap-3">
          <svg width="28" height="32" viewBox="0 0 36 40" fill="none">
            <path d="M18 2L33.5885 10V26L18 34L2.41154 26V10L18 2Z" stroke="white" strokeWidth="2" fill="none" />
          </svg>
          <span className="text-sm">
            <span className="font-semibold text-white">Project P</span>{" "}
            <span className="font-light text-[#9FB0C8] uppercase tracking-widest text-[9px]">Innovations</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            data-testid={`sidebar-${item.id}`}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors duration-200 text-left ${
              activeSection === item.id
                ? "bg-[#FF7A2A]/15 text-[#FF7A2A] font-medium"
                : "text-[#B9C7D6] hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <item.icon size={18} strokeWidth={1.5} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* User & logout */}
      <div className="px-4 py-4 border-t border-white/[0.04]">
        <p className="text-xs text-[#9FB0C8]/60 truncate mb-3 px-2">{adminEmail}</p>
        <button
          data-testid="admin-logout"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#B9C7D6]/70 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors duration-200"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}

// ============ DASHBOARD OVERVIEW ============
function DashboardOverview({ jobs, applications, emailLogs }) {
  const stats = [
    { label: "Total Jobs", value: jobs.length, icon: Briefcase, color: "#FF7A2A" },
    { label: "Applications", value: applications.length, icon: Users, color: "#3B82F6" },
    { label: "Emails Sent", value: emailLogs.length, icon: Mail, color: "#10B981" },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {stats.map((s, i) => (
          <div key={s.label} className="glass-card p-6" data-testid={`overview-stat-${i}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#9FB0C8] uppercase tracking-wider">{s.label}</p>
                <p className="text-3xl font-bold text-white mt-2">{s.value}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: `${s.color}15` }}>
                <s.icon size={24} style={{ color: s.color }} strokeWidth={1.5} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent applications */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Recent Applications</h3>
        {applications.length === 0 ? (
          <p className="text-sm text-[#9FB0C8]/60">No applications yet.</p>
        ) : (
          <div className="space-y-3">
            {applications.slice(0, 5).map((app) => (
              <div key={app.id} className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
                <div>
                  <p className="text-sm text-white font-medium">{app.name}</p>
                  <p className="text-xs text-[#9FB0C8]">{app.email} {app.job_title ? `— ${app.job_title}` : ""}</p>
                </div>
                <span className="text-[10px] text-[#9FB0C8]/50">{new Date(app.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ JOBS TABLE ============
function JobsTable({ jobs, onEdit, onDelete, onAdd }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Job Postings</h2>
        <button
          data-testid="add-job-btn"
          onClick={onAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#FF7A2A] text-white text-sm font-medium rounded-xl hover:brightness-110 transition-all duration-200"
        >
          <Plus size={16} />
          Create New Job
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="jobs-table">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-xs text-[#9FB0C8] uppercase tracking-wider font-medium py-4 px-5 bg-white/[0.03]">Job Title</th>
                <th className="text-left text-xs text-[#9FB0C8] uppercase tracking-wider font-medium py-4 px-5 bg-white/[0.03]">Location</th>
                <th className="text-left text-xs text-[#9FB0C8] uppercase tracking-wider font-medium py-4 px-5 bg-white/[0.03]">Type</th>
                <th className="text-left text-xs text-[#9FB0C8] uppercase tracking-wider font-medium py-4 px-5 bg-white/[0.03]">Seniority</th>
                <th className="text-left text-xs text-[#9FB0C8] uppercase tracking-wider font-medium py-4 px-5 bg-white/[0.03]">Created</th>
                <th className="text-right text-xs text-[#9FB0C8] uppercase tracking-wider font-medium py-4 px-5 bg-white/[0.03]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr
                  key={job.id}
                  data-testid={`admin-job-row-${job.id}`}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors duration-150"
                >
                  <td className="py-4 px-5">
                    <p className="text-sm font-semibold text-white">{job.title}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {job.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] text-[#9FB0C8] bg-white/[0.04] px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                      {job.tags.length > 3 && (
                        <span className="text-[10px] text-[#9FB0C8]/50">+{job.tags.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-5 text-sm text-[#B9C7D6]">{job.location}</td>
                  <td className="py-4 px-5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      job.type === "Full-time"
                        ? "bg-blue-500/10 text-blue-400"
                        : job.type === "Contract"
                        ? "bg-amber-500/10 text-amber-400"
                        : job.type === "Internship"
                        ? "bg-purple-500/10 text-purple-400"
                        : "bg-green-500/10 text-green-400"
                    }`}>
                      {job.type || "Full-time"}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-sm text-[#B9C7D6]">{job.seniority}</td>
                  <td className="py-4 px-5 text-xs text-[#9FB0C8]/60">
                    {new Date(job.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        data-testid={`edit-job-${job.id}`}
                        onClick={() => onEdit(job)}
                        className="p-2 rounded-lg text-cyan-400/70 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors duration-200"
                        title="Edit"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        data-testid={`delete-job-${job.id}`}
                        onClick={() => onDelete(job.id)}
                        className="p-2 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-[#9FB0C8]/60">
                    No job postings yet. Click "Create New Job" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============ APPLICATIONS LIST ============
function ApplicationsList({ applications }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-6">Applications</h2>
      <div className="space-y-3">
        {applications.map((app) => (
          <div key={app.id} data-testid={`application-${app.id}`} className="glass-card p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-white">{app.name}</h3>
                  {app.job_title && (
                    <span className="text-[10px] text-[#FF7A2A] bg-[#FF7A2A]/10 px-2 py-0.5 rounded-full">
                      {app.job_title}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#9FB0C8] mt-0.5">{app.email}</p>
                {app.message && (
                  <p className="text-xs text-[#B9C7D6]/80 mt-2 leading-relaxed max-w-lg">{app.message}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
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
            <p className="text-[10px] text-[#9FB0C8]/40 mt-3">
              {new Date(app.created_at).toLocaleString()}
            </p>
          </div>
        ))}
        {applications.length === 0 && (
          <div className="glass-card p-12 text-center text-[#9FB0C8]/60 text-sm">
            No applications received yet.
          </div>
        )}
      </div>
    </div>
  );
}

// ============ EMAIL LOGS ============
function EmailLogsList({ emailLogs }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-1">
        Email Logs
      </h2>
      <p className="text-xs text-[#9FB0C8]/50 mb-6">Email sending is MOCKED — notifications are stored in the database.</p>
      <div className="space-y-3">
        {emailLogs.map((log) => (
          <div key={log.id} data-testid={`email-log-${log.id}`} className="glass-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <Mail size={14} className="text-[#FF7A2A]" />
              <span className="text-sm font-medium text-white">{log.subject}</span>
            </div>
            <p className="text-xs text-[#9FB0C8]">To: {log.to}</p>
            <p className="text-xs text-[#B9C7D6]/70 mt-2 whitespace-pre-line leading-relaxed">{log.body}</p>
            <p className="text-[10px] text-[#9FB0C8]/40 mt-2">
              {new Date(log.sent_at).toLocaleString()}
            </p>
          </div>
        ))}
        {emailLogs.length === 0 && (
          <div className="glass-card p-12 text-center text-[#9FB0C8]/60 text-sm">
            No emails sent yet.
          </div>
        )}
      </div>
    </div>
  );
}

// ============ MAIN DASHBOARD ============
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [section, setSection] = useState("dashboard");
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
        localStorage.removeItem("admin_email");
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
    if (!window.confirm("Are you sure you want to delete this job posting?")) return;
    try {
      await axios.delete(`${API}/admin/jobs/${id}`, { headers: getAuthHeaders() });
      toast.success("Job deleted successfully.");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete job.");
    }
  };

  const sectionTitles = {
    dashboard: "Dashboard",
    jobs: "Job Postings",
    applications: "Applications",
    emails: "Email Logs",
  };

  return (
    <main data-testid="admin-dashboard" className="min-h-screen bg-[#071020]">
      <AdminSidebar activeSection={section} onNavigate={setSection} />

      {/* Main content area */}
      <div className="ml-[280px] min-h-screen">
        {/* Top header */}
        <header className="h-16 border-b border-white/[0.04] bg-[#071020]/60 backdrop-blur-sm flex items-center px-8 sticky top-0 z-30">
          <div className="flex items-center gap-2 text-sm text-[#9FB0C8]">
            <span>Admin</span>
            <ChevronRight size={14} />
            <span className="text-white font-medium">{sectionTitles[section]}</span>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 lg:p-10">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={28} className="animate-spin text-[#FF7A2A]" />
            </div>
          ) : (
            <>
              {section === "dashboard" && (
                <DashboardOverview jobs={jobs} applications={applications} emailLogs={emailLogs} />
              )}
              {section === "jobs" && (
                <JobsTable
                  jobs={jobs}
                  onEdit={(job) => { setEditingJob(job); setShowJobModal(true); }}
                  onDelete={deleteJob}
                  onAdd={() => { setEditingJob(null); setShowJobModal(true); }}
                />
              )}
              {section === "applications" && (
                <ApplicationsList applications={applications} />
              )}
              {section === "emails" && (
                <EmailLogsList emailLogs={emailLogs} />
              )}
            </>
          )}
        </div>
      </div>

      {/* Job modal */}
      <AnimatePresence>
        {showJobModal && (
          <JobFormModal
            job={editingJob}
            onClose={() => { setShowJobModal(false); setEditingJob(null); }}
            onSaved={() => { setShowJobModal(false); setEditingJob(null); fetchData(); }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
