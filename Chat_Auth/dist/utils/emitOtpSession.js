"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitOtpSession = void 0;
const emitOtpSession = (io, socketId, status) => {
    console.log("socketId", socketId);
    const statusMessage = status === "success"
        ? 'OTP Verification Successful!'
        : 'OTP Session Expired!';
    console.log("statusMessage", statusMessage);
    io.to(socketId).emit('otpSessionEnded', { message: statusMessage });
};
exports.emitOtpSession = emitOtpSession;
