

INSERT INTO Profile (entity_type, full_name, email) 
VALUES ('Admin', 'a', 'a');


INSERT INTO Member (full_name, email, gender, plan, password_hash) 
VALUES 
    ('John', 'john@gmail.com', 'Male', 'Premium', '$2b$10$qnhtaSzvoqvQeuxq.3mpLOffeqdnLv8HdjCRmIuW6iWQKSog6opZG'),
    ('Martin', 'Martin@gmail.com', 'Female', 'Free', '$2b$10$qnhtaSzvoqvQeuxq.3mpLOffeqdnLv8HdjCRmIuW6iWQKSog6opZG');


INSERT INTO Admin (full_name, email, password_hash) 
VALUES ('admin', 'admin@gmail.com', '$2b$10$qnhtaSzvoqvQeuxq.3mpLOffeqdnLv8HdjCRmIuW6iWQKSog6opZG');


INSERT INTO Trainer (full_name, email, password_hash) 
VALUES 

    ('Sam', 'sam@gmail.com', '$2b$10$qnhtaSzvoqvQeuxq.3mpLOffeqdnLv8HdjCRmIuW6iWQKSog6opZG');


INSERT INTO Profile (profile_id, entity_type, full_name, email, country, weight_KG, height_cm, BMI, fitnessPlan, stepGoal) 
VALUES 
    (1,'Member', 'John', 'john@gmail.com', 'USA', 75, 180, 24, 'NULL', 10000),
    (2,'Member', 'Martin', 'martin@gmail.com', 'Canada', 65, 165, 23, 'NULL', 12000),
    (3,'Trainer', 'Sam', 'sam@gmail.com', NULL, NULL, NULL, NULL, 'NULL', NULL),
    (4,'Admin', 'admin', 'admin@gmail.com', NULL, NULL, NULL, NULL, 'NULL', NULL);


INSERT INTO healthTracker (profile_id, Date, calsEaten, calsBurnt, steps) 
VALUES 
    (1, '2024-04-01', 2000, 500, 8000),
    (2, '2024-04-01', 1800, 600, 10000);


INSERT INTO Equipment (equipment_name, description) 
VALUES 
    ('Treadmill', 'Cardio equipment'),
    ('Dumbbells', 'Weight lifting equipment'),
    ('Yoga Mat', 'Mat for yoga exercises');


INSERT INTO Rooms (room_name, location, size, description) 
VALUES 
    ('Gym', 'First Floor', 30, 'Aerobics room');


INSERT INTO transactions (type, person_type, name, status, person_id, amount) 
VALUES 
    ('Membership', 'Member', 'John', 'Paid', 1, 9.99);


INSERT INTO sessions (trainer_id, trainer_name, name, location, size, registered, description, start_time, end_time, date) 
VALUES 
    (3, 'Sam', 'Cardio Blast', 'Gym', 15, 1, 'Intense cardio workout', '09:00:00', '10:00:00', '2024-04-10');



INSERT INTO equipbooking (session_id, equipment_id) 
VALUES 
    (1, 1),
    (1, 2);


INSERT INTO bookings (member_id, name, location, session_id, start_time, end_time, date) 
VALUES 
    (1, 'John', 'Gym', 1, '09:00:00', '10:00:00', '2024-04-10');
