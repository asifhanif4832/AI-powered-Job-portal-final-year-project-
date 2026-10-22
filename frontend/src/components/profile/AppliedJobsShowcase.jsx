import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Calendar,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles = {
  pending:             "bg-amber-100 text-amber-900 ring-amber-200/80",
  shortlisted:         "bg-violet-100 text-violet-900 ring-violet-200/80",
  interview_scheduled: "bg-sky-100 text-sky-900 ring-sky-200/80",
  hired:               "bg-emerald-100 text-emerald-900 ring-emerald-200/80",
  accepted:            "bg-emerald-100 text-emerald-900 ring-emerald-200/80",
  rejected:            "bg-rose-100 text-rose-900 ring-rose-200/80",
};

// ─── Deleted Job Card ─────────────────────────────────────────────────────────
const DeletedJobCard = ({ app, i }) => {
  const dateStr = app?.createdAt?.split?.("T")?.[0] || "—";
  const title   = app?.job?.title || "Role";
  const company = app?.job?.company?.name || "Company";

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05, duration: 0.35 }}
      className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-dashed border-red-200 bg-red-50/60 p-5 shadow-sm"
    >
      {/* Deleted Banner */}
      <div className="mb-3 flex items-center gap-2 rounded-xl bg-red-100 px-3 py-2">
        <Trash2 className="h-4 w-4 shrink-0 text-red-500" />
        <span className="text-xs font-bold text-red-700">
          This job posting has been removed by the recruiter
        </span>
      </div>

      <div className="flex items-start justify-between gap-3 opacity-60">
        <div className="min-w-0">
          <p className="line-clamp-2 text-base font-bold text-slate-600 line-through">
            {title}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="truncate">{company}</span>
          </p>
        </div>
        <Badge className="shrink-0 border-0 bg-red-100 font-semibold text-red-700 ring-1 ring-red-200">
          Job Removed
        </Badge>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 opacity-60">
        <Calendar className="h-3.5 w-3.5" />
        Applied {dateStr}
      </div>

      <p className="mt-3 text-xs text-slate-500">
        You can explore other open positions below.
      </p>

      <div className="mt-3">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"
        >
          Browse other jobs
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.article>
  );
};

// ─── Normal Job Card ──────────────────────────────────────────────────────────
const JobCard = ({ app, i }) => {
  const status  = String(app?.status || "pending").toLowerCase();
  const jobId   = app?.job?._id;
  const title   = app?.job?.title || "Role";
  const company = app?.job?.company?.name || "Company";
  const dateStr = app?.createdAt?.split?.("T")?.[0] || "—";

  const inner = (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05, duration: 0.35 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition duration-300 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/10"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-brand-400/20 to-accent-400/10 blur-2xl" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-2 text-base font-bold text-slate-900 group-hover:text-brand-800">
            {title}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
            <Building2 className="h-4 w-4 shrink-0 text-brand-500" />
            <span className="truncate">{company}</span>
          </p>
        </div>
        <Badge
          className={cn(
            "shrink-0 border-0 font-semibold ring-1",
            statusStyles[status] || statusStyles.pending
          )}
        >
          {status.replaceAll("_", " ")}
        </Badge>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <Calendar className="h-3.5 w-3.5" />
        Applied {dateStr}
      </div>

      {jobId && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 transition group-hover:gap-2">
            View job details
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      )}
    </motion.article>
  );

  return jobId ? (
    <Link
      to={`/description/${jobId}`}
      className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded-2xl"
    >
      {inner}
    </Link>
  ) : (
    inner
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AppliedJobsShowcase({ applications = [] }) {
  const list = Array.isArray(applications) ? applications : [];

  if (list.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-dashed border-brand-200/80 bg-gradient-to-br from-brand-50/40 via-white to-accent-50/30 p-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg shadow-brand-500/10 ring-2 ring-brand-100">
          <Sparkles className="h-8 w-8 text-brand-600" />
        </div>
        <h3 className="mt-5 text-lg font-bold text-slate-900">No applications yet</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
          Explore open roles and send your first application — your status updates will show up here.
        </p>
        <Link
          to="/jobs"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-800 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:from-brand-700 hover:to-brand-900"
        >
          Browse jobs
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {list.map((app, i) => {
        const isDeleted = app?.job?.isDeleted === true || app?.job === null;
        return (
          <li key={app._id || i}>
            {isDeleted
              ? <DeletedJobCard app={app} i={i} />
              : <JobCard app={app} i={i} />
            }
          </li>
        );
      })}
    </ul>
  );
}