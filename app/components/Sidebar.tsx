import React, { useEffect, useState } from "react";
import { Box, Typography, IconButton, List, ListItem, ListItemIcon, ListItemText, Link, Modal, ButtonGroup, Button, Divider, Drawer } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { styled } from "@mui/system";
import { CityData, myCustomRamp } from "./Map";
import theme from "../theme";
import { BarChart } from "@mui/x-charts";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable, { RowInput } from "jspdf-autotable";
import { Download, Thermostat, WaterDrop } from "@mui/icons-material";


function getAQIAdvice(aqi: number) {
  if (aqi >= 0 && aqi <= 50) {
    return {
      level: "Повітря чисте 😁",
      advice:
        "Якість повітря в нормі, немає жодних ризиків для здоров'я.",
    };
  } else if (aqi > 50 && aqi <= 100) {
    return {
      level: "Повітря прийнятне 🙂",
      advice:
        "Якість повітря прийнятна, але для деяких чутливих людей можуть виникнути легкі проблеми зі здоров'ям.",
    };
  } else if (aqi > 100 && aqi <= 150) {
    return {
      level: "Повітря нездорове для чутливих 😕",
      advice:
        "Люди з респіраторними захворюваннями, діти та люди похилого віку можуть відчути негативний вплив на здоров'я.",
    };
  } else if (aqi > 150 && aqi <= 200) {
    return {
      level: "Повітря нездорове 😷",
      advice:
        "Можливі серйозні проблеми зі здоров'ям у всього населення, особливо для тих, хто має захворювання дихальних шляхів.",
    };
  } else if (aqi > 200) {
    return {
      level: "Повітря дуже нездорове 😨",
      advice:
        "Ризик серйозного впливу на здоров'я для всіх.",
    };
  } else {
    return {
      level: "Невідомий рівень ❓",
      advice:
        "Неправильне значення AQI. Будь ласка, введіть дійсний індекс якості повітря.",
    };
  }
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

function formatDate(dateString: string) {
  const date = new Date(dateString);

  // Extract day, month, year, hours, and minutes
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  // Return formatted date and time
  return `${day}.${month}.${year} ${hours}:${minutes}`;
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
    formatDate(item.updated),
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
    formatDate(item.updated),
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
    description:
      "Повітря чисте. Можна провітрювати, активно проводити час просто неба.",
  },
  {
    range: "51–100",
    color: "#ffeb3b", // Yellow
    description:
      "Повітря прийнятне. Не варто хвилюватися, це нормальний показник.",
  },
  {
    range: "101–150",
    color: "#ff9800", // Orange
    description:
      "Повітря нездорове для чутливих людей. Обмежте активність на вулиці.",
  },
  {
    range: "151–200",
    color: "#f44336", // Red
    description:
      "Повітря нездорове. Відмовтесь від прогулянок, закрийте вікна.",
  },
  {
    range: "201–300",
    color: "#9c27b0", // Purple
    description:
      "Повітря дуже нездорове. Закривайте вікна та ввімкніть очищувач повітря.",
  },
  {
    range: "301+",
    color: "#4a148c", // Maroon
    description:
      "Повітря небезпечне. Бережіть себе, увімкніть очищувач чи зволожувач повітря.",
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
}: {
  selectedCity: CityData | null;
  handleSelectedCity: (city: CityData | null) => void;
  map: any;
  currentPosition: any;
}) => {
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
	 console.log("predictAQI", data);
    setPredictAQI(data.predictedAQI);
  }
    if (history && (history.hours.length > 0 || history.month.length > 0)) {
      fetchPredictAQI([...history.hours, ...history.month]);
    }
  }, [history]);

	if (!selectedCity || !history) return null;


    const handleOnClose = () => {
      handleSelectedCity(null);
		setPredictAQI(null);
      map.flyTo(currentPosition);
    };

  const { aqi, station_name, updated, city, temperature, pressure } = selectedCity;

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
            <Typography variant="h6">Станція №{station_name}</Typography>
            <IconButton
              size="large"
              aria-label="close"
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
              <Typography variant="h2" fontWeight={500}>
                {aqi}
              </Typography>
              <Typography variant="h4" fontWeight={500}>
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
            {getAQIAdvice(aqi).level}
          </Typography>
          <Typography>{getAQIAdvice(aqi).advice}</Typography>
        </Box>

        {predictAQI ? (
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
              Прогноз на 24 години
            </Typography>
            <Typography sx={{ marginBottom: "4px" }}>
              значення AQI {Math.round(predictAQI)}
            </Typography>
            <Divider
              sx={{ borderColor: theme.palette.grey[500], marginY: "8px" }}
            />
            <Typography
              variant="body2"
              sx={{ fontStyle: "italic", color: theme.palette.text.secondary }}
            >
              Рекомендація: {getAQIAdvice(Math.round(predictAQI)).advice}
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
              Ми не можемо визначити прогнозований AQI 😕
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
            Склад забруднення
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
              <Typography>{`${data.value} мкг/м3`}</Typography>
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
            Додаткова інформація
          </Typography>
          <Typography>Дані за - {formatDate(updated)}</Typography>
          <Typography>Місто - {city}</Typography>
          <Typography>Джерело даних - Мої дані 😛</Typography>
          <Button
            variant="contained"
            size="small"
            sx={{ marginTop: "10px" }}
            startIcon={<Download />}
            onClick={() => generatePDF(history)}
          >
            Download PDF
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
              48 г
            </Button>
            <Button onClick={() => setSelectedHistory(history.month)}>
              30 дн
            </Button>
          </ButtonGroup>
          <BarChart
            dataset={selectedHistory}
            xAxis={[
              {
                scaleType: "band",
                dataKey: "updated",
                valueFormatter: (v) => formatDate(String(v)),
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
            Що таке AQI?
          </Typography>
          <Typography sx={{ marginTop: 2 }}>
            AQI (Air Quality Index) – індекс якості повітря, що розроблений
            Агенцією з охорони довкілля США і використовується у багатьох
            країнах світу. Чим більше значення AQI, тим вищий рівень забруднення
            повітря і негативніший плив на здоровя.
          </Typography>
          <List>
            {aqiLevels.map((level) => (
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
                <ListItemText primary={level.description} />
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
            Що таке PM?
          </Typography>
          <Typography sx={{ marginTop: 2 }}>
            PM1, PM2.5, PM10 - тверді частки, particulate matter, розміром до 10
            мікронів. Вони такі малі, що непомітні неозброєним оком.
          </Typography>
          <Typography sx={{ marginTop: 2 }}>
            Серед джерел наддрібних часток - автотранспорт, промисловість,
            пожежі.
          </Typography>
          <Typography sx={{ marginTop: 2 }}>
            PMи можуть проникати у наші легені, кров й негативно впливати на
            серце, мозок, дихальну систему. Всесвітня організація охорони
            здоровʼя приділяє цим часткам особливу увагу.
          </Typography>
        </Box>
      </Modal>
    </Drawer>
  );
};

export default Sidebar;