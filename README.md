# Authentication System with React, Node.js, Express, and PostgreSQL

A complete authentication system with user registration, OTP verification, JWT authentication, password management, and social login capabilities.

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- React Router for navigation
- Axios for API requests
- Socket.io Client for real-time OTP sessions

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL (in Docker)
- pg for database communication
- JWT for authentication
- Nodemailer for email functionality
- bcrypt for password hashing
- Socket.io for real-time communication

### DevOps
- Docker & Docker Compose
- Environment variable management

## Features

### User Authentication
- User registration with email verification
- Login with JWT (access and refresh tokens)
- Dual token strategy:
  - Short-lived access token (15 minutes)
  - Long-lived refresh token (7 days)
- Automatic token refresh mechanism
- Secure password hashing with bcrypt
- Token blacklisting for logout

### OTP Verification
- Email-based OTP verification
- Real-time OTP session management using Socket.io
- Configurable OTP expiration

### Password Management
- Secure password reset flow
- Forgot password functionality

### Social Media Authentication
- OAuth integration for Google using googleApis.

### Email Communication
- Transactional emails (verification, password reset)
