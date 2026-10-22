import express from "express";
// import {register,login,logout ,updateProfile } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getCompany, getCompanyById, registerCompany, updateCompany,deleteCompany } from "../controllers/company.controller.js";
import { singleUpload } from "../middlewares/multer.js";
const router=express.Router();
router.route("/register").post(isAuthenticated,registerCompany);
router.route("/get").get(isAuthenticated,getCompany);
router.route("/get/:id").get(isAuthenticated,getCompanyById);
router.route("/update/:id").put(isAuthenticated,singleUpload,updateCompany);
// ✅ ADD THIS
router.route("/delete/:id").delete(isAuthenticated, deleteCompany);
export default router; 

