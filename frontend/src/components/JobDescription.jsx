import React, { useEffect, useMemo, useState } from "react";
import Navbar from "./shared/Navbar";
import { Button } from "./ui/button";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import {
  APPLICATION_API_END_POINT,
  JOB_API_END_POINT,
  USER_API_END_POINT,
} from "@/utils/constant";
import { setSingleJob, toggleSavedJobId, setSavedJobIds } from "@/redux/jobSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { PageShell, PageContainer } from "./layout/PageShell";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Clock,
  Banknote,
  Users,
  Building2,
  Sparkles,
  CheckCircle2,
  Send,
  Bookmark,
} from "lucide-react";
import { cn } from "@/lib/utils";

function fmtDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function JobDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-8 py-4">
      <div className="h-4 w-32 rounded bg-slate-200" />
      <div className="h-48 rounded-3xl bg-slate-200/80" />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="h-6 w-3/4 rounded bg-slate-200" />
          <div className="h-24 rounded-2xl bg-slate-100" />
          <div className="h-40 rounded-2xl bg-slate-100" />
        </div>
        <div className="h-64 rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}

const JobDescription = () => {
  const { singleJob, savedJobIds } = useSelector((store) => store.job);
  const { user } = useSelector((store) => store.auth);
  const [isApplied, setIsApplied] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const params = useParams();
  const jobId = params.id;
  const isSaved = jobId && savedJobIds.includes(String(jobId));
  const canSave = user?.role === "student";

  const dispatch = useDispatch();

  const isOwner = useMemo(() => {
    if (!user || !singleJob?.created_by) return false;
    const ownerId = singleJob.created_by?._id ?? singleJob.created_by;
    return String(ownerId) === String(user._id);
  }, [user, singleJob?.created_by]);

  const canApply =
    user?.role === "student" && !isOwner && singleJob;

  const isInitiallyApplied = useMemo(() => {
    return (
      singleJob?.applications?.some((application) => {
        const aid = application.applicant?._id ?? application.applicant;
        return String(aid) === String(user?._id);
      }) || false
    );
  }, [singleJob?.applications, user?._id]);

  useEffect(() => {
    setIsApplied(isInitiallyApplied);
  }, [isInitiallyApplied]);

  const applyJobHandler = async () => {
    if (!canApply || !jobId) return;
    try {
      const res = await axios.get(
        `${APPLICATION_API_END_POINT}/apply/${jobId}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setIsApplied(true);
        const updatedSingleJob = {
          ...singleJob,
          applications: [
            ...(singleJob?.applications || []),
            { applicant: user?._id },
          ],
        };
        dispatch(setSingleJob(updatedSingleJob));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Apply failed");
    }
  };

  const saveForLaterHandler = async () => {
    if (!canSave || !jobId) {
      toast.error("Please sign in as a student to save jobs");
      return;
    }
    try {
      setSaveLoading(true);
      const res = await axios.post(
        `${USER_API_END_POINT}/saved-jobs/${jobId}`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        dispatch(toggleSavedJobId(jobId));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not update saved jobs");
    } finally {
      setSaveLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    dispatch(setSingleJob(null));

    const fetchSingleJob = async () => {
      try {
        const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, {
          withCredentials: true,
        });
        if (cancelled) return;
        if (res.data.success) {
          dispatch(setSingleJob(res.data.job));
          const applied = res.data.job.applications?.some((application) => {
            const aid = application.applicant?._id ?? application.applicant;
            return String(aid) === String(user?._id);
          });
          setIsApplied(!!applied);
        } else {
          setLoadError("notfound");
        }
      } catch {
        if (!cancelled) setLoadError("failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (jobId) fetchSingleJob();
    return () => {
      cancelled = true;
    };
  }, [jobId, dispatch, user?._id]);

  useEffect(() => {
    const syncSavedIds = async () => {
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
    syncSavedIds();
  }, [user?._id, user?.role, dispatch]);

  const requirementsList = useMemo(() => {
    const r = singleJob?.requirements;
    if (!r) return [];
    if (Array.isArray(r)) return r.map((s) => String(s).trim()).filter(Boolean);
    return String(r)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [singleJob?.requirements]);

  const company = singleJob?.company;
  const recruiterProfileId = singleJob?.created_by?._id || singleJob?.created_by;
  const applicantCount = singleJob?.applications?.length ?? 0;

  if (loadError) {
    return (
      <PageShell>
        <Navbar />
        <PageContainer className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-brand-100 p-4 text-brand-700">
            <Briefcase className="h-10 w-10" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            Job not found
          </h1>
          <p className="mt-2 max-w-md text-slate-600">
            This listing may have been removed or the link is incorrect.
          </p>
          <Button asChild className="mt-8 rounded-full bg-brand-700 px-8 hover:bg-brand-800">
            <Link to="/jobs">Browse all jobs</Link>
          </Button>
        </PageContainer>
      </PageShell>
    );
  }

  if (loading || !singleJob || String(singleJob._id) !== String(jobId)) {
    return (
      <PageShell>
        <Navbar />
        <PageContainer className="py-8">
          <JobDetailSkeleton />
        </PageContainer>
      </PageShell>
    );
  }

  return (
    <PageShell className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_90%_40%_at_50%_-10%,rgba(124,58,237,0.12),transparent)]" />
      <Navbar />

      <PageContainer className="relative py-8 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            to="/jobs"
            className="group inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-brand-800"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200/80 transition group-hover:ring-brand-200">
              <ArrowLeft className="h-4 w-4" />
            </span>
            Back to jobs
          </Link>
        </motion.div>

        {/* Hero card */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-8 overflow-hidden rounded-3xl border border-slate-200/60 bg-gradient-to-br from-white via-white to-brand-50/30 p-6 shadow-xl shadow-brand-900/[0.06] sm:p-8 lg:p-10"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-10 h-48 w-48 rounded-full bg-accent-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 flex-1 gap-5">
              <div className="relative shrink-0">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-white bg-white shadow-lg shadow-slate-200/50 ring-2 ring-brand-100 sm:h-24 sm:w-24">
                  {company?.logo ? (
                    <img
                      src={company.logo}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Building2 className="h-10 w-10 text-brand-500 sm:h-12 sm:w-12" />
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-md">
                  <Sparkles className="h-4 w-4" />
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                  {company?.name || "Company"}
                </p>
                <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
                  {singleJob.title}
                </h1>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 ring-1 ring-blue-100">
                    <Briefcase className="h-3.5 w-3.5" />
                    {singleJob.position} open
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/80">
                    <MapPin className="h-3.5 w-3.5" />
                    {singleJob.jobType}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-900 ring-1 ring-brand-100">
                    <Banknote className="h-3.5 w-3.5" />
                    {singleJob.salary}k
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100">
                    <Users className="h-3.5 w-3.5" />
                    {applicantCount} applicant{applicantCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex w-full shrink-0 flex-col gap-3 sm:flex-row sm:items-center lg:w-auto lg:flex-col lg:items-stretch">
              {isOwner && user?.role === "recruiter" && (
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-2xl border-brand-200 bg-white/80 font-semibold shadow-sm hover:bg-brand-50"
                >
                  <Link to={`/admin/jobs/${jobId}/applicants`}>
                    View applicants
                  </Link>
                </Button>
              )}

              {canSave && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-2xl border-slate-200 font-semibold shadow-sm transition hover:border-brand-200 hover:bg-brand-50/50"
                  onClick={saveForLaterHandler}
                  disabled={saveLoading}
                >
                  <Bookmark
                    className={cn(
                      "mr-2 h-4 w-4",
                      isSaved && "fill-brand-600 text-brand-600"
                    )}
                  />
                  {saveLoading ? "…" : isSaved ? "Saved" : "Save for later"}
                </Button>
              )}

              {!user && (
                <Button
                  asChild
                  className="h-12 rounded-2xl bg-gradient-to-r from-brand-700 to-brand-800 font-semibold shadow-lg shadow-brand-600/25"
                >
                  <Link to="/login">Log in to apply</Link>
                </Button>
              )}

              {user?.role === "student" && canApply && (
                <Button
                  type="button"
                  onClick={isApplied ? undefined : applyJobHandler}
                  disabled={isApplied}
                  className={cn(
                    "h-12 rounded-2xl font-semibold shadow-lg transition",
                    isApplied
                      ? "cursor-not-allowed bg-slate-300 text-slate-600 shadow-none"
                      : "bg-gradient-to-r from-brand-700 to-brand-800 shadow-brand-600/25 hover:from-brand-800 hover:to-brand-900"
                  )}
                >
                  {isApplied ? (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Already applied
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Apply now
                    </>
                  )}
                </Button>
              )}

              {user?.role === "recruiter" && !isOwner && (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-600">
                  Recruiter accounts cannot apply. Switch to a student profile
                  to apply to roles.
                </p>
              )}
            </div>
          </div>
        </motion.section>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="space-y-8"
          >
            <section className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm backdrop-blur-sm sm:p-8">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                  <Briefcase className="h-4 w-4" />
                </span>
                About the role
              </h2>
              <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-600">
                {singleJob.description}
              </p>
            </section>

            {requirementsList.length > 0 && (
              <section className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm backdrop-blur-sm sm:p-8">
                <h2 className="text-lg font-bold text-slate-900">
                  Requirements
                </h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {requirementsList.map((req, i) => (
                    <motion.li
                      key={`${req}-${i}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm text-slate-700"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                      {req}
                    </motion.li>
                  ))}
                </ul>
              </section>
            )}
          </motion.div>

          {/* Sidebar stats */}
          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="lg:sticky lg:top-24"
          >
            <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-b from-white to-slate-50/90 p-6 shadow-lg shadow-slate-200/40">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Job facts
              </h3>
              <dl className="mt-6 space-y-5">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <dt className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                    <MapPin className="h-4 w-4 text-brand-500" />
                    Location
                  </dt>
                  <dd className="text-right text-sm font-semibold text-slate-900">
                    {singleJob.location}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <dt className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                    <Clock className="h-4 w-4 text-brand-500" />
                    Experience
                  </dt>
                  <dd className="text-right text-sm font-semibold text-slate-900">
                    {singleJob.experienceLevel} years
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <dt className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                    <Banknote className="h-4 w-4 text-brand-500" />
                    Salary
                  </dt>
                  <dd className="text-right text-sm font-semibold text-slate-900">
                    {singleJob.salary} (thousands)
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <dt className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                    <Users className="h-4 w-4 text-brand-500" />
                    Applicants
                  </dt>
                  <dd className="text-right text-sm font-semibold text-slate-900">
                    {applicantCount}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                    Posted
                  </dt>
                  <dd className="text-right text-sm font-semibold text-slate-900">
                    {fmtDate(singleJob.createdAt)}
                  </dd>
                </div>
              </dl>

              {company?.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 flex w-full items-center justify-center rounded-xl border border-brand-200 bg-brand-50/50 py-3 text-sm font-semibold text-brand-800 transition hover:bg-brand-100/80"
                >
                  Company website
                </a>
              )}
              {recruiterProfileId && (
                <Link
                  to={`/recruiters/${recruiterProfileId}`}
                  className="mt-3 flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  View recruiter profile
                </Link>
              )}
            </div>
          </motion.aside>
        </div>
      </PageContainer>
    </PageShell>
  );
};

export default JobDescription;
