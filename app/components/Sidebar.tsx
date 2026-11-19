import React, { useEffect, useState } from "react";
import { Box, Typography, IconButton, List, ListItem, ListItemIcon, ListItemText, Link, Modal, ButtonGroup, Button, Divider, Drawer } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlineOutlined";
import { styled } from "@mui/system";
import { CityData, myCustomRamp } from "./Map";
import theme from "../theme";
import { BarChart } from "@mui/x-charts";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable, { RowInput } from "jspdf-autotable";
import { Download, Thermostat, WaterDrop } from "@mui/icons-material";
import { translations, type AppLanguage } from "@/app/lib/i18n";


function getAQIAdvice(aqi: number, language: AppLanguage) {
  const advice = translations[language].advice;

  if (aqi >= 0 && aqi <= 50) {
    return advice.good;
  } else if (aqi > 50 && aqi <= 100) {
    return advice.acceptable;
  } else if (aqi > 100 && aqi <= 150) {
    return advice.sensitive;
  } else if (aqi > 150 && aqi <= 200) {
    return advice.unhealthy;
  }

  if (aqi > 200) return advice.veryUnhealthy;
  return advice.unknown;
}

function getPollutionComposition(data: any) {
  // CityData
  const result: Array<{ label: string; value: string }> = [];

  for (const key in data) {
    if (key.includes("Pm")) {
      result.push({ label: key.slice(3), value: data[key].toFixed(3) });
    }
  }

  return result;
}

function formatDate(dateString: string, language: AppLanguage) {
  const date = new Date(dateString);
  const locale = language === "uk" ? "uk-UA" : "en-US";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function generatePDF(data: { hours: any[]; month: any[] }) {
  const doc = new jsPDF();

  // Add main title at the top center of the page
  doc.setFontSize(18);
  doc.text("Air Quality Report", 105, 20, { align: "center" });

  // Add a subtitle below the title
  doc.setFontSize(12);
  doc.text("Generated Report for Air Quality and Locations", 105, 30, {
    align: "center",
  });

  // Initial Y position
  let currentY = 40;

  // Table: Last 48 Hours
  doc.setFontSize(14);
  doc.text("Air Quality Data - Last 48 Hours", 14, currentY);

  const tableDataHours = data.hours.map((item) => [
    item.station_name,
    item.city,
    item.aqi,
    item.avgPm10.toFixed(3) ?? "N/A",
    item.avgPm25.toFixed(3) ?? "N/A",
    item.avgPm100.toFixed(3) ?? "N/A",
    item.humidity ?? "N/A",
    item.pressure ?? "N/A",
    formatDate(item.updated, "en"),
    item.lat.toFixed(3) ?? "N/A",
    item.lng.toFixed(3) ?? "N/A",
  ]);

  // Insert the first table at position Y: currentY + 10
  autoTable(doc, {
    head: [
      [
        "Name",
        "City",
        "AQI",
        "PM10",
        "PM25",
        "PM100",
        "Humidity",
        "Pressure",
        "Updated",
        "Latitude",
        "Longitude",
      ],
    ],
    body: tableDataHours as RowInput[],
    startY: currentY + 10,
  });

  // Manually calculate the position for the second table
  currentY += 10 + tableDataHours.length * 10 + 20;

  // Table: Current Month
  doc.setFontSize(14);
  doc.text("Air Quality Data - Current Month", 14, currentY);

  const tableDataMonth = data.month.map((item) => [
    item.station_name,
    item.city,
    item.aqi,
    item.avgPm10.toFixed(3) ?? "N/A",
    item.avgPm25.toFixed(3) ?? "N/A",
    item.avgPm100.toFixed(3) ?? "N/A",
    item.humidity ?? "N/A",
    item.pressure ?? "N/A",
    formatDate(item.updated, "en"),
    item.lat.toFixed(3) ?? "N/A",
    item.lng.toFixed(3) ?? "N/A",
  ]);

  autoTable(doc, {
    head: [
      [
        "Name",
        "City",
        "AQI",
        "PM10",
        "PM25",
        "PM100",
        "Humidity",
        "Pressure",
        "Updated",
        "Latitude",
        "Longitude",
      ],
    ],
    body: tableDataMonth as RowInput[],
    startY: currentY + 10,
  });

  // Save the PDF
  doc.save("air_quality_report.pdf");
}

function pressureToPercentage(pressure: number): string {
  const referencePressure = 1013.25; // in hPa
  const percentage = (pressure / referencePressure) * 100;
  return `${percentage.toFixed(2)}%`;
}

const aqiLevels = [
  {
    range: "0–50",
    color: "#66bb6a", // Green
  },
  {
    range: "51–100",
    color: "#ffeb3b", // Yellow
  },
  {
    range: "101–150",
    color: "#ff9800", // Orange
  },
  {
    range: "151–200",
    color: "#f44336", // Red
  },
  {
    range: "201–300",
    color: "#9c27b0", // Purple
  },
  {
    range: "301+",
    color: "#4a148c", // Maroon
  },
];

const boxShadow = "0px 16px 42px -11px rgba(0,0,0,0.78)";


// Define a styled AQIBox that changes background based on AQI level
const StyledAQIBox = styled(Box)<{ aqi: number }>(({ aqi }) => {
  const backgroundColor = myCustomRamp.getColorHex(aqi);
  

  return {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "190px",
    backgroundColor: backgroundColor,
    zIndex: -1,
    boxShadow: boxShadow,
  };
});

const Sidebar = ({
  selectedCity,
  handleSelectedCity,
  map,
  currentPosition,
  language,
}: {
  selectedCity: CityData | null;
  handleSelectedCity: (city: CityData | null) => void;
  map: any;
  currentPosition: any;
  language: AppLanguage;
}) => {
  const t = translations[language];
	const [openAqiModal, setOpenAqiModal] = useState(false);
	const [openPmModal, setOpenPmModal] = useState(false);
	const [history, setHistory] = useState<{
    hours: any[];
    month: any[];
  } | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<any[]>([]);
  const [predictAQI, setPredictAQI] = useState<number | null>(null);

	useEffect(() => {
    async function fetchData() {
      setHistory(null);
      setPredictAQI(null);
      const res = await fetch(`/api/air-quality/history/${selectedCity?.station_name}`);
      const data = await res.json();
      setHistory(data);
		setSelectedHistory(data.hours);
    }

	 if(!!selectedCity) {
		fetchData();
	 }
  }, [selectedCity]);

  useEffect(() => {
	async function fetchPredictAQI(history: any[]) {
    const response = await fetch("/api/predict-aqi", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ historyData: history }),
    });

    const data = await response.json();
    if (
      !response.ok ||
      typeof data.predictedAQI !== "number" ||
      !Number.isFinite(data.predictedAQI)
    ) {
      console.error("AQI forecast failed:", data.error ?? "Invalid forecast response.");
      setPredictAQI(null);
      return;
    }
    setPredictAQI(data.predictedAQI);
  }
    if (history && history.hours.length >= 5) {
      fetchPredictAQI(history.hours.slice(-24));
    } else if (history && history.month.length >= 5) {
      fetchPredictAQI(history.month.slice(-24));
    }
  }, [history]);

	if (!selectedCity || !history) return null;


    const handleOnClose = () => {
      handleSelectedCity(null);
		setPredictAQI(null);
      map.flyTo(currentPosition);
    };

  const {
    aqi,
    station_name,
    updated,
    city,
    temperature,
    pressure,
    data_source,
  } = selectedCity;
  const aqiAdvice = getAQIAdvice(aqi, language);

  return (
    <Drawer
      anchor="left"
      open={!!selectedCity}
      onClose={handleOnClose}
      //hideBackdrop
    >
      <Box
        sx={{
          padding: "20px",
          width: "350px",
          display: "flex",
          flexDirection: "column",
          rowGap: "35px",
        }}
      >
        <StyledAQIBox aqi={aqi || 0} />
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="h6">
              {t.station} №{station_name}
            </Typography>
            <IconButton
              size="large"
              aria-label={t.close}
              onClick={handleOnClose}
              sx={{ position: "absolute", top: 0, right: 0 }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Box
            sx={{
              marginTop: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <WaterDrop fontSize="small" />
              <Typography variant="body1" component="span">
                {pressure ? pressureToPercentage(pressure / 100) : "N/A"}
              </Typography>
            </Box>
            <Divider
              sx={{ borderColor: theme.palette.text.primary }}
              orientation="vertical"
              flexItem
            />
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Thermostat fontSize="small" />
              <Typography variant="body1" component="span">
                {temperature ? Math.round(temperature) : "N/A"}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              marginTop: "15px",
              marginBottom: "20px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
              <Typography variant="h2" sx={{ fontWeight: 500 }}>
                {aqi}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 500 }}>
                AQI
              </Typography>
            </Box>
            <IconButton
              sx={{
                color: theme.palette.text.primary,
                alignSelf: "flex-start",
              }}
              onClick={() => {
                setOpenAqiModal(true);
              }}
            >
              <HelpOutlineIcon />
            </IconButton>
          </Box>
        </Box>

        <Box
          sx={{
            border: `solid 1px ${theme.palette.grey[600]}`,
            borderRadius: "8px",
            padding: "10px",
            position: "relative",
            backgroundColor: theme.palette.divider,
            boxShadow: boxShadow,
          }}
        >
          <Typography variant="h6" sx={{ marginBottom: "8px" }}>
            {aqiAdvice.level}
          </Typography>
          <Typography>{aqiAdvice.text}</Typography>
        </Box>

        {predictAQI !== null ? (
          <Box
            sx={{
              border: `solid 1px ${theme.palette.grey[600]}`,
              borderRadius: "8px",
              padding: "10px",
              position: "relative",
              backgroundColor: theme.palette.divider,
              boxShadow: boxShadow,
            }}
          >
            <Typography
              variant="h6"
              sx={{ marginBottom: "8px", fontWeight: "bold" }}
            >
              {t.forecast}
            </Typography>
            <Typography sx={{ marginBottom: "4px" }}>
              {t.aqiValue} {Math.round(predictAQI)}
            </Typography>
            <Divider
              sx={{ borderColor: theme.palette.grey[500], marginY: "8px" }}
            />
            <Typography
              variant="body2"
              sx={{ fontStyle: "italic", color: theme.palette.text.secondary }}
            >
              {t.recommendation}:{" "}
              {getAQIAdvice(Math.round(predictAQI), language).text}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              border: `solid 1px ${theme.palette.grey[600]}`,
              borderRadius: "8px",
              padding: "10px",
              position: "relative",
              backgroundColor: theme.palette.divider,
              boxShadow: boxShadow,
            }}
          >
            <Typography variant="h6" sx={{ marginBottom: "8px" }}>
              {t.noForecast}
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            border: `solid 1px ${theme.palette.grey[600]}`,
            borderRadius: "8px",
            padding: "10px",
            backgroundColor: theme.palette.divider,
            boxShadow: boxShadow,
          }}
        >
          <Typography variant="h6" sx={{ marginBottom: "8px" }}>
            {t.pollutionComposition}
          </Typography>
          {getPollutionComposition(selectedCity).map((data) => (
            <Box
              key={data.label}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Link
                component="button"
                sx={{
                  color: theme.palette.text.primary,
                  display: "inline-flex",
                  alignItems: "center",
                  textDecorationColor: theme.palette.text.primary,
                  gap: "10px",
                }}
                onClick={() => {
                  setOpenPmModal(true);
                }}
              >
                <CloudQueueIcon />
                {data.label}
              </Link>
              <Typography>{`${data.value} µg/m³`}</Typography>
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            border: `solid 1px ${theme.palette.grey[600]}`,
            borderRadius: "8px",
            padding: "10px",
            position: "relative",
            backgroundColor: theme.palette.divider,
            boxShadow: boxShadow,
          }}
        >
          <Typography variant="h6" sx={{ marginBottom: "8px" }}>
            {t.additionalInfo}
          </Typography>
          <Typography>
            {t.dataAs}: {formatDate(updated, language)}
          </Typography>
          <Typography>
            {t.city}: {city}
          </Typography>
          <Typography>
            {t.dataSource}:{" "}
            {data_source === "demo" ? t.demoDataName : t.dataSourceName}
          </Typography>
          <Button
            variant="contained"
            size="small"
            sx={{ marginTop: "10px" }}
            startIcon={<Download />}
            onClick={() => generatePDF(history)}
          >
            {t.downloadPdf}
          </Button>
        </Box>
        <Box
          sx={{
            border: `solid 1px ${theme.palette.grey[600]}`,
            borderRadius: "8px",
            padding: "10px",
            position: "relative",
            backgroundColor: theme.palette.divider,
            boxShadow: boxShadow,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <ButtonGroup size="small">
            <Button onClick={() => setSelectedHistory(history.hours)}>
              {t.last48Hours}
            </Button>
            <Button onClick={() => setSelectedHistory(history.month)}>
              {t.last30Days}
            </Button>
          </ButtonGroup>
          <BarChart
            dataset={selectedHistory}
            xAxis={[
              {
                scaleType: "band",
                dataKey: "updated",
                valueFormatter: (v) => formatDate(String(v), language),
              },
            ]}
            series={[
              {
                dataKey: "aqi",
                label: "aqi",
              },
            ]}
            width={350}
            height={150}
          />
        </Box>
      </Box>

      <Modal open={openAqiModal} onClose={() => setOpenAqiModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            backgroundColor: theme.palette.background.paper,
            boxShadow: boxShadow,
            backgroundImage:
              "linear-gradient(rgba(255, 255, 255, 0.147), rgba(255, 255, 255, 0.147))",
            padding: 4,
            color: theme.palette.text.primary,
            borderRadius: "8px",
          }}
        >
          <Typography variant="h6" component="h2">
            {t.whatIsAqi}
          </Typography>
          <Typography sx={{ marginTop: 2 }}>
            {t.aqiDefinition}
          </Typography>
          <List>
            {aqiLevels.map((level, index) => (
              <ListItem key={level.range} disablePadding>
                <ListItemIcon
                  sx={{
                    backgroundColor: level.color,
                    marginRight: "20px",
                    color: "#000",
                    fontWeight: 500,
                    padding: "5px",
                    borderRadius: "4px",
                    justifyContent: "center",
                  }}
                >
                  {level.range}
                </ListItemIcon>
                <ListItemText primary={t.aqiLevels[index]} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Modal>

      <Modal open={openPmModal} onClose={() => setOpenPmModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            backgroundColor: theme.palette.background.paper,
            boxShadow: boxShadow,
            backgroundImage:
              "linear-gradient(rgba(255, 255, 255, 0.147), rgba(255, 255, 255, 0.147))",
            padding: 4,
            color: theme.palette.text.primary,
            borderRadius: "8px",
          }}
        >
          <Typography variant="h6" component="h2">
            {t.whatIsPm}
          </Typography>
          {t.pmDefinition.map((paragraph) => (
            <Typography key={paragraph} sx={{ marginTop: 2 }}>
              {paragraph}
            </Typography>
          ))}
        </Box>
      </Modal>
    </Drawer>
  );
};

export default Sidebar;