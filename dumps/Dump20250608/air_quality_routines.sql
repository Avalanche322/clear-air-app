CREATE DATABASE  IF NOT EXISTS `air_quality` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `air_quality`;
-- MySQL dump 10.13  Distrib 8.0.32, for Win64 (x86_64)
--
-- Host: localhost    Database: air_quality
-- ------------------------------------------------------
-- Server version	8.0.32

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping events for database 'air_quality'
--

--
-- Dumping routines for database 'air_quality'
--
/*!50003 DROP FUNCTION IF EXISTS `CalculateAQI` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `CalculateAQI`(avgPm10 DOUBLE, avgPm25 DOUBLE, avgPm100 DOUBLE) RETURNS double
    DETERMINISTIC
BEGIN
    DECLARE aqi_pm10 DOUBLE;
    DECLARE aqi_pm25 DOUBLE;
    DECLARE aqi_pm100 DOUBLE;

    -- AQI for PM2.5
    IF avgPm25 IS NOT NULL THEN
        IF avgPm25 <= 12 THEN
            SET aqi_pm25 = avgPm25 * 50 / 12;
        ELSEIF avgPm25 <= 35.4 THEN
            SET aqi_pm25 = 50 + (avgPm25 - 12) * 50 / (35.4 - 12);
        ELSE
            SET aqi_pm25 = 100;
        END IF;
    ELSE
        SET aqi_pm25 = 0; -- No value for PM2.5
    END IF;

    -- AQI for PM10
    IF avgPm10 IS NOT NULL THEN
        IF avgPm10 <= 54 THEN
            SET aqi_pm10 = avgPm10 * 50 / 54;
        ELSEIF avgPm10 <= 154 THEN
            SET aqi_pm10 = 50 + (avgPm10 - 54) * 50 / (154 - 54);
        ELSE
            SET aqi_pm10 = 100;
        END IF;
    ELSE
        SET aqi_pm10 = 0; -- No value for PM10
    END IF;

    -- AQI for PM100
    IF avgPm100 IS NOT NULL THEN
        IF avgPm100 <= 150 THEN
            SET aqi_pm100 = avgPm100 * 50 / 150;
        ELSEIF avgPm100 <= 350 THEN
            SET aqi_pm100 = 50 + (avgPm100 - 150) * 50 / (350 - 150);
        ELSE
            SET aqi_pm100 = 100;
        END IF;
    ELSE
        SET aqi_pm100 = 0;
    END IF;

    -- Return the maximum AQI value
    RETURN GREATEST(aqi_pm10, aqi_pm25, aqi_pm100);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `CalculateFuzzyAQI` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `CalculateFuzzyAQI`(pm10 DOUBLE, pm25 DOUBLE, pm100 DOUBLE) RETURNS double
    DETERMINISTIC
BEGIN
    DECLARE fuzzy_pm10 DOUBLE;
    DECLARE fuzzy_pm25 DOUBLE;
    DECLARE fuzzy_pm100 DOUBLE;

    -- Нечітке обчислення для PM10
    SET fuzzy_pm10 = CASE 
        WHEN pm10 IS NULL THEN 0
        ELSE
            50 * FuzzyMembership(pm10, 0, 54) +
            50 * FuzzyMembership(pm10, 54, 154) +
            100 * FuzzyMembership(pm10, 154, 254)
    END;

    -- Нечітке обчислення для PM2.5
    SET fuzzy_pm25 = CASE 
        WHEN pm25 IS NULL THEN 0
        ELSE
            50 * FuzzyMembership(pm25, 0, 12) +
            50 * FuzzyMembership(pm25, 12, 35.4) +
            100 * FuzzyMembership(pm25, 35.4, 55.4)
    END;

    -- Нечітке обчислення для PM100
    SET fuzzy_pm100 = CASE 
        WHEN pm100 IS NULL THEN 0
        ELSE
            50 * FuzzyMembership(pm100, 0, 150) +
            50 * FuzzyMembership(pm100, 150, 350) +
            100 * FuzzyMembership(pm100, 350, 500)
    END;

    -- Повертаємо максимальне значення
    RETURN GREATEST(fuzzy_pm10, fuzzy_pm25, fuzzy_pm100);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `FuzzyMembership` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `FuzzyMembership`(value DOUBLE, low DOUBLE, high DOUBLE) RETURNS double
    DETERMINISTIC
BEGIN
    IF value <= low THEN
        RETURN 0;
    ELSEIF value >= high THEN
        RETURN 1;
    ELSE
        RETURN (value - low) / (high - low);
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `InsertAndUpdateAQI` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `InsertAndUpdateAQI`(IN json_data JSON)
BEGIN
    SET SQL_SAFE_UPDATES = 0;

    -- Step 1: Clear the `city_air_quality` table for fresh data
    DELETE FROM city_air_quality;

    -- Step 2: Update or insert data into the `location` table, avoiding duplicates
    INSERT INTO location (name, city, lat, lng)
    SELECT 
        JSON_UNQUOTE(JSON_EXTRACT(data.value, '$.name')) AS name,
        JSON_UNQUOTE(JSON_EXTRACT(data.value, '$.city')) AS city,
        JSON_EXTRACT(data.value, '$.lat') AS lat,
        JSON_EXTRACT(data.value, '$.lng') AS lng
    FROM JSON_TABLE(
        json_data,
        '$[*]' COLUMNS (
            value JSON PATH '$'
        )
    ) AS data
    ON DUPLICATE KEY UPDATE
        city = VALUES(city),
        lat = VALUES(lat),
        lng = VALUES(lng);

    -- Step 3: Insert new air quality data into the `city_air_quality` table
    INSERT INTO city_air_quality (location_id, aqi, avgPm10, avgPm25, avgPm100, humidity, temperature, pressure, updated)
    SELECT 
        loc.name AS location_id,
        NULLIF(JSON_UNQUOTE(JSON_EXTRACT(data.value, '$.aqi')), 'null') AS aqi,
        NULLIF(JSON_UNQUOTE(JSON_EXTRACT(data.value, '$.avgPm10')), 'null') AS avgPm10,
        NULLIF(JSON_UNQUOTE(JSON_EXTRACT(data.value, '$.avgPm25')), 'null') AS avgPm25,
        NULLIF(JSON_UNQUOTE(JSON_EXTRACT(data.value, '$.avgPm100')), 'null') AS avgPm100,
        NULLIF(JSON_UNQUOTE(JSON_EXTRACT(data.value, '$.humidity')), 'null') AS humidity,
        NULLIF(JSON_UNQUOTE(JSON_EXTRACT(data.value, '$.temperature')), 'null') AS temperature,
        NULLIF(JSON_UNQUOTE(JSON_EXTRACT(data.value, '$.pressure')), 'null') AS pressure,
        NOW() AS updated
    FROM JSON_TABLE(
        json_data,
        '$[*]' COLUMNS (
            value JSON PATH '$'
        )
    ) AS data
    JOIN location loc
    ON loc.name = JSON_UNQUOTE(JSON_EXTRACT(data.value, '$.name'));

    -- Step 4: Insert historical air quality data into the `city_air_quality_history` table
    INSERT INTO city_air_quality_history (location_id, aqi, avgPm10, avgPm25, avgPm100, humidity, pressure, temperature, updated)
    SELECT 
        loc.name AS location_id,
        NULLIF(JSON_UNQUOTE(JSON_EXTRACT(data.value, '$.aqi')), 'null') AS aqi,
        NULLIF(JSON_UNQUOTE(JSON_EXTRACT(data.value, '$.avgPm10')), 'null') AS avgPm10,
        NULLIF(JSON_UNQUOTE(JSON_EXTRACT(data.value, '$.avgPm25')), 'null') AS avgPm25,
        NULLIF(JSON_UNQUOTE(JSON_EXTRACT(data.value, '$.avgPm100')), 'null') AS avgPm100,
        NULLIF(JSON_UNQUOTE(JSON_EXTRACT(data.value, '$.humidity')), 'null') AS humidity,
        NULLIF(JSON_UNQUOTE(JSON_EXTRACT(data.value, '$.pressure')), 'null') AS pressure,
        NULLIF(JSON_UNQUOTE(JSON_EXTRACT(data.value, '$.temperature')), 'null') AS temperature,
        NOW() AS updated
    FROM JSON_TABLE(
        json_data,
        '$[*]' COLUMNS (
            value JSON PATH '$'
        )
    ) AS data
    JOIN location loc
    ON loc.name = JSON_UNQUOTE(JSON_EXTRACT(data.value, '$.name'));

    SET SQL_SAFE_UPDATES = 1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-08 16:25:12
