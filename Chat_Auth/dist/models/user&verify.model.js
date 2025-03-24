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
exports.deleteUserInVerifyTable = exports.searchExistingUserInVerifyTable = exports.updateSocketIdInVerifyTable = exports.updateOtpInVerifyTable = exports.insertUserDataInVerifyTable = exports.insertUserData = exports.searchExistingUser = void 0;
const db_config_1 = __importDefault(require("../configs/db.config"));
const searchExistingUser = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const queryText = `SELECT * FROM users WHERE email=$1`;
    try {
        if (!email)
            return [];
        const result = yield db_config_1.default.query(queryText, [email]);
        return result.rows;
    }
    catch (error) {
        console.error('error in searchExistingUser', error);
        throw error;
    }
});
exports.searchExistingUser = searchExistingUser;
const insertUserData = (email, fullName, password, client) => __awaiter(void 0, void 0, void 0, function* () {
    const queryText = `INSERT INTO users (email, fullname, password) VALUES ($1, $2, $3)`;
    try {
        if (!email || !fullName || !password)
            return;
        yield (client || db_config_1.default).query(queryText, [email, fullName, password]);
        return;
    }
    catch (error) {
        console.error('error in insertUserData', error);
        throw error;
    }
});
exports.insertUserData = insertUserData;
const insertUserDataInVerifyTable = (email, fullName, password, client, otp, otpSessionId) => __awaiter(void 0, void 0, void 0, function* () {
    const queryText = `INSERT INTO verify (unverified_email, unverified_fullname, unverified_password, otp, otp_session_id) VALUES ($1, $2, $3, $4, $5)`;
    try {
        if (!email || !fullName || !password || !otp)
            return;
        yield (client || db_config_1.default).query(queryText, [email, fullName, password, otp, otpSessionId]);
        return;
    }
    catch (error) {
        console.error('error in insertUserDataInVerifyTable', error);
        throw error;
    }
});
exports.insertUserDataInVerifyTable = insertUserDataInVerifyTable;
const updateOtpInVerifyTable = (newOtp, previousOtp, client) => __awaiter(void 0, void 0, void 0, function* () {
    const queryText = `UPDATE verify SET otp = $1 WHERE otp = $2`;
    try {
        if (!newOtp || !previousOtp)
            return;
        yield (client || db_config_1.default).query(queryText, [newOtp, previousOtp]);
        return;
    }
    catch (error) {
        console.error('error in updateOtpInVerifyTable', error);
        throw error;
    }
});
exports.updateOtpInVerifyTable = updateOtpInVerifyTable;
const updateSocketIdInVerifyTable = (sessionId, socketId, client) => __awaiter(void 0, void 0, void 0, function* () {
    const queryText = `UPDATE verify SET socket_id = $1 WHERE otp_session_id= $2 RETURNING *`;
    try {
        if (!sessionId || !socketId)
            return;
        const result = yield (client || db_config_1.default).query(queryText, [socketId, sessionId]);
        return;
    }
    catch (error) {
        console.error('error in updateSocketIdInVerifyTable', error);
        throw error;
    }
});
exports.updateSocketIdInVerifyTable = updateSocketIdInVerifyTable;
const searchExistingUserInVerifyTable = (otp, name) => __awaiter(void 0, void 0, void 0, function* () {
    const queryWithOtp = `SELECT unverified_email, unverified_fullname, unverified_password, otp FROM verify WHERE otp=$1`;
    const queryWithName = `SELECT unverified_email, unverified_fullname, unverified_password, otp FROM verify WHERE unverified_fullname=$1`;
    try {
        const queryText = otp ? queryWithOtp : (name ? queryWithName : undefined);
        const queryParameter = otp ? otp : (name ? name : undefined);
        if (!queryText || !queryParameter)
            return [];
        const result = yield db_config_1.default.query(queryText, [queryParameter]);
        return result.rows;
    }
    catch (error) {
        console.error('error in searchExistingUserInVerifyTable', error);
        throw error;
    }
});
exports.searchExistingUserInVerifyTable = searchExistingUserInVerifyTable;
const deleteUserInVerifyTable = (name, client) => __awaiter(void 0, void 0, void 0, function* () {
    const queryText = `DELETE FROM verify WHERE unverified_fullname = $1 RETURNING *`;
    try {
        const result = yield (client || db_config_1.default).query(queryText, [name]);
        console.log(`User ${name} is successfully deleted from verify table.`);
        return result.rows;
    }
    catch (error) {
        console.error('error in deleteUserInVerifyTable', error);
        throw error;
    }
});
exports.deleteUserInVerifyTable = deleteUserInVerifyTable;
