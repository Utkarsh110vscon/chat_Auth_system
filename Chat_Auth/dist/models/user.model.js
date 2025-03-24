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
exports.searchExistingUserInVerifyTable = exports.insertUserDataInVerifyTable = exports.insertUserData = exports.searchExistingUser = void 0;
const db_config_1 = __importDefault(require("../configs/db.config"));
const searchExistingUser = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const queryText = `SELECT _id, email, fullname FROM users WHERE email=$1`;
    try {
        const result = yield db_config_1.default.query(queryText, [email]);
        return result.rows;
    }
    catch (error) {
        console.error(error);
        throw error;
    }
});
exports.searchExistingUser = searchExistingUser;
const insertUserData = (email, fullName, password) => __awaiter(void 0, void 0, void 0, function* () {
    const queryText = `INSERT INTO users (email, fullname, password) VALUES ($1, $2, $3)`;
    try {
        yield db_config_1.default.query(queryText, [email, fullName, password]);
        return;
    }
    catch (error) {
        console.error(error);
        throw error;
    }
});
exports.insertUserData = insertUserData;
const insertUserDataInVerifyTable = (email, fullName, password, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const queryText = `INSERT INTO verify (unverified_email, unverified_fullname, unverified_password, otp) VALUES ($1, $2, $3, $4)`;
    try {
        yield db_config_1.default.query(queryText, [email, fullName, password, otp]);
        return;
    }
    catch (error) {
        console.error(error);
        throw error;
    }
});
exports.insertUserDataInVerifyTable = insertUserDataInVerifyTable;
const searchExistingUserInVerifyTable = (otp) => __awaiter(void 0, void 0, void 0, function* () {
    const queryText = `SELECT unverified_email, unverified_fullname, unverified_password, otp FROM verify WHERE otp=$1`;
    try {
        const result = yield db_config_1.default.query(queryText, [otp]);
        return result.rows;
    }
    catch (error) {
        console.error(error);
        throw error;
    }
});
exports.searchExistingUserInVerifyTable = searchExistingUserInVerifyTable;
