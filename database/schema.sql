-- AgriAI-SG Database Schema | MySQL 8.0
-- Geethanjali Thota | S1040006 | CN7000 | UEL/LSBF

CREATE DATABASE IF NOT EXISTS agriai_sg CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE agriai_sg;

CREATE TABLE users (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL,
    email         VARCHAR(150)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    role          ENUM('FARMER','ADMIN') NOT NULL DEFAULT 'FARMER',
    active        BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE farms (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT        NOT NULL,
    name       VARCHAR(150)  NOT NULL,
    location   VARCHAR(255),
    total_area DECIMAL(10,2) COMMENT 'Area in square metres',
    created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_farms_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE growing_units (
    id             BIGINT        AUTO_INCREMENT PRIMARY KEY,
    farm_id        BIGINT        NOT NULL,
    name           VARCHAR(150)  NOT NULL,
    area_sqm       DECIMAL(10,2) NOT NULL,
    growing_method ENUM('HYDROPONIC','AEROPONIC','AQUAPONIC','SOIL_BASED') NOT NULL,
    created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_units_farm FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE
);

CREATE TABLE crops (
    id                    BIGINT        AUTO_INCREMENT PRIMARY KEY,
    growing_unit_id       BIGINT        NOT NULL,
    crop_type             VARCHAR(100)  NOT NULL,
    planting_date         DATE          NOT NULL,
    expected_harvest_date DATE,
    area_planted          DECIMAL(10,2),
    actual_yield          DECIMAL(10,3),
    harvested             BOOLEAN       NOT NULL DEFAULT FALSE,
    notes                 TEXT,
    created_at            TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_crops_unit FOREIGN KEY (growing_unit_id) REFERENCES growing_units(id) ON DELETE CASCADE
);

CREATE TABLE activities (
    id              BIGINT       AUTO_INCREMENT PRIMARY KEY,
    farm_id         BIGINT       NOT NULL,
    growing_unit_id BIGINT,
    type            ENUM('PLANTING','IRRIGATION','FERTILISATION','PESTICIDE','HARVESTING') NOT NULL,
    activity_date   DATE         NOT NULL,
    notes           TEXT,
    quantity        VARCHAR(50),
    logged_by       BIGINT       NOT NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_act_farm FOREIGN KEY (farm_id)         REFERENCES farms(id)         ON DELETE CASCADE,
    CONSTRAINT fk_act_unit FOREIGN KEY (growing_unit_id) REFERENCES growing_units(id) ON DELETE SET NULL,
    CONSTRAINT fk_act_user FOREIGN KEY (logged_by)       REFERENCES users(id)
);

CREATE TABLE predictions (
    id                      BIGINT        AUTO_INCREMENT PRIMARY KEY,
    user_id                 BIGINT        NOT NULL,
    growing_unit_id         BIGINT,
    crop_type               VARCHAR(100)  NOT NULL,
    temperature             DECIMAL(5,2),
    humidity                DECIMAL(5,2),
    nutrient_ec             DECIMAL(5,2),
    growing_method          VARCHAR(50),
    predicted_yield_per_sqm DECIMAL(8,3),
    confidence              DECIMAL(5,2),
    suggested_window_start  DATE,
    suggested_window_end    DATE,
    model_used              VARCHAR(100),
    created_at              TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pred_user FOREIGN KEY (user_id)         REFERENCES users(id),
    CONSTRAINT fk_pred_unit FOREIGN KEY (growing_unit_id) REFERENCES growing_units(id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────────────────────
-- Register your own account at http://localhost:3000/register
-- Or use these seed accounts (password: Agri@2026 for both)
-- BCrypt strength 12 hash of "Agri@2026"
INSERT INTO users (name, email, password_hash, role) VALUES
('Geethanjali Thota','admin@agriai-sg.com',
 '$2a$12$eImiTXuWVxfM37uY4JANjQ9LmDLAKFNT5Ev2LbvE2oVbhG7m/Q7nS',
 'ADMIN'),
('Ahmad Lee','farmer@agriai-sg.com',
 '$2a$12$eImiTXuWVxfM37uY4JANjQ9LmDLAKFNT5Ev2LbvE2oVbhG7m/Q7nS',
 'FARMER');

select * from users;