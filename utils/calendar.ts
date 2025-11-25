import { ParsedEvent } from "../types";

/**
 * Generates a Google Calendar Web Add Link
 */
export const generateGoogleCalendarLink = (event: ParsedEvent): string => {
  const formatDate = (isoString: string) => {
    return isoString.replace(/[-:.]/g, "").slice(0, 15) + "Z"; // Simple conversion, assuming UTC or handling offset
  };

  // Convert local ISO to UTC for the URL or use specific format if offset is known.
  // For simplicity in this demo, we construct a date object and use getIOString
  const startDate = new Date(event.start);
  const endDate = new Date(event.end);

  const startStr = startDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
  const endStr = endDate.toISOString().replace(/-|:|\.\d\d\d/g, "");

  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.append("action", "TEMPLATE");
  url.searchParams.append("text", event.title);
  url.searchParams.append("dates", `${startStr}/${endStr}`);
  
  if (event.description) {
    url.searchParams.append("details", event.description);
  }
  if (event.location) {
    url.searchParams.append("location", event.location);
  }

  return url.toString();
};

/**
 * Generates an .ics file content for a single or multiple events
 */
export const generateICS = (events: ParsedEvent[]): string => {
  let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//YogaApp//ScheduleParser//EN\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n";

  events.forEach((event) => {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    
    // Format date to YYYYMMDDTHHmmSSZ
    const formatICSDate = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    
    const now = formatICSDate(new Date());

    icsContent += "BEGIN:VEVENT\n";
    icsContent += `UID:${event.id}@yoga-schedule-parser\n`;
    icsContent += `DTSTAMP:${now}\n`;
    icsContent += `DTSTART:${formatICSDate(startDate)}\n`;
    icsContent += `DTEND:${formatICSDate(endDate)}\n`;
    icsContent += `SUMMARY:${event.title}\n`;
    
    if (event.description) {
      // Escape newlines for ICS
      const safeDesc = event.description.replace(/\n/g, "\\n");
      icsContent += `DESCRIPTION:${safeDesc}\n`;
    }
    
    if (event.location) {
        icsContent += `LOCATION:${event.location}\n`;
    }

    icsContent += "END:VEVENT\n";
  });

  icsContent += "END:VCALENDAR";
  return icsContent;
};

export const downloadICS = (events: ParsedEvent[]) => {
  const content = generateICS(events);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `schedule_export_${new Date().toISOString().slice(0, 10)}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};