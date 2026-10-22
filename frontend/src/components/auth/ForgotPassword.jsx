import React, { useState } from "react";
import Navbar from "../shared/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { RadioGroup } from "../ui/radio-group";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constant";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { PageShell } from "../layout/PageShell";
import { AuthCard } from "../layout/AuthCard";

const STEPS = { REQUEST: 1, RESET: 2 };

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.REQUEST);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const requestOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!role) {
      toast.error("Please select a role");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(
        `${USER_API_END_POINT}/forgot-password`,
        { email: email.trim(), role },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setStep(STEPS.RESET);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Could not send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      toast.error("Enter the 6-digit OTP from your email");
      return;
    }
    if (!passwordRegex.test(newPassword)) {
      toast.error(
        "Password must be at least 8 characters and include uppercase, lowercase, number & special character"
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(
        `${USER_API_END_POINT}/reset-password`,
        {
          email: email.trim(),
          role,
          otp: otp.trim(),
          newPassword,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/login");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Could not reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <Navbar />
      <AuthCard
        wide
        title="Reset password"
        subtitle={
          step === STEPS.REQUEST
            ? "We’ll email a one-time code. Use the same role as your account."
            : "Enter the code and your new password."
        }
      >
          {step === STEPS.REQUEST ? (
            <form onSubmit={requestOtp}>
              <div className="my-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  autoComplete="email"
                />
              </div>

              <RadioGroup className="flex items-center gap-6 my-5">
                <div className="flex items-center gap-2">
                  <Input
                    type="radio"
                    name="role"
                    value="student"
                    checked={role === "student"}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <Label>Student</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="radio"
                    name="role"
                    value="recruiter"
                    checked={role === "recruiter"}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <Label>Recruiter</Label>
                </div>
              </RadioGroup>

              {loading ? (
                <Button className="w-full my-4" disabled>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Sending…
                </Button>
              ) : (
                <Button type="submit" className="w-full my-4">
                  Send OTP
                </Button>
              )}
            </form>
          ) : (
            <form onSubmit={resetPassword}>
              <div className="my-2">
                <Label>OTP</Label>
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="6-digit code"
                  autoComplete="one-time-code"
                />
              </div>

              <div className="my-2">
                <Label>New password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                    placeholder="New password"
                    autoComplete="new-password"
                  />
                  <span
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Min 8 chars, uppercase, lowercase, number & special character
                </p>
              </div>

              <div className="my-2">
                <Label>Confirm password</Label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                    placeholder="Confirm password"
                    autoComplete="new-password"
                  />
                  <span
                    onClick={() => setShowConfirm((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 my-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setStep(STEPS.REQUEST);
                    setOtp("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                >
                  Back
                </Button>
                {loading ? (
                  <Button className="flex-1" disabled>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Updating…
                  </Button>
                ) : (
                  <Button type="submit" className="flex-1">
                    Reset password
                  </Button>
                )}
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-600">
            <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
              Back to login
            </Link>
          </p>
      </AuthCard>
    </PageShell>
  );
};

export default ForgotPassword;
