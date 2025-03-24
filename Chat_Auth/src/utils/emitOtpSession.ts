import { Server } from "socket.io";

export const emitOtpSession = (io: Server, socketId: string, status: 'success' | 'failed') => {
    console.log("socketId", socketId)
    const statusMessage = status === "success"
        ? 'OTP Verification Successful!'
        : 'OTP Session Expired!';

    console.log("statusMessage", statusMessage)
    io.to(socketId).emit('otpSessionEnded', { message: statusMessage })
}