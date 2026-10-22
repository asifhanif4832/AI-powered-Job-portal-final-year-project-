import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

const getJwtSecret = () => process.env.SECRET_KEY || process.env.SECRET_Key;

/**
 * Attach Socket.IO to the HTTP server. Clients authenticate with a short-lived
 * JWT from GET /api/v1/user/ws-token (same cookie session as the REST API).
 */
export function initSocket(httpServer) {
    const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
    io = new Server(httpServer, {
        cors: {
            origin: clientOrigin,
            credentials: true,
        },
    });

    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) {
                return next(new Error("auth_required"));
            }
            const secret = getJwtSecret();
            if (!secret) {
                return next(new Error("server_config"));
            }
            const decoded = jwt.verify(token, secret);
            if (!decoded?.userId || decoded.purpose !== "socket") {
                return next(new Error("invalid_token"));
            }
            socket.userId = String(decoded.userId);
            return next();
        } catch {
            return next(new Error("unauthorized"));
        }
    });

    io.on("connection", (socket) => {
        socket.join(`user:${socket.userId}`);
    });

    return io;
}

export function getIo() {
    return io;
}
