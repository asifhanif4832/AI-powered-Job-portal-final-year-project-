import http from "http";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import recommendationRouter from "./routes/recommendationRoutes.js";  // ✅ added
import { initSocket } from "./socket/io.js";

dotenv.config({});
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const corsOptions = {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
};
app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;

app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1", recommendationRouter);  // ✅ added — endpoint: /api/v1/recommendations
const httpServer = http.createServer(app);
initSocket(httpServer);

const startServer = async () => {
    await connectDB();
    httpServer.listen(PORT, () => {
        console.log(`Server running at port ${PORT}`);
    });
};

startServer();
