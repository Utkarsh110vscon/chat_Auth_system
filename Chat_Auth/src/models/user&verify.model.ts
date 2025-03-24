import pool from "../configs/db.config";
import { deleteUserTypes, insertUserType, searchExistingUserInVerifyType, searchExistingUserType, updateOtpType, updateSocketIdType } from "../types/authType";

export const searchExistingUser: searchExistingUserType = async (email) => {
    const queryText = `SELECT * FROM users WHERE email=$1`
    try {
        if (!email) return [];
        const result = await pool.query(queryText, [email])
        return result.rows
    } catch (error) {
        console.error('error in searchExistingUser',error)
        throw error
    }
}

export const insertUserData: insertUserType = async (email, fullName, password, client) => {
    const queryText = `INSERT INTO users (email, fullname, password) VALUES ($1, $2, $3)`

    try {
        if (!email || !fullName || !password) return;
        await (client || pool).query(queryText, [email, fullName, password])
        return;
    } catch (error) {
        console.error('error in insertUserData',error)
        throw error
    }
}

export const insertUserDataInVerifyTable: insertUserType = async (email, fullName, password, client, otp, otpSessionId) => {
    const queryText = `INSERT INTO verify (unverified_email, unverified_fullname, unverified_password, otp, otp_session_id) VALUES ($1, $2, $3, $4, $5)`
    try {
        if (!email || !fullName || !password || !otp) return;
        await (client || pool).query(queryText, [email, fullName, password, otp, otpSessionId])
        return;
    } catch (error) {
        console.error('error in insertUserDataInVerifyTable',error)
        throw error
    }
}

export const updateOtpInVerifyTable:updateOtpType = async (newOtp, previousOtp, client) => {
    const queryText= `UPDATE verify SET otp = $1 WHERE otp = $2`;
    try{
        if(!newOtp || ! previousOtp) return;
        await (client || pool).query(queryText, [newOtp, previousOtp])
        return;
    }catch(error){
        console.error('error in updateOtpInVerifyTable',error)
        throw error
    }
}

export const updateSocketIdInVerifyTable:updateSocketIdType = async(sessionId, socketId, client) => {
    const queryText= `UPDATE verify SET socket_id = $1 WHERE otp_session_id= $2 RETURNING *`;
    try{
        if(!sessionId || !socketId) return;
        const result= await (client || pool).query(queryText, [socketId, sessionId])
        return;
    }catch(error) {
        console.error('error in updateSocketIdInVerifyTable',error)
        throw error
    }
}

export const searchExistingUserInVerifyTable: searchExistingUserInVerifyType = async (otp, name) => {
    const queryWithOtp =`SELECT unverified_email, unverified_fullname, unverified_password, otp FROM verify WHERE otp=$1`
    const queryWithName=`SELECT unverified_email, unverified_fullname, unverified_password, otp FROM verify WHERE unverified_fullname=$1`
    try {
        const queryText= otp ? queryWithOtp : ( name ? queryWithName : undefined);
        const queryParameter = otp ? otp : ( name ? name : undefined);

        if(!queryText || !queryParameter) return[];
        const result = await pool.query(queryText, [queryParameter])
        return result.rows
    } catch (error) {
        console.error('error in searchExistingUserInVerifyTable',error)
        throw error
    }
}

export const deleteUserInVerifyTable:deleteUserTypes = async (name, client) => {
    const queryText= `DELETE FROM verify WHERE unverified_fullname = $1 RETURNING *`
    try{
        const result= await (client || pool).query(queryText,[name]);
        console.log(`User ${name} is successfully deleted from verify table.`)
        return result.rows;
    }catch(error){
        console.error('error in deleteUserInVerifyTable',error)
        throw error;
    }
}