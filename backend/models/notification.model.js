import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ["new_application", "application_status"],
            required: true,
        },
        title: { type: String, required: true },
        body: { type: String, required: true },
        read: { type: Boolean, default: false },
        job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
        applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
