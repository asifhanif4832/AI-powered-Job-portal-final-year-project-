import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from './ui/button'
import { useDispatch } from 'react-redux'
import { setSearchedQuery } from '@/redux/jobSlice'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

const HeroSection = () => {
  const [query, setQuery] = useState("")
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const searchJobHandler = () => {
    if (!query.trim()) return
    dispatch(setSearchedQuery(query.trim()))
    navigate("/jobs")
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') searchJobHandler()
  }

  return (
    <section className="relative overflow-hidden px-4 pt-10 pb-8 sm:pt-16 sm:pb-12">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl animate-float-soft" />
      <div className="pointer-events-none absolute -right-16 top-40 h-64 w-64 rounded-full bg-accent-500/12 blur-3xl animate-float-delayed" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[120%] -translate-x-1/2 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(124,58,237,0.2),transparent)]" />

      <motion.div
        className="relative mx-auto max-w-3xl text-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.span
          variants={item}
          className="inline-flex items-center gap-2 rounded-full border border-brand-200/60 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-brand-800 shadow-sm backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600" />
          </span>
          Live listings
        </motion.span>

        <motion.h1
          variants={item}
          className="mt-7 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl md:leading-[1.1]"
        >
          Search, apply & land your{" "}
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-r from-brand-600 via-brand-700 to-accent-500 bg-clip-text text-transparent animate-gradient-shift">
              dream job
            </span>
            <span className="absolute -inset-1 -z-0 rounded-lg bg-gradient-to-r from-brand-500/20 to-accent-500/20 blur-xl" />
          </span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg"
        >
          Explore open roles, save what you love, and apply with one profile — built for students and recruiters.
        </motion.p>

        <motion.div
          variants={item}
          className="mx-auto mt-10 flex max-w-xl flex-col gap-4 sm:flex-row sm:items-stretch"
        >
          <div className="group flex flex-1 items-center gap-3 rounded-2xl border border-slate-200/90 bg-white/90 py-1.5 pl-4 pr-1.5 shadow-lg shadow-slate-200/40 backdrop-blur-sm transition duration-300 focus-within:border-brand-300 focus-within:shadow-brand-500/15 focus-within:ring-2 focus-within:ring-brand-500/20">
            <Search className="h-5 w-5 shrink-0 text-brand-500 transition group-focus-within:scale-110" />
            <input
              type="text"
              placeholder="Role, company, keyword…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-w-0 flex-1 border-0 bg-transparent py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
            />
          </div>
          <Button
            type="button"
            onClick={searchJobHandler}
            className="h-[52px] shrink-0 rounded-2xl bg-gradient-to-r from-brand-700 to-brand-800 px-8 text-base font-semibold shadow-lg shadow-brand-600/25 transition hover:from-brand-800 hover:to-brand-900 hover:shadow-xl hover:shadow-brand-600/30 active:scale-[0.98] sm:h-auto sm:min-w-[140px]"
          >
            Search
          </Button>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default HeroSection
