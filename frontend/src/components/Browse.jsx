import React, { useEffect } from 'react'
import Navbar from './shared/Navbar'
import Job from './Job'
import { useDispatch, useSelector } from 'react-redux'
import store from '@/redux/store'
import { setSearchedQuery } from '@/redux/jobSlice'
import useGetAllJobs from '@/hooks/useGetAllJobs'
import { PageShell, PageContainer, SectionHeader } from './layout/PageShell'

const Browse = () => {
  useGetAllJobs()
  const { allJobs } = useSelector(store => store.job)
  const dispatch = useDispatch()

  useEffect(() => {
    return () => {
      dispatch(setSearchedQuery(''))
    }
  }, [dispatch])

  return (
    <PageShell>
      <Navbar />
      <PageContainer className="py-8 sm:py-10">
        <SectionHeader
          eyebrow="Search"
          title="Browse jobs"
          description={`${allJobs.length} listing${allJobs.length === 1 ? '' : 's'} match your filters.`}
        />

        <div className='hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-3'>
          {allJobs.length <= 0 ? (
            <p className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-surface-card py-16 text-center text-slate-500">
              No jobs found. Try another keyword.
            </p>
          ) : (
            allJobs.map(job => <Job key={job._id} job={job} />)
          )}
        </div>

        <div className='flex gap-4 overflow-x-auto pb-4 scrollbar-hide sm:hidden'>
          {allJobs.length <= 0 ? (
            <p className="w-full py-12 text-center text-slate-500">No jobs found.</p>
          ) : (
            allJobs.map(job => (
              <div key={job._id} className="min-w-[280px] shrink-0">
                <Job job={job} />
              </div>
            ))
          )}
        </div>
      </PageContainer>
    </PageShell>
  )
}

export default Browse
