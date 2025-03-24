import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

export const oauth2Client= new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "http://localhost:3000/api/auth/google/redirect"
);

export const scopes= ['profile', 'email'];