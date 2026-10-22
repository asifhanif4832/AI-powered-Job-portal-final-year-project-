import express from "express";
import {
    register,
    login,
    logout,
    updateProfile,
    forgotPassword,
    resetPasswordWithOtp,
    getSavedJobIds,
    getSavedJobsList,
    toggleSavedJob,
    sendRegisterOtp,
    getWsToken,
    getRecruiterPublicProfile,
} from "../controllers/user.controller.js";
import {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
} from "../controllers/notification.controller.js";

import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/multer.js";
const router=express.Router();
router.route("/send-register-otp").post(sendRegisterOtp);
router.route("/register").post(singleUpload,register);
router.route("/login").post(login);
router.route("/recruiters/:id").get(getRecruiterPublicProfile);

router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPasswordWithOtp);

router.route("/logout").get(logout);

router.route("/ws-token").get(isAuthenticated, getWsToken);
router.route("/notifications").get(isAuthenticated, getNotifications);
router.route("/notifications/read-all").post(isAuthenticated, markAllNotificationsRead);
router.route("/notifications/:id/read").patch(isAuthenticated, markNotificationRead);

router.route("/saved-jobs/list").get(isAuthenticated, getSavedJobsList);
router.route("/saved-jobs").get(isAuthenticated, getSavedJobIds);
router.route("/saved-jobs/:jobId").post(isAuthenticated, toggleSavedJob);

router.route("/profile/update").post(isAuthenticated,singleUpload,updateProfile);
export default router;

