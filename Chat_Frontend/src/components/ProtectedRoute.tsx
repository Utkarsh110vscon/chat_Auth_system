import { ReactNode } from "react";
import { useAppSelector } from "../hooks/customHook";
import { Navigate } from "react-router-dom";

interface ProtectedRouteNode{
    children: ReactNode
}

const ProtectedRoute =({ children }:ProtectedRouteNode) => {
    const globalAuthState = useAppSelector((state) => state.auth.userSession);
    console.log(globalAuthState)

    if(!globalAuthState){
        return  <Navigate to={"/login"} />
    }

    return(
        <div>
            {children}
        </div>
    );
}

export default ProtectedRoute;