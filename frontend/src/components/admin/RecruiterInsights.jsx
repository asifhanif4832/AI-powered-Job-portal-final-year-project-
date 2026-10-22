import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import Navbar from "../shared/Navbar";
import { PageContainer, PageShell } from "../layout/PageShell";
import useGetAllAdminJobs from "@/hooks/useGetAllAdminJobs";
import useGetAllCompanies from "@/hooks/useGetAllCompanies";
import useGetRecruiterPipeline from "@/hooks/useGetRecruiterPipeline";
import {
  BarChart3,
  Briefcase,
  Building2,
  CalendarClock,
  ClipboardList,
  Lightbulb,
  Rocket,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";

const PLAYBOOK = [
  {
    title: "Clear job posts",
    body: "Salary range + must-have skills reduce unqualified volume and speed up shortlisting.",
    color: "from-rose-500 to-orange-500",
  },
  {
    title: "Fast first response",
    body: "Move strong profiles to Shortlisted within 48h — top candidates apply to many places.",
    color: "from-violet-500 to-purple-600",
  },
  {
    title: "Interview discipline",
    body: "Schedule interviews with date/time + notes so candidates stay aligned and prepared.",
    color: "from-cyan-500 to-blue-600",
  },
  {
    title: "Close the loop",
    body: "Hired or Rejected — always update status so your funnel metrics stay honest.",
    color: "from-emerald-500 to-teal-600",
  },
];

const STAGES = [
  { key: "pending", label: "Applied", desc: "New applications awaiting review" },
  { key: "shortlisted", label: "Shortlisted", desc: "Promising profiles to pursue" },
  { key: "interview_scheduled", label: "Interview", desc: "Scheduled conversations" },
  { key: "hired", label: "Hired", desc: "Offers accepted / ready to onboard" },
];

export default function RecruiterInsights() {
  useGetAllAdminJobs();
  useGetAllCompanies();
  useGetRecruiterPipeline();

  const { allAdminJobs } = useSelector((s) => s.job);
  const { companies } = useSelector((s) => s.company);
  const { recruiterPipeline, pipelineSummary } = useSelector((s) => s.application);

  const totalApps = pipelineSummary?.total || 0;
  const interviewing = pipelineSummary?.byStatus?.interview_scheduled || 0;
  const hired =
    (pipelineSummary?.byStatus?.hired || 0) + (pipelineSummary?.byStatus?.accepted || 0);
  const shortlist = pipelineSummary?.byStatus?.shortlisted || 0;
  const conversion = totalApps ? Math.round((hired / totalApps) * 100) : 0;
  const pending = pipelineSummary?.byStatus?.pending || 0;

  const appsByJobId = useMemo(() => {
    const m = {};
    for (const a of recruiterPipeline || []) {
      const id = a?.job?._id;
      if (!id) continue;
      m[String(id)] = (m[String(id)] || 0) + 1;
    }
    return m;
  }, [recruiterPipeline]);

  const topRolesByVolume = useMemo(() => {
    const jobs = allAdminJobs || [];
    return [...jobs]
      .map((j) => ({
        job: j,
        count: appsByJobId[String(j._id)] || 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [allAdminJobs, appsByJobId]);

  const needsAttention = pending > 5 || interviewing > 3;

  return (
    <PageShell className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_45%_at_50%_-20%,rgba(234,88,12,0.12),transparent)]" />
      <Navbar />
      <PageContainer className="py-8 sm:py-10">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/60 bg-gradient-to-br from-slate-900 via-violet-900 to-brand-900 p-7 text-white shadow-2xl sm:p-10"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            Recruiter control room
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Hiring Insights</h1>
          <p className="mt-2 max-w-2xl text-white/85">
            Monitor funnel health, accelerate decisions, and keep hiring velocity high.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/admin/pipeline"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-white/90"
            >
              <ClipboardList className="h-4 w-4" />
              Open pipeline
            </Link>
            <Link
              to="/admin/jobs/create"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <Rocket className="h-4 w-4" />
              Post job
            </Link>
          </div>
        </motion.section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Companies", value: companies?.length || 0, icon: Building2, color: "from-indigo-500 to-violet-600" },
            { label: "Open listings", value: allAdminJobs?.length || 0, icon: Briefcase, color: "from-rose-500 to-pink-600" },
            { label: "Applications", value: totalApps, icon: Users, color: "from-cyan-500 to-sky-600" },
            { label: "Interviewing", value: interviewing, icon: CalendarClock, color: "from-amber-500 to-orange-600" },
            { label: "Hire conversion", value: `${conversion}%`, icon: BarChart3, color: "from-emerald-500 to-teal-600" },
          ].map((item) => (
            <div key={item.label} className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className={`absolute -right-8 -top-8 h-20 w-20 rounded-full bg-gradient-to-br ${item.color} opacity-20 blur-2xl`} />
              <item.icon className="h-6 w-6 text-slate-700" />
              <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">{item.label}</p>
              <p className="mt-1 text-2xl font-black text-slate-900">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 via-white to-orange-50 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                <Zap className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">This week’s focus</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {needsAttention
                    ? "You have backlog or interviews in flight — prioritize clearing pending reviews and confirming slots."
                    : "Pipeline looks healthy. Keep momentum: refresh listings and nurture shortlisted candidates."}
                </p>
              </div>
            </div>
            <ul className="grid gap-2 text-sm text-slate-700 sm:text-right">
              <li><Link className="font-semibold text-brand-800 hover:underline" to="/admin/jobs">Review pending applications →</Link></li>
              <li><Link className="font-semibold text-brand-800 hover:underline" to="/admin/pipeline">Move candidates through stages →</Link></li>
            </ul>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Target className="h-5 w-5 text-violet-600" />
            Pipeline stages (how it maps here)
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Each stage mirrors what you set in the applicant menu — keep candidates moving forward.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STAGES.map((s, i) => {
              const count =
                s.key === "hired"
                  ? hired
                  : pipelineSummary?.byStatus?.[s.key] ?? 0;
              return (
                <div
                  key={s.key}
                  className="relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/80 p-4"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Step {i + 1}
                  </span>
                  <p className="mt-2 font-semibold text-slate-900">{s.label}</p>
                  <p className="mt-1 text-xs text-slate-600">{s.desc}</p>
                  <p className="mt-3 text-2xl font-black text-brand-800">{count}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Funnel breakdown</h2>
            <div className="mt-5 space-y-3">
              {[
                ["Pending", pipelineSummary?.byStatus?.pending || 0],
                ["Shortlisted", shortlist],
                ["Interview scheduled", interviewing],
                ["Hired", hired],
                ["Rejected", pipelineSummary?.byStatus?.rejected || 0],
              ].map(([label, value]) => {
                const pct = totalApps ? Math.round((Number(value) / totalApps) * 100) : 0;
                return (
                  <div key={label}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{label}</span>
                      <span className="text-slate-500">
                        {value} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-600 to-accent-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Action center</h2>
            <div className="mt-4 grid gap-2">
              <Link to="/admin/jobs/create" className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100">Create a new listing</Link>
              <Link to="/admin/pipeline" className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100">Review pipeline board</Link>
              <Link to="/admin/jobs" className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100">Open jobs table</Link>
              <Link to="/admin/companies" className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100">Manage company profiles</Link>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Hiring playbook
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {PLAYBOOK.map((p) => (
              <div
                key={p.title}
                className="relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/80 p-5"
              >
                <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${p.color} opacity-15 blur-2xl`} />
                <p className="font-bold text-slate-900">{p.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-slate-900">Roles by application volume</h2>
          <p className="mt-1 text-sm text-slate-600">
            Where candidates are landing — double down on high-traffic roles or refresh stale posts.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {topRolesByVolume.length ? (
              topRolesByVolume.map(({ job, count }) => (
                <Link
                  key={job._id}
                  to={`/admin/jobs/${job._id}/applicants`}
                  className="min-w-[200px] flex-1 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 transition hover:border-brand-200 hover:shadow-md"
                >
                  <p className="line-clamp-2 font-semibold text-slate-900">{job.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{job?.company?.name || "Company"}</p>
                  <p className="mt-2 text-sm font-bold text-brand-800">{count} applications</p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-slate-500">Post jobs to start seeing volume insights.</p>
            )}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Recent candidates</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {(recruiterPipeline || []).slice(0, 8).map((app) => (
              <div key={app._id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <p className="font-semibold text-slate-900">{app?.applicant?.fullname || "Candidate"}</p>
                <p className="text-sm text-slate-600">{app?.job?.title || "Role"}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {String(app?.status || "pending").replaceAll("_", " ")}
                  {app?.interviewAt ? ` • ${new Date(app.interviewAt).toLocaleString()}` : ""}
                </p>
              </div>
            ))}
            {(!recruiterPipeline || recruiterPipeline.length === 0) && (
              <p className="text-sm text-slate-500">No candidate activity yet.</p>
            )}
          </div>
        </section>
      </PageContainer>
    </PageShell>
  );
}
