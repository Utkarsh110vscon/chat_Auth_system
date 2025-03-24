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
exports.createVerifyTable = exports.createUserTable = void 0;
const db_config_1 = __importDefault(require("../configs/db.config"));
const createUserTable = () => __awaiter(void 0, void 0, void 0, function* () {
    const queryText = `CREATE TABLE IF NOt EXISTS users
    (
        _id SERIAL PRIMARY KEY,
        fullname VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`;
    try {
        yield db_config_1.default.query(queryText);
    }
    catch (error) {
        throw error;
    }
});
exports.createUserTable = createUserTable;
const createVerifyTable = () => __awaiter(void 0, void 0, void 0, function* () {
    const queryText = `CREATE TABLE IF NOT EXISTS verify 
    (
        _id SERIAL PRIMARY KEY,
        unverified_fullname VARCHAR(255) NOT NULL,
        unverified_email VARCHAR(255) NOT NULL,
        unverified_password TEXT NOT NULL,
        otp VARCHAR(4) UNIQUE NOT NULL,
        otp_session_id TEXT,
        socket_id TEXT,
        creation_time TIMESTAMPTZ DEFAULT NOW()
    )
    `;
    try {
        yield db_config_1.default.query(queryText);
    }
    catch (error) {
        throw error;
    }
});
exports.createVerifyTable = createVerifyTable;
