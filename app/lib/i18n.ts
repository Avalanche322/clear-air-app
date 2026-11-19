export type AppLanguage = "uk" | "en";

export const translations = {
  uk: {
    documentTitle: "Мапа якості повітря",
    station: "Станція",
    close: "Закрити",
    forecast: "Прогноз на 24 години",
    aqiValue: "Значення AQI",
    recommendation: "Рекомендація",
    noForecast: "Недостатньо актуальних вимірювань для прогнозу AQI 😕",
    pollutionComposition: "Склад забруднення",
    additionalInfo: "Додаткова інформація",
    dataAs: "Дані за",
    city: "Місто",
    dataSource: "Джерело даних",
    dataSourceName: "Наявний набір даних",
    demoDataName: "Вигадані демонстраційні дані",
    downloadPdf: "Завантажити PDF",
    last48Hours: "48 год",
    last30Days: "30 дн",
    whatIsAqi: "Що таке AQI?",
    aqiDefinition:
      "AQI (індекс якості повітря) розроблений Агентством з охорони довкілля США та використовується в багатьох країнах. Що вище значення AQI, то більше забруднення повітря та його потенційний вплив на здоров’я.",
    aqiLevels: [
      "Добре. Повітря чисте; можна провітрювати й активно проводити час надворі.",
      "Помірно. Якість повітря прийнятна; для більшості людей ризиків немає.",
      "Нездорове для чутливих груп. Обмежте активність надворі, якщо ви чутливі до забруднення.",
      "Нездорове. Обмежте тривале перебування та фізичну активність надворі.",
      "Дуже нездорове. Уникайте активності надворі та за можливості залишайтеся в приміщенні.",
      "Небезпечне. Залишайтеся в приміщенні та уникайте фізичної активності надворі.",
    ],
    whatIsPm: "Що таке PM?",
    pmDefinition: [
      "PM1, PM2.5 і PM10 — це частинки пилу (particulate matter) розміром до 10 мікрометрів. Вони настільки малі, що їх не видно неозброєним оком.",
      "Серед джерел дрібнодисперсних частинок — транспорт, промисловість і пожежі.",
      "Частинки PM можуть проникати в легені та кров і впливати на серце, мозок і дихальну систему. Всесвітня організація охорони здоров’я приділяє їм особливу увагу.",
    ],
    advice: {
      good: {
        level: "Повітря чисте 😁",
        text: "Якість повітря добра. Можна провітрювати та проводити час надворі.",
      },
      acceptable: {
        level: "Повітря прийнятне 🙂",
        text: "Якість повітря прийнятна; зазвичай хвилюватися не варто.",
      },
      sensitive: {
        level: "Нездорове для чутливих груп 😕",
        text: "Чутливим людям варто обмежити активність надворі.",
      },
      unhealthy: {
        level: "Повітря нездорове 😷",
        text: "Обмежте тривале перебування надворі та за можливості зачиніть вікна.",
      },
      veryUnhealthy: {
        level: "Повітря дуже нездорове 😨",
        text: "Уникайте активності надворі та за можливості залишайтеся в приміщенні.",
      },
      unknown: {
        level: "Невідомий рівень ❓",
        text: "Не вдалося визначити рекомендацію для цього значення AQI.",
      },
    },
    language: "Мова",
    languageUkrainian: "Українська",
    languageEnglish: "Англійська",
  },
  en: {
    documentTitle: "Air Quality Map",
    station: "Station",
    close: "Close",
    forecast: "24-hour forecast",
    aqiValue: "AQI value",
    recommendation: "Recommendation",
    noForecast: "Not enough recent readings to forecast AQI 😕",
    pollutionComposition: "Pollutant levels",
    additionalInfo: "Additional information",
    dataAs: "Updated",
    city: "City",
    dataSource: "Data source",
    dataSourceName: "Existing dataset",
    demoDataName: "Synthetic demo data",
    downloadPdf: "Download PDF",
    last48Hours: "48 hours",
    last30Days: "30 days",
    whatIsAqi: "What is AQI?",
    aqiDefinition:
      "The AQI (Air Quality Index) was developed by the U.S. Environmental Protection Agency and is used in many countries. Higher AQI values indicate more air pollution and a greater potential health impact.",
    aqiLevels: [
      "Good. Air is clean; enjoy outdoor activities and ventilate your home.",
      "Moderate. Air quality is acceptable; most people are not at risk.",
      "Unhealthy for sensitive groups. Reduce outdoor activity if you are sensitive to air pollution.",
      "Unhealthy. Limit prolonged outdoor exposure and physical activity.",
      "Very unhealthy. Avoid outdoor activity and stay indoors when possible.",
      "Hazardous. Stay indoors and avoid outdoor physical activity.",
    ],
    whatIsPm: "What is PM?",
    pmDefinition: [
      "PM1, PM2.5, and PM10 are particulate matter up to 10 micrometers in size. These particles are too small to see with the naked eye.",
      "Common sources of fine particles include traffic, industry, and fires.",
      "PM can enter the lungs and bloodstream and affect the heart, brain, and respiratory system. The World Health Organization pays particular attention to these particles.",
    ],
    advice: {
      good: {
        level: "Good air quality 😁",
        text: "Air quality is good. Enjoy outdoor activities and ventilate your home.",
      },
      acceptable: {
        level: "Acceptable air quality 🙂",
        text: "Air quality is acceptable; there is generally no reason for concern.",
      },
      sensitive: {
        level: "Unhealthy for sensitive groups 😕",
        text: "Sensitive people should reduce outdoor activity.",
      },
      unhealthy: {
        level: "Unhealthy air 😷",
        text: "Limit prolonged outdoor exposure and close windows when possible.",
      },
      veryUnhealthy: {
        level: "Very unhealthy air 😨",
        text: "Avoid outdoor activity and stay indoors when possible.",
      },
      unknown: {
        level: "Unknown level ❓",
        text: "A recommendation is not available for this AQI value.",
      },
    },
    language: "Language",
    languageUkrainian: "Ukrainian",
    languageEnglish: "English",
  },
} as const;
