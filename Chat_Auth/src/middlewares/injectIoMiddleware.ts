import { Server } from "socket.io";
import { MiddlewarerFncType } from "../types/authType";

export const injectIoMiddleware = (io: Server): MiddlewarerFncType => {
    return (req, res, next) => {
        req.io = io
        next()
    };
};