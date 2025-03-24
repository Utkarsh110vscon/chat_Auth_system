"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectIoMiddleware = void 0;
const injectIoMiddleware = (io) => {
    return (req, res, next) => {
        req.io = io;
        next();
    };
};
exports.injectIoMiddleware = injectIoMiddleware;
