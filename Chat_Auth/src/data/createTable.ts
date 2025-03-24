import pool from "../configs/db.config"

export const createUserTable = async () => {
    const queryText = `CREATE TABLE IF NOt EXISTS users
    (
        _id SERIAL PRIMARY KEY,
        fullname VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`

    try {
        await pool.query(queryText);
    } catch (error) {
        throw error
    }
}

export const createVerifyTable = async () => {
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
    `

    try {
        await pool.query(queryText);
    } catch (error) {
        throw error
    }
}