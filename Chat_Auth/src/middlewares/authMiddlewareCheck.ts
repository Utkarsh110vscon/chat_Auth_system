import { MiddlewarerFncType } from "../types/authType";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv"

dotenv.config();


export const authMiddlewareCheck: MiddlewarerFncType = async (req, res, next) => {
    try {
        
        const authHeader = req.headers.authorization;
        if (!authHeader || !process.env.ACCESS_SECRET) {
            throw new Error("No access token found");
        }

        const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

        const decode = jwt.verify(token, process.env.ACCESS_SECRET) as JwtPayload;

        req.user = decode;
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        res.status(401).json({
            status: "rejected",
            message: "Unauthorized access!",
        });
    }
};
