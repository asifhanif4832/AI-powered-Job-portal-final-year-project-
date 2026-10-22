import React, { useEffect } from 'react'
import { createBrowserRouter, RouterProvider, Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import Login from './components/auth/login'
import Signup from './components/auth/signup'
import ForgotPassword from './components/auth/ForgotPassword'

import Home from './components/Home'
import Jobs from './components/Jobs'
import Browse from './components/Browse'
import SavedJobs from './components/SavedJobs'
import Profile from './components/Profile'
import Dashboard from './components/Dashboard'
import HowItWorks from './components/HowItWorks'
import RequireAuth from './components/auth/RequireAuth'
import JobDescription from './components/JobDescription'
import Companies from './components/admin/Companies'
import CompanyCreate from './components/admin/CompanyCreate'
import CompanySetup from './components/admin/CompanySetup'
import AdminJobs from './components/admin/AdminJobs'
import PostJob from './components/admin/PostJob'
import Applicants from './components/admin/Applicants'
import ProtectedRoute from './components/admin/ProtectedRoute'
import JobSetup from './components/admin/JobSetup'
import RecruiterProfile from './components/RecruiterProfile'
import RecruiterPipeline from './components/admin/RecruiterPipeline'
import StudentCareerCenter from './components/StudentCareerCenter'
import RecruiterInsights from './components/admin/RecruiterInsights'
import RecommendedJobs from './components/RecommendedJobs'

const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    })
  }, [pathname])

  return null
}

const RootLayout = () => {
  return (
    <>
      <ScrollToTop />
      <ScrollRestoration />
      <Outlet />
    </>
  )
}

function App() {
  const appRouter = createBrowserRouter([
    {
      element: <RootLayout />,
      children: [
        {
          path: '/',
          element: <Home />,
        },
        {
          path: '/login',
          element: <Login />,
        },
        {
          path: '/signup',
          element: <Signup />,
        },
        {
          path: '/forgot-password',
          element: <ForgotPassword />,
        },
        {
          path: '/jobs',
          element: <Jobs />,
        },
        {
          path: '/description/:id',
          element: <JobDescription />,
        },
        {
          path: '/recruiters/:id',
          element: <RecruiterProfile />,
        },
        {
          path: '/browse',
          element: <Browse />,
        },
        {
          path: '/saved-jobs',
          element: <SavedJobs />,
        },
        {
          path: '/how-it-works',
          element: <HowItWorks />,
        },
        {
          path: '/dashboard',
          element: <RequireAuth><Dashboard /></RequireAuth>,
        },
        {
          path: '/career-center',
          element: <RequireAuth><StudentCareerCenter /></RequireAuth>,
        },
        {
          path: '/recommended-jobs',
          element: <RequireAuth><RecommendedJobs /></RequireAuth>,
        },
        {
          path: '/profile',
          element: <RequireAuth><Profile /></RequireAuth>,
        },
        // Admin / Recruiter routes
        {
          path: '/admin/companies',
          element: <ProtectedRoute><Companies /></ProtectedRoute>,
        },
        {
          path: '/admin/companies/create',
          element: <ProtectedRoute><CompanyCreate /></ProtectedRoute>,
        },
        {
          path: '/admin/companies/:id',
          element: <ProtectedRoute><CompanySetup /></ProtectedRoute>,
        },
        {
          path: '/admin/jobs',
          element: <ProtectedRoute><AdminJobs /></ProtectedRoute>,
        },
        {
          path: '/admin/jobs/create',
          element: <ProtectedRoute><PostJob /></ProtectedRoute>,
        },
        {
          path: '/admin/jobs/:id/edit',
          element: <ProtectedRoute><JobSetup /></ProtectedRoute>,
        },
        {
          path: '/admin/jobs/:id/applicants',
          element: <ProtectedRoute><Applicants /></ProtectedRoute>,
        },
        {
          path: '/admin/pipeline',
          element: <ProtectedRoute><RecruiterPipeline /></ProtectedRoute>,
        },
        {
          path: '/admin/insights',
          element: <ProtectedRoute><RecruiterInsights /></ProtectedRoute>,
        },
      ],
    },
  ])

  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  )
}

export default App
