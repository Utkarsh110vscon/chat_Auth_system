import { createContext, ReactNode, useEffect } from "react";
import socket from "../service/socket";
import { Socket } from "socket.io-client";

export const SocketContext= createContext<Socket>(socket);

const SocketProvider = ({ children }:{ children:ReactNode } ) => {

    useEffect(() => {
        socket.connect();

        return () => {
            socket.disconnect()
        }
    }, [socket])
    
    return(
        <SocketContext.Provider value={socket}>
            { children }
        </SocketContext.Provider>
        
    );
}

export default SocketProvider