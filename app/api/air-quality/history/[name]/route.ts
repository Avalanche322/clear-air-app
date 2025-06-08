import { NextResponse, NextRequest } from "next/server";

import connection from "@/app/lib/db";

export async function GET(request: Request, { params }: { params: { name: string } }) {
  try {
    const [hours] = await connection.query(
      `SELECT 
    city_air_quality_history.id,
	 location.name as station_name,
	 location.city,
    city_air_quality_history.aqi, 
    city_air_quality_history.avgPm10, 
    city_air_quality_history.avgPm25, 
    city_air_quality_history.avgPm100, 
    city_air_quality_history.updated, 
    city_air_quality_history.pressure, 
    city_air_quality_history.humidity,
	 location.lat,
	 location.lng
FROM 
    city_air_quality_history 
JOIN 
    location ON city_air_quality_history.location_id = location.name 
WHERE
    location.name = ${params.name} 
    AND city_air_quality_history.updated > NOW() - INTERVAL 48 HOUR;`
    );

	 const [month] = await connection.query(
     `SELECT 
    city_air_quality_history.id,
	 location.name as station_name,
	 location.city,
    city_air_quality_history.aqi, 
    city_air_quality_history.avgPm10, 
    city_air_quality_history.avgPm25, 
    city_air_quality_history.avgPm100, 
    city_air_quality_history.updated, 
    city_air_quality_history.pressure, 
    city_air_quality_history.humidity,
    city_air_quality_history.temperature,
	 location.lat,
	 location.lng
FROM 
    city_air_quality_history 
JOIN 
    location ON city_air_quality_history.location_id = location.name 
WHERE 
    location.name = ${params.name} 
    AND city_air_quality_history.updated > NOW() - INTERVAL 1 MONTH`
   );

    return NextResponse.json({ hours, month });
  } catch (err) {
    console.log("ERROR: API - ", (err as Error).message);

    const response = {
      error: (err as Error).message,

      returnedStatus: 200,
    };

    return NextResponse.json(response, { status: 200 });
  }
}
