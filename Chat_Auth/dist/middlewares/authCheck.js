"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddlewareCheck = void 0;
const authMiddlewareCheck = (req, res, next) => {
    const accessToken = req.header;
    console.log(accessToken);
    res.send('hello');
};
exports.authMiddlewareCheck = authMiddlewareCheck;
