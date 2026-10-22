import axios from "axios";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { getIo } from "../socket/io.js";
import { sendInterviewScheduledEmail } from "../utils/mailer.js";

const ALLOWED_STATUSES = [
    "pending",
    "shortlisted",
    "interview_scheduled",
    "hired",
    "accepted",
    "rejected",
];

const emitNotification = (userId, payload) => {
    try {
        const io = getIo();
        if (io) {
            io.to(`user:${String(userId)}`).emit("notification", payload);
        }
    } catch (e) {
        console.error("Socket emit failed:", e?.message);
    }
};

export const applyJob = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;
        if (!jobId) {
            return res.status(400).json({
                message: "Job id is required",
                success: false,
            });
        }
        const existingApplication = await Application.findOne({ job: jobId, applicant: userId });
        if (existingApplication) {
            return res.status(400).json({
                message: "You have already applied for this job",
                success: false,
            });
        }
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false,
            });
        }
        if (String(job.created_by) === String(userId)) {
            return res.status(400).json({
                message: "You cannot apply to your own job posting",
                success: false,
            });
        }

        const applicantUser = await User.findById(userId).select("fullname email profile");

// ── Calculate AI match score ──
let matchScore = null;
try {
    const resumeUrl  = applicantUser?.profile?.resume || null;
    const userSkills = applicantUser?.profile?.skills || [];
    const jobSkills  = job.requirements || [];

    if (resumeUrl) {
        console.log("Calculating match score via Groq resume analysis...");
        const { analyzeResumeWithAI, extractScoreFromAnalysis } = await import("../utils/aiService.js");

        const analysisText = await analyzeResumeWithAI(
            resumeUrl,
            job.title || "",
            job.requirements || [],
            job.description || ""
        );

        matchScore = extractScoreFromAnalysis(analysisText);
        console.log(`Groq match score: ${matchScore}`);
    }

    if (matchScore === null || matchScore === undefined) {
        const { calculateSkillMatch } = await import("../utils/aiService.js");
        matchScore = calculateSkillMatch(userSkills, jobSkills, job.title || "", job.description || "");
        console.log(`Fallback skill match score: ${matchScore}`);
    }

} catch (e) {
    console.warn("Match score calculation failed (non-blocking):", e.message);
    try {
        const { calculateSkillMatch } = await import("../utils/aiService.js");
        matchScore = calculateSkillMatch(
            applicantUser?.profile?.skills || [],
            job.requirements || [],
            job.title || "",
            job.description || ""
        );
    } catch (_) {}
}

const newApplication = await Application.create({
    job:        jobId,
    applicant:  userId,
    matchScore,
});
        job.applications.push(newApplication._id);
        await job.save();

        const title = "New application";
        const body = `${applicantUser?.fullname || "A candidate"} applied to ${job.title}`;

        const notif = await Notification.create({
            recipient: job.created_by,
            type: "new_application",
            title,
            body,
            job: job._id,
            applicant: userId,
        });

        emitNotification(job.created_by, {
            _id: notif._id,
            type: notif.type,
            title: notif.title,
            body: notif.body,
            job: job._id,
            applicant: userId,
            read: false,
            createdAt: notif.createdAt,
        });

        return res.status(201).json({
            message: "Job applied successfully",
            success: true,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error?.message || "Failed to apply",
            success: false,
        });
    }
};

export const getAppliedJobs = async (req, res) => {
    try {
        const userId = req.id;
        const application = await Application.find({ applicant: userId })
            .sort({ createdAt: -1 })
            .populate({
                path: "job",
                options: { sort: { createdAt: -1 } },
                populate: {
                    path: "company",
                    options: { sort: { createdAt: -1 } },
                },
            });
        if (!application) {
            return res.status(404).json({
                message: "No Applications",
                success: false,
            });
        }
        return res.status(200).json({
            application,
            success: true,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to load applications",
            success: false,
        });
    }
};

export const getApplicants = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path: "applications",
            options: { sort: { createdAt: -1 } },
            populate: {
                path: "applicant",
            },
        });
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false,
            });
        }

        // Backfill matchScore if missing
        try {
            const { calculateSkillMatch } = await import("../utils/aiService.js");
            for (const app of job.applications) {
                if (app.matchScore === null || app.matchScore === undefined) {
                    const applicantSkills = app.applicant?.profile?.skills || [];
                    const score = calculateSkillMatch(applicantSkills, job.requirements || [], job.title || "", job.description || "");
                    app.matchScore = score;
                    await Application.findByIdAndUpdate(app._id, { matchScore: score });
                }
            }
        } catch (bfErr) {
            console.warn("Backfilling applicant matchScore failed:", bfErr.message);
        }

        return res.status(200).json({
            job,
            success: true,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to load applicants",
            success: false,
        });
    }
};

export const getRecruiterPipeline = async (req, res) => {
    try {
        const recruiterId = req.id;
        const jobs = await Job.find({ created_by: recruiterId }).select("_id");
        const jobIds = jobs.map((j) => j._id);

        const applications = await Application.find({ job: { $in: jobIds } })
            .sort({ createdAt: -1 })
            .populate({
                path: "job",
                select: "title company createdAt created_by requirements description",
                populate: { path: "company", select: "name logo" },
            })
            .populate({
                path: "applicant",
                select: "fullname email phoneNumber profile",
            });

        // Backfill matchScore if missing
        try {
            const { calculateSkillMatch } = await import("../utils/aiService.js");
            for (const app of applications) {
                if (app.matchScore === null || app.matchScore === undefined) {
                    const applicantSkills = app.applicant?.profile?.skills || [];
                    const reqs = app.job?.requirements || [];
                    const score = calculateSkillMatch(applicantSkills, reqs, app.job?.title || "", app.job?.description || "");
                    app.matchScore = score;
                    await Application.findByIdAndUpdate(app._id, { matchScore: score });
                }
            }
        } catch (bfErr) {
            console.warn("Backfill pipeline matchScore failed:", bfErr.message);
        }

        const counts = applications.reduce(
            (acc, a) => {
                const key = String(a.status || "pending");
                acc.total += 1;
                if (!acc.byStatus[key]) acc.byStatus[key] = 0;
                acc.byStatus[key] += 1;
                return acc;
            },
            { total: 0, byStatus: {} }
        );

        return res.status(200).json({
            success: true,
            applications,
            summary: counts,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to load recruiter pipeline",
            success: false,
        });
    }
};

export const updateStatus = async (req, res) => {
    try {
        const { status, interviewAt, interviewNotes } = req.body;
        const applicationId = req.params.id;
        if (!status) {
            return res.status(400).json({
                message: "Status is required",
                success: false,
            });
        }
        const normalized = String(status).toLowerCase();
        if (!ALLOWED_STATUSES.includes(normalized)) {
            return res.status(400).json({
                message: "Invalid status",
                success: false,
            });
        }

        const application = await Application.findById(applicationId).populate({
            path: "job",
            select: "title created_by company",
            populate: { path: "company", select: "name" },
        });
        if (!application) {
            return res.status(404).json({
                message: "Application not found",
                success: false,
            });
        }
        if (normalized === "interview_scheduled" && !interviewAt) {
            return res.status(400).json({
                message: "Interview date/time is required for interview scheduling",
                success: false,
            });
        }

        application.status = normalized;
        if (normalized === "interview_scheduled") {
            application.interviewAt = new Date(interviewAt);
            application.interviewNotes = interviewNotes ? String(interviewNotes).trim() : "";
        } else if (normalized === "rejected" || normalized === "hired" || normalized === "accepted") {
            application.interviewAt = null;
            application.interviewNotes = "";
        }
        await application.save();

        const jobTitle = application.job?.title || "a job";
        const prettyStatus = normalized.replace("_", " ");
        const title = `Application ${prettyStatus}`;
        const body =
            normalized === "interview_scheduled" && application.interviewAt
                ? `Your interview for ${jobTitle} is scheduled on ${new Date(application.interviewAt).toLocaleString()}.`
                : `Your application for ${jobTitle} is now ${prettyStatus}.`;

        const notif = await Notification.create({
            recipient: application.applicant,
            type: "application_status",
            title,
            body,
            job: application.job?._id,
            applicant: application.applicant,
        });

        emitNotification(application.applicant, {
            _id: notif._id,
            type: notif.type,
            title: notif.title,
            body: notif.body,
            job: application.job?._id,
            read: false,
            createdAt: notif.createdAt,
        });

        if (normalized === "interview_scheduled") {
            const applicant = await User.findById(application.applicant).select("fullname email");
            if (applicant?.email) {
                try {
                    await sendInterviewScheduledEmail(applicant.email, {
                        candidateName: applicant.fullname,
                        jobTitle,
                        companyName: application.job?.company?.name,
                        interviewAt: application.interviewAt,
                        notes: application.interviewNotes,
                    });
                } catch (e) {
                    console.error("Interview schedule email failed:", e?.message);
                }
            }
        }

        return res.status(200).json({
            message: "Status updated successfully",
            success: true,
            application,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error?.message || "Failed to update status",
            success: false,
        });
    }
};
export const analyzeResume = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const application = await Application.findById(applicationId)
            .populate({ path: "applicant", select: "fullname profile" })
            .populate({ path: "job", select: "title requirements description" });

        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }

        const resumeUrl = application.applicant?.profile?.resume;
        if (!resumeUrl) {
            return res.status(400).json({
                success: false,
                message: "This applicant has no resume uploaded.",
            });
        }

        // Import and use Node.js AI service
        const { analyzeResumeWithAI, extractScoreFromAnalysis, calculateSkillMatch } = await import("../utils/aiService.js");

        const analysis = await analyzeResumeWithAI(
            resumeUrl,
            application.job?.title || "",
            application.job?.requirements || [],
            application.job?.description || ""
        );

        let matchScore = extractScoreFromAnalysis(analysis);
        if (matchScore === null || matchScore === undefined) {
            matchScore = calculateSkillMatch(
                application.applicant?.profile?.skills || [],
                application.job?.requirements || [],
                application.job?.title || "",
                application.job?.description || ""
            );
        }

        if (matchScore !== null && matchScore !== undefined) {
            application.matchScore = matchScore;
            await application.save();
        }

        return res.json({
            success: true,
            analysis,
            applicantName: application.applicant?.fullname,
            matchScore: application.matchScore,
        });

    } catch (error) {
        console.error("Resume analysis error:", error.message);
        res.status(500).json({ success: false, message: error.message || "Server error" });
    }
};