import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import Navbar from "./shared/Navbar";
import { PageShell, PageContainer } from "./layout/PageShell";
import useGetAppliedJobs from "@/hooks/useGetAppliedJobs";
import useGetAllCompanies from "@/hooks/useGetAllCompanies";
import useGetAllAdminJobs from "@/hooks/useGetAllAdminJobs";
import useGetRecruiterPipeline from "@/hooks/useGetRecruiterPipeline";
import { getStudentProfileCompletion } from "@/lib/profileCompletion";
import {
  Bookmark,
  Briefcase,
  Building2,
  LayoutDashboard,
  PlusCircle,
  Rocket,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

const cardBase =
  "relative overflow-hidden rounded-2xl border p-6 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl";

export default function Dashboard() {
  useGetAppliedJobs();
  useGetAllCompanies();
  useGetAllAdminJobs();
  useGetRecruiterPipeline();

  const { user } = useSelector((s) => s.auth);
  const { savedJobIds, allAppliedJobs, allAdminJobs } = useSelector((s) => s.job);
  const { companies } = useSelector((s) => s.company);
  const { pipelineSummary } = useSelector((s) => s.application);

  const isStudent = user?.role === "student";
  const isRecruiter = user?.role === "recruiter";

  const completion = isStudent ? getStudentProfileCompletion(user) : null;
  const appliedList = Array.isArray(allAppliedJobs) ? allAppliedJobs : [];
  const upcomingInterviews = appliedList.filter(
    (a) => String(a?.status || "").toLowerCase() === "interview_scheduled" && a?.interviewAt
  ).length;
  const savedCount = savedJobIds?.length ?? 0;

  const companyCount = companies?.length ?? 0;
  const jobsPosted = allAdminJobs?.length ?? 0;

  return (
    <PageShell className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(124,58,237,0.15),transparent)]" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl" />

      <Navbar />

      <PageContainer className="py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200/60 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-800 shadow-sm">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Your workspace
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Hey,{" "}
              <span className="bg-gradient-to-r from-brand-600 via-violet-600 to-accent-600 bg-clip-text text-transparent">
                {user?.fullname?.split(" ")[0] || "there"}
              </span>
            </h1>
            <p className="mt-2 max-w-xl text-slate-600">
              {isStudent
                ? "Track applications, saved roles, and profile strength in one colorful place."
                : "Manage companies, job posts, and incoming talent from a single hub."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
            >
              <Rocket className="h-4 w-4" />
              Explore jobs
            </Link>
            {isRecruiter && (
              <Link
                to="/admin/jobs/create"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-800 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:from-brand-700 hover:to-brand-900"
              >
                <PlusCircle className="h-4 w-4" />
                Post a job
              </Link>
            )}
          </div>
        </motion.div>

        {isStudent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.45 }}
            className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            <div
              className={`${cardBase} border-violet-200/80 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50/50`}
            >
              <Target className="h-8 w-8 text-violet-600" />
              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-violet-800/80">
                Profile strength
              </p>
              <p className="mt-1 text-3xl font-black tabular-nums text-violet-900">
                {completion?.percent ?? 0}%
              </p>
              <Link
                to="/profile"
                className="mt-3 inline-flex text-sm font-semibold text-violet-700 hover:underline"
              >
                Improve profile →
              </Link>
            </div>

           <div
              className={`${cardBase} border-cyan-200/80 bg-gradient-to-br from-cyan-50 via-white to-sky-50/50`}
            >
              <Briefcase className="h-8 w-8 text-cyan-600" />
              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-cyan-800/80">
                Applications
              </p>
              <p className="mt-1 text-3xl font-black tabular-nums text-cyan-950">
                {appliedList.length}
              </p>
             <Link
                to="/profile#applications"
                onClick={() => setTimeout(() => document.getElementById('applications')?.scrollIntoView({ behavior: 'smooth' }), 300)}
                className="mt-3 inline-flex text-sm font-semibold text-cyan-700 hover:underline"
              >
                View applications →
              </Link>
            </div>

            <div
              className={`${cardBase} border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-orange-50/50`}
            >
              <Bookmark className="h-8 w-8 text-amber-600" />
              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-amber-900/80">
                Saved jobs
              </p>
              <p className="mt-1 text-3xl font-black tabular-nums text-amber-950">
                {savedCount}
              </p>
              <Link
                to="/saved-jobs"
                className="mt-3 inline-flex text-sm font-semibold text-amber-800 hover:underline"
              >
                Open saved →
              </Link>
            </div>

           <div
              className={`${cardBase} border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-teal-50/50`}
            >
              <TrendingUp className="h-8 w-8 text-emerald-600" />
              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-emerald-900/80">
                Upcoming interviews
              </p>
              <p className="mt-1 text-3xl font-black tabular-nums text-emerald-950">
                {upcomingInterviews}
              </p>
              <Link
                to="/profile#interviews"
                onClick={() => setTimeout(() => document.getElementById('interviews')?.scrollIntoView({ behavior: 'smooth' }), 300)}
                className="mt-3 inline-flex text-sm font-semibold text-emerald-700 hover:underline"
              >
                View interviews →
              </Link>
            </div>
          </motion.div>
        )}

        {isRecruiter && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.45 }}
            className="mt-10 grid gap-4 sm:grid-cols-3"
          >
            <div
              className={`${cardBase} border-indigo-200/80 bg-gradient-to-br from-indigo-50 to-white`}
            >
              <Building2 className="h-8 w-8 text-indigo-600" />
              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-indigo-900/80">
                Companies
              </p>
              <p className="mt-1 text-3xl font-black text-indigo-950">{companyCount}</p>
              <Link
                to="/admin/companies"
                className="mt-3 inline-flex text-sm font-semibold text-indigo-700 hover:underline"
              >
                Manage →
              </Link>
            </div>
            <div
              className={`${cardBase} border-rose-200/80 bg-gradient-to-br from-rose-50 to-white`}
            >
              <Users className="h-8 w-8 text-rose-600" />
              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-rose-900/80">
                Job listings
              </p>
              <p className="mt-1 text-3xl font-black text-rose-950">{jobsPosted}</p>
              <Link
                to="/admin/jobs"
                className="mt-3 inline-flex text-sm font-semibold text-rose-700 hover:underline"
              >
                View all →
              </Link>
            </div>
           <div
              className={`${cardBase} border-sky-200/80 bg-gradient-to-br from-sky-50 to-white`}
            >
              <Sparkles className="h-8 w-8 text-sky-600" />
              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-sky-900/80">
                Interviews
              </p>
              <p className="mt-1 text-3xl font-black text-sky-950">
                {pipelineSummary?.byStatus?.interview_scheduled || 0}
              </p>
              <Link
                to="/admin/pipeline#candidates"
                onClick={() => setTimeout(() => document.getElementById('candidates')?.scrollIntoView({ behavior: 'smooth' }), 300)}
                className="mt-3 inline-flex text-sm font-semibold text-sky-700 hover:underline"
              >
                View candidates →
              </Link>
            </div>
          </motion.div>
        )}

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.45 }}
          className="mt-12 rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-xl shadow-slate-200/40 backdrop-blur-sm sm:p-8"
        >
          <h2 className="text-lg font-bold text-slate-900">Quick shortcuts</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(isStudent
              ? [
                  { to: "/jobs", label: "Browse jobs", desc: "Search & filter roles", color: "from-violet-500 to-purple-600" },
                  { to: "/saved-jobs", label: "Saved", desc: "Your shortlist", color: "from-amber-500 to-orange-600" },
                  { to: "/profile", label: "Profile", desc: "Resume & skills", color: "from-emerald-500 to-teal-600" },
                 { to: "/career-center", label: "Career center", desc: "Interview prep & timeline", color: "from-sky-500 to-blue-600" },
                  { to: "/recommended-jobs", label: "Recommended", desc: "AI matched jobs for you", color: "from-purple-500 to-violet-600" },
                ]
              : [
                  { to: "/admin/companies", label: "Companies", desc: "Brands you hire for", color: "from-indigo-500 to-violet-600" },
                  { to: "/admin/jobs", label: "Manage jobs", desc: "Edit & track listings", color: "from-rose-500 to-pink-600" },
                  { to: "/admin/pipeline", label: "Pipeline", desc: "Live candidate stages", color: "from-amber-500 to-orange-600" },
                  { to: "/admin/insights", label: "Insights", desc: "Funnel metrics & actions", color: "from-emerald-500 to-teal-600" },
                ]
            ).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition hover:border-brand-200 hover:bg-white hover:shadow-md"
              >
                <div
                  className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${item.color} opacity-20 blur-2xl transition group-hover:opacity-30`}
                />
                <p className="font-semibold text-slate-900">{item.label}</p>
                <p className="mt-1 text-xs text-slate-500">{item.desc}</p>
              </Link>
            ))}
          </div>
        </motion.section>
      </PageContainer>
    </PageShell>
  );
}
