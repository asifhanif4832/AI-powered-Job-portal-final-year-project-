import { Notification } from "../models/notification.model.js";

const serverError = (res, error, message = "Something went wrong") => {
    console.error(error);
    return res.status(500).json({ success: false, message });
};

export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.id })
            .sort({ createdAt: -1 })
            .limit(80)
            .lean();
        const unread = notifications.filter((n) => !n.read).length;
        return res.status(200).json({ success: true, notifications, unreadCount: unread });
    } catch (error) {
        return serverError(res, error, "Failed to load notifications");
    }
};

export const markNotificationRead = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Notification.findOneAndUpdate(
            { _id: id, recipient: req.id },
            { read: true },
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }
        return res.status(200).json({ success: true, notification: updated });
    } catch (error) {
        return serverError(res, error, "Failed to update notification");
    }
};

export const markAllNotificationsRead = async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.id, read: false }, { read: true });
        return res.status(200).json({ success: true, message: "All marked as read" });
    } catch (error) {
        return serverError(res, error, "Failed to mark all as read");
    }
};
