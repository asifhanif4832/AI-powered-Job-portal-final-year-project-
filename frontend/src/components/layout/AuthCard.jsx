import React from "react";
import { cn } from "@/lib/utils";

export function AuthCard({ children, title, subtitle, className, wide = false }) {
  return (
    <div
      className={cn(
        "min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-10 sm:py-14",
        className
      )}
    >
      <div className={cn("w-full", wide ? "max-w-2xl" : "max-w-md")}>
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-surface-card p-6 shadow-lg shadow-slate-200/60 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
