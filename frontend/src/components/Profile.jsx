import React, { useEffect, useState } from "react";
import Navbar from "./shared/Navbar";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Briefcase,
  GraduationCap,
  Link2,
  Mail,
  MapPin,
  Pen,
  Phone,
  Sparkles,
} from "lucide-react";
import { Badge } from "./ui/badge";
import UpdateProfileDialog from "./UpdateProfileDialog";
import ProfileCompletionCard from "./ProfileCompletionCard";
import AppliedJobsShowcase from "./profile/AppliedJobsShowcase";
import { useSelector } from "react-redux";
import store from "@/redux/store";
import useGetAppliedJobs from "@/hooks/useGetAppliedJobs";
import { PageShell, PageContainer } from "./layout/PageShell";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constant";
import { useDispatch } from "react-redux";
import { setSavedJobIds } from "@/redux/jobSlice";

const Profile = () => {
  useGetAppliedJobs();
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { allAppliedJobs } = useSelector((store) => store.job);
  const dispatch = useDispatch();

  const hasResume = Boolean(user?.profile?.resume?.trim());
  const roleLabel =
    user?.role === "recruiter" ? "Recruiter" : user?.role === "student" ? "Student" : "Member";

  useEffect(() => {
    const syncSaved = async () => {
      if (user?.role !== "student") return;
      try {
        const res = await axios.get(`${USER_API_END_POINT}/saved-jobs`, {
          withCredentials: true,
        });
        if (res.data.success) {
          dispatch(setSavedJobIds(res.data.jobIds || []));
        }
      } catch {
        /* ignore */
      }
    };
    syncSaved();
  }, [user?.role, dispatch]);

  const applications = Array.isArray(allAppliedJobs) ? allAppliedJobs : [];
  const upcomingInterviews = applications
    .filter((a) => String(a?.status || "").toLowerCase() === "interview_scheduled" && a?.interviewAt)
    .sort((a, b) => new Date(a.interviewAt) - new Date(b.interviewAt));

  return (
    <PageShell className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_60%_at_50%_-10%,rgba(124,58,237,0.14),transparent)]" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-80 w-80 rounded-full bg-gradient-to-tl from-accent-400/20 to-transparent blur-3xl" />

      <Navbar />

      <PageContainer className="py-8 sm:py-10">
        {user?.role === "student" && (
          <ProfileCompletionCard user={user} onEditProfile={() => setOpen(true)} />
        )}

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative mt-8 overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-brand-600 via-violet-600 to-accent-600 p-6 text-white shadow-2xl shadow-brand-900/20 sm:p-10"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-fuchsia-400/20 blur-3xl" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
              <div className="relative shrink-0">
                <div className="rounded-full bg-gradient-to-tr from-amber-300 via-white to-cyan-300 p-1 shadow-xl">
                  <Avatar className="h-28 w-28 border-4 border-white shadow-inner sm:h-32 sm:w-32">
                    <AvatarImage src={user?.profile?.profilePhoto} alt={user?.fullname} className="object-cover" />
                  </Avatar>
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-brand-600 shadow-lg">
                  <Sparkles className="h-4 w-4" />
                </span>
              </div>
              <div className="text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <Badge className="border-0 bg-white/20 font-semibold text-white backdrop-blur-sm">
                    {roleLabel}
                  </Badge>
                  <Badge className="border-0 bg-emerald-400/90 font-semibold text-emerald-950">
                    Active
                  </Badge>
                </div>
                <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                  {user?.fullname}
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
                  {user?.profile?.bio?.trim() ||
                    "Tell recruiters who you are — add a short bio from Edit profile."}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 lg:flex-col lg:items-stretch">
              <Button
                type="button"
                onClick={() => setOpen(true)}
                className="h-12 rounded-2xl border-0 bg-white font-semibold text-brand-800 shadow-lg hover:bg-white/90"
              >
                <Pen className="mr-2 h-4 w-4" />
                Edit profile
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-2xl border-white/40 bg-white/10 font-semibold text-white backdrop-blur-sm hover:bg-white/20"
              >
                <Link to="/dashboard">Open dashboard</Link>
              </Button>
            </div>
          </div>
        </motion.section>

        {/* Bento grid */}
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-lg shadow-slate-200/50 backdrop-blur-sm lg:col-span-2"
          >
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-50 to-blue-100 text-sky-700">
                <Mail className="h-4 w-4" />
              </span>
              Contact
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Email
                </p>
                <p className="mt-1 flex items-center gap-2 font-medium text-slate-900">
                  <Mail className="h-4 w-4 text-brand-600" />
                  {user?.email}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Phone
                </p>
                <p className="mt-1 flex items-center gap-2 font-medium text-slate-900">
                  <Phone className="h-4 w-4 text-brand-600" />
                  {user?.phoneNumber ?? "—"}
                </p>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-8">
              <h3 className="flex items-center gap-2 font-bold text-slate-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-100 text-emerald-700">
                  <Briefcase className="h-4 w-4" />
                </span>
                Skills
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {user?.profile?.skills?.length > 0 ? (
                  user.profile.skills.map((item, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-gradient-to-r from-brand-50 to-violet-50 px-3 py-1.5 text-sm font-semibold text-brand-900 ring-1 ring-brand-100"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-400">
                    Add skills to stand out — edit your profile.
                  </span>
                )}
              </div>
            </div>

            {user?.role === "student" && (
              <div className="mt-8 border-t border-slate-100 pt-8">
                <h3 className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-100 text-amber-800">
                    <GraduationCap className="h-4 w-4" />
                  </span>
                  Experience
                </h3>
                <div className="mt-3 whitespace-pre-wrap rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-sm leading-relaxed text-slate-700">
                  {user?.profile?.experience?.trim() ? (
                    user.profile.experience
                  ) : (
                    <span className="text-slate-400">
                      Internships, projects, or work history — add from Edit profile.
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-6 shadow-lg shadow-violet-200/40">
              <h3 className="flex items-center gap-2 font-bold text-slate-900">
                <MapPin className="h-5 w-5 text-violet-600" />
                Quick links
              </h3>
              <ul className="mt-4 space-y-2 text-sm font-medium">
                <li>
                  <Link
                    className="flex items-center justify-between rounded-xl bg-white/80 px-3 py-2.5 text-violet-800 ring-1 ring-violet-100 transition hover:bg-violet-50"
                    to="/jobs"
                  >
                    Browse jobs
                    <span className="text-violet-400">→</span>
                  </Link>
                </li>
                <li>
                  <Link
                    className="flex items-center justify-between rounded-xl bg-white/80 px-3 py-2.5 text-violet-800 ring-1 ring-violet-100 transition hover:bg-violet-50"
                    to="/saved-jobs"
                  >
                    Saved jobs
                    <span className="text-violet-400">→</span>
                  </Link>
                </li>
                <li>
                  <Link
                    className="flex items-center justify-between rounded-xl bg-white/80 px-3 py-2.5 text-violet-800 ring-1 ring-violet-100 transition hover:bg-violet-50"
                    to="/how-it-works"
                  >
                    How it works
                    <span className="text-violet-400">→</span>
                  </Link>
                </li>
              </ul>
            </div>

            {user?.role === "student" && (
              <div className="rounded-2xl border border-cyan-200/80 bg-gradient-to-br from-cyan-50 to-sky-50 p-6 shadow-lg shadow-cyan-200/30">
                <h3 className="flex items-center gap-2 font-bold text-slate-900">
                  <Link2 className="h-5 w-5 text-cyan-600" />
                  Resume / CV
                </h3>
                {hasResume ? (
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={user?.profile?.resume}
                    className="mt-3 inline-flex text-sm font-semibold text-cyan-800 underline underline-offset-4 hover:text-cyan-950"
                  >
                    {user?.profile?.resumeOriginalName || "View resume"}
                  </a>
                ) : (
                  <p className="mt-3 text-sm text-slate-600">
                    Upload a PDF resume — it helps recruiters shortlist faster.
                  </p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 w-full rounded-xl border-cyan-200 bg-white font-semibold text-cyan-900 hover:bg-cyan-50"
                  onClick={() => setOpen(true)}
                >
                  {hasResume ? "Replace resume" : "Upload resume"}
                </Button>
              </div>
            )}
          </motion.div>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mt-12"
        >
          {user?.role === "student" && (
            <div id="interviews" className="mb-8 rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
              <h3 className="text-lg font-bold text-emerald-900">Upcoming interviews</h3>
              <p className="mt-1 text-sm text-emerald-800/80">
                Real-time interview schedules from recruiters.
              </p>
              {upcomingInterviews.length ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {upcomingInterviews.slice(0, 4).map((app) => {
    const isDeleted = app?.job?.isDeleted || !app?.job;
    return (
        <div key={app._id} className={`rounded-xl border bg-white/80 p-4 ${isDeleted ? "border-red-200 bg-red-50/50" : "border-emerald-100"}`}>
            <div className="flex items-center justify-between gap-2">
                <p className={`font-semibold ${isDeleted ? "text-slate-400 line-through" : "text-slate-900"}`}>
                    {app?.job?.title || "Role"}
                </p>
                {isDeleted && (
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                        Job Removed
                    </span>
                )}
            </div>
            <p className="text-sm text-slate-600">{app?.job?.company?.name || "Company"}</p>
            <p className="mt-2 text-sm font-medium text-emerald-900">
                {new Date(app.interviewAt).toLocaleString()}
            </p>
            {app?.interviewNotes && (
                <p className="mt-1 text-xs text-slate-600">Note: {app.interviewNotes}</p>
            )}
        </div>
    );
})}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-600">No interviews scheduled yet.</p>
              )}
            </div>
          )}

          <div id="applications" className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Applications</h2>
              <p className="text-sm text-slate-600">
                Status updates for your applications — click a card to open the job.
              </p>
            </div>
          </div>
          <AppliedJobsShowcase applications={applications} />
        </motion.section>
      </PageContainer>

      <UpdateProfileDialog open={open} setOpen={setOpen} />
    </PageShell>
  );
};

export default Profile;
