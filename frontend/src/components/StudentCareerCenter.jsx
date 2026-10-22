import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import Navbar from "./shared/Navbar";
import { PageContainer, PageShell } from "./layout/PageShell";
import useGetAppliedJobs from "@/hooks/useGetAppliedJobs";
import { Briefcase, CalendarClock, CheckCircle2, FileText, Sparkles, Target } from "lucide-react";

const checklist = [
  "Update profile bio with a strong 2-line intro",
  "Keep at least 8 relevant skills in profile",
  "Upload latest resume before applying",
  "Track interview schedule daily",
  "Prepare role-specific questions for recruiter",
];

export default function StudentCareerCenter() {
  useGetAppliedJobs();
  const { user } = useSelector((s) => s.auth);
  const { allAppliedJobs } = useSelector((s) => s.job);

  const applications = Array.isArray(allAppliedJobs) ? allAppliedJobs : [];
  const upcoming = applications
    .filter((a) => String(a?.status || "").toLowerCase() === "interview_scheduled" && a?.interviewAt)
    .sort((a, b) => new Date(a.interviewAt) - new Date(b.interviewAt));
  const shortlisted = applications.filter((a) => String(a?.status || "").toLowerCase() === "shortlisted").length;

  if (user?.role !== "student") {
    return (
      <PageShell>
        <Navbar />
        <PageContainer className="py-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-lg font-semibold text-slate-900">Career Center is for student accounts.</p>
            <Link to="/dashboard" className="mt-3 inline-block text-brand-700 hover:underline">
              Go to dashboard
            </Link>
          </div>
        </PageContainer>
      </PageShell>
    );
  }

  return (
    <PageShell className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_45%_at_50%_-20%,rgba(124,58,237,0.16),transparent)]" />
      <Navbar />
      <PageContainer className="py-8 sm:py-10">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/60 bg-gradient-to-br from-violet-600 via-brand-600 to-accent-600 p-7 text-white shadow-2xl shadow-brand-900/20 sm:p-10"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            Student growth hub
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Career Center</h1>
          <p className="mt-2 max-w-2xl text-white/90">
            Plan your next move with interview timeline, readiness checklist, and application momentum.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-white/15 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-wide text-white/80">Applied</p>
              <p className="mt-1 text-2xl font-bold">{applications.length}</p>
            </div>
            <div className="rounded-xl bg-white/15 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-wide text-white/80">Shortlisted</p>
              <p className="mt-1 text-2xl font-bold">{shortlisted}</p>
            </div>
            <div className="rounded-xl bg-white/15 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-wide text-white/80">Upcoming interviews</p>
              <p className="mt-1 text-2xl font-bold">{upcoming.length}</p>
            </div>
          </div>
        </motion.section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <CalendarClock className="h-5 w-5 text-brand-600" />
              Interview timeline
            </h2>
            <div className="mt-5 space-y-3">
              {upcoming.length ? (
                upcoming.map((a) => {
                  const isDeleted = a?.job?.isDeleted || !a?.job;
                  const inner = (
                    <div className="block rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-brand-200 hover:bg-brand-50/30">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-slate-900">{a?.job?.title || "Role"}</p>
                        {isDeleted && (
                          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                            Job Removed
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{a?.job?.company?.name || "Company"}</p>
                      <p className="mt-2 text-sm font-medium text-brand-800">
                        {new Date(a.interviewAt).toLocaleString()}
                      </p>
                      {a?.interviewNotes && (
                        <p className="mt-1 text-xs text-slate-600">Note: {a.interviewNotes}</p>
                      )}
                    </div>
                  );

                  // Only make it a link if job is not deleted
                  return isDeleted ? (
                    <div key={a._id}>{inner}</div>
                  ) : (
                    <Link key={a._id} to={`/description/${a?.job?._id}`}>
                      {inner}
                    </Link>
                  );
                })
              ) : (
                <p className="rounded-xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
                  No interviews scheduled yet. Keep applying and updating your profile.
                </p>
              )}
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Target className="h-5 w-5 text-violet-600" />
                Readiness checklist
              </h2>
              <ul className="mt-4 space-y-2">
                {checklist.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <FileText className="h-5 w-5 text-cyan-600" />
                Quick actions
              </h2>
              <div className="mt-4 grid gap-2">
                <Link to="/profile" className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100">Update profile</Link>
                <Link to="/jobs" className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100">Explore matching jobs</Link>
                <Link to="/saved-jobs" className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100">Review saved jobs</Link>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Briefcase className="h-5 w-5 text-brand-600" />
            Application momentum
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {applications.slice(0, 12).map((a) => {
              const isDeleted = a?.job?.isDeleted || !a?.job;
              return (
                <span
                  key={a._id}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isDeleted
                      ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {(isDeleted ? "🗑 " : "") + (a?.job?.title || "Role").slice(0, 24)}
                  {" • "}
                  {isDeleted ? "Job Removed" : String(a?.status || "pending").replaceAll("_", " ")}
                </span>
              );
            })}
            {applications.length === 0 && (
              <p className="text-sm text-slate-500">No applications yet.</p>
            )}
          </div>
        </section>
      </PageContainer>
    </PageShell>
  );
}