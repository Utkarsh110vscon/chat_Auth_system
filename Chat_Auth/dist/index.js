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
const dotenv_1 = require("dotenv");
const express_1 = __importDefault(require("express"));
const auth_router_1 = require("./routers/auth.router");
const bodyParser = require("body-parser");
const initializeDatabase_1 = __importDefault(require("./data/initializeDatabase"));
const helperFunc_1 = require("./utils/helperFunc");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const user_verify_model_1 = require("./models/user&verify.model");
const injectIoMiddleware_1 = require("./middlewares/injectIoMiddleware");
(0, dotenv_1.configDotenv)();
const app = (0, express_1.default)();
const port = process.env.PORT;
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
});
io.on('connection', (socket) => {
    console.log(`Client connected with socket id: ${socket.id}`);
    socket.on('registerOtpSession', (sessionId) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(`session_id: ${sessionId} associated with socket_id: ${socket.id}`);
        try {
            yield (0, user_verify_model_1.updateSocketIdInVerifyTable)(sessionId, socket.id);
            socket.emit('startOtpSession');
        }
        catch (error) {
            console.log(`Failed to update socket ID in DB for session: ${sessionId}`, error);
            socket.emit('OtpSessionError', { error: 'Session registration failed' });
        }
    }));
    socket.on('disconnect', () => {
        console.log(`Client disconnected ${socket.id}`);
    });
});
app.use((0, injectIoMiddleware_1.injectIoMiddleware)(io));
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/api', auth_router_1.authRouter);
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, initializeDatabase_1.default)();
    (0, helperFunc_1.scheduleJob)(io);
    server.listen(port, () => {
        console.log(`server is listening on port ${port}`);
    });
});
startServer();
