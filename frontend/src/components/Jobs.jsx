import React, { useEffect, useMemo, useState } from 'react'
import Navbar from './shared/Navbar'
import FilterCard, { DEFAULT_FILTERS } from './FilterCard'
import FiltersModal from './FiltersModal'
import Job from './Job'
import useGetAllJobs from '@/hooks/useGetAllJobs'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { setSearchedQuery } from '@/redux/jobSlice'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { SlidersHorizontal, X } from 'lucide-react'
import { PageShell, PageContainer, SectionHeader } from './layout/PageShell'

const Jobs = () => {
  useGetAllJobs()
  // this is changes
 const { allJobs, searchedQuery } = useSelector(store => store.job ?? { allJobs: [], searchedQuery: '' })
  const dispatch = useDispatch()

  const [filterJobs, setFilterJobs] = useState(allJobs)
  const [openFilter, setOpenFilter] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState(DEFAULT_FILTERS)

  const filterData = useMemo(() => {
    const locations = [...new Set((allJobs || []).map(job => job?.location).filter(Boolean))]
    const industries = [...new Set((allJobs || []).map(job => job?.title).filter(Boolean))]
    return [
      { filterType: 'Location', array: locations },
      { filterType: 'Industry', array: industries },
      { filterType: 'Salary', array: ['0k-40k', '41k-1lakh', '1lakh-5lakh', '5lakh+'] },
    ]
  }, [allJobs])

  const activeFilterEntries = useMemo(
    () => Object.entries(advancedFilters).filter(([, value]) => value !== 'all'),
    [advancedFilters]
  )

  useEffect(() => {
    const query = (searchedQuery || '').toLowerCase().trim()

    const filtered = (allJobs || []).filter(job => {
      const locationMatch =
        advancedFilters.Location === 'all' ||
        (job?.location || '').toLowerCase() === advancedFilters.Location.toLowerCase()

      const industryMatch =
        advancedFilters.Industry === 'all' ||
        (job?.title || '').toLowerCase().includes(advancedFilters.Industry.toLowerCase())

      const salary = Number(job?.salary || 0)
      const salaryMatch =
        advancedFilters.Salary === 'all' ||
        (advancedFilters.Salary === '0k-40k' && salary <= 40) ||
        (advancedFilters.Salary === '41k-1lakh' && salary > 40 && salary <= 100) ||
        (advancedFilters.Salary === '1lakh-5lakh' && salary > 100 && salary <= 500) ||
        (advancedFilters.Salary === '5lakh+' && salary > 500)

      const keywordMatch =
        !query ||
        (job?.title || '').toLowerCase().includes(query) ||
        (job?.description || '').toLowerCase().includes(query) ||
        (job?.location || '').toLowerCase().includes(query)

      return locationMatch && industryMatch && salaryMatch && keywordMatch
    })

    setFilterJobs(filtered)
  }, [allJobs, searchedQuery, advancedFilters])

  // useEffect(() => {
  //   return () => {
  //     dispatch(setSearchedQuery(''))
  //   }
  // }, [dispatch])

  return (
    <PageShell>
      <Navbar />

      <PageContainer className="py-8">
        <SectionHeader
          eyebrow="Explore"
          title="All jobs"
          description="Filter by location or role, then save roles you like."
        />

        <div className="mb-6 lg:hidden">
          <Button
            type="button"
            variant="outline"
            className="gap-2 border-slate-200"
            onClick={() => setOpenFilter(true)}
          >
            <SlidersHorizontal size={18} />
            Filters
          </Button>
        </div>

        {activeFilterEntries.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {activeFilterEntries.map(([key, value]) => (
              <Badge key={key} className="border-0 bg-brand-50 text-brand-900">
                {key}: {value}
              </Badge>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-slate-600"
              onClick={() => setAdvancedFilters(DEFAULT_FILTERS)}
            >
              <X className="h-3.5 w-3.5" />
              Clear all
            </Button>
          </div>
        )}

        <div className="relative flex gap-8">
          <aside className="hidden w-[280px] shrink-0 lg:block">
            <div className="sticky top-24 rounded-2xl border border-slate-200/80 bg-surface-card p-4 shadow-sm">
              <FilterCard
                selectedFilters={advancedFilters}
                onChange={setAdvancedFilters}
                onReset={() => setAdvancedFilters(DEFAULT_FILTERS)}
                filterData={filterData}
              />
            </div>
          </aside>

          <FiltersModal
            open={openFilter}
            onOpenChange={setOpenFilter}
            selectedFilters={advancedFilters}
            onChange={setAdvancedFilters}
            onApply={() => setOpenFilter(false)}
            onReset={() => setAdvancedFilters(DEFAULT_FILTERS)}
            filterData={filterData}
          />

          <div className="min-w-0 flex-1">
            {filterJobs.length <= 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-surface-muted py-20 text-center text-slate-500">
                No jobs match your filters yet.
              </div>
            ) : (
              <div className="max-h-[calc(100vh-12rem)] overflow-y-auto pb-8">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {filterJobs.map(job => (
                    <motion.div
                      key={job?._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Job job={job} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </PageShell>
  )
}

export default Jobs
