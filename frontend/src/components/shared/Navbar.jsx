import React, { useState } from 'react'
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { User2, LogOut, Menu, X, Sparkles } from "lucide-react"
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { setUser } from '@/redux/authSlice'
import { setSavedJobIds } from '@/redux/jobSlice'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { NotificationBell } from '@/components/shared/NotificationBell'

const navLinkClass = ({ isActive }) =>
  cn(
    "relative rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-300",
    isActive
      ? "bg-gradient-to-br from-brand-50 to-brand-100/80 text-brand-900 shadow-sm shadow-brand-500/10"
      : "text-slate-600 hover:bg-slate-100/90 hover:text-slate-900"
  )

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const { user } = useSelector(store => store.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const logoutHandler = async () => {
    try {
      const res = await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true })
      if (res.data.success) {
        navigate("/", { replace: true })
        dispatch(setUser(null))
        dispatch(setSavedJobIds([]))
        toast.success(res.data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong")
    }
  }

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 glass-nav"
    >
      <div className="mx-auto flex h-[4.25rem] max-w-screen-xl items-center justify-between px-4 md:px-8">
        <Link
          to="/"
          className="group flex items-center gap-2 text-xl font-bold tracking-tight transition-transform duration-300 hover:scale-[1.02]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-lg shadow-brand-600/30 transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-brand-500/35">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <span className="flex flex-col leading-none sm:flex-row sm:items-baseline sm:gap-1.5">
            <span className="text-slate-900">Job</span>
            <span className="bg-gradient-to-r from-brand-600 via-brand-700 to-accent-600 bg-clip-text text-transparent">
              Portal
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <nav>
            <ul className="flex items-center gap-1">
              {user && user.role === 'recruiter' ? (
                <>
                  <li><NavLink to="/admin/companies" className={navLinkClass}>Companies</NavLink></li>
                  <li><NavLink to="/admin/jobs" className={navLinkClass}>Jobs</NavLink></li>
                  <li><NavLink to="/admin/pipeline" className={navLinkClass}>Pipeline</NavLink></li>
                  <li><NavLink to="/admin/insights" className={navLinkClass}>Insights</NavLink></li>
                  <li><NavLink to="/how-it-works" className={navLinkClass}>How it works</NavLink></li>
                  <li><NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink></li>
                </>
              ) : (
                <>
                  <li><NavLink to="/" end className={navLinkClass}>Home</NavLink></li>
                  <li><NavLink to="/jobs" className={navLinkClass}>Jobs</NavLink></li>
                  <li><NavLink to="/how-it-works" className={navLinkClass}>How it works</NavLink></li>
                  {user?.role === 'student' && (
                    <li><NavLink to="/saved-jobs" className={navLinkClass}>Saved</NavLink></li>
                  )}
                  {/* add here */}
                 {user?.role === 'student' && (
                    <li><NavLink to="/career-center" className={navLinkClass}>Career center</NavLink></li>
                  )}
                  {user?.role === 'student' && (
                    <li><NavLink to="/recommended-jobs" className={navLinkClass}>Recommended</NavLink></li>
                  )}
                  {user && (
                    <li><NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink></li>
                  )}
                </>
              )}
            </ul>
          </nav>

          <div className="ml-5 flex items-center gap-1 border-l border-slate-200/80 pl-5 sm:gap-2">
            {!user ? (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm" className="border-slate-200/90 transition hover:border-brand-200 hover:bg-brand-50/50">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="bg-gradient-to-r from-brand-700 to-brand-800 shadow-md shadow-brand-600/25 transition hover:from-brand-800 hover:to-brand-900 hover:shadow-lg hover:shadow-brand-600/30">
                    Sign up
                  </Button>
                </Link>
              </>
            ) : (
              <>
              <NotificationBell user={user} />
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="group rounded-full p-0.5 ring-2 ring-transparent transition-all duration-300 hover:ring-brand-300/80 focus:outline-none focus:ring-brand-400"
                  >
                    <Avatar className="h-10 w-10 cursor-pointer border-2 border-white shadow-md transition group-hover:scale-105">
                      <AvatarImage src={user?.profile?.profilePhoto} alt="" />
                    </Avatar>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 border-slate-200/80 p-0 shadow-xl">
                  <div className="bg-gradient-to-br from-brand-50/50 to-transparent p-4">
                    <div className="flex gap-4">
                      <Avatar className="h-12 w-12 border-2 border-white shadow">
                        <AvatarImage src={user?.profile?.profilePhoto} />
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-semibold text-slate-900">{user?.fullname}</h4>
                        <p className="line-clamp-2 text-sm text-slate-500">{user?.profile?.bio || "No bio yet"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5 border-t border-slate-100 p-2">
                    {user?.role === 'student' && (
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition hover:bg-brand-50"
                      >
                        <User2 className="h-4 w-4 text-brand-600" />
                        Profile
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={logoutHandler}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                      <LogOut className="h-4 w-4 text-slate-500" />
                      Log out
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          {user && <NotificationBell user={user} />}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 active:scale-95"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden border-t border-slate-100/80 bg-white/95 backdrop-blur-md md:hidden"
        >
          <div className="px-4 pb-4">
            {user && (
              <div className="flex items-center gap-3 border-b border-slate-100 py-4">
                <Avatar className="h-11 w-11 border-2 border-brand-100 shadow-sm">
                  <AvatarImage src={user?.profile?.profilePhoto} />
                </Avatar>
                <div>
                  <h4 className="font-semibold text-slate-900">{user?.fullname}</h4>
                  {user?.role === 'student' && (
                    <Link to="/profile" className="mt-1 text-sm font-medium text-brand-700" onClick={() => setOpen(false)}>
                      View profile
                    </Link>
                  )}
                </div>
              </div>
            )}
            <ul className="flex flex-col gap-1 py-3">
              {user && user.role === 'recruiter' ? (
                <>
                  <NavLink to="/admin/companies" className={navLinkClass} onClick={() => setOpen(false)}>Companies</NavLink>
                  <NavLink to="/admin/jobs" className={navLinkClass} onClick={() => setOpen(false)}>Jobs</NavLink>
                  <NavLink to="/admin/pipeline" className={navLinkClass} onClick={() => setOpen(false)}>Pipeline</NavLink>
                  <NavLink to="/admin/insights" className={navLinkClass} onClick={() => setOpen(false)}>Insights</NavLink>
                  <NavLink to="/how-it-works" className={navLinkClass} onClick={() => setOpen(false)}>How it works</NavLink>
                  <NavLink to="/dashboard" className={navLinkClass} onClick={() => setOpen(false)}>Dashboard</NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/" end className={navLinkClass} onClick={() => setOpen(false)}>Home</NavLink>
                  <NavLink to="/jobs" className={navLinkClass} onClick={() => setOpen(false)}>Jobs</NavLink>
                  <NavLink to="/how-it-works" className={navLinkClass} onClick={() => setOpen(false)}>How it works</NavLink>
                  {user?.role === 'student' && (
                    <NavLink to="/saved-jobs" className={navLinkClass} onClick={() => setOpen(false)}>Saved jobs</NavLink>
                  )}
                  {/* add here */}
                  {user?.role === 'student' && (
                    <NavLink to="/career-center" className={navLinkClass} onClick={() => setOpen(false)}>Career center</NavLink>
                  )}
                  {user?.role === 'student' && (
                    <NavLink to="/recommended-jobs" className={navLinkClass} onClick={() => setOpen(false)}> Recommended</NavLink>
                  )}
                  {user && (
                    <NavLink to="/dashboard" className={navLinkClass} onClick={() => setOpen(false)}>Dashboard</NavLink>
                  )}
                </>
              )}
            </ul>
            {!user ? (
              <div className="flex flex-col gap-2 pt-2">
                <Link to="/login" onClick={() => setOpen(false)}><Button variant="outline" className="w-full">Login</Button></Link>
                <Link to="/signup" onClick={() => setOpen(false)}><Button className="w-full bg-gradient-to-r from-brand-700 to-brand-800">Sign up</Button></Link>
              </div>
            ) : (
              <Button variant="outline" className="mt-2 w-full" onClick={() => { logoutHandler(); setOpen(false) }}>
                Log out
              </Button>
            )}
          </div>
        </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

export default Navbar
