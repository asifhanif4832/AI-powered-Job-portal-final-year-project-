import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { getJobRecommendations } from "../utils/aiService.js";

export const getRecommendations = async (req, res) => {
    try {
        const userId = req.id;

        // 1. Get user skills
        const user = await User.findById(userId).select("profile.skills");
        const userSkills = user?.profile?.skills || [];

        if (!userSkills.length) {
            return res.status(400).json({
                success: false,
                message: "Please add skills to your profile first.",
            });
        }

        // 2. Get all active jobs
        const jobs = await Job.find({
            $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }]
        })
            .populate("company", "name logo location")
            .lean();

        if (!jobs.length) {
            return res.json({ success: true, recommendations: [], total: 0 });
        }

        // 3. Format jobs
        const jobsForAI = jobs.map((job) => ({
            _id: job._id.toString(),
            title: job.title,
            description: job.description,
            location: job.location,
            jobType: job.jobType,
            salary: job.salary,
            company: job.company,
            requirements: job.requirements || [],
            requiredSkills: job.requirements || [],
            position: job.position,
            experienceLevel: job.experienceLevel,
            createdAt: job.createdAt,
        }));

        // 4. Get recommendations using intelligent skill matching + Groq AI
        console.log(`Getting recommendations for ${userSkills.length} skills across ${jobs.length} jobs`);
        const recommendations = await getJobRecommendations(userSkills, jobsForAI, 50);

        return res.json({
            success: true,
            recommendations,
            total: recommendations.length,
            userSkills,
        });

    } catch (error) {
        console.error("Recommendation error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
