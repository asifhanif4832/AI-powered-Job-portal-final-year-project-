import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { RadioGroup } from '../ui/radio-group'
import { Button } from '../ui/button'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import axios from "axios"
import { USER_API_END_POINT } from '@/utils/constant'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading, setUser } from '@/redux/authSlice'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { PageShell } from '../layout/PageShell'
import { AuthCard } from '../layout/AuthCard'

const Login = () => {
  const [input, setInput] = useState({
    email: "",
    password: "",
    role: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const { loading, user } = useSelector(store => store.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const getDestination = (role, fromPath) => {
    if (role === 'recruiter') {
      if (fromPath && (fromPath.startsWith('/admin') || fromPath === '/dashboard')) {
        return fromPath
      }
      return '/admin/companies'
    } else {
      if (fromPath && !fromPath.startsWith('/admin')) {
        return fromPath
      }
      return '/'
    }
  }

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value })
  }

  const submitHandler = async (e) => {
    e.preventDefault()
    try {
      dispatch(setLoading(true))
      const res = await axios.post(
        `${USER_API_END_POINT}/login`,
        input,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      )
      if (res.data.success) {
        const loggedInUser = res.data.user
        dispatch(setUser(loggedInUser))
        toast.success(res.data.message)
        const target = getDestination(loggedInUser?.role, location.state?.from?.pathname)
        navigate(target, { replace: true })
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Login failed"
      )
    } finally {
      dispatch(setLoading(false))
    }
  }

  useEffect(() => {
    if (user) {
      const target = getDestination(user?.role, location.state?.from?.pathname)
      navigate(target, { replace: true })
    }
  }, [user, navigate, location.state])

  return (
    <PageShell>
      <Navbar />
      <AuthCard
        title="Welcome back"
        subtitle="Sign in to manage applications and saved jobs."
      >
        <form onSubmit={submitHandler} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              value={input.email}
              onChange={changeEventHandler}
              placeholder="you@example.com"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-brand-700 hover:text-brand-800"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={input.password}
                onChange={changeEventHandler}
                className="h-11 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">I am a</Label>
            <RadioGroup className="flex flex-wrap gap-4">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50">
                <Input
                  type="radio"
                  name="role"
                  value="student"
                  checked={input.role === 'student'}
                  onChange={changeEventHandler}
                  className="h-4 w-4"
                />
                <span className="text-sm font-medium">Student</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50">
                <Input
                  type="radio"
                  name="role"
                  value="recruiter"
                  checked={input.role === 'recruiter'}
                  onChange={changeEventHandler}
                  className="h-4 w-4"
                />
                <span className="text-sm font-medium">Recruiter</span>
              </label>
            </RadioGroup>
          </div>

          {loading ? (
            <Button type="button" className="h-11 w-full bg-brand-700" disabled>
              <Loader2 className="animate-spin" />
            </Button>
          ) : (
            <Button type="submit" className="h-11 w-full bg-brand-700 hover:bg-brand-800">
              Sign in
            </Button>
          )}

          <p className="text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="font-semibold text-brand-700 hover:text-brand-800">
              Create one
            </Link>
          </p>
        </form>
      </AuthCard>
    </PageShell>
  )
}

export default Login
