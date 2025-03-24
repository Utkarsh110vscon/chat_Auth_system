import { NextFunction, Router, Request, Response } from "express"
import { JwtPayload } from "jsonwebtoken"
import { PoolClient } from "pg"
import { Server } from "socket.io"


export interface tokenObjType {
    accessToken: string | undefined
    refreshToken: string | undefined
}

export interface IoRequest extends Request {
    io?: Server;
    user?: JwtPayload;
}


export type Port = String | undefined
export type routerType = Router
export type ControllerFncType = (req: IoRequest, res: Response) => void | Promise<void>
export type MiddlewarerFncType = (req: IoRequest, res: Response, next: NextFunction) => void | Promise<void>
export type existingUserType = { _id: number, fullname: string, email: string, password: string }
export type searchExistingUserType = (email?: string, otp?: number) => Promise<existingUserType[]>
export type searchExistingUserInVerifyType = (otp?: string, name?: string, client?: PoolClient) => Promise<any[]>
export type insertUserType = (email?: string, fullName?: string, password?: string, client?:PoolClient, otp?: string, otpSessionId?: string) => Promise<void>
export type hashFncType = (password: string, saltRound: number) => Promise<string>
export type mailFncType = (to: string, subject: string, otp: string) => Promise<void>
export type generateTokenType = (email: string) => tokenObjType
export type verifyTokenType = (refreshToken: string) => JwtPayload | void
export type generateNewAccessTokenType = (email: string, id: number) => string | undefined
export type updateOtpType = (newOtp: string, previousOtp: string, client?: PoolClient) => Promise<void>
export type updateSocketIdType = (sessionId: string, socketId: string, client?: PoolClient) => Promise<void>
export type deleteUserTypes = (name: string, client?:PoolClient) => Promise<any[]>