CREATE TABLE Member (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    gender VARCHAR(100),
	plan VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Admin (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);


CREATE TABLE Trainer (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);




CREATE TABLE Profile (
    profile_id SERIAL PRIMARY KEY,
    entity_type VARCHAR(20) NOT NULL, 
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    country VARCHAR(50),
	weight_KG INT,
	height_cm INT,
	BMI INT,
    fitnessPlan VARCHAR(100), 
    stepGoal INT
);

CREATE TABLE healthTracker (
    id SERIAL PRIMARY KEY,
    profile_id INT REFERENCES Profile(profile_id),
    Date DATE,
    calsEaten INT,
    calsBurnt INT,
    steps INT
);

CREATE TABLE Equipment (
    id SERIAL PRIMARY KEY,
    equipment_name VARCHAR(255) NOT NULL,
    description TEXT
);

CREATE TABLE Rooms (
    id SERIAL PRIMARY KEY,
    room_name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    size INT NOT NULL,
    description TEXT
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    person_type VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(100) NOT NULL,
    person_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (person_id) REFERENCES Profile(profile_id)
);

CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    trainer_id INT NOT NULL,
    trainer_name VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    size INT NOT NULL,
    registered INT NOT NULL,
    description TEXT,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (trainer_id) REFERENCES Profile(profile_id)
);

CREATE TABLE equipbooking (
    session_id INT,
    equipment_id INT,
    FOREIGN KEY (session_id) REFERENCES sessions(id),
    FOREIGN KEY (equipment_id) REFERENCES Equipment(id),
    PRIMARY KEY (session_id, equipment_id)
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    member_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    session_id INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    date DATE NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES profile(profile_id),
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);