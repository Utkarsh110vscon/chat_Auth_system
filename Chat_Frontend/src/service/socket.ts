import { io } from "socket.io-client";

const socket= io(import.meta.env.VITE_API_BASE_URL, {
    reconnection: true,
    reconnectionAttempts: 3,
    reconnectionDelay:1500
});

export default socket;