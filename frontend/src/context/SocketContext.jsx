import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import axios from "axios";
import { toast } from "sonner";
import { API_ORIGIN, USER_API_END_POINT } from "@/utils/constant";

const SocketContext = createContext(null);

function dedupeById(list) {
  const seen = new Set();
  return list.filter((n) => {
    const id = String(n._id ?? "");
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export function SocketProvider({ children }) {
  const user = useSelector((s) => s.auth.user);
  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${USER_API_END_POINT}/notifications`, {
        withCredentials: true,
      });
      if (res.data.success) {
        const list = res.data.notifications || [];
        setNotifications(list);
        setUnreadCount(
          res.data.unreadCount ?? list.filter((n) => !n.read).length
        );
      }
    } catch {
      /* ignore */
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setNotifications([]);
      setUnreadCount(0);
      return undefined;
    }

    let cancelled = false;

    (async () => {
      try {
        const tokenRes = await axios.get(`${USER_API_END_POINT}/ws-token`, {
          withCredentials: true,
        });
        if (cancelled || !tokenRes.data?.token) return;

        const s = io(API_ORIGIN, {
          auth: { token: tokenRes.data.token },
          transports: ["websocket", "polling"],
        });
        socketRef.current = s;

        s.on("connect", () => {
          refreshNotifications();
        });

        s.on("notification", (payload) => {
          if (!payload?._id) return;
          setNotifications((prev) =>
            dedupeById([payload, ...prev])
          );
          setUnreadCount((c) => c + 1);
          toast.info(payload.title, { description: payload.body });
        });
      } catch (e) {
        console.error("Socket setup failed:", e);
      }
    })();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [user?._id, refreshNotifications]);

  useEffect(() => {
    if (user?._id) refreshNotifications();
  }, [user?._id, refreshNotifications]);

  const markRead = async (id) => {
    try {
      await axios.patch(
        `${USER_API_END_POINT}/notifications/${id}/read`,
        {},
        { withCredentials: true }
      );
      setNotifications((prev) =>
        prev.map((n) =>
          String(n._id) === String(id) ? { ...n, read: true } : n
        )
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      /* ignore */
    }
  };

  const markAllRead = async () => {
    try {
      await axios.post(
        `${USER_API_END_POINT}/notifications/read-all`,
        {},
        { withCredentials: true }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      /* ignore */
    }
  };

  const value = {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    refreshNotifications,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocketNotifications() {
  return useContext(SocketContext);
}
