"use client";

import React, { useEffect, useRef, useState } from "react";
import { Map as MapTilerMap, MapStyle, Language, helpers, ColorRamp, MapMouseEvent, MapContextEvent } from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import "./map.css";
import {
  useTheme,
} from "@mui/material";
import Sidebar from "./Sidebar";

export const myCustomRamp = new ColorRamp({
  stops: [
    { value: 0, color: [102, 187, 106] }, // Good (0–50) - Green
    { value: 50, color: [255, 235, 59] }, // Moderate (51–100) - Yellow
    { value: 100, color: [255, 152, 0] }, // Unhealthy for Sensitive Groups (101–150) - Orange
    { value: 150, color: [244, 67, 54] }, // Unhealthy (151–200) - Red
    { value: 200, color: [156, 39, 176] }, // Very Unhealthy (201–300) - Purple
    { value: 300, color: [84, 33, 139] }, // Hazardous (301–500) - Maroon/Deep Purple
  ],
});



export interface CityData {
  id: number;
  aqi: number;
  avgPm10: number;
  avgPm25: number;
  avgPm100: number;
  humidity: number | null;
  pressure: number | null;
  temperature: number | null;
  updated: string;
  station_name: number;
  city: string;
  lat: number;
  lng: number;
}

export default function Map() {
  const mapContainer = useRef(null);
  const map = useRef<any>(null);
  const ukraine = { lng: 31.1656, lat: 48.3794 };
  const zoom = 5;
  const [cityData, setCityData] = useState<CityData[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [currentPosition, setCurrentPosition] = useState<any>();

  const theme = useTheme();

  const handleSelectedCity = (city: CityData | null) => {
    setSelectedCity(city);
  };

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/air-quality");
      const data = await res.json();
      setCityData(data);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new MapTilerMap({
      container: mapContainer.current,
      style: MapStyle.BASIC.DARK,
      language: Language.LOCAL,
      center: [ukraine.lng, ukraine.lat],
      minZoom: zoom,
      maxZoom: 22,
      apiKey: process.env.NEXT_PUBLIC_MAPTILER_KEY,
    });

    map.current.on("load", () => {
      if (!map.current) return;

      const geoJsonData = {
        type: "FeatureCollection",
        features: cityData.map((city) => ({
          type: "Feature",
          properties: city,
          geometry: {
            type: "Point",
            coordinates: [city.lng, city.lat],
          },
        })),
      };

      helpers.addPoint(map.current, {
        data: geoJsonData as any,
        property: "aqi",
        labelColor: "#000",
        pointRadius: 16,
        showLabel: true,
        pointColor: myCustomRamp,
        zoomCompensation: false,
        outline: true,
        outlineWidth: [
          { zoom: 6, value: 0 },
          { zoom: 7, value: 1 },
          { zoom: 12, value: 3 },
        ],
        outlineOpacity: [
          { zoom: 7, value: 0 },
          { zoom: 10, value: 1 },
        ],
      });
    });

    // Change cursor on mouse move over points
    map.current.on("mousemove", (event: MapMouseEvent) => {
      const features = map.current.queryRenderedFeatures(event.point);

      // Check if a point was hovered
      const hoveredPoint = features.find(
        (feature: { properties: CityData }) =>
          feature.properties && feature.properties.aqi !== undefined
      );

      if (hoveredPoint) {
        // Change cursor to pointer if over a point
        map.current.getCanvas().style.cursor = "pointer";
      } else {
        // Reset cursor if not over a point
        map.current.getCanvas().style.cursor = "";
      }
    });

    // Add a click event listener on the map
    map.current.on("click", (event: MapMouseEvent) => {
      const features = map.current.queryRenderedFeatures(event.point);

      // Check if a point was clicked
      const clickedPoint = features.find(
        (feature: { properties: CityData }) =>
          feature.properties && feature.properties.aqi !== undefined
      );

      if (clickedPoint) {
        setSelectedCity(clickedPoint.properties);
		  const coordinates = features![0].geometry.coordinates.slice();
		  const currentCenter = map.current.getCenter();
		  setCurrentPosition({
        zoom: map.current.getZoom(),
        center: [currentCenter.lng, currentCenter.lat],
      });
        map.current!.flyTo({ center: coordinates, zoom: 12 });
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [cityData, ukraine.lng, ukraine.lat, zoom, theme]);

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />

      <Sidebar
        selectedCity={selectedCity}
        handleSelectedCity={handleSelectedCity}
        map={map.current}
        currentPosition={currentPosition}
      />
    </div>
  );
}
