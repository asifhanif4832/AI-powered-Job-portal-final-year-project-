import mongoose from "mongoose";
const applicationSchema=new mongoose.Schema({
    job:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Job',
        required:true
    },
    applicant:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    status:{
        type:String,
        enum:['pending','shortlisted','interview_scheduled','hired','accepted','rejected'],
        default:'pending'
    },
    interviewAt:{
        type:Date,
        default:null
    },
    interviewNotes:{
        type:String,
        default:""
    },
    matchScore: {          // ✅ new
        type: Number,
        default: null
    },
},{timestamps:true});
export const Application=mongoose.model("Application",applicationSchema);