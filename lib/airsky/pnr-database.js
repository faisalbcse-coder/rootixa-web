/**
 * Centralized PNR Database for AirSky Airlines
 * 10 Predefined PNR Records with authentic flight routes and details.
 */

export const AIRSKY_PNR_DATABASE = {
  AS7K2P: {
    pnr: "AS7K2P",
    flightNumber: "AS 701",
    airline: "AirSky",
    originCode: "DAC",
    originCity: "Dhaka",
    originAirport: "Hazrat Shahjalal Int'l (DAC)",
    originTerminal: "Terminal 2",
    destinationCode: "RUH",
    destinationCity: "Riyadh",
    destinationAirport: "King Khalid Int'l (RUH)",
    destinationTerminal: "Terminal 1",
    departureDate: "10 SEP 2026",
    departureTime: "22:45",
    arrivalTime: "02:15 (+1)",
    boardingTime: "21:55",
    gate: "A12",
    seat: "18A",
    bookingClass: "Economy",
    status: "VALID",
    aircraft: "Boeing 787-9 Dreamliner",
    baggage: "2 x 23kg",
    defaultPassenger: "MD Ariful Islam",
    securityToken: "SEC-9921-AS7K2P",
  },
  AS9M4Q: {
    pnr: "AS9M4Q",
    flightNumber: "AS 703",
    airline: "AirSky",
    originCode: "DAC",
    originCity: "Dhaka",
    originAirport: "Hazrat Shahjalal Int'l (DAC)",
    originTerminal: "Terminal 2",
    destinationCode: "JED",
    destinationCity: "Jeddah",
    destinationAirport: "King Abdulaziz Int'l (JED)",
    destinationTerminal: "North Terminal",
    departureDate: "11 SEP 2026",
    departureTime: "03:30",
    arrivalTime: "07:20",
    boardingTime: "02:40",
    gate: "B04",
    seat: "12F",
    bookingClass: "Economy",
    status: "VALID",
    aircraft: "Airbus A350-900",
    baggage: "2 x 23kg",
    defaultPassenger: "Tanvir Ahmed",
    securityToken: "SEC-8834-AS9M4Q",
  },
  AS3X8L: {
    pnr: "AS3X8L",
    flightNumber: "AS 705",
    airline: "AirSky",
    originCode: "DAC",
    originCity: "Dhaka",
    originAirport: "Hazrat Shahjalal Int'l (DAC)",
    originTerminal: "Terminal 1",
    destinationCode: "DXB",
    destinationCity: "Dubai",
    destinationAirport: "Dubai Int'l Airport (DXB)",
    destinationTerminal: "Terminal 3",
    departureDate: "11 SEP 2026",
    departureTime: "19:15",
    arrivalTime: "22:30",
    boardingTime: "18:25",
    gate: "C08",
    seat: "04A",
    bookingClass: "Business",
    status: "VALID",
    aircraft: "Boeing 777-300ER",
    baggage: "2 x 32kg",
    defaultPassenger: "Fatima Al-Zahra",
    securityToken: "SEC-4412-AS3X8L",
  },
  AS6N5R: {
    pnr: "AS6N5R",
    flightNumber: "AS 707",
    airline: "AirSky",
    originCode: "DAC",
    originCity: "Dhaka",
    originAirport: "Hazrat Shahjalal Int'l (DAC)",
    originTerminal: "Terminal 2",
    destinationCode: "LHR",
    destinationCity: "London",
    destinationAirport: "London Heathrow (LHR)",
    destinationTerminal: "Terminal 4",
    departureDate: "12 SEP 2026",
    departureTime: "09:40",
    arrivalTime: "15:10",
    boardingTime: "08:50",
    gate: "A06",
    seat: "24C",
    bookingClass: "Economy",
    status: "VALID",
    aircraft: "Boeing 787-9 Dreamliner",
    baggage: "2 x 23kg",
    defaultPassenger: "Rahim Chowdhury",
    securityToken: "SEC-7761-AS6N5R",
  },
  AS8T2W: {
    pnr: "AS8T2W",
    flightNumber: "AS 709",
    airline: "AirSky",
    originCode: "DAC",
    originCity: "Dhaka",
    originAirport: "Hazrat Shahjalal Int'l (DAC)",
    originTerminal: "Terminal 1",
    destinationCode: "SIN",
    destinationCity: "Singapore",
    destinationAirport: "Singapore Changi (SIN)",
    destinationTerminal: "Terminal 2",
    departureDate: "12 SEP 2026",
    departureTime: "23:50",
    arrivalTime: "06:10 (+1)",
    boardingTime: "23:00",
    gate: "D15",
    seat: "02K",
    bookingClass: "First Class",
    status: "VALID",
    aircraft: "Boeing 787-10 Dreamliner",
    baggage: "3 x 32kg",
    defaultPassenger: "Samantha Lee",
    securityToken: "SEC-1190-AS8T2W",
  },
  AS4P7Y: {
    pnr: "AS4P7Y",
    flightNumber: "AS 711",
    airline: "AirSky",
    originCode: "DAC",
    originCity: "Dhaka",
    originAirport: "Hazrat Shahjalal Int'l (DAC)",
    originTerminal: "Terminal 2",
    destinationCode: "KUL",
    destinationCity: "Kuala Lumpur",
    destinationAirport: "Kuala Lumpur Int'l (KUL)",
    destinationTerminal: "KLIA 1",
    departureDate: "13 SEP 2026",
    departureTime: "14:20",
    arrivalTime: "20:05",
    boardingTime: "13:30",
    gate: "B09",
    seat: "15B",
    bookingClass: "Economy",
    status: "VALID",
    aircraft: "Airbus A330-300",
    baggage: "2 x 23kg",
    defaultPassenger: "Kamal Hossain",
    securityToken: "SEC-3351-AS4P7Y",
  },
  AS5D9K: {
    pnr: "AS5D9K",
    flightNumber: "AS 713",
    airline: "AirSky",
    originCode: "DAC",
    originCity: "Dhaka",
    originAirport: "Hazrat Shahjalal Int'l (DAC)",
    originTerminal: "Terminal 2",
    destinationCode: "BKK",
    destinationCity: "Bangkok",
    destinationAirport: "Suvarnabhumi Airport (BKK)",
    destinationTerminal: "Main Concourse",
    departureDate: "13 SEP 2026",
    departureTime: "11:15",
    arrivalTime: "14:45",
    boardingTime: "10:25",
    gate: "A02",
    seat: "08D",
    bookingClass: "Premium Economy",
    status: "VALID",
    aircraft: "Boeing 787-8",
    baggage: "2 x 25kg",
    defaultPassenger: "Nusrat Jahan",
    securityToken: "SEC-5529-AS5D9K",
  },
  AS2H6M: {
    pnr: "AS2H6M",
    flightNumber: "AS 715",
    airline: "AirSky",
    originCode: "DAC",
    originCity: "Dhaka",
    originAirport: "Hazrat Shahjalal Int'l (DAC)",
    originTerminal: "Terminal 1",
    destinationCode: "DOH",
    destinationCity: "Doha",
    destinationAirport: "Hamad Int'l Airport (DOH)",
    destinationTerminal: "Concourse C",
    departureDate: "14 SEP 2026",
    departureTime: "20:00",
    arrivalTime: "22:50",
    boardingTime: "19:10",
    gate: "C11",
    seat: "19E",
    bookingClass: "Economy",
    status: "VALID",
    aircraft: "Boeing 777-300ER",
    baggage: "2 x 23kg",
    defaultPassenger: "Mohammad Saiful",
    securityToken: "SEC-6618-AS2H6M",
  },
  AS7R3V: {
    pnr: "AS7R3V",
    flightNumber: "AS 717",
    airline: "AirSky",
    originCode: "DAC",
    originCity: "Dhaka",
    originAirport: "Hazrat Shahjalal Int'l (DAC)",
    originTerminal: "Terminal 2",
    destinationCode: "JFK",
    destinationCity: "New York",
    destinationAirport: "John F. Kennedy Int'l (JFK)",
    destinationTerminal: "Terminal 4",
    departureDate: "15 SEP 2026",
    departureTime: "01:10",
    arrivalTime: "11:40",
    boardingTime: "00:15",
    gate: "A01",
    seat: "07A",
    bookingClass: "Business",
    status: "VALID",
    aircraft: "Boeing 777-300ER",
    baggage: "2 x 32kg",
    defaultPassenger: "Zubair Rahman",
    securityToken: "SEC-2294-AS7R3V",
  },
  AS9B5T: {
    pnr: "AS9B5T",
    flightNumber: "AS 719",
    airline: "AirSky",
    originCode: "DAC",
    originCity: "Dhaka",
    originAirport: "Hazrat Shahjalal Int'l (DAC)",
    originTerminal: "Terminal 2",
    destinationCode: "YYZ",
    destinationCity: "Toronto",
    destinationAirport: "Toronto Pearson Int'l (YYZ)",
    destinationTerminal: "Terminal 1",
    departureDate: "15 SEP 2026",
    departureTime: "04:45",
    arrivalTime: "16:20",
    boardingTime: "03:55",
    gate: "B12",
    seat: "28H",
    bookingClass: "Economy",
    status: "VALID",
    aircraft: "Boeing 787-9 Dreamliner",
    baggage: "2 x 23kg",
    defaultPassenger: "Ayesha Siddiqua",
    securityToken: "SEC-7703-AS9B5T",
  },
};

/**
 * Return array of all 10 predefined PNR records
 */
export function getAllPNRs() {
  return Object.values(AIRSKY_PNR_DATABASE);
}

/**
 * Check if a PNR code exists in the database
 */
export function isValidPNR(pnr) {
  if (!pnr || typeof pnr !== "string") return false;
  const clean = pnr.trim().toUpperCase();
  return Boolean(AIRSKY_PNR_DATABASE[clean]);
}

/**
 * Retrieve PNR record by code
 */
export function getPNR(pnr) {
  if (!pnr || typeof pnr !== "string") return null;
  const clean = pnr.trim().toUpperCase();
  return AIRSKY_PNR_DATABASE[clean] || null;
}

/**
 * Get ticket information combining PNR data and optional passenger override
 */
export function getTicketData(pnr, passengerOverride = "") {
  const record = getPNR(pnr);
  if (!record) return null;

  let passengerName = passengerOverride?.trim();

  // If running in browser, check localStorage for any locally saved customized ticket
  if (!passengerName && typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(`airsky_ticket_${record.pnr}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.passengerName) {
          passengerName = parsed.passengerName;
        }
      }
    } catch {
      // ignore localStorage read errors
    }
  }

  return {
    ...record,
    passengerName: passengerName || record.defaultPassenger,
    issueTimestamp: new Date().toISOString(),
  };
}

/**
 * Save customized generated ticket to localStorage for cross-route sync
 */
export function saveGeneratedTicket(pnr, passengerName) {
  if (typeof window === "undefined" || !pnr) return;
  try {
    const clean = pnr.trim().toUpperCase();
    localStorage.setItem(
      `airsky_ticket_${clean}`,
      JSON.stringify({
        pnr: clean,
        passengerName: passengerName?.trim() || "",
        updatedAt: new Date().toISOString(),
      })
    );
  } catch {
    // localStorage failure fallback
  }
}

/**
 * Retrieve saved passenger name from localStorage
 */
export function getSavedPassengerName(pnr) {
  if (typeof window === "undefined" || !pnr) return null;
  try {
    const clean = pnr.trim().toUpperCase();
    const saved = localStorage.getItem(`airsky_ticket_${clean}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed?.passengerName || null;
    }
  } catch {
    return null;
  }
  return null;
}
