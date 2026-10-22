import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "./shared/Navbar";
import Footer from "./shared/Footer";
import { PageShell, PageContainer } from "./layout/PageShell";
import { Button } from "./ui/button";
import {
  ArrowRight,
  Bell,
  Bookmark,
  Building2,
  ClipboardCheck,
  Rocket,
  Search,
  Send,
  Sparkles,
  UserPlus,
  Zap,
} from "lucide-react";

const studentSteps = [
  {
    icon: UserPlus,
    title: "Create your profile",
    body: "Add bio, skills, resume, and experience so recruiters can understand you in seconds.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Search,
    title: "Discover jobs",
    body: "Search by role, keyword, or category — save listings you care about.",
    color: "from-sky-500 to-blue-600",
  },
  {
    icon: Send,
    title: "Apply in one click",
    body: "Submit applications with your profile. Track status from your dashboard.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Bell,
    title: "Real-time updates",
    body: "Get notified when your application status changes — no refresh needed.",
    color: "from-amber-500 to-orange-600",
  },
];

const recruiterSteps = [
  {
    icon: Building2,
    title: "Register your company",
    body: "Create a company profile with logo and details — your brand on every job post.",
    color: "from-indigo-500 to-violet-600",
  },
  {
    icon: ClipboardCheck,
    title: "Post requirements",
    body: "Salary, location, experience, and skills — clear posts attract better candidates.",
    color: "from-rose-500 to-pink-600",
  },
  {
    icon: Zap,
    title: "Instant applications",
    body: "When students apply, you get live notifications and a full applicant list.",
    color: "from-cyan-500 to-sky-600",
  },
  {
    icon: Bookmark,
    title: "Shortlist & decide",
    body: "Accept or reject with one action — candidates are notified automatically.",
    color: "from-fuchsia-500 to-purple-600",
  },
];

export default function HowItWorks() {
  return (
    <PageShell className="flex min-h-screen flex-col">
      <Navbar />

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(124,58,237,0.18),transparent)]" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-t from-accent-200/30 to-transparent blur-3xl" />

        <PageContainer className="py-14 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200/60 bg-white/90 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-800 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Built for clarity & speed
            </span>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
              How{" "}
              <span className="bg-gradient-to-r from-brand-600 via-violet-600 to-accent-500 bg-clip-text text-transparent">
                Job Portal
              </span>{" "}
              works
            </h1>
            <p className="mt-5 text-lg text-slate-600 sm:text-xl">
              A single place for students to launch careers and recruiters to hire
              talent — with a modern UI and real-time updates.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                className="h-12 rounded-full bg-gradient-to-r from-brand-600 to-brand-800 px-8 text-base font-semibold shadow-lg shadow-brand-600/25"
              >
                <Link to="/signup">
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-full border-slate-200 px-8 text-base font-semibold"
              >
                <Link to="/jobs">Browse jobs</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-full border-slate-200 px-8 text-base font-semibold"
              >
                <Link to="/career-center">Career center</Link>
              </Button>
            </div>
          </motion.div>

          <section className="mt-20 sm:mt-28">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg">
                <Rocket className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">For students</h2>
                <p className="text-slate-600">From profile to offer — simplified.</p>
              </div>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {studentSteps.map((s, i) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white p-6 shadow-lg shadow-slate-200/40 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div
                    className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${s.color} opacity-20 blur-2xl transition group-hover:opacity-30`}
                  />
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-md`}
                  >
                    <s.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-900">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.body}</p>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="mt-20 sm:mt-28">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">For recruiters</h2>
                <p className="text-slate-600">Post jobs and manage applicants effortlessly.</p>
              </div>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {recruiterSteps.map((s, i) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white p-6 shadow-lg shadow-slate-200/40 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div
                    className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${s.color} opacity-20 blur-2xl transition group-hover:opacity-30`}
                  />
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-md`}
                  >
                    <s.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-900">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.body}</p>
                </motion.div>
              ))}
            </div>
          </section>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-20 rounded-3xl border border-brand-200/50 bg-gradient-to-br from-brand-600 via-violet-600 to-accent-600 p-8 text-center text-white shadow-2xl shadow-brand-500/30 sm:p-12"
          >
            <h2 className="text-2xl font-bold sm:text-3xl">Ready to try it?</h2>
            <p className="mx-auto mt-3 max-w-lg text-white/90">
              Join as a student or recruiter — your role shapes the experience you see.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                asChild
                className="h-12 rounded-full bg-white px-8 font-semibold text-brand-800 hover:bg-white/90"
              >
                <Link to="/signup">Create account</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-full border-white/40 bg-white/10 px-8 font-semibold text-white shadow-none backdrop-blur-sm hover:bg-white/20"
              >
                <Link to="/login">Log in</Link>
              </Button>
            </div>
          </motion.div>
        </PageContainer>
      </div>

      <Footer />
    </PageShell>
  );
}
