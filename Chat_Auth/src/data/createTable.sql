CREATE TABLE IF NOt EXISTS users(
	_id SERIAL PRIMARY KEY,
	fullname VARCHAR(255) NOT NULL,
	email VARCHAR(255) UNIQUE NOT NULL,
	password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS verify (
   	_id SERIAL PRIMARY KEY,
    unverified_fullname VARCHAR(255) NOT NULL,
    unverified_email VARCHAR(255) UNIQUE NOT NULL,
    unverified_password TEXT NOT NULL,
    otp VARCHAR(4) NOt NULL,
    creation_time TIMESTAMPTZ DEFAULT NOW()
);


SELECT * FROM users ORDER BY _id ASC