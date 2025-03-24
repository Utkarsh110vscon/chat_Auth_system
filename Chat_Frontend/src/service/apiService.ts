import axios, { AxiosHeaders, InternalAxiosRequestConfig } from "axios";
import { getNewaccessToken } from "../utils/helperFnc";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true
});

const authRoutes= ['/login', '/signup'];

API.interceptors.request.use(
    async (request: InternalAxiosRequestConfig) => {
        const accessToken = localStorage.getItem("accessToken");

        if (accessToken) {

            if(!(request.headers instanceof AxiosHeaders)){
                request.headers= new AxiosHeaders(request.headers)
            }
            request.headers.set("Authorization", `Bearer ${accessToken}`);
        }

        return request;
    },
    (error) => Promise.reject(error)

);

API.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;
        console.log("originalRequest",originalRequest);

        if (error.response && error.response.status === 401 && !originalRequest._retry  && !authRoutes.includes(window.location.pathname)) {
            originalRequest._retry = true;

            try {
                const newAccessToken = await getNewaccessToken();
                console.log(newAccessToken,'in response interceptor');
                if (newAccessToken) {
                    localStorage.setItem("accessToken", newAccessToken);
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    console.log('inside if block');
                    return API(originalRequest);
                } else {
                    localStorage.removeItem("accessToken");
                    window.location.href = "/login";
                }
            } catch (refreshError) {    
                localStorage.removeItem("accessToken");
                window.location.href = "/login";  
            }
        }

        if (error.response && error.response.status === 498) {
            console.log("498 status: Refresh token invalid or expired. Logging out...");
            localStorage.removeItem("accessToken");
            window.location.href = "/login";
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export default API;
