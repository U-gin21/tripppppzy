CREATE DATABASE IF NOT EXISTS tripzy_db;
USE tripzy_db;

-- Temporarily disable foreign key checks to allow dropping and recreating tables
SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS companion_requests;
DROP TABLE IF EXISTS companion_posts;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS destinations;
DROP TABLE IF EXISTS faqs;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('tourist', 'provider', 'admin') NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    name_with_initial VARCHAR(100) NOT NULL,
    nic_passport VARCHAR(50) NOT NULL,
    contact_no VARCHAR(20) NOT NULL,
    gender ENUM('male', 'female') NOT NULL,
    date_of_birth DATE NOT NULL,
    profile_photo VARCHAR(255) DEFAULT 'default_profile.jpg',
    status ENUM('pending', 'active', 'rejected') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Services Table
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provider_id INT NOT NULL,
    service_type ENUM('hotel', 'vehicle', 'guide', 'camping_tool') NOT NULL,
    name_of_institute VARCHAR(150) NOT NULL,
    photo VARCHAR(255) NOT NULL,
    contact_no VARCHAR(20) NOT NULL,
    email VARCHAR(150) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('enabled', 'disabled') DEFAULT 'enabled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tourist_id INT NOT NULL,
    service_id INT NOT NULL,
    ref_no VARCHAR(50) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'completed', 'rejected') DEFAULT 'pending',
    booking_details TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tourist_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- 4. Companion Posts
CREATE TABLE IF NOT EXISTS companion_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    destination_place VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget_range VARCHAR(100) NOT NULL,
    companions_needed INT NOT NULL,
    gender_preference VARCHAR(20) DEFAULT 'Any',
    travel_interests VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('open', 'closed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Companion Requests
CREATE TABLE IF NOT EXISTS companion_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    requester_id INT NOT NULL,
    message TEXT,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES companion_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Destinations Table
CREATE TABLE IF NOT EXISTS destinations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    district VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    image VARCHAR(255) NOT NULL,
    activities VARCHAR(255) NOT NULL,
    budget_category ENUM('budget', 'mid-range', 'luxury') NOT NULL,
    interest_category ENUM('Beaches', 'Mountains', 'Camping', 'Wildlife', 'Historical places', 'Adventure', 'Nature', 'Cultural destinations') NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tourist_id INT NOT NULL,
    service_id INT NOT NULL,
    rating INT NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tourist_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- 8. FAQs Table
CREATE TABLE IF NOT EXISTS faqs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- SEED DATA

-- Primary Admin Account (Password: ABcd1234)
INSERT INTO users (email, password_hash, user_type, full_name, name_with_initial, nic_passport, contact_no, gender, date_of_birth, profile_photo, status)
VALUES ('dteugee2003@gmail.com', '$2y$10$djocG7BNp8X9zo2iEOqPs.Zr.1VenvrAFM.L..3K/Kc4Cr3hUcWRy', 'admin', 'Eugene De Silva', 'E. De Silva', '200305012345', '0771234567', 'male', '2003-05-01', 'default_profile.jpg', 'active');

-- Initial Destinations
INSERT INTO destinations (name, district, description, image, activities, budget_category, interest_category, latitude, longitude) VALUES
('Mirissa Beach', 'Matara', 'A beautiful, golden sandy beach ideal for whale watching, surfing, and relaxing under coconut trees.', 'mirissa.jpg', 'Whale Watching, Surfing, Beach Parties', 'budget', 'Beaches', 5.9482, 80.4574),
('Ella Rock & Nine Arch Bridge', 'Badulla', 'A scenic mountain town famous for hiking trails, lush green tea plantations, and the architectural masterpiece of the Nine Arch Bridge.', 'ella.jpg', 'Hiking, Sightseeing, Tea Factory Tours', 'mid-range', 'Mountains', 6.8724, 81.0456),
('Yala National Park', 'Hambantota', 'One of Sri Lanka\'s premier wildlife sanctuaries, housing the highest density of leopards in the world.', 'yala.jpg', 'Wildlife Safari, Photography, Bird Watching', 'luxury', 'Wildlife', 6.3688, 81.5273),
('Sigiriya Rock Fortress', 'Matale', 'An ancient palace complex built on top of a 200m high rock plateau, featuring historic frescoes and mirror walls.', 'sigiriya.jpg', 'History Walk, Rock Climbing, Photography', 'luxury', 'Historical places', 7.9570, 80.7603),
('Knuckles Mountain Range', 'Kandy', 'A rugged, mist-shrouded wilderness perfect for wilderness camping and trekking adventures.', 'knuckles.jpg', 'Camping, Mountain Trekking, Bird Watching', 'budget', 'Camping', 7.4475, 80.7914),
('Kitulgala River Rafting', 'Kegalle', 'The adventure capital of Sri Lanka, popular for white water rafting, canyoning, and jungle camping.', 'kitulgala.jpg', 'White Water Rafting, Canyoning, Ziplining', 'mid-range', 'Adventure', 6.9934, 80.4182),
('Galle Dutch Fort', 'Galle', 'A UNESCO World Heritage site, displaying an archaeological marvel of Portuguese, Dutch, and British colonial styles.', 'galle.jpg', 'Sightseeing, Shopping, Heritage Walk', 'mid-range', 'Cultural destinations', 6.0329, 80.2170),
('Hortons Plains & World\'s End', 'Nuwara Eliya', 'A protected national park in the central highlands featuring montane grasslands and cloud forests.', 'horton.jpg', 'Hiking, Wildlife Spotting, Scenic Photography', 'mid-range', 'Nature', 6.8028, 80.8028);

-- Initial FAQs
INSERT INTO faqs (question, answer) VALUES
('What is Tripzy?', 'Tripzy is a smart tourism management and booking platform for Sri Lanka that lets tourists search destinations, book hotels/vehicles/guides/camping gear, and find travel companions.'),
('How do I pay for bookings?', 'Tripzy uses an offline payment model. You can complete your bookings online for free and pay the service provider directly in cash or card upon arrival.'),
('Can I register as a service provider?', 'Yes! You can register as a service provider (Hotel, Vehicle, Guide, or Camping gear provider) from the registration page. The admin team will verify and approve your account shortly.'),
('What is the Travel Companion Finder?', 'It is a feature that allows travelers to post their trip plans and find other users to join them, making travel more social and budget-friendly.');

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
