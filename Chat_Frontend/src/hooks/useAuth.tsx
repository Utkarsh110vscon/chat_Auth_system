import { useEffect, useState } from "react";
import API from "../service/apiService";
import { AuthenticateUserSession } from "../app/slices/AuthSlice";
import { useDispatch } from "react-redux";

export const useAuth = () => {
    const dispatch = useDispatch();
    const [authLoading, setAuthLoading] = useState(true);
    
    const checkAuth = async () => {
        try {
            const res = await API.get('/api/auth/check');
            console.log(res)
            dispatch(AuthenticateUserSession())
        } catch (error) {
            console.log(error);
        } finally {
            setAuthLoading(false);
        }
    }

    useEffect(() => {
        checkAuth();
    }, []);

    return { authLoading };
}