import { configDotenv } from "dotenv";
import express from "express";
import { authRouter } from "./routers/auth.router";
import { Port } from "./types/authType";
import bodyParser = require("body-parser");
import initializeDatabase from "./data/initializeDatabase";
import { scheduleJob } from "./utils/helperFunc";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { Server } from 'socket.io';
import  http from 'http';
import { updateSocketIdInVerifyTable } from "./models/user&verify.model";
import { injectIoMiddleware } from "./middlewares/injectIoMiddleware";

configDotenv();

const app = express();
const port:Port=  process.env.PORT;
const server= http.createServer(app);

const io= new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true 
    }
});

io.on('connection', (socket) => {
    console.log(`Client connected with socket id: ${socket.id}`);

    socket.on('registerOtpSession', async(sessionId) => {
        console.log(`session_id: ${sessionId} associated with socket_id: ${socket.id}`);
        try{
            await updateSocketIdInVerifyTable(sessionId, socket.id)
            socket.emit('startOtpSession');
        }catch(error) {
            console.log(`Failed to update socket ID in DB for session: ${sessionId}`,error);
            socket.emit('OtpSessionError', { error: 'Session registration failed'})
        }
    })
    
    socket.on('disconnect', () => {
        console.log(`Client disconnected ${socket.id}`)
    })
});

app.use(injectIoMiddleware(io));

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(cookieParser());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use('/api', authRouter)

const startServer= async() => {
    
    await initializeDatabase();
    scheduleJob(io);
    server.listen(port, () => {
        console.log(`server is listening on port ${port}`)
    });
}

startServer();