// import axios from "axios";
import { Application } from "../models/application.model.js";
import crypto from "crypto";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";
import { PasswordResetOtp } from "../models/passwordResetOtp.model.js";
import { RegisterOtp } from "../models/registerOtp.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { sendPasswordResetOtp, sendSignupOtp } from "../utils/mailer.js";
import { emailMatchRegex } from "../utils/emailQuery.js";

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const PASSWORD_RESET_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const handleControllerError = (res, error, fallbackMessage) => {
    console.error(error);
    const isDbUnavailable =
        error?.name === "MongooseError" ||
        error?.name === "MongoServerSelectionError" ||
        error?.code === "ECONNREFUSED" ||
        error?.message?.includes("buffering timed out") ||
        error?.message?.includes("querySrv ECONNREFUSED");

    return res.status(isDbUnavailable ? 503 : 500).json({
        message: isDbUnavailable ? "Database unavailable. Please try again." : fallbackMessage,
        success: false
    });
};

export const sendRegisterOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email?.trim()) {
            return res.status(400).json({
                message: "Email is required",
                success: false,
            });
        }
        const smtpUser = (process.env.SMTP_USER || process.env.GMAIL_USER || "").trim();
        const smtpPass = (process.env.SMTP_PASS || "").replace(/\s/g, "");
        if (!smtpUser || !smtpPass) {
            return res.status(503).json({
                message:
                    "Email is not configured on the server. Set SMTP_USER and SMTP_PASS in backend/.env.",
                success: false,
            });
        }

        const existing = await User.findOne({ email: emailMatchRegex(email) });
        if (existing) {
            return res.status(400).json({
                message: "An account with this email already exists.",
                success: false,
            });
        }

        const otp = String(crypto.randomInt(100000, 1000000));
        const otpHash = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
        const emailNorm = email.trim().toLowerCase();

        await RegisterOtp.findOneAndUpdate(
            { email: emailNorm },
            { otpHash, expiresAt },
            { upsert: true, new: true }
        );

        await sendSignupOtp(email.trim(), otp);

        return res.status(200).json({
            success: true,
            message: "Verification code sent to your email.",
        });
    } catch (error) {
        if (error?.message?.includes("SMTP_USER") || error?.message?.includes("SMTP_PASS")) {
            return res.status(503).json({
                message: "Email service is not configured.",
                success: false,
            });
        }
        return handleControllerError(res, error, "Unable to send verification code");
    }
};

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role, otp } = req.body;
        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false,
            });
        }
        if (!otp || String(otp).trim().length !== 6) {
            return res.status(400).json({
                message: "Enter the 6-digit verification code from your email",
                success: false,
            });
        }

        const emailNorm = email.trim().toLowerCase();
        const otpRecord = await RegisterOtp.findOne({ email: emailNorm });
        if (!otpRecord || otpRecord.expiresAt.getTime() < Date.now()) {
            return res.status(400).json({
                message: "Invalid or expired code. Click “Send code” again.",
                success: false,
            });
        }
        const otpOk = await bcrypt.compare(String(otp).trim(), otpRecord.otpHash);
        if (!otpOk) {
            return res.status(400).json({
                message: "Invalid verification code",
                success: false,
            });
        }
        await RegisterOtp.deleteOne({ _id: otpRecord._id });

        const file = req.file;
        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content);

        const user = await User.findOne({ email: emailMatchRegex(email) });
        if (user) {
            return res.status(400).json({
                message: "User already exists with this email.",
                success: false,
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile: {
                profilePhoto: cloudResponse.secure_url,
            },
        });
        return res.status(201).json({
            message: "Account created successfully.",
            success: true,
        });
    } catch (error) {
        return handleControllerError(res, error, "Unable to create account");
    }
};
export const login =async(req,res)=>{
    try{
        const{
            email,password,role
        }=req.body;
        if(!email || !password || !role){
            return res.status(400).json({
                message:"Something is missing",
                success:false
            });
        };
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({
        message:"Incorrect email or password",
        success:false,
    })
    }

    const isPasswordMatch=await bcrypt.compare(password, user.password);
    if(!isPasswordMatch) {
        return res.status(400).json({
            message:"Incorrect email or Password",
            success:"false"
        })
    };
    if(role!== user.role){
        return res.status(400).json({
            message:"Account doesn't exist with current role.",
            success:false
        })
    };
    const tokenData={
     userId:user._id
    }
    const token=await jwt.sign(tokenData,process.env.SECRET_KEY,{expiresIn:'1d'});
    const safeUser = {
  _id: user._id,
  fullname: user.fullname,
  email: user.email,
  phoneNumber: user.phoneNumber,
  role: user.role,
  profile: user.profile
};

    return res.status(200).cookie("token",token,{maxAge:1*24*60*60*1000,httpsOnly:true, sameSite:'strict'}).json({
        message:`Welcome back ${user.fullname}`,
        user:safeUser,
        success:true
    })
    
}
   catch (error) {
    return handleControllerError(res, error, "Internal server error");
  }
}

export const forgotPassword = async (req, res) => {
    try {
        const { email, role } = req.body;
        if (!email || !role) {
            return res.status(400).json({
                message: "Email and role are required",
                success: false,
            });
        }
        if (!["student", "recruiter"].includes(role)) {
            return res.status(400).json({ message: "Invalid role", success: false });
        }

        const smtpUser = (process.env.SMTP_USER || process.env.GMAIL_USER || "").trim();
        const smtpPass = (process.env.SMTP_PASS || "").replace(/\s/g, "");
        if (!smtpUser || !smtpPass) {
            return res.status(503).json({
                message:
                    "Email is not configured: set SMTP_USER to your Gmail address and SMTP_PASS to your Google app password in backend/.env, then restart the server.",
                success: false,
            });
        }

        const user = await User.findOne({
            email: emailMatchRegex(email),
            role,
        });
        if (!user) {
            return res.status(404).json({
                message: "No account found with this email and role.",
                success: false,
            });
        }

        const otp = String(crypto.randomInt(100000, 1000000));
        const otpHash = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

        await PasswordResetOtp.findOneAndUpdate(
            { email: user.email, role: user.role },
            { otpHash, expiresAt },
            { upsert: true, new: true }
        );

        await sendPasswordResetOtp(user.email, otp);

        return res.status(200).json({
            message: "OTP sent to your email. Please check your inbox.",
            success: true,
        });
    } catch (error) {
        if (error?.message?.includes("SMTP_USER") || error?.message?.includes("SMTP_PASS")) {
            return res.status(503).json({
                message: "Email service is not configured. Set SMTP_USER and SMTP_PASS.",
                success: false,
            });
        }
        return handleControllerError(res, error, "Unable to send reset email");
    }
};

export const resetPasswordWithOtp = async (req, res) => {
    try {
        const { email, role, otp, newPassword } = req.body;
        if (!email || !role || otp === undefined || otp === null || !newPassword) {
            return res.status(400).json({
                message: "Email, role, OTP, and new password are required",
                success: false,
            });
        }
        if (!["student", "recruiter"].includes(role)) {
            return res.status(400).json({ message: "Invalid role", success: false });
        }
        if (!PASSWORD_RESET_REGEX.test(newPassword)) {
            return res.status(400).json({
                message:
                    "Password must be at least 8 characters and include uppercase, lowercase, number & special character (@$!%*?&)",
                success: false,
            });
        }

        const user = await User.findOne({
            email: emailMatchRegex(email),
            role,
        });
        if (!user) {
            return res.status(404).json({
                message: "No account found with this email and role.",
                success: false,
            });
        }

        const record = await PasswordResetOtp.findOne({
            email: user.email,
            role: user.role,
        });
        if (!record || record.expiresAt.getTime() < Date.now()) {
            return res.status(400).json({
                message: "Invalid or expired OTP. Request a new OTP.",
                success: false,
            });
        }

        const match = await bcrypt.compare(String(otp).trim(), record.otpHash);
        if (!match) {
            return res.status(400).json({ message: "Invalid OTP", success: false });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        await PasswordResetOtp.deleteOne({ _id: record._id });

        return res.status(200).json({
            message: "Password updated successfully. You can sign in now.",
            success: true,
        });
    } catch (error) {
        return handleControllerError(res, error, "Unable to reset password");
    }
};

export const getSavedJobIds = async (req, res) => {
    try {
        const user = await User.findById(req.id).select("savedJobs role");
        if (!user || user.role !== "student") {
            return res.status(200).json({ success: true, jobIds: [] });
        }
        const jobIds = (user.savedJobs || []).map((id) => id.toString());
        return res.status(200).json({ success: true, jobIds });
    } catch (error) {
        return handleControllerError(res, error, "Unable to load saved jobs");
    }
};

/** Full job documents for the saved-jobs page (student only). */
export const getSavedJobsList = async (req, res) => {
    try {
        const user = await User.findById(req.id).select("savedJobs role");
        if (!user || user.role !== "student") {
            return res.status(403).json({
                success: false,
                message: "Only students can view saved jobs",
            });
        }
        const ids = user.savedJobs || [];
        if (ids.length === 0) {
            return res.status(200).json({ success: true, jobs: [] });
        }
        const jobs = await Job.find({ _id: { $in: ids } })
            .populate("company")
            .sort({ createdAt: -1 });
        return res.status(200).json({ success: true, jobs });
    } catch (error) {
        return handleControllerError(res, error, "Unable to load saved jobs");
    }
};

export const toggleSavedJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: "Invalid job id", success: false });
        }
        const user = await User.findById(req.id);
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }
        if (user.role !== "student") {
            return res.status(403).json({
                message: "Only students can save jobs",
                success: false,
            });
        }
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found", success: false });
        }
        const list = [...(user.savedJobs || [])];
        const index = list.findIndex((id) => id.toString() === jobId);
        const wasSaved = index > -1;
        if (wasSaved) {
            list.splice(index, 1);
        } else {
            list.push(new mongoose.Types.ObjectId(jobId));
        }
        user.savedJobs = list;
        await user.save();
        return res.status(200).json({
            success: true,
            message: wasSaved ? "Removed from saved jobs" : "Saved for later",
            saved: !wasSaved,
        });
    } catch (error) {
        return handleControllerError(res, error, "Unable to update saved jobs");
    }
};

export const getRecruiterPublicProfile = async (req, res) => {
    try {
        const recruiterId = req.params.id;
        const recruiter = await User.findOne({
            _id: recruiterId,
            role: "recruiter",
        }).select("fullname email profile createdAt");

        if (!recruiter) {
            return res.status(404).json({
                message: "Recruiter not found",
                success: false,
            });
        }

        const recruiterJobs = await Job.find({ created_by: recruiterId })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate({ path: "company", select: "name logo website location" })
            .select("title location jobType salary experienceLevel createdAt company");

        return res.status(200).json({
            success: true,
            recruiter: {
                _id: recruiter._id,
                fullname: recruiter.fullname,
                email: recruiter.email,
                profile: recruiter.profile,
                joinedAt: recruiter.createdAt,
                jobsPosted: recruiterJobs.length,
            },
            jobs: recruiterJobs,
        });
    } catch (error) {
        return handleControllerError(res, error, "Unable to load recruiter profile");
    }
};

/** Short-lived JWT for Socket.IO handshake (see backend/socket/io.js). */
export const getWsToken = async (req, res) => {
    try {
        const secret = process.env.SECRET_KEY || process.env.SECRET_Key;
        if (!secret) {
            return res.status(500).json({
                message: "Server configuration error",
                success: false,
            });
        }
        const token = jwt.sign(
            { userId: req.id, purpose: "socket" },
            secret,
            { expiresIn: "24h" }
        );
        return res.status(200).json({ success: true, token });
    } catch (error) {
        return handleControllerError(res, error, "Unable to issue socket token");
    }
};

export const logout=async(req,res)=>{
    try{
        return res.status(200).cookie("token","",{maxAge:0}).json({
            message:"Logged out successfully.",
            success:true
        })
    }catch(error){
        return handleControllerError(res, error, "Unable to logout");
    }
}
export const updateProfile=async (req,res)=>{
    try{
        const { fullname, email, phoneNumber, bio, skills, experience } = req.body;
        const file = req.file;

        let cloudResponse = null;
        if (file) {
            const fileUri = getDataUri(file);
            cloudResponse = await cloudinary.uploader.upload(fileUri.content);
        }

        let skillsArray;
        if (skills !== undefined && skills !== null && String(skills).trim() !== "") {
            skillsArray = String(skills)
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
        }

        const userId = req.id;
        let user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false,
            });
        }
        if (fullname) user.fullname = fullname;
        if (email) user.email = email;
        if (phoneNumber !== undefined && phoneNumber !== "") {
            user.phoneNumber = phoneNumber;
        }
        if (bio !== undefined) user.profile.bio = bio;
        if (skillsArray) user.profile.skills = skillsArray;
        if (experience !== undefined) user.profile.experience = experience;

       if (cloudResponse && file) {
    user.profile.resume = cloudResponse.secure_url;
    user.profile.resumeOriginalName = file.originalname;
}
await user.save();

// ── Recalculate match scores if resume was updated ──
if (cloudResponse && file) {
    try {
        const { Application } = await import("../models/application.model.js");
        const axios = (await import("axios")).default;

        // Get all applications of this user
        const applications = await Application.find({ applicant: userId })
            .populate({ path: "job", select: "title requirements description" });

        for (const app of applications) {
            if (!app.job) continue;
            try {
                const { analyzeResumeWithAI, extractScoreFromAnalysis, calculateSkillMatch } = await import("../utils/aiService.js");
                const analysisText = await analyzeResumeWithAI(
                    cloudResponse.secure_url,
                    app.job.title || "",
                    app.job.requirements || [],
                    app.job.description || ""
                );
                let newScore = extractScoreFromAnalysis(analysisText);
                if (newScore === null || newScore === undefined) {
                    newScore = calculateSkillMatch(
                        user.profile?.skills || [],
                        app.job.requirements || [],
                        app.job.title || "",
                        app.job.description || ""
                    );
                }
                if (newScore !== null && newScore !== undefined) {
                    app.matchScore = newScore;
                    await app.save();
                    console.log(`Updated matchScore for application ${app._id}: ${newScore}`);
                }
            } catch (e) {
                console.warn(`Score update failed for application ${app._id}:`, e.message);
                try {
                    const { calculateSkillMatch } = await import("../utils/aiService.js");
                    const fallbackScore = calculateSkillMatch(
                        user.profile?.skills || [],
                        app.job.requirements || [],
                        app.job.title || "",
                        app.job.description || ""
                    );
                    app.matchScore = fallbackScore;
                    await app.save();
                } catch (_) {}
            }
        }
    } catch (e) {
        console.warn("Match score recalculation failed (non-blocking):", e.message);
    }
}

       const safeUser={
        _id:user._id,
        fullname:user.fullname,
        email:user.email,
        phoneNumber:user.phoneNumber,
        role:user.role,
        profile:user.profile
    }
    return res.status(200).json({
        message:"Profile updated successfully.",
        user:safeUser,
        success:true
    }) 
   
    } catch (error) {
    return handleControllerError(res, error, "Server error in update profile");
  }
}