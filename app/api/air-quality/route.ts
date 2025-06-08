import { NextResponse, NextRequest } from "next/server";

import connection from "@/app/lib/db";

export async function GET(request: Request) {
  try {
    const [results] = await connection.query(
      `SELECT 
		ca.id,
		ca.aqi,
		ca.avgPm10,
		ca.avgPm25,
		ca.avgPm100,
		ca.humidity,
		ca.pressure,
		ca.temperature,
		ca.updated,
		loc.name as station_name,
		loc.city,
		loc.lat,
		loc.lng
		FROM 
			city_air_quality ca
		JOIN 
			location loc ON ca.location_id = loc.name;`
    );

    return NextResponse.json(results);
  } catch (err) {
    console.log("ERROR: API - ", (err as Error).message);

    const response = {
      error: (err as Error).message,

      returnedStatus: 200,
    };

    return NextResponse.json(response, { status: 200 });
  }
}
