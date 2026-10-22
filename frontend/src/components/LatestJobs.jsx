import React from 'react'
import LatestJobCards from './LatestJobCards'
import { useSelector } from 'react-redux'
import { PageContainer, SectionHeader } from './layout/PageShell'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import { ArrowRight } from 'lucide-react'

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

const LatestJobs = () => {
  const { allJobs } = useSelector(store => store.job)
  const latestJobs = (allJobs || []).slice(0, 6)

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className="py-12 sm:py-16"
    >
      <PageContainer>
        <SectionHeader
          eyebrow="Open roles"
          title={<>Latest & top <span className="text-brand-700">job openings</span></>}
          description="Hand-picked listings from companies hiring now."
        />

        <motion.div
          variants={listVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="hidden gap-5 lg:grid lg:grid-cols-3"
        >
          {latestJobs.length <= 0 ? (
            <p className="col-span-full text-center text-slate-500">No jobs available yet.</p>
          ) : (
            latestJobs.map(job => (
              <motion.div key={job._id} variants={cardVariants}>
                <LatestJobCards job={job} />
              </motion.div>
            ))
          )}
        </motion.div>

        <motion.div
          variants={listVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="hidden gap-5 sm:grid sm:grid-cols-2 lg:hidden"
        >
          {latestJobs.length <= 0 ? (
            <p className="col-span-full text-center text-slate-500">No jobs available yet.</p>
          ) : (
            latestJobs.map(job => (
              <motion.div key={job._id} variants={cardVariants}>
                <LatestJobCards job={job} />
              </motion.div>
            ))
          )}
        </motion.div>

        <motion.div
          variants={listVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="flex flex-col gap-4 sm:hidden"
        >
          {latestJobs.length <= 0 ? (
            <p className="text-center text-slate-500">No jobs available yet.</p>
          ) : (
            latestJobs.map(job => (
              <motion.div key={job._id} variants={cardVariants}>
                <LatestJobCards job={job} />
              </motion.div>
            ))
          )}
        </motion.div>

        {(allJobs || []).length > 6 && (
          <div className="mt-10 flex justify-center">
            <Link to="/jobs">
              <Button className="h-11 rounded-xl bg-brand-700 px-6 font-semibold text-white shadow-md transition hover:bg-brand-800 hover:shadow-lg">
                View all jobs ({allJobs.length})
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </PageContainer>
    </motion.section>
  )
}

export default LatestJobs
