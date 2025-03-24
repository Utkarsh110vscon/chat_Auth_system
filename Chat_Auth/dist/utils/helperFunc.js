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
exports.generateNewAccessToken = exports.verfiyToken = exports.generateToken = exports.generateOtp = exports.scheduleJob = exports.createHash = void 0;
exports.generateRandomSessionId = generateRandomSessionId;
const bcrypt_1 = __importDefault(require("bcrypt"));
const node_cron_1 = __importDefault(require("node-cron"));
const db_config_1 = __importDefault(require("../configs/db.config"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const emitOtpSession_1 = require("./emitOtpSession");
dotenv_1.default.config();
const createHash = (password, saltRound) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcrypt_1.default.hash(password, saltRound);
    return hashedPassword;
});
exports.createHash = createHash;
const scheduleJob = (io) => __awaiter(void 0, void 0, void 0, function* () {
    node_cron_1.default.schedule('* * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield db_config_1.default.query(`DELETE FROM verify WHERE creation_time < NOW() - INTERVAL '5 minutes' RETURNING *`);
            console.error(`Cleaned up ${result.rowCount} old rows from verify table`);
            if (!result.rows.length)
                return;
            result.rows.forEach(row => (0, emitOtpSession_1.emitOtpSession)(io, row.socket_id, 'failed'));
        }
        catch (error) {
            console.error("Cleanup job failed:", error);
        }
    }));
});
exports.scheduleJob = scheduleJob;
const generateOtp = () => {
    let randomNUM = '';
    for (let i = 0; i < 4; i++) {
        randomNUM = randomNUM + Math.floor(Math.random() * 9);
    }
    return randomNUM;
};
exports.generateOtp = generateOtp;
const generateToken = (email) => {
    const ACCESS_SECRET = process.env.ACCESS_SECRET;
    const REFRESH_SECRET = process.env.REFRESH_SECRET;
    const ACCESS_EXPIRY = "10m";
    const REFRESH_EXPIRY = "1h";
    let accessToken;
    let refreshToken;
    if (ACCESS_SECRET && REFRESH_SECRET) {
        accessToken = jsonwebtoken_1.default.sign({ userEmail: email }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });
        refreshToken = jsonwebtoken_1.default.sign({ userEmail: email }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });
    }
    return { refreshToken, accessToken };
};
exports.generateToken = generateToken;
const verfiyToken = (refreshToken) => {
    const REFRESH_SECRET = process.env.REFRESH_SECRET;
    try {
        if (REFRESH_SECRET) {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, REFRESH_SECRET);
            return decoded;
        }
        else {
            throw new Error('Server Error');
        }
    }
    catch (error) {
        console.log(error);
        return;
    }
};
exports.verfiyToken = verfiyToken;
const generateNewAccessToken = (email, id) => {
    const ACCESS_SECRET = process.env.ACCESS_SECRET;
    const ACCESS_EXPIRY = "10m";
    let accessToken;
    if (ACCESS_SECRET) {
        accessToken = jsonwebtoken_1.default.sign({ userId: id, userEmail: email }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });
    }
    return accessToken;
};
exports.generateNewAccessToken = generateNewAccessToken;
function generateRandomSessionId() {
    return Math.random().toString(36).substr(2, 9);
}
