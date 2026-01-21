-- Database Schema untuk Production Scheduling System

CREATE DATABASE IF NOT EXISTS production_scheduling;
USE production_scheduling;

-- Table Users (untuk login dan sebagai PIC)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  role ENUM('admin', 'staff', 'manager') DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email)
);

-- Table Suppliers
CREATE TABLE suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_name VARCHAR(200) NOT NULL,
  supplier_type ENUM('potong', 'jahit', 'sablon', 'bordir') NOT NULL,
  contact_person VARCHAR(200),
  phone VARCHAR(50),
  address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_supplier_type (supplier_type),
  INDEX idx_supplier_name (supplier_name)
);

-- Table Articles (Master Artikel)
CREATE TABLE articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_article_name (article_name)
);

-- Table Schedule Potong
CREATE TABLE schedule_potong (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  article_name VARCHAR(200) NOT NULL,
  description TEXT,
  quantity INT NOT NULL,
  pic_id INT NOT NULL,
  week_delivery VARCHAR(50) NOT NULL,
  supplier_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (pic_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
  INDEX idx_supplier_date (supplier_id, start_date, end_date),
  INDEX idx_week_delivery (week_delivery),
  INDEX idx_status (status)
);

-- Table Schedule Jahit
CREATE TABLE schedule_jahit (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  article_name VARCHAR(200) NOT NULL,
  description TEXT,
  quantity INT NOT NULL,
  pic_id INT NOT NULL,
  week_delivery VARCHAR(50) NOT NULL,
  supplier_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (pic_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
  INDEX idx_supplier_date (supplier_id, start_date, end_date),
  INDEX idx_week_delivery (week_delivery),
  INDEX idx_status (status)
);

-- Table Schedule Sablon
CREATE TABLE schedule_sablon (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  article_name VARCHAR(200) NOT NULL,
  description TEXT,
  quantity INT NOT NULL,
  pic_id INT NOT NULL,
  week_delivery VARCHAR(50) NOT NULL,
  supplier_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (pic_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
  INDEX idx_supplier_date (supplier_id, start_date, end_date),
  INDEX idx_week_delivery (week_delivery),
  INDEX idx_status (status)
);

-- Table Schedule Bordir
CREATE TABLE schedule_bordir (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  article_name VARCHAR(200) NOT NULL,
  description TEXT,
  quantity INT NOT NULL,
  pic_id INT NOT NULL,
  week_delivery VARCHAR(50) NOT NULL,
  supplier_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (pic_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
  INDEX idx_supplier_date (supplier_id, start_date, end_date),
  INDEX idx_week_delivery (week_delivery),
  INDEX idx_status (status)
);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password, full_name, email, role) VALUES
('admin', '$2a$10$rQ7Z1YxHNlGQhVz0MxK6gOYxQ6pL8K5yZGqJ3L0bC7.qXxT8Z8KMy', 'Administrator', 'admin@example.com', 'admin');

-- Insert sample suppliers
INSERT INTO suppliers (supplier_name, supplier_type, contact_person, phone, address) VALUES
('Tukang Potong A', 'potong', 'Budi Santoso', '081234567890', 'Jakarta Selatan'),
('Tukang Potong B', 'potong', 'Andi Wijaya', '081234567891', 'Jakarta Timur'),
('Tukang Jahit A', 'jahit', 'Siti Aminah', '081234567892', 'Jakarta Pusat'),
('Tukang Jahit B', 'jahit', 'Dewi Lestari', '081234567893', 'Jakarta Barat'),
('Tukang Sablon A', 'sablon', 'Joko Susilo', '081234567894', 'Tangerang'),
('Tukang Sablon B', 'sablon', 'Rudi Hartono', '081234567895', 'Bekasi'),
('Tukang Bordir A', 'bordir', 'Maria Ulfa', '081234567896', 'Bogor'),
('Tukang Bordir B', 'bordir', 'Nina Sari', '081234567897', 'Depok');

-- Insert sample articles
INSERT INTO articles (article_name, description, category) VALUES
('Kaos Polos Hitam', 'Kaos polos warna hitam bahan cotton combed 30s', 'Kaos'),
('Jaket Hoodie Abu', 'Jaket hoodie abu-abu fleece premium', 'Jaket'),
('Kemeja Batik Slimfit', 'Kemeja batik modern slimfit', 'Kemeja'),
('Celana Chino Navy', 'Celana chino warna navy bahan stretch', 'Celana');
