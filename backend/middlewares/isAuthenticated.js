import jwt from "jsonwebtoken";

const getJwtSecret = () =>
    process.env.SECRET_KEY || process.env.SECRET_Key;

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false,
            });
        }
        const secret = getJwtSecret();
        if (!secret) {
            console.error("SECRET_KEY is missing in environment");
            return res.status(500).json({
                message: "Server configuration error",
                success: false,
            });
        }
        const decode = jwt.verify(token, secret);
        if (!decode?.userId) {
            return res.status(401).json({
                message: "Invalid token",
                success: false,
            });
        }
        req.id = decode.userId;
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({
            message: "Invalid or expired token",
            success: false,
        });
    }
};
export default isAuthenticated;