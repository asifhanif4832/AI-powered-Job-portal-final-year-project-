import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { RadioGroup } from '../ui/radio-group'
import { Button } from '../ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import axios from "axios"
import { USER_API_END_POINT } from '@/utils/constant'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '@/redux/authSlice'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { PageShell } from '../layout/PageShell'
import { AuthCard } from '../layout/AuthCard'
import { cn } from '@/lib/utils'

const Signup = () => {
  const [input, setInput] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "",
    file: null,
    otp: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpSending, setOtpSending] = useState(false)

  const { loading, user } = useSelector(store => store.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phoneRegex = /^[0-9]{10,13}$/
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

  const changeEventHandler = (e) => {
    const { name, value } = e.target
    if (name === 'email') {
      setOtpSent(false)
      setInput(prev => ({ ...prev, email: value, otp: '' }))
      return
    }
    setInput({ ...input, [name]: value })
  }

  const changeFileHandler = (e) => {
    setInput({ ...input, file: e.target.files?.[0] || null })
  }

  const sendEmailOtp = async () => {
    if (!emailRegex.test(input.email)) {
      toast.error("Please enter a valid email first")
      return
    }
    try {
      setOtpSending(true)
      const res = await axios.post(
        `${USER_API_END_POINT}/send-register-otp`,
        { email: input.email.trim() },
        { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
      )
      if (res.data.success) {
        setOtpSent(true)
        toast.success(res.data.message)
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Could not send verification code"
      )
    } finally {
      setOtpSending(false)
    }
  }

  const validateForm = () => {
    if (!input.fullname.trim()) {
      toast.error("Full name is required")
      return false
    }

    if (!emailRegex.test(input.email)) {
      toast.error("Please enter a valid email address")
      return false
    }

    if (!otpSent) {
      toast.error('Click "Send code" to verify your email before signing up')
      return false
    }

    if (!/^\d{6}$/.test(String(input.otp).trim())) {
      toast.error("Enter the 6-digit code sent to your email")
      return false
    }

    if (!phoneRegex.test(input.phoneNumber)) {
      toast.error("Please enter a valid phone number")
      return false
    }

    if (!passwordRegex.test(input.password)) {
      toast.error(
        "Password must be at least 8 characters and include uppercase, lowercase, number & special character"
      )
      return false
    }

    if (!input.role) {
      toast.error("Please select a role")
      return false
    }

    if (!input.file) {
      toast.error("Profile picture is required")
      return false
    }

    return true
  }

  const submitHandler = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    const formData = new FormData()
    formData.append("fullname", input.fullname)
    formData.append("email", input.email)
    formData.append("phoneNumber", input.phoneNumber)
    formData.append("password", input.password)
    formData.append("role", input.role)
    formData.append("otp", String(input.otp).trim())
    formData.append("file", input.file)

    try {
      dispatch(setLoading(true))
      const res = await axios.post(
        `${USER_API_END_POINT}/register`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true
        }
      )

      if (res.data.success) {
        toast.success(res.data.message)
        navigate("/login")
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Signup failed")
    } finally {
      dispatch(setLoading(false))
    }
  }

  useEffect(() => {
    if (user) navigate("/")
  }, [user, navigate])

  return (
    <PageShell>
      <Navbar />
      <AuthCard
        wide
        title="Create your account"
        subtitle="Verify your email, then complete your profile to start applying."
      >
        <form onSubmit={submitHandler} className="space-y-4">
          <div className='space-y-2'>
            <Label>Full Name</Label>
            <Input
              name="fullname"
              value={input.fullname}
              onChange={changeEventHandler}
              placeholder="Enter your full name"
              className="h-10"
            />
          </div>

          <div className='space-y-2'>
            <Label>Email</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="email"
                name="email"
                value={input.email}
                onChange={changeEventHandler}
                placeholder="example@email.com"
                className="h-10 flex-1"
              />
              <Button
                type="button"
                variant="outline"
                className="h-10 shrink-0 border-slate-200"
                disabled={otpSending}
                onClick={sendEmailOtp}
              >
                {otpSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Send code"
                )}
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              We will email a 6-digit code to verify this address.
            </p>
          </div>

          <div className='space-y-2'>
            <Label>Email verification code</Label>
            <Input
              inputMode="numeric"
              name="otp"
              maxLength={6}
              value={input.otp}
              onChange={(e) =>
                setInput(prev => ({
                  ...prev,
                  otp: e.target.value.replace(/\D/g, "").slice(0, 6)
                }))
              }
              placeholder="6-digit code"
              disabled={!otpSent}
              className={cn("h-10", !otpSent && "opacity-60")}
            />
            {!otpSent && (
              <p className="text-xs text-amber-800">Send the code to your email first.</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label>Phone Number</Label>
            <Input
              name="phoneNumber"
              value={input.phoneNumber}
              onChange={changeEventHandler}
              placeholder="03001234567"
            />
          </div>

          <div className='my-2'>
            <Label>Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={input.password}
                onChange={changeEventHandler}
                className="pr-10"
                placeholder="Enter strong password"
              />
              <span
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Min 8 chars, uppercase, lowercase, number & special character
            </p>
          </div>

          <RadioGroup className='flex items-center gap-6 my-5'>
            <div className="flex items-center gap-2">
              <Input
                type="radio"
                name="role"
                value="student"
                checked={input.role === 'student'}
                onChange={changeEventHandler}
              />
              <Label>Student</Label>
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="radio"
                name="role"
                value="recruiter"
                checked={input.role === 'recruiter'}
                onChange={changeEventHandler}
              />
              <Label>Recruiter</Label>
            </div>
          </RadioGroup>

          <div className='flex items-center gap-3 my-4'>
            <Label>Profile <span className="text-red-600">*</span></Label>
            <Input type="file" accept="image/*" onChange={changeFileHandler} />
          </div>

          {loading ? (
            <Button type="button" className="h-11 w-full bg-brand-700" disabled>
              <Loader2 className="animate-spin" />
            </Button>
          ) : (
            <Button type="submit" className="h-11 w-full bg-brand-700 hover:bg-brand-800">
              Create account
            </Button>
          )}

          <p className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
              Sign in
            </Link>
          </p>
        </form>
      </AuthCard>
    </PageShell>
  )
}

export default Signup
