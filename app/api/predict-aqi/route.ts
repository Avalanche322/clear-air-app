import { NextResponse } from "next/server";

type Observation = {
  aqi: number;
  timestamp: number;
};

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const historyData =
      typeof body === "object" && body !== null && "historyData" in body
        ? body.historyData
        : undefined;

    if (!Array.isArray(historyData)) {
      return NextResponse.json(
        { error: "historyData must be an array." },
        { status: 400 }
      );
    }

    const observations = historyData.flatMap((entry): Observation[] => {
      if (typeof entry !== "object" || entry === null) return [];

      const record = entry as { aqi?: unknown; updated?: unknown };
      if (typeof record.aqi !== "number" || !Number.isFinite(record.aqi)) {
        return [];
      }

      return [
        {
          aqi: record.aqi,
          timestamp:
            typeof record.updated === "string"
              ? Date.parse(record.updated)
              : Number.NaN,
        },
      ];
    });

    if (observations.length < 5) {
      return NextResponse.json(
        { error: "At least 5 finite AQI records are required." },
        { status: 400 }
      );
    }

    const hasTimestamps = observations.every((item) =>
      Number.isFinite(item.timestamp)
    );
    if (hasTimestamps) {
      observations.sort((left, right) => left.timestamp - right.timestamp);
    }

    const recent = observations.slice(-24);
    const origin = hasTimestamps ? recent[0].timestamp : 0;
    const xValues = recent.map((item, index) =>
      hasTimestamps ? (item.timestamp - origin) / 3_600_000 : index
    );
    const yValues = recent.map((item) => item.aqi);
    const xMean = xValues.reduce((sum, value) => sum + value, 0) / xValues.length;
    const yMean = yValues.reduce((sum, value) => sum + value, 0) / yValues.length;
    const variance = xValues.reduce(
      (sum, value) => sum + (value - xMean) ** 2,
      0
    );
    const covariance = xValues.reduce(
      (sum, value, index) => sum + (value - xMean) * (yValues[index] - yMean),
      0
    );
    const slope = variance === 0 ? 0 : covariance / variance;
    const latestX = xValues[xValues.length - 1];
    const forecast = yMean + slope * (latestX + 24 - xMean);

    if (!Number.isFinite(forecast)) {
      throw new Error("AQI forecast calculation produced a non-finite result.");
    }

    return NextResponse.json({
      predictedAQI: Math.round(Math.max(0, Math.min(500, forecast))),
    });
  } catch (error) {
    console.error("ERROR:", error);
    return NextResponse.json(
      { error: "Failed to predict AQI." },
      { status: 500 }
    );
  }
}
