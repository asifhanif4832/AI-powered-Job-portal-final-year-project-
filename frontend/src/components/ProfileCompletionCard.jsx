import React from "react";
import { Button } from "./ui/button";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";
import { getStudentProfileCompletion } from "@/lib/profileCompletion";

const ProfileCompletionCard = ({ user, onEditProfile }) => {
  const { percent, steps, complete, isStudent } = getStudentProfileCompletion(user);

  if (!isStudent) return null;

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-br from-fuchsia-500/10 via-white to-cyan-500/10 p-6 shadow-xl shadow-brand-900/[0.07] ring-1 ring-brand-100/80 sm:p-8">
      <div className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-gradient-to-br from-violet-400/30 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-0 h-56 w-56 rounded-full bg-gradient-to-tl from-amber-400/20 to-transparent blur-3xl" />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative mx-auto flex h-36 w-36 shrink-0 items-center justify-center sm:mx-0">
            <svg className="h-36 w-36 -rotate-90" viewBox="0 0 120 120" aria-hidden>
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-200"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="url(#profileRing)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-[stroke-dashoffset] duration-700 ease-out"
              />
              <defs>
                <linearGradient id="profileRing" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black tabular-nums text-slate-900">{percent}%</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                strength
              </span>
            </div>
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-800 ring-1 ring-brand-100">
              <Sparkles className="h-3 w-3" />
              Profile polish
            </span>
            <h2 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
              {complete ? "Profile looks amazing" : "Level up your profile"}
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">
              {complete
                ? "You have filled the essentials — recruiters can evaluate you with confidence."
                : "Each block below is worth visibility. Complete them for a stronger first impression."}
            </p>
          </div>
        </div>
      </div>

      <ul className="relative mt-8 grid gap-3 sm:grid-cols-2">
        {steps.map((step) => (
          <li
            key={step.id}
            className="flex items-start gap-3 rounded-2xl border border-slate-100/80 bg-white/70 p-4 shadow-sm backdrop-blur-sm"
          >
            {step.done ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
            ) : (
              <Circle className="mt-0.5 h-5 w-5 shrink-0 text-slate-300" />
            )}
            <div>
              <span className="font-semibold text-slate-900">{step.label}</span>
              <p className="text-xs text-slate-500">{step.description}</p>
            </div>
          </li>
        ))}
      </ul>

      {!complete && (
        <Button
          type="button"
          className="relative mt-8 w-full rounded-2xl bg-gradient-to-r from-brand-600 via-violet-600 to-accent-500 py-6 text-base font-bold shadow-lg shadow-brand-500/25 hover:from-brand-700 hover:via-violet-700 hover:to-accent-600"
          onClick={onEditProfile}
        >
          Complete profile now
        </Button>
      )}
    </div>
  );
};

export default ProfileCompletionCard;
