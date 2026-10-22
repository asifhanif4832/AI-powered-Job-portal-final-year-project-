import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { 
    applyJob, 
    getApplicants, 
    getAppliedJobs, 
    getRecruiterPipeline, 
    updateStatus,
    analyzeResume
} from "../controllers/application.controller.js";

const router = express.Router();

router.route("/apply/:id").get(isAuthenticated, applyJob);
router.route("/get").get(isAuthenticated, getAppliedJobs);
router.route("/recruiter/pipeline").get(isAuthenticated, getRecruiterPipeline);
router.route("/:id/applicants").get(isAuthenticated, getApplicants);
router.route("/status/:id/update").post(isAuthenticated, updateStatus);
router.route("/analyze/:applicationId").get(isAuthenticated, analyzeResume); // ✅ new

export default router;