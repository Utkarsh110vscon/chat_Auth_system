import { google } from "googleapis";
import { sendMail, sendPassword } from "../configs/nodemailer.config";
import { oauth2Client, scopes } from "../configs/oauth2Client.config";
import { deleteUserInVerifyTable, insertUserData, insertUserDataInVerifyTable, searchExistingUser, searchExistingUserInVerifyTable, updateOtpInVerifyTable } from "../models/user&verify.model";
import { ControllerFncType } from "../types/authType";
import { createHash, generateNewAccessToken, generateOtp, generateRandomSessionId, generateToken, verfiyToken } from "../utils/helperFunc";
import bcrypt from 'bcrypt';
import { emitOtpSession } from "../utils/emitOtpSession";
import pool from "../configs/db.config";

export const signUpUser: ControllerFncType = async (req, res) => {

    const io = req.io
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {

            res.status(400).json({
                status: 'rejected',
                message: 'All fields are required!'
            });
            return;
        }

        const value = await searchExistingUser(email);

        if (value.length) {
            res.status(409).json({
                status: 'rejected',
                message: 'User already registered'
            })
            return
        }

        const hashedPassword = await createHash(password, 12);

        const otp = generateOtp();
        const otpSessionId = generateRandomSessionId();

        await insertUserDataInVerifyTable(email, fullName, hashedPassword, undefined, otp, otpSessionId);

        await sendMail(email, 'Verify Your Email Address', otp);

        res.status(201).json({
            status: 'accepted',
            message: 'User successfully registered, Verify using the Provided Otp in you email!',
            otpSessionId: otpSessionId
        });

        return;
    } catch (error) {
        console.log(error)

        res.status(500).json({
            status: 'rejected',
            message: 'Something went wrong! please try again.'
        });
    }
}

export const verifyUser: ControllerFncType = async (req, res) => {
    const clientOtp = req.body.clientOtp;
    const client= await pool.connect();
    console.log('clientOtp',clientOtp);
    try {

        if (!req.io) return;

        if (!clientOtp) {
            res.status(400).json({
                status: 'rejected',
                message: 'OTP is required'
            })
            return;
        }

        await client.query('BEGIN');

        const existingUser = await searchExistingUserInVerifyTable(clientOtp, undefined, client);

        if (!existingUser.length) {
            await client.query('ROLLBACK');

            res.status(403).json({
                status: 'rejected',
                message: "Invalid OTP. Please try again.",
            })
            return
        }

        await insertUserData(existingUser[0].unverified_email, existingUser[0].unverified_fullname, existingUser[0].unverified_password,client)
        const deletedUser= await deleteUserInVerifyTable(existingUser[0].unverified_fullname, client)
        
        console.log(deletedUser[0]);
        emitOtpSession(req.io, deletedUser[0].socket_id, 'success')

        await client.query('COMMIT');
        
        res.status(201).json({
            status: 'accepted',
            message: 'User successfully verified'
        });

        return;
    } catch (error) {
        console.log(error);
        await client.query('ROLLBACK');

        res.status(500).json({
            status: 'rejected',
            message: 'Something went wrong! please try again.'
        });
    }finally{
        client.release();
    }
}

export const loginUser: ControllerFncType = async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await searchExistingUser(email);

        if (!existingUser.length) {
            res.status(404).json({
                status: 'rejected',
                message: "Invalid email or password"
            })
            return;
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser[0].password);

        if (!isPasswordCorrect) {
            res.status(404).json({
                status: 'rejected',
                message: "Invalid email or password"
            })
            return;
        }

        const token = generateToken(existingUser[0].email)

        if (!token.accessToken || !token.refreshToken) {
            throw new Error('Token generation failed.')
        }

        res.cookie('refreshToken', token.refreshToken, {
            httpOnly: true,
            secure: false,
            // maxAge: 7 * 24 * 60 * 60 * 1000
            maxAge: 60 * 60 * 1000
        })

        res.status(200).json({
            status: 'accepted',
            message: 'User Sucessfully logged-in.',
            accessToken: token.accessToken
        });

        return;

    } catch (error) {
        console.log(error);

        res.status(500).json({
            status: 'rejected',
            message: 'Something went wrong! please try again.'
        });
    }

}

export const getNewAccessToken: ControllerFncType = (req, res) => {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
        res.status(498).json({
            status: 'rejected',
            message: 'Access Denied. No Refresh Token!'
        })
        return;
    }

    const decode = verfiyToken(refreshToken);

    if (!decode) {
        res.status(498).json({
            status: 'rejected',
            message: 'Access Denied. Authntication failed!'
        });
        return;
    }

    const newAccessToken = generateNewAccessToken(decode?.userEmail, decode?.userId)

    if (!newAccessToken) {
        res.status(500).json({
            status: 'rejected',
            message: 'Something went wrong! please try again.'
        });
        return;
    }

    res.status(200).json({
        status: 'accepted',
        message: 'Acess Token successfully generated.',
        newAccessToken: newAccessToken
    });

}

export const logoutUser: ControllerFncType = (req, res) => {
    try {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: false
        })

        res.status(200).json({
            status: 'accepted',
            message: 'Logged out successfully.'
        })
        return;
    } catch (error) {
        console.log(error);

        res.status(500).json({
            status: 'rejected',
            message: 'Something went wrong! please try again.'
        });
    }
}

export const authenticateUser: ControllerFncType = (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'user authorized successfully!'
    });
}

export const googleAuth: ControllerFncType = (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        prompt: 'consent',
        scope: scopes
    })

    res.redirect(url);
}

export const googleAuthRedirect: ControllerFncType = async (req, res) => {
    try {
        if (!req.query.code) {
            res.status(400).json({
                status: 'rejected',
                message: 'No code provided'
            })
            return;
        }

        const code = req.query.code as string

        const Credential = await oauth2Client.getToken(code);

        oauth2Client.setCredentials(Credential.tokens);

        const oauth = google.oauth2({
            auth: oauth2Client,
            version: 'v2'
        });

        const { data } = await oauth.userinfo.get();

        if (!data.email || !data.name) {
            throw new Error("Data is not provided by google!");
        }

        const user = await searchExistingUser(data.email)

        if (!user.length) {
            const temporaryPassword = `${data.email}/${data.name}/${new Date().getFullYear()}`
            await insertUserData(data.email, data.name, temporaryPassword);
            console.log(data.email);
            sendPassword(data.email, 'Your New Password', temporaryPassword);
        }

        const localTokens = generateToken(data.email);

        res.cookie('refreshToken', localTokens.refreshToken, {
            httpOnly: true,
            maxAge: 60 * 60 * 1000,
            secure: false
        });

        res.send(
            `<!DOCTYPE html>
            <html>
            <head>
                <title>Authentication Successful</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background: linear-gradient(to right, #6366F1, #9333EA); /* Indigo to Purple gradient */
                        display: flex;
                        height: 100vh;
                        justify-content: center;
                        align-items: center;
                        margin: 0;
                        color: #333;
                    }
                    .container {
                        background-color: #fff; /* Solid white card */
                        border-radius: 16px;
                        padding: 40px 60px;
                        text-align: center;
                        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
                        max-width: 400px;
                        width: 100%;
                    }
                    h1 {
                        color: #4F46E5; /* Deep Indigo for emphasis */
                        margin-bottom: 10px;
                        font-size: 2rem;
                    }
                    p {
                        color: #666;
                        margin-bottom: 20px;
                        line-height: 1.6;
                    }
                    .btn {
                        background: linear-gradient(to right, #6366F1, #9333EA); /* Vibrant button */
                        color: #fff;
                        border: none;
                        padding: 12px 30px;
                        border-radius: 8px;
                        cursor: pointer;
                        text-decoration: none;
                        display: inline-block;
                        transition: transform 0.2s ease, opacity 0.2s ease;
                        font-weight: 600;
                    }
                    .btn:hover {
                        transform: translateY(-2px); /* Subtle lift effect */
                        opacity: 0.95;
                    }
                    .icon {
                        font-size: 50px;
                        color: #4F46E5; /* Indigo for consistency */
                        margin-bottom: 10px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="icon">✅</div>
                    <h1>Success!</h1>
                    <p>Your authentication was successful.</p>
                    <p>You can safely close this window and continue in the new tab.</p>
                    <a class="btn" href="http://localhost:5173/" target="_blank">Home</a>
                </div>
            </body>
            </html>`
        );


    } catch (error) {
        console.log(error);

        res.status(500).json({
            status: 'rejected',
            message: 'Something went wrong! please try again.'
        });
    }
}

export const resendOtp: ControllerFncType = async (req, res) => {

    if (!req.query.fullName || !req.query.email) {
        res.status(400).json({
            status: 'rejected',
            message: "Unverified user's name is required."
        })
        return
    }

    const name = String(req.query.fullName);
    const email = String(req.query.email);
    try {

        const unverifiedUser = await searchExistingUserInVerifyTable(undefined, name)

        if (!unverifiedUser.length) {
            res.status(404).json({
                status: 'rejected',
                message: "No user who requires verification found."
            })
            return
        }

        const otp = generateOtp();

        await updateOtpInVerifyTable(otp, unverifiedUser[0].otp)

        await sendMail(email, 'Your New OTP for Secure Email Verification', otp)

        res.status(200).json({
            status: 'accepted',
            message: 'OTP resent successfully!'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 'rejected',
            message: 'Something went wrong! please try again.'
        });
    }

}

export const sendHelp: ControllerFncType = (req, res) => {
    req.io?.emit('valueMessage', 'my message');

    res.json({
        message: 'hello'
    })
}