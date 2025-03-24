import pg from "pg";
import dotenv from 'dotenv';

dotenv.config();

const { Pool }= pg

const pool= new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT)
})

pool.on('connect' , () => {
    console.log("Connection with Postgres Database Established!");
});

pool.on('error', () => {
    console.log("Error while connecting to the database!");
})

export default pool;