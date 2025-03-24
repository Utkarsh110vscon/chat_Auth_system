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
exports.sendHelp = exports.resendOtp = exports.googleAuthRedirect = exports.googleAuth = exports.authenticateUser = exports.logoutUser = exports.getNewAccessToken = exports.loginUser = exports.verifyUser = exports.signUpUser = void 0;
const googleapis_1 = require("googleapis");
const nodemailer_config_1 = require("../configs/nodemailer.config");
const oauth2Client_config_1 = require("../configs/oauth2Client.config");
const user_verify_model_1 = require("../models/user&verify.model");
const helperFunc_1 = require("../utils/helperFunc");
const bcrypt_1 = __importDefault(require("bcrypt"));
const emitOtpSession_1 = require("../utils/emitOtpSession");
const db_config_1 = __importDefault(require("../configs/db.config"));
const signUpUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const io = req.io;
    try {
        const { fullName, email, password } = req.body;
        if (!fullName || !email || !password) {
            res.status(400).json({
                status: 'rejected',
                message: 'All fields are required!'
            });
            return;
        }
        const value = yield (0, user_verify_model_1.searchExistingUser)(email);
        if (value.length) {
            res.status(409).json({
                status: 'rejected',
                message: 'User already registered'
            });
            return;
        }
        const hashedPassword = yield (0, helperFunc_1.createHash)(password, 12);
        const otp = (0, helperFunc_1.generateOtp)();
        const otpSessionId = (0, helperFunc_1.generateRandomSessionId)();
        yield (0, user_verify_model_1.insertUserDataInVerifyTable)(email, fullName, hashedPassword, undefined, otp, otpSessionId);
        yield (0, nodemailer_config_1.sendMail)(email, 'Verify Your Email Address', otp);
        res.status(201).json({
            status: 'accepted',
            message: 'User successfully registered, Verify using the Provided Otp in you email!',
            otpSessionId: otpSessionId
        });
        return;
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            status: 'rejected',
            message: 'Something went wrong! please try again.'
        });
    }
});
exports.signUpUser = signUpUser;
const verifyUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const clientOtp = req.body.clientOtp;
    const client = yield db_config_1.default.connect();
    console.log('clientOtp', clientOtp);
    try {
        if (!req.io)
            return;
        if (!clientOtp) {
            res.status(400).json({
                status: 'rejected',
                message: 'OTP is required'
            });
            return;
        }
        yield client.query('BEGIN');
        const existingUser = yield (0, user_verify_model_1.searchExistingUserInVerifyTable)(clientOtp, undefined, client);
        if (!existingUser.length) {
            yield client.query('ROLLBACK');
            res.status(403).json({
                status: 'rejected',
                message: "Invalid OTP. Please try again.",
            });
            return;
        }
        yield (0, user_verify_model_1.insertUserData)(existingUser[0].unverified_email, existingUser[0].unverified_fullname, existingUser[0].unverified_password, client);
        const deletedUser = yield (0, user_verify_model_1.deleteUserInVerifyTable)(existingUser[0].unverified_fullname, client);
        console.log(deletedUser[0]);
        (0, emitOtpSession_1.emitOtpSession)(req.io, deletedUser[0].socket_id, 'success');
        yield client.query('COMMIT');
        res.status(201).json({
            status: 'accepted',
            message: 'User successfully verified'
        });
        return;
    }
    catch (error) {
        console.log(error);
        yield client.query('ROLLBACK');
        res.status(500).json({
            status: 'rejected',
            message: 'Something went wrong! please try again.'
        });
    }
    finally {
        client.release();
    }
});
exports.verifyUser = verifyUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const existingUser = yield (0, user_verify_model_1.searchExistingUser)(email);
        if (!existingUser.length) {
            res.status(404).json({
                status: 'rejected',
                message: "Invalid email or password"
            });
            return;
        }
        const isPasswordCorrect = yield bcrypt_1.default.compare(password, existingUser[0].password);
        if (!isPasswordCorrect) {
            res.status(404).json({
                status: 'rejected',
                message: "Invalid email or password"
            });
            return;
        }
        const token = (0, helperFunc_1.generateToken)(existingUser[0].email);
        if (!token.accessToken || !token.refreshToken) {
            throw new Error('Token generation failed.');
        }
        res.cookie('refreshToken', token.refreshToken, {
            httpOnly: true,
            secure: false,
            // maxAge: 7 * 24 * 60 * 60 * 1000
            maxAge: 60 * 60 * 1000
        });
        res.status(200).json({
            status: 'accepted',
            message: 'User Sucessfully logged-in.',
            accessToken: token.accessToken
        });
        return;
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            status: 'rejected',
            message: 'Something went wrong! please try again.'
        });
    }
});
exports.loginUser = loginUser;
const getNewAccessToken = (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        res.status(498).json({
            status: 'rejected',
            message: 'Access Denied. No Refresh Token!'
        });
        return;
    }
    const decode = (0, helperFunc_1.verfiyToken)(refreshToken);
    if (!decode) {
        res.status(498).json({
            status: 'rejected',
            message: 'Access Denied. Authntication failed!'
        });
        return;
    }
    const newAccessToken = (0, helperFunc_1.generateNewAccessToken)(decode === null || decode === void 0 ? void 0 : decode.userEmail, decode === null || decode === void 0 ? void 0 : decode.userId);
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
};
exports.getNewAccessToken = getNewAccessToken;
const logoutUser = (req, res) => {
    try {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: false
        });
        res.status(200).json({
            status: 'accepted',
            message: 'Logged out successfully.'
        });
        return;
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            status: 'rejected',
            message: 'Something went wrong! please try again.'
        });
    }
};
exports.logoutUser = logoutUser;
const authenticateUser = (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'user authorized successfully!'
    });
};
exports.authenticateUser = authenticateUser;
const googleAuth = (req, res) => {
    const url = oauth2Client_config_1.oauth2Client.generateAuthUrl({
        prompt: 'consent',
        scope: oauth2Client_config_1.scopes
    });
    res.redirect(url);
};
exports.googleAuth = googleAuth;
const googleAuthRedirect = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.query.code) {
            res.status(400).json({
                status: 'rejected',
                message: 'No code provided'
            });
            return;
        }
        const code = req.query.code;
        const Credential = yield oauth2Client_config_1.oauth2Client.getToken(code);
        oauth2Client_config_1.oauth2Client.setCredentials(Credential.tokens);
        const oauth = googleapis_1.google.oauth2({
            auth: oauth2Client_config_1.oauth2Client,
            version: 'v2'
        });
        const { data } = yield oauth.userinfo.get();
        if (!data.email || !data.name) {
            throw new Error("Data is not provided by google!");
        }
        const user = yield (0, user_verify_model_1.searchExistingUser)(data.email);
        if (!user.length) {
            const temporaryPassword = `${data.email}/${data.name}/${new Date().getFullYear()}`;
            yield (0, user_verify_model_1.insertUserData)(data.email, data.name, temporaryPassword);
            console.log(data.email);
            (0, nodemailer_config_1.sendPassword)(data.email, 'Your New Password', temporaryPassword);
        }
        const localTokens = (0, helperFunc_1.generateToken)(data.email);
        res.cookie('refreshToken', localTokens.refreshToken, {
            httpOnly: true,
            maxAge: 60 * 60 * 1000,
            secure: false
        });
        res.send(`<!DOCTYPE html>
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
            </html>`);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            status: 'rejected',
            message: 'Something went wrong! please try again.'
        });
    }
});
exports.googleAuthRedirect = googleAuthRedirect;
const resendOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.query.fullName || !req.query.email) {
        res.status(400).json({
            status: 'rejected',
            message: "Unverified user's name is required."
        });
        return;
    }
    const name = String(req.query.fullName);
    const email = String(req.query.email);
    try {
        const unverifiedUser = yield (0, user_verify_model_1.searchExistingUserInVerifyTable)(undefined, name);
        if (!unverifiedUser.length) {
            res.status(404).json({
                status: 'rejected',
                message: "No user who requires verification found."
            });
            return;
        }
        const otp = (0, helperFunc_1.generateOtp)();
        yield (0, user_verify_model_1.updateOtpInVerifyTable)(otp, unverifiedUser[0].otp);
        yield (0, nodemailer_config_1.sendMail)(email, 'Your New OTP for Secure Email Verification', otp);
        res.status(200).json({
            status: 'accepted',
            message: 'OTP resent successfully!'
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            status: 'rejected',
            message: 'Something went wrong! please try again.'
        });
    }
});
exports.resendOtp = resendOtp;
const sendHelp = (req, res) => {
    var _a;
    (_a = req.io) === null || _a === void 0 ? void 0 : _a.emit('valueMessage', 'my message');
    res.json({
        message: 'hello'
    });
};
exports.sendHelp = sendHelp;
