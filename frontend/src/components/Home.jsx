import React, { useEffect } from 'react'
import Navbar from './shared/Navbar'
import HeroSection from './HeroSection'
import CategoryCarousel from './CategoryCarousel'
import LatestJobs from './LatestJobs'
import Footer from './shared/Footer'
import useGetAllJobs from '@/hooks/useGetAllJobs'
import { useDispatch, useSelector } from 'react-redux'
import store from '@/redux/store'
import { useNavigate } from 'react-router-dom'
import { setSearchedQuery } from '@/redux/jobSlice'
import { PageShell } from './layout/PageShell'

const Home = () => {
  const dispatch = useDispatch()
  useGetAllJobs()
  const { user } = useSelector(store => store.auth)
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.role === 'recruiter') {
      navigate("/admin/companies")
    }
  }, [user?.role, navigate])

  useEffect(() => {
    dispatch(setSearchedQuery(''))
  }, [dispatch])

  return (
    <PageShell className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col">
        <HeroSection />
        <CategoryCarousel />
        <LatestJobs />
      </main>
      <Footer />
    </PageShell>
  )
}

export default Home
