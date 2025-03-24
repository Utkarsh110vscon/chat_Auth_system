"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPassword = exports.sendMail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transport = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: "uk10234567@gmail.com",
        pass: "kjdw lvou vrrf kcal",
    },
});
const sendMail = (to, subject, otp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mail = yield transport.sendMail({
            from: "uk10234567@gmail.com",
            to,
            subject,
            html: `
               <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                    <h1 style="text-align: center; color: #4CAF50;">Email Verification</h1>
                    <p style="font-size: 16px; color: #333;">Thank you for registering with us. Please verify your email address by using the OTP below:</p>
                    
                    <div style="text-align: center; margin: 20px 0;">
                        <span style="display: inline-block; font-size: 22px; font-weight: bold; color: #fff; background: #4CAF50; padding: 10px 20px; border-radius: 5px;">
                            ${otp}
                        </span>
                    </div>
        
                    <p style="font-size: 14px; color: #777;">If you did not register, please ignore this email.</p>
                    
                    <hr style="border: none; height: 1px; background: #ddd; margin: 20px 0;">
                    
                    <p style="text-align: center; font-size: 12px; color: #aaa;">
                        &copy; 2025 Your Company. All rights reserved.
                    </p>
                </div>`
        });
        console.log("Email sent:", mail.messageId);
    }
    catch (error) {
        console.error("Error sending email:", error);
    }
});
exports.sendMail = sendMail;
const sendPassword = (to, subject, password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mail = yield transport.sendMail({
            from: "uk10234567@gmail.com",
            to,
            subject,
            html: `<div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                    <h1 style="text-align: center; color: #4CAF50;">Your New Password</h1>
                    <p style="font-size: 16px; color: #333;">Thank you for registering with us. Your temporary password is:</p>

                    <div style="text-align: center; margin: 20px 0;">
                        <span style="display: inline-block; font-size: 22px; font-weight: bold; color: #fff; background: rgb(76, 116, 175); padding: 10px 20px; border-radius: 5px;">
                            ${password}
                        </span>
                    </div>

                    <p style="font-size: 14px; color: #777;">If you did not request a password, please ignore this email.</p>

                    <hr style="border: none; height: 1px; background: #ddd; margin: 20px 0;">

                    <p style="text-align: center; font-size: 12px; color: #aaa;">
                        &copy; 2025 Your Company. All rights reserved.
                    </p>
                </div>`
        });
        console.log("Email sent:", mail.messageId);
    }
    catch (error) {
        console.error("Error sending email:", error);
    }
});
exports.sendPassword = sendPassword;
// <p style="font-size: 16px; color: #333;">
// For security reasons, we strongly recommend that you change this password immediately after logging in.
// </p>
