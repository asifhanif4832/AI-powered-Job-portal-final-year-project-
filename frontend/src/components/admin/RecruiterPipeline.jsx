import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../shared/Navbar";
import { PageShell, PageContainer } from "../layout/PageShell";
import useGetRecruiterPipeline from "@/hooks/useGetRecruiterPipeline";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  Filter,
  HelpCircle,
  LayoutGrid,
  Sparkles,
} from "lucide-react";

const STATUS_LABEL = {
  pending: "Pending",
  shortlisted: "Shortlisted",
  interview_scheduled: "Interview",
  hired: "Hired",
  accepted: "Accepted",
  rejected: "Rejected",
};

const STATUS_CLASS = {
  pending: "bg-slate-100 text-slate-700",
  shortlisted: "bg-violet-100 text-violet-800",
  interview_scheduled: "bg-amber-100 text-amber-800",
  hired: "bg-emerald-100 text-emerald-800",
  accepted: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "shortlisted", label: "Shortlisted" },
  { id: "interview_scheduled", label: "Interview" },
  { id: "hired", label: "Hired" },
  { id: "rejected", label: "Rejected" },
];

export default function RecruiterPipeline() {
  useGetRecruiterPipeline();
  const { recruiterPipeline, pipelineSummary } = useSelector((s) => s.application);
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    const list = recruiterPipeline || [];
    if (filter === "all") return list;
    return list.filter((a) => String(a?.status || "pending") === filter);
  }, [recruiterPipeline, filter]);

  const total = pipelineSummary?.total || 0;
  const interviewing = pipelineSummary?.byStatus?.interview_scheduled || 0;
  const hired =
    (pipelineSummary?.byStatus?.hired || 0) + (pipelineSummary?.byStatus?.accepted || 0);

  return (
    <PageShell className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_90%_50%_at_50%_-15%,rgba(124,58,237,0.12),transparent)]" />
      <Navbar />
      <PageContainer className="py-8 sm:py-10">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-br from-slate-900 via-brand-900 to-violet-900 p-6 text-white shadow-2xl sm:p-10"
        >
          <div className="pointer-events-none absolute -right-20 top-0 h-48 w-48 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            Live pipeline
          </span>
          <h1 className="relative mt-3 text-3xl font-black tracking-tight sm:text-4xl">Hiring pipeline</h1>
          <p className="relative mt-2 max-w-2xl text-sm text-white/85 sm:text-base">
            Har candidate ko stage-wise track karein — shortlist, interview schedule, aur final decision yahin se.
          </p>
          <div className="relative mt-6 flex flex-wrap gap-2">
            <Link
              to="/admin/insights"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-white/90"
            >
              <BarChart3 className="h-4 w-4" />
              Insights
            </Link>
            <Link
              to="/admin/jobs/create"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              New job post
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Total applications</p>
            <p className="mt-1 text-3xl font-black text-slate-900">{total}</p>
            <p className="mt-2 text-xs text-slate-500">Sab jobs ka combined</p>
          </div>
          <div className="rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-violet-700">Interview stage</p>
            <p className="mt-1 text-3xl font-black text-violet-950">{interviewing}</p>
            <p className="mt-2 text-xs text-violet-600">Schedule / follow-up zaroori</p>
          </div>
          <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Hired / closed win</p>
            <p className="mt-1 text-3xl font-black text-emerald-950">{hired}</p>
            <p className="mt-2 text-xs text-emerald-700">Accepted offers included</p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <LayoutGrid className="h-5 w-5 text-brand-600" />
              Stage filter
            </h2>
            <p className="text-sm text-slate-500">
              <Filter className="mr-1 inline h-4 w-4" />
              {filtered.length} of {recruiterPipeline?.length || 0} shown
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition",
                  filter === f.id
                    ? "border-brand-500 bg-brand-50 text-brand-900 shadow-sm"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-brand-200 hover:bg-white"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50/80 via-white to-cyan-50/40 p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <HelpCircle className="h-5 w-5 text-indigo-600" />
            Recruiter quick guide
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { t: "1. Review", d: "Pending me naye applications dekhein — resume + profile match karein." },
              { t: "2. Shortlist", d: "Strong fits ko Shortlisted karein taake pipeline clear rahe." },
              { t: "3. Interview", d: "Interview scheduled select karke date/time + notes dein — student ko notify ho jata hai." },
              { t: "4. Decide", d: "Hired ya Rejected se process band karein — metrics sahi rahengi." },
            ].map((step) => (
              <div key={step.t} className="rounded-xl border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur-sm">
                <p className="font-bold text-indigo-900">{step.t}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="candidates" className="mt-8 rounded-2xl border border-slate-200/70 bg-slate-50/50 p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <ClipboardList className="h-5 w-5 text-slate-700" />
            Candidates
          </h2>
          <div className="mt-6 space-y-3">
            {filtered?.length ? (
              filtered.map((app) => (
                <div
                  key={app._id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-brand-200/80 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{app?.applicant?.fullname || "Candidate"}</p>
                      <p className="text-sm text-slate-600">{app?.applicant?.email}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {app?.job?.title} · {app?.job?.company?.name || "Company"}
                      </p>
                    </div>
                   <div className="flex items-center gap-2">
    {/* Match Score Badge */}
   {!app?.applicant?.profile?.resume ? (
    <span style={{
        fontSize: 11, fontWeight: 600, color: '#92400e',
        background: '#fef3c7', padding: '3px 10px',
        borderRadius: 99, border: '1px solid #fde68a'
    }}>
        No Resume
    </span>
) : app.matchScore !== null && app.matchScore !== undefined ? (
    <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700,
        background: app.matchScore >= 75 ? '#d1fae5' : app.matchScore >= 50 ? '#dbeafe' : '#fee2e2',
        color:      app.matchScore >= 75 ? '#065f46' : app.matchScore >= 50 ? '#1e40af' : '#991b1b',
    }}>
        {app.matchScore >= 75 ? '🟢' : app.matchScore >= 50 ? '🔵' : '🔴'}
        {app.matchScore}% match
    </span>
) : (
    <span style={{
        fontSize: 11, fontWeight: 600, color: '#6b7280',
        background: '#f3f4f6', padding: '3px 10px',
        borderRadius: 99, border: '1px solid #e5e7eb'
    }}>
        Pending Analysis
    </span>
)}
    {/* Status Badge */}
    <Badge className={`border-0 ${STATUS_CLASS[app?.status] || STATUS_CLASS.pending}`}>
        {STATUS_LABEL[app?.status] || app?.status}
    </Badge>
</div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {app?.interviewAt && (
                      <span className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-100">
                        Interview: {new Date(app.interviewAt).toLocaleString()}
                      </span>
                    )}
                    {app?.interviewNotes && (
                      <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-700">
                        Note: {app.interviewNotes}
                      </span>
                    )}
                    <Link
                      to={`/admin/jobs/${app?.job?._id}/applicants`}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      Applicant table
                    </Link>
                    <Link
                      to={`/description/${app?.job?._id}`}
                      className="rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-800"
                    >
                      Job details
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
                Is filter ke liye koi candidate nahi — stage change karke dekhein.
              </div>
            )}
          </div>
        </section>
      </PageContainer>
    </PageShell>
  );
}
