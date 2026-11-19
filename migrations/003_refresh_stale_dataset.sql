USE air_quality;

CREATE TEMPORARY TABLE demo_seed_targets AS
SELECT
  loc.name AS location_id,
  COALESCE(ca.aqi, 50) AS base_aqi,
  COALESCE(ca.avgPm10, 10) AS pm10,
  COALESCE(ca.avgPm25, 5) AS pm25,
  COALESCE(ca.avgPm100, 20) AS pm100,
  COALESCE(ca.humidity, 50) AS humidity,
  COALESCE(NULLIF(ca.pressure, 0), 101325) AS pressure,
  COALESCE(ca.temperature, 15) AS temperature
FROM location AS loc
JOIN city_air_quality AS ca ON ca.location_id = loc.name
WHERE loc.name NOT IN ('9001', '9002', '9003', '9004', '9005', '9006')
  AND loc.city NOT LIKE '%(DEMO)'
  AND (ca.updated IS NULL OR ca.updated < NOW() - INTERVAL 30 DAY);

INSERT INTO city_air_quality_history
  (location_id, aqi, avgPm10, avgPm25, avgPm100, humidity, pressure, temperature, updated)
WITH RECURSIVE hour_offsets (hours_ago) AS (
  SELECT 0
  UNION ALL
  SELECT hours_ago + 1 FROM hour_offsets WHERE hours_ago < 47
)
SELECT
  targets.location_id,
  GREATEST(0, LEAST(500, ROUND(targets.base_aqi + 6 * SIN(hour_offsets.hours_ago / 4) + MOD(hour_offsets.hours_ago * 7, 9) - 4))),
  ROUND(targets.pm10 * (0.88 + MOD(hour_offsets.hours_ago * 3, 10) / 100), 2),
  ROUND(targets.pm25 * (0.90 + MOD(hour_offsets.hours_ago * 5, 12) / 100), 2),
  ROUND(targets.pm100 * (0.89 + MOD(hour_offsets.hours_ago * 2, 11) / 100), 2),
  GREATEST(20, LEAST(95, targets.humidity + MOD(hour_offsets.hours_ago * 5, 9) - 4)),
  targets.pressure + MOD(hour_offsets.hours_ago * 29, 301) - 150,
  ROUND(targets.temperature + 3 * SIN(hour_offsets.hours_ago / 7), 1),
  TIMESTAMP(DATE_FORMAT(NOW(), '%Y-%m-%d %H:00:00')) - INTERVAL hour_offsets.hours_ago HOUR
FROM demo_seed_targets AS targets
CROSS JOIN hour_offsets
LEFT JOIN city_air_quality_history AS existing
  ON existing.location_id = targets.location_id
  AND existing.updated = TIMESTAMP(DATE_FORMAT(NOW(), '%Y-%m-%d %H:00:00')) - INTERVAL hour_offsets.hours_ago HOUR
WHERE existing.id IS NULL;

INSERT INTO city_air_quality_history
  (location_id, aqi, avgPm10, avgPm25, avgPm100, humidity, pressure, temperature, updated)
WITH RECURSIVE day_offsets (days_ago) AS (
  SELECT 1
  UNION ALL
  SELECT days_ago + 1 FROM day_offsets WHERE days_ago < 29
)
SELECT
  targets.location_id,
  GREATEST(0, LEAST(500, ROUND(targets.base_aqi + 8 * SIN(day_offsets.days_ago / 4) + MOD(day_offsets.days_ago * 7, 13) - 6))),
  ROUND(targets.pm10 * (0.86 + MOD(day_offsets.days_ago * 3, 15) / 100), 2),
  ROUND(targets.pm25 * (0.87 + MOD(day_offsets.days_ago * 5, 16) / 100), 2),
  ROUND(targets.pm100 * (0.86 + MOD(day_offsets.days_ago * 2, 15) / 100), 2),
  GREATEST(20, LEAST(95, targets.humidity + MOD(day_offsets.days_ago * 5, 13) - 6)),
  targets.pressure + MOD(day_offsets.days_ago * 29, 501) - 250,
  ROUND(targets.temperature + 5 * SIN(day_offsets.days_ago / 5), 1),
  TIMESTAMP(DATE_FORMAT(NOW(), '%Y-%m-%d 12:00:00')) - INTERVAL day_offsets.days_ago DAY
FROM demo_seed_targets AS targets
CROSS JOIN day_offsets
LEFT JOIN city_air_quality_history AS existing
  ON existing.location_id = targets.location_id
  AND existing.updated = TIMESTAMP(DATE_FORMAT(NOW(), '%Y-%m-%d 12:00:00')) - INTERVAL day_offsets.days_ago DAY
WHERE existing.id IS NULL;

UPDATE city_air_quality AS ca
JOIN demo_seed_targets AS targets ON targets.location_id = ca.location_id
SET ca.aqi = COALESCE(ca.aqi, targets.base_aqi),
    ca.updated = NOW();

UPDATE location AS loc
JOIN demo_seed_targets AS targets ON targets.location_id = loc.name
SET loc.city = CONCAT(loc.city, ' (DEMO)');
