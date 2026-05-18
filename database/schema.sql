-- ============================================================
-- Hostel Management System - MySQL Database Schema
-- Sunrise Residency Hostel
-- ============================================================

CREATE DATABASE IF NOT EXISTS hostel_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hostel_db;

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  NOT NULL UNIQUE,
  phone       VARCHAR(15)   NOT NULL,
  password    VARCHAR(255)  NOT NULL,
  role        ENUM('admin','warden','student','security') DEFAULT 'student',
  is_active   BOOLEAN       DEFAULT TRUE,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── ROOMS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rooms (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  room_number VARCHAR(10)   NOT NULL UNIQUE,
  floor       INT           NOT NULL,
  type        ENUM('single','double','triple') NOT NULL,
  capacity    INT           NOT NULL,
  occupied    INT           DEFAULT 0,
  monthly_fee DECIMAL(10,2) NOT NULL,
  status      ENUM('available','occupied','maintenance') DEFAULT 'available',
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ── STUDENT PROFILES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_profiles (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT           NOT NULL UNIQUE,
  room_id         INT,
  admission_no    VARCHAR(20)   UNIQUE,
  course          VARCHAR(100),
  year            INT,
  parent_name     VARCHAR(100),
  parent_phone    VARCHAR(15),
  address         TEXT,
  joined_date     DATE,
  security_deposit DECIMAL(10,2) DEFAULT 10000.00,
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
);

-- ── MESS MENU ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mess_menu (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  meal_type   ENUM('breakfast','lunch','snacks','dinner') NOT NULL,
  items       TEXT          NOT NULL,
  updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_day_meal (day_of_week, meal_type)
);

-- ── MESS ATTENDANCE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mess_attendance (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  student_id  INT           NOT NULL,
  meal_date   DATE          NOT NULL,
  meal_type   ENUM('breakfast','lunch','snacks','dinner') NOT NULL,
  status      ENUM('present','absent') DEFAULT 'present',
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id),
  UNIQUE KEY unique_student_meal (student_id, meal_date, meal_type)
);

-- ── OUTPASSES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS outpasses (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  student_id      INT           NOT NULL,
  destination     VARCHAR(255)  NOT NULL,
  purpose         TEXT          NOT NULL,
  departure_date  DATETIME      NOT NULL,
  return_date     DATETIME      NOT NULL,
  type            ENUM('day','overnight','weekend') DEFAULT 'day',
  status          ENUM('pending','approved','rejected','cancelled','returned') DEFAULT 'pending',
  approved_by     INT,
  rejection_reason TEXT,
  actual_return   DATETIME,
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- ── FEE RECORDS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fee_records (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  student_id    INT           NOT NULL,
  amount        DECIMAL(10,2) NOT NULL,
  fee_type      ENUM('room_rent','mess_fee','penalty','security','other') NOT NULL,
  due_date      DATE          NOT NULL,
  paid_date     DATE,
  payment_mode  ENUM('online','cash','bank_transfer') DEFAULT 'online',
  transaction_id VARCHAR(100),
  status        ENUM('pending','paid','overdue','partial') DEFAULT 'pending',
  month_year    VARCHAR(7),   -- e.g. "2026-05"
  notes         TEXT,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id)
);

-- ── COMPLAINTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS complaints (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  student_id    INT           NOT NULL,
  category      ENUM('plumbing','electrical','furniture','cleanliness','internet','other') NOT NULL,
  title         VARCHAR(200)  NOT NULL,
  description   TEXT          NOT NULL,
  priority      ENUM('low','medium','high','emergency') DEFAULT 'medium',
  status        ENUM('open','assigned','in_progress','resolved','closed') DEFAULT 'open',
  assigned_to   INT,
  photo_url     VARCHAR(500),
  resolution    TEXT,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  resolved_at   TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- ── VISITORS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS visitors (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  visitor_name  VARCHAR(100)  NOT NULL,
  visitor_phone VARCHAR(15)   NOT NULL,
  id_type       ENUM('aadhar','passport','driving_license','student_id') NOT NULL,
  id_number     VARCHAR(50)   NOT NULL,
  purpose       VARCHAR(200)  NOT NULL,
  host_student_id INT         NOT NULL,
  check_in      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  check_out     TIMESTAMP,
  recorded_by   INT           NOT NULL,
  FOREIGN KEY (host_student_id) REFERENCES users(id),
  FOREIGN KEY (recorded_by) REFERENCES users(id)
);

-- ── CHAT LOGS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_logs (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  session_id    VARCHAR(100),
  user_query    TEXT          NOT NULL,
  bot_reply     TEXT          NOT NULL,
  matched_topic VARCHAR(50),
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ── NOTIFICATIONS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT           NOT NULL,
  title         VARCHAR(200)  NOT NULL,
  message       TEXT          NOT NULL,
  type          ENUM('info','warning','success','error') DEFAULT 'info',
  is_read       BOOLEAN       DEFAULT FALSE,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── ORG SETUPS (PDF Upload) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS org_setups (
  id             VARCHAR(36)   PRIMARY KEY,          -- UUID
  org_name       VARCHAR(200)  NOT NULL,
  email          VARCHAR(150)  NOT NULL UNIQUE,
  phone          VARCHAR(20)   NOT NULL,
  pdf_page_count INT           DEFAULT 0,
  pdf_char_count INT           DEFAULT 0,
  created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ── ORG FAQs (AI-generated from PDF) ─────────────────────────
CREATE TABLE IF NOT EXISTS org_faqs (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  org_id      VARCHAR(36)   NOT NULL,
  org_email   VARCHAR(150)  NOT NULL,
  org_name    VARCHAR(200)  NOT NULL,
  question    TEXT          NOT NULL,
  answer      TEXT          NOT NULL,
  category    VARCHAR(50)   DEFAULT 'general',
  order_index INT           DEFAULT 0,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_org_email (org_email)
);
