USE air_quality;

-- Synthetic records for the map and history charts. IDs 9001-9006 are reserved for demos.
INSERT INTO location (name, city, lat, lng) VALUES
  ('9001', 'Kyiv (DEMO)', 50.4501, 30.5234),
  ('9002', 'Lviv (DEMO)', 49.8397, 24.0297),
  ('9003', 'Odesa (DEMO)', 46.4825, 30.7233),
  ('9004', 'Kharkiv (DEMO)', 49.9935, 36.2304),
  ('9005', 'Dnipro (DEMO)', 48.4647, 35.0462),
  ('9006', 'Zaporizhzhia (DEMO)', 47.8388, 35.1396)
ON DUPLICATE KEY UPDATE
  city = VALUES(city),
  lat = VALUES(lat),
  lng = VALUES(lng);

DELETE FROM city_air_quality_history
WHERE location_id IN ('9001', '9002', '9003', '9004', '9005', '9006');

DELETE FROM city_air_quality
WHERE location_id IN ('9001', '9002', '9003', '9004', '9005', '9006');

INSERT INTO city_air_quality
  (location_id, aqi, avgPm10, avgPm25, avgPm100, humidity, pressure, temperature, updated)
VALUES
  ('9001', 44, 18.0, 9.0, 24.0, 48, 101300, 15.5, NOW()),
  ('9002', 72, 32.0, 20.0, 45.0, 57, 101200, 13.2, NOW()),
  ('9003', 118, 65.0, 41.0, 88.0, 63, 101500, 20.1, NOW()),
  ('9004', 162, 88.0, 68.0, 124.0, 39, 100850, 11.4, NOW()),
  ('9005', 185, 110.0, 75.0, 150.0, 34, 100920, 16.3, NOW()),
  ('9006', 170, 110.0, 70.0, 165.0, 52, 101050, 18.6, NOW());

INSERT INTO city_air_quality_history
  (location_id, aqi, avgPm10, avgPm25, avgPm100, humidity, pressure, temperature, updated)
WITH RECURSIVE hour_offsets (hours_ago) AS (
  SELECT 0
  UNION ALL
  SELECT hours_ago + 1 FROM hour_offsets WHERE hours_ago < 47
),
stations AS (
  SELECT '9001' AS location_id, 44 AS base_aqi, 18.0 AS pm10, 9.0 AS pm25, 24.0 AS pm100, 48 AS humidity, 101300 AS pressure, 15.5 AS temperature
  UNION ALL SELECT '9002', 72, 32.0, 20.0, 45.0, 57, 101200, 13.2
  UNION ALL SELECT '9003', 118, 65.0, 41.0, 88.0, 63, 101500, 20.1
  UNION ALL SELECT '9004', 162, 88.0, 68.0, 124.0, 39, 100850, 11.4
  UNION ALL SELECT '9005', 185, 110.0, 75.0, 150.0, 34, 100920, 16.3
  UNION ALL SELECT '9006', 170, 110.0, 70.0, 165.0, 52, 101050, 18.6
)
SELECT
  stations.location_id,
  GREATEST(0, LEAST(500, ROUND(stations.base_aqi + 6 * SIN(hour_offsets.hours_ago / 4) + MOD(hour_offsets.hours_ago * 7, 9) - 4))),
  ROUND(stations.pm10 * (0.88 + MOD(hour_offsets.hours_ago * 3, 10) / 100), 2),
  ROUND(stations.pm25 * (0.90 + MOD(hour_offsets.hours_ago * 5, 12) / 100), 2),
  ROUND(stations.pm100 * (0.89 + MOD(hour_offsets.hours_ago * 2, 11) / 100), 2),
  GREATEST(20, LEAST(95, stations.humidity + MOD(hour_offsets.hours_ago * 5, 9) - 4)),
  stations.pressure + MOD(hour_offsets.hours_ago * 29, 301) - 150,
  ROUND(stations.temperature + 3 * SIN(hour_offsets.hours_ago / 7), 1),
  NOW() - INTERVAL hour_offsets.hours_ago HOUR
FROM stations
CROSS JOIN hour_offsets
ORDER BY stations.location_id, hour_offsets.hours_ago DESC;

INSERT INTO city_air_quality_history
  (location_id, aqi, avgPm10, avgPm25, avgPm100, humidity, pressure, temperature, updated)
WITH RECURSIVE days_ago (day_offset) AS (
  SELECT 1
  UNION ALL
  SELECT day_offset + 1 FROM days_ago WHERE day_offset < 30
),
stations AS (
  SELECT '9001' AS location_id, 44 AS base_aqi, 18.0 AS pm10, 9.0 AS pm25, 24.0 AS pm100, 48 AS humidity, 101300 AS pressure, 15.5 AS temperature
  UNION ALL SELECT '9002', 72, 32.0, 20.0, 45.0, 57, 101200, 13.2
  UNION ALL SELECT '9003', 118, 65.0, 41.0, 88.0, 63, 101500, 20.1
  UNION ALL SELECT '9004', 162, 88.0, 68.0, 124.0, 39, 100850, 11.4
  UNION ALL SELECT '9005', 185, 110.0, 75.0, 150.0, 34, 100920, 16.3
  UNION ALL SELECT '9006', 170, 110.0, 70.0, 165.0, 52, 101050, 18.6
)
SELECT
  stations.location_id,
  GREATEST(0, LEAST(500, ROUND(stations.base_aqi + 8 * SIN(days_ago.day_offset / 4) + MOD(days_ago.day_offset * 7, 13) - 6))),
  ROUND(stations.pm10 * (0.86 + MOD(days_ago.day_offset * 3, 15) / 100), 2),
  ROUND(stations.pm25 * (0.87 + MOD(days_ago.day_offset * 5, 16) / 100), 2),
  ROUND(stations.pm100 * (0.86 + MOD(days_ago.day_offset * 2, 15) / 100), 2),
  GREATEST(20, LEAST(95, stations.humidity + MOD(days_ago.day_offset * 5, 13) - 6)),
  stations.pressure + MOD(days_ago.day_offset * 29, 501) - 250,
  ROUND(stations.temperature + 5 * SIN(days_ago.day_offset / 5), 1),
  NOW() - INTERVAL days_ago.day_offset DAY
FROM stations
CROSS JOIN days_ago
ORDER BY stations.location_id, days_ago.day_offset DESC;
