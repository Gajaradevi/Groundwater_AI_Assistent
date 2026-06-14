-- ============================================
-- Groundwater Data Management System
-- Database Schema and Sample Data
-- ============================================

-- Create the database
CREATE DATABASE IF NOT EXISTS ingres_db;
USE ingres_db;

-- ============================================
-- Drop existing table if it exists
-- ============================================
DROP TABLE IF EXISTS groundwater_data;

-- ============================================
-- Create groundwater_data table
-- ============================================
CREATE TABLE groundwater_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique identifier for each record',
    
    district VARCHAR(100) NOT NULL COMMENT 'District/Block/Mandal name',
    state VARCHAR(100) NOT NULL COMMENT 'State/UT name',
    year INT NOT NULL COMMENT 'Assessment year',
    
    annual_recharge DOUBLE NOT NULL COMMENT 'Annual groundwater recharge in km3',
    extractable_resources DOUBLE NOT NULL COMMENT 'Total extractable groundwater resources in km3',
    total_extraction DOUBLE NOT NULL COMMENT 'Total groundwater extraction in km3',
    
    stage_development DOUBLE NOT NULL COMMENT 'Stage of development (extraction/extractable)*100 in percentage',
    category VARCHAR(30) NOT NULL COMMENT 'Classification: SAFE, SEMI_CRITICAL, CRITICAL, OVER_EXPLOITED',
    
    remarks VARCHAR(500) COMMENT 'Additional notes or remarks about the assessment',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL COMMENT 'Last update timestamp',
    
    -- Create indexes for faster queries
    UNIQUE KEY unique_district_year (district, year),
    KEY idx_state (state),
    KEY idx_year (year),
    KEY idx_category (category),
    KEY idx_stage_development (stage_development)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
COMMENT='Central repository for India groundwater resource assessment data';

-- ============================================
-- Insert Sample Data
-- ============================================

-- Sample data for Maharashtra
INSERT INTO groundwater_data (district, state, year, annual_recharge, extractable_resources, total_extraction, stage_development, category, remarks)
VALUES 
('Pune', 'Maharashtra', 2023, 15.5, 12.0, 8.5, 70.83, 'SEMI_CRITICAL', 'High extraction in agricultural areas'),
('Nashik', 'Maharashtra', 2023, 18.2, 14.5, 14.0, 96.55, 'CRITICAL', 'Very high extraction due to sugarcane farming'),
('Ahmednagar', 'Maharashtra', 2023, 16.8, 13.2, 13.5, 102.27, 'OVER_EXPLOITED', 'Over-exploited, requires regulation'),
('Aurangabad', 'Maharashtra', 2023, 14.5, 11.8, 7.2, 61.02, 'SAFE', 'Safe zone, sustainable extraction'),
('Nagpur', 'Maharashtra', 2023, 19.3, 15.5, 9.8, 63.23, 'SAFE', 'Adequate water resources');

-- Sample data for Karnataka
INSERT INTO groundwater_data (district, state, year, annual_recharge, extractable_resources, total_extraction, stage_development, category, remarks)
VALUES 
('Bengaluru', 'Karnataka', 2023, 22.5, 18.0, 15.5, 86.11, 'CRITICAL', 'Urban groundwater depletion'),
('Mysore', 'Karnataka', 2023, 25.0, 20.0, 18.5, 92.5, 'CRITICAL', 'Coffee cultivation affecting water table'),
('Belgaum', 'Karnataka', 2023, 20.8, 16.5, 13.2, 80.0, 'SEMI_CRITICAL', 'Moderate extraction pressure'),
('Gulbarga', 'Karnataka', 2023, 18.5, 15.0, 8.9, 59.33, 'SAFE', 'Adequate groundwater reserves');

-- Sample data for Telangana
INSERT INTO groundwater_data (district, state, year, annual_recharge, extractable_resources, total_extraction, stage_development, category, remarks)
VALUES 
('Hyderabad', 'Telangana', 2023, 24.0, 19.0, 17.5, 92.11, 'CRITICAL', 'Rapid urbanization affecting water'),
('Ranga Reddy', 'Telangana', 2023, 21.5, 17.0, 16.0, 94.12, 'CRITICAL', 'Urban sprawl causing depletion'),
('Medak', 'Telangana', 2023, 19.8, 16.0, 10.5, 65.63, 'SAFE', 'Agricultural area with stable water table'),
('Warangal', 'Telangana', 2023, 23.0, 18.5, 12.2, 65.95, 'SAFE', 'Adequate water resources for agriculture');

-- Sample data for Uttar Pradesh
INSERT INTO groundwater_data (district, state, year, annual_recharge, extractable_resources, total_extraction, stage_development, category, remarks)
VALUES 
('Agra', 'Uttar Pradesh', 2023, 26.5, 21.0, 20.0, 95.24, 'CRITICAL', 'Intense agricultural groundwater use'),
('Lucknow', 'Uttar Pradesh', 2023, 28.0, 22.5, 18.5, 82.22, 'SEMI_CRITICAL', 'Urban and agricultural extraction'),
('Kanpur', 'Uttar Pradesh', 2023, 25.5, 20.0, 19.2, 96.0, 'CRITICAL', 'Industrial and agricultural demand high'),
('Varanasi', 'Uttar Pradesh', 2023, 23.8, 19.0, 14.5, 76.32, 'SEMI_CRITICAL', 'Moderate extraction pressure');

-- Sample data for Rajasthan
INSERT INTO groundwater_data (district, state, year, annual_recharge, extractable_resources, total_extraction, stage_development, category, remarks)
VALUES 
('Jaipur', 'Rajasthan', 2023, 20.0, 16.0, 15.5, 96.88, 'CRITICAL', 'Desert region with high extraction'),
('Jodhpur', 'Rajasthan', 2023, 16.5, 13.0, 12.8, 98.46, 'CRITICAL', 'Arid climate, over-exploited'),
('Udaipur', 'Rajasthan', 2023, 22.0, 17.5, 14.0, 80.0, 'SEMI_CRITICAL', 'Moderate water stress');

-- Historical data for trend analysis (2020-2023)
INSERT INTO groundwater_data (district, state, year, annual_recharge, extractable_resources, total_extraction, stage_development, category, remarks)
VALUES 
('Pune', 'Maharashtra', 2020, 15.5, 12.0, 6.5, 54.17, 'SAFE', 'Historical data - 2020'),
('Pune', 'Maharashtra', 2021, 15.5, 12.0, 7.2, 60.0, 'SAFE', 'Historical data - 2021'),
('Pune', 'Maharashtra', 2022, 15.5, 12.0, 8.0, 66.67, 'SEMI_CRITICAL', 'Historical data - 2022'),

('Nashik', 'Maharashtra', 2020, 18.2, 14.5, 12.0, 82.76, 'CRITICAL', 'Historical data - 2020'),
('Nashik', 'Maharashtra', 2021, 18.2, 14.5, 13.0, 89.66, 'CRITICAL', 'Historical data - 2021'),
('Nashik', 'Maharashtra', 2022, 18.2, 14.5, 13.8, 95.17, 'CRITICAL', 'Historical data - 2022'),

('Hyderabad', 'Telangana', 2020, 24.0, 19.0, 14.0, 73.68, 'SEMI_CRITICAL', 'Historical data - 2020'),
('Hyderabad', 'Telangana', 2021, 24.0, 19.0, 15.5, 81.58, 'CRITICAL', 'Historical data - 2021'),
('Hyderabad', 'Telangana', 2022, 24.0, 19.0, 16.8, 88.42, 'CRITICAL', 'Historical data - 2022');

-- ============================================
-- Verification Queries
-- ============================================

-- Count of records
SELECT COUNT(*) as total_records FROM groundwater_data;

-- Records by category
SELECT category, COUNT(*) as count FROM groundwater_data WHERE year = 2023 GROUP BY category;

-- Records by state
SELECT state, COUNT(*) as count FROM groundwater_data WHERE year = 2023 GROUP BY state;

-- List all 2023 data
SELECT * FROM groundwater_data WHERE year = 2023 ORDER BY state, district;
