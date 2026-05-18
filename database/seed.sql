USE hostel_db;

-- ── ADMIN USER (password: Admin@123) ─────────────────────────
INSERT INTO users (name, email, phone, password, role) VALUES
('Admin User',   'admin@sunriseresidency.in',  '9000000001', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Mr. Sharma',   'warden.boys@sunriseresidency.in', '9876500011', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'warden'),
('Mrs. Priya',   'warden.girls@sunriseresidency.in','9876500022', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'warden'),
('Security Ram', 'security@sunriseresidency.in', '9000000002', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'security'),
('Akshaya G',    'akshaya@student.in',          '9111222333', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
('Rahul Kumar',  'rahul@student.in',            '9222333444', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
('Priya Singh',  'priya@student.in',            '9333444555', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student');
-- All passwords above hash to: "password" (bcrypt)

-- ── ROOMS ────────────────────────────────────────────────────
INSERT INTO rooms (room_number, floor, type, capacity, occupied, monthly_fee, status) VALUES
('101', 1, 'single', 1, 1, 8000.00, 'occupied'),
('102', 1, 'double', 2, 2, 5500.00, 'occupied'),
('103', 1, 'triple', 3, 1, 4000.00, 'occupied'),
('104', 1, 'single', 1, 0, 8000.00, 'available'),
('105', 1, 'double', 2, 0, 5500.00, 'available'),
('201', 2, 'single', 1, 0, 8000.00, 'available'),
('202', 2, 'double', 2, 1, 5500.00, 'occupied'),
('203', 2, 'triple', 3, 0, 4000.00, 'available'),
('204', 2, 'single', 1, 0, 8000.00, 'maintenance'),
('301', 3, 'double', 2, 0, 5500.00, 'available');

-- ── STUDENT PROFILES ─────────────────────────────────────────
INSERT INTO student_profiles (user_id, room_id, admission_no, course, year, parent_name, parent_phone, joined_date) VALUES
(5, 1, 'SR2026001', 'B.Tech CSE', 2, 'Gunda Rao',    '9000111222', '2026-01-10'),
(6, 2, 'SR2026002', 'B.Tech ECE', 3, 'Kumar Raj',    '9000222333', '2025-06-15'),
(7, 3, 'SR2026003', 'MBA',        1, 'Singh Mohan',  '9000333444', '2026-03-01');

-- ── MESS MENU ────────────────────────────────────────────────
INSERT INTO mess_menu (day_of_week, meal_type, items) VALUES
('Monday','breakfast','Idli, Sambar, Chutney, Tea/Coffee'),
('Monday','lunch','Rice, Dal, Rajma, Roti, Salad'),
('Monday','snacks','Bread Butter, Chai'),
('Monday','dinner','Roti, Paneer Curry, Rice, Curd'),
('Tuesday','breakfast','Poha, Boiled Eggs, Tea'),
('Tuesday','lunch','Rice, Sambar, Rasam, Papad'),
('Tuesday','snacks','Vada Pav, Tea'),
('Tuesday','dinner','Chapati, Mixed Veg, Dal, Rice'),
('Wednesday','breakfast','Paratha, Curd, Pickle, Tea'),
('Wednesday','lunch','Biryani, Raita, Salad'),
('Wednesday','snacks','Samosa, Chai'),
('Wednesday','dinner','Roti, Chicken Curry / Paneer, Rice'),
('Thursday','breakfast','Dosa, Sambar, Chutney, Tea'),
('Thursday','lunch','Rice, Dal Fry, Aloo Gobi, Roti'),
('Thursday','snacks','Bread Omelette / Banana'),
('Thursday','dinner','Roti, Kadhi, Rice, Kheer'),
('Friday','breakfast','Upma, Boiled Eggs, Tea'),
('Friday','lunch','Rice, Dal, Fish Curry / Soya, Roti'),
('Friday','snacks','Pakora, Tea'),
('Friday','dinner','Chapati, Palak Paneer, Rice, Salad'),
('Saturday','breakfast','Puri, Chole, Tea'),
('Saturday','lunch','Veg Pulao, Raita, Salad'),
('Saturday','snacks','Noodles / Maggi, Tea'),
('Saturday','dinner','Roti, Egg Curry / Dal Makhani, Rice'),
('Sunday','breakfast','Poori, Halwa, Tea'),
('Sunday','lunch','Special Thali: Rice, Dal, 2 Curries, Roti, Sweet'),
('Sunday','snacks','Juice, Biscuits'),
('Sunday','dinner','Roti, Mixed Dal, Rice, Curd');

-- ── FEE RECORDS ──────────────────────────────────────────────
INSERT INTO fee_records (student_id, amount, fee_type, due_date, paid_date, payment_mode, transaction_id, status, month_year) VALUES
(5, 8000.00, 'room_rent', '2026-05-05', '2026-05-03', 'online', 'TXN20260503001', 'paid',   '2026-05'),
(5, 2500.00, 'mess_fee',  '2026-05-05', '2026-05-03', 'online', 'TXN20260503002', 'paid',   '2026-05'),
(6, 5500.00, 'room_rent', '2026-05-05', NULL,         NULL,      NULL,             'overdue','2026-05'),
(6, 2500.00, 'mess_fee',  '2026-05-05', NULL,         NULL,      NULL,             'overdue','2026-05'),
(7, 4000.00, 'room_rent', '2026-06-05', NULL,         NULL,      NULL,             'pending','2026-06'),
(7, 2500.00, 'mess_fee',  '2026-06-05', NULL,         NULL,      NULL,             'pending','2026-06');

-- ── COMPLAINTS ───────────────────────────────────────────────
INSERT INTO complaints (student_id, category, title, description, priority, status) VALUES
(5, 'electrical', 'Room light flickering', 'The tube light in room 101 keeps flickering since 3 days.', 'medium', 'open'),
(6, 'plumbing',   'Tap water leaking',     'Bathroom tap dripping continuously in room 102.',          'high',   'assigned'),
(7, 'internet',   'Wi-Fi very slow',        'Internet speed is below 1 Mbps from 8–10 PM daily.',      'low',    'open');

-- ── CHAT LOGS ────────────────────────────────────────────────
INSERT INTO chat_logs (session_id, user_query, bot_reply, matched_topic) VALUES
('sess001', 'gate timing', 'Main gate closes at 10:00 PM (Mon-Sat) and 9:00 PM (Sunday).', 'gate'),
('sess001', 'mess timing', 'Breakfast: 7:30–9:30 AM ...', 'mess'),
('sess002', 'wifi password', 'Free Wi-Fi is available 24/7 for all hostel students.', 'wifi');
