import React from 'react'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const LatestJobCards = ({ job }) => {
  const navigate = useNavigate()
  return (
    <motion.div
      role="button"
      tabIndex={0}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.99 }}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/description/${job._id}`)}
      onClick={() => navigate(`/description/${job._id}`)}
      className="group h-full cursor-pointer rounded-2xl border border-slate-200/80 bg-surface-card p-6 shadow-sm transition-all duration-300 hover:border-brand-200/90 hover:shadow-lg hover:shadow-brand-500/15"
    >
      <div>
        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-brand-800">
          {job?.company?.name}
        </h3>
        <p className="text-sm text-slate-500">{job?.location || '—'}</p>
      </div>
      <div className="mt-4">
        <h4 className="text-base font-semibold text-slate-800">{job?.title}</h4>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{job?.description}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge className="border-0 bg-blue-50 font-medium text-blue-800" variant="secondary">
          {job?.position} positions
        </Badge>
        <Badge className="border-0 bg-accent-50 font-medium text-accent-700" variant="secondary">
          {job?.jobType}
        </Badge>
        <Badge className="border-0 bg-brand-50 font-medium text-brand-800" variant="secondary">
          {job?.salary}k
        </Badge>
      </div>
    </motion.div>
  )
}

export default LatestJobCards
