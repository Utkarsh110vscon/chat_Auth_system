import { createSlice } from "@reduxjs/toolkit";

const AuthState= {
    userSession: false,
    otpSession: false
}

const AuthSlice= createSlice({
    name: 'auth',
    initialState:AuthState,
    reducers: {
        AuthenticateUserSession: (state) => {
            state.userSession = true
        },
        UnauthenticateUserSession: (state) => {
            state.userSession = false
        },
        AuthenticateOtpSession: (state) => {
            state.otpSession = true
        },
        UnauthenticateOtpSession: (state) => {
            state.otpSession = false
        }
    }
});

export default AuthSlice.reducer
export const { AuthenticateUserSession,UnauthenticateUserSession,AuthenticateOtpSession,UnauthenticateOtpSession } = AuthSlice.actions