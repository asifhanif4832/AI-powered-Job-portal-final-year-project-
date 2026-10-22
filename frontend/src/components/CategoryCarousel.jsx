import React from 'react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel'
import { Button } from './ui/button'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setSearchedQuery } from '@/redux/jobSlice'
import { PageContainer } from './layout/PageShell'
import { motion } from 'framer-motion'

const category = [
  "Frontend Developer",
  "Backend Developer",
  "Data Science",
  "Graphic Designer",
  "FullStack Developer"
]

const CategoryCarousel = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const searchJobHandler = (query) => {
    dispatch(setSearchedQuery(query))
    navigate("/jobs")
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="border-y border-slate-200/60 bg-gradient-to-b from-white to-slate-50/80 py-12"
    >
      <PageContainer>
        <p className="mb-8 text-center text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Explore by role
        </p>
        <div className="relative px-10 sm:px-14">
          <Carousel className="w-full">
            <CarouselContent className="-ml-2">
              {category.map((cat, index) => (
                <CarouselItem
                  key={index}
                  className="basis-full pl-2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                    <Button
                      type="button"
                      onClick={() => searchJobHandler(cat)}
                      variant="outline"
                      className="h-12 w-full rounded-2xl border-slate-200/90 bg-white/80 text-slate-700 shadow-sm backdrop-blur-sm transition hover:border-brand-300 hover:bg-gradient-to-br hover:from-brand-50 hover:to-white hover:text-brand-900 hover:shadow-md hover:shadow-brand-500/10"
                    >
                      {cat}
                    </Button>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="border-slate-200 bg-white/90 text-slate-600 shadow-md backdrop-blur-sm transition hover:bg-brand-50 hover:text-brand-800" />
            <CarouselNext className="border-slate-200 bg-white/90 text-slate-600 shadow-md backdrop-blur-sm transition hover:bg-brand-50 hover:text-brand-800" />
          </Carousel>
        </div>
      </PageContainer>
    </motion.section>
  )
}

export default CategoryCarousel
