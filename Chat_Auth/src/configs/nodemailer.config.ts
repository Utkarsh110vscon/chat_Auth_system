import nodemailer from "nodemailer";
import { mailFncType } from "../types/authType";

const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "uk10234567@gmail.com",
        pass: "kjdw lvou vrrf kcal",
    },
});

export const sendMail: mailFncType = async (to, subject, otp) => {
    try {
        const mail = await transport.sendMail({
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
    } catch (error) {
        console.error("Error sending email:", error);
    }
};


export const sendPassword: mailFncType = async (to, subject, password) => {
    try {
        const mail = await transport.sendMail({
            from: "uk10234567@gmail.com",
            to,
            subject,
            html:
             `<div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
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
    } catch (error) {
        console.error("Error sending email:", error);
    }
};


// <p style="font-size: 16px; color: #333;">
// For security reasons, we strongly recommend that you change this password immediately after logging in.
// </p>
