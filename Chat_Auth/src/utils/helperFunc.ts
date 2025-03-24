import bcrypt from 'bcrypt';
import cron from 'node-cron';
import pool from '../configs/db.config';
import { generateNewAccessTokenType, generateTokenType, hashFncType, verifyTokenType } from '../types/authType';
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { emitOtpSession } from './emitOtpSession';

dotenv.config();


export const createHash: hashFncType = async (password, saltRound) => {
    const hashedPassword = await bcrypt.hash(password, saltRound);
    return hashedPassword;
}

export const scheduleJob = async (io:Server) => {
    cron.schedule('* * * * *', async () => {
        try {
            const result = await pool.query(`DELETE FROM verify WHERE creation_time < NOW() - INTERVAL '5 minutes' RETURNING *`)
            console.error(`Cleaned up ${result.rowCount} old rows from verify table`);
            if(!result.rows.length) return;
            result.rows.forEach(row => emitOtpSession(io, row.socket_id, 'failed'))
        } catch (error) {
            console.error("Cleanup job failed:", error);
        }
    });
}

export const generateOtp = () => {
    let randomNUM='';
    for (let i = 0; i < 4; i++) {
        randomNUM =  randomNUM + Math.floor(Math.random() * 9)
    }
    return randomNUM;
};


export const generateToken: generateTokenType = (email) => {
    const ACCESS_SECRET = process.env.ACCESS_SECRET;
    const REFRESH_SECRET = process.env.REFRESH_SECRET;

    const ACCESS_EXPIRY = "10m";
    const REFRESH_EXPIRY = "1h";

    let accessToken;
    let refreshToken;

    if (ACCESS_SECRET && REFRESH_SECRET) {
        accessToken = jwt.sign({ userEmail: email }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY })
        refreshToken = jwt.sign({ userEmail: email }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY })
    }

    return { refreshToken, accessToken };
}

export const verfiyToken : verifyTokenType = (refreshToken) => {
    const REFRESH_SECRET = process.env.REFRESH_SECRET;

    try{
        if (REFRESH_SECRET) {
            const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as JwtPayload;
            return decoded;
        }else{
            throw new Error('Server Error')
        }
    }catch(error){
        console.log(error);
        return;
    }

}

export const generateNewAccessToken: generateNewAccessTokenType = (email, id) => {
    const ACCESS_SECRET = process.env.ACCESS_SECRET;
    const ACCESS_EXPIRY = "10m";
    let accessToken;

    if (ACCESS_SECRET) {
        accessToken = jwt.sign({ userId: id, userEmail: email }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY })
    }

    return accessToken;
}


export function generateRandomSessionId() {
    return Math.random().toString(36).substr(2, 9);
}