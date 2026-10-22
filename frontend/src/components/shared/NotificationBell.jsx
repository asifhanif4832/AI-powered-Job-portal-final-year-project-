import React from "react";
import { Bell, Briefcase, CheckCheck } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useSocketNotifications } from "@/context/SocketContext";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export function NotificationBell({ user }) {
  const ctx = useSocketNotifications();

  if (!user || !ctx) return null;

  const { notifications, unreadCount, markRead, markAllRead } = ctx;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-brand-800"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[min(100vw-2rem,22rem)] border-slate-200/80 p-0 shadow-xl"
        align="end"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
          <span className="text-sm font-semibold text-slate-900">
            Notifications
          </span>
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={() => markAllRead()}
              className="flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-900"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              {user.role === "recruiter"
                ? "When students apply to your jobs, you will see alerts here in real time."
                : "Application updates from recruiters will appear here."}
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <li key={String(n._id)}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!n.read) markRead(n._id);
                    }}
                    className={cn(
                      "flex w-full gap-3 px-3 py-3 text-left transition hover:bg-slate-50",
                      !n.read && "bg-brand-50/50"
                    )}
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                      <Briefcase className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-slate-900">
                        {n.title}
                      </span>
                      <span className="mt-0.5 line-clamp-2 text-xs text-slate-600">
                        {n.body}
                      </span>
                      {n.job && (
                        <Link
                          to={`/description/${n.job}`}
                          className="mt-1 inline-block text-xs font-medium text-brand-700 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View job
                        </Link>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
