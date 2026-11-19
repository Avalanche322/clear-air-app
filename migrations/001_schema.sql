USE air_quality;

CREATE TABLE IF NOT EXISTS location (
  name varchar(255) NOT NULL,
  city varchar(255) NOT NULL,
  lat double NOT NULL,
  lng double NOT NULL,
  PRIMARY KEY (name),
  UNIQUE KEY name_UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS city_air_quality (
  id int NOT NULL AUTO_INCREMENT,
  aqi int DEFAULT NULL,
  avgPm10 float DEFAULT NULL,
  avgPm25 float DEFAULT NULL,
  avgPm100 float DEFAULT NULL,
  humidity float DEFAULT NULL,
  pressure float DEFAULT NULL,
  temperature float DEFAULT NULL,
  updated timestamp NULL DEFAULT NULL,
  location_id varchar(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY location_id_UNIQUE (location_id),
  KEY city_air_quality_ibfk_1_idx (location_id),
  CONSTRAINT fk_city_air_quality_location
    FOREIGN KEY (location_id) REFERENCES location (name) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS city_air_quality_history (
  id int NOT NULL AUTO_INCREMENT,
  aqi int DEFAULT NULL,
  avgPm10 float DEFAULT NULL,
  avgPm25 float DEFAULT NULL,
  avgPm100 float DEFAULT NULL,
  humidity float DEFAULT NULL,
  pressure float DEFAULT NULL,
  temperature float DEFAULT NULL,
  updated timestamp NULL DEFAULT NULL,
  location_id varchar(255) DEFAULT NULL,
  PRIMARY KEY (id),
  KEY fk_city_air_quality_history_location (location_id),
  CONSTRAINT fk_city_air_quality_history_location
    FOREIGN KEY (location_id) REFERENCES location (name) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
