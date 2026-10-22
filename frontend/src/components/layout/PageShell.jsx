import React from "react";
import { cn } from "@/lib/utils";

/** Standard page wrapper: full-width background + centered content. */
export function PageShell({ children, className, withPadding = true }) {
  return (
    <div
      className={cn(
        "min-h-screen bg-surface-page text-slate-900",
        withPadding && "pb-12",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PageContainer({ children, className, narrow = false }) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10",
        narrow && "max-w-3xl",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeader({ eyebrow, title, description, className }) {
  return (
    <div className={cn("mb-8 text-center sm:text-left", className)}>
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-600">
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}
