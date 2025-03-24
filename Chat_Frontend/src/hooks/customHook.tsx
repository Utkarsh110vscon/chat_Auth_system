import { TypedUseSelectorHook, useSelector } from "react-redux";
import { RootState } from "../app/store";
import { SocketContext } from "../components/SocketProvider";
import { useContext } from "react";

export const useAppSelector:TypedUseSelectorHook<RootState>= useSelector;
export const useSocket= () => {
    return(useContext(SocketContext));
}
