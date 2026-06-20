import crypto from "crypto";
import { db } from "./db";
import { pageSections } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

interface CalendarEventData {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  attendees: string[];
}

function base64url(str: string | Buffer): string {
  const buf = typeof str === "string" ? Buffer.from(str) : str;
  return buf.toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function getGoogleAccessToken(): Promise<string> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawPrivateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!email || !rawPrivateKey) {
    throw new Error("Missing Google Service Account environment variables.");
  }

  // Format private key (replace literal \n with real newlines)
  const privateKey = rawPrivateKey.replace(/\\n/g, "\n");

  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: email,
    scope: "https://www.googleapis.com/auth/calendar",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const signatureInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claim))}`;
  
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(signatureInput);
  const signature = sign.sign(privateKey);

  const jwt = `${signatureInput}.${base64url(signature)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(`Google OAuth failed: ${JSON.stringify(errorData)}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function createCalendarEvent(eventData: CalendarEventData) {
  try {
    // 1. Fetch parameters from database
    const configRow = await db.query.pageSections.findFirst({
      where: eq(pageSections.cle, "parametres"),
    });

    const config = (configRow?.contenu as Record<string, unknown>) || {};
    const calendarId = config.google_calendar_id as string | undefined;

    if (!calendarId) {
      console.warn("GOOGLE_CALENDAR_ID is not configured in settings. Skipping Google Calendar event creation.");
      return null;
    }

    const token = await getGoogleAccessToken();

    // Call Google Calendar API to insert event with Meet conference
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1`;

    const body = {
      summary: eventData.title,
      description: eventData.description,
      start: {
        dateTime: eventData.startTime.toISOString(),
        timeZone: "Africa/Abidjan",
      },
      end: {
        dateTime: eventData.endTime.toISOString(),
        timeZone: "Africa/Abidjan",
      },
      attendees: eventData.attendees.map((email) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: `meet_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(`Google Calendar Event API error: ${JSON.stringify(err)}`);
    }

    const event = await response.json();
    
    return {
      eventId: event.id as string,
      meetingUrl: event.conferenceData?.entryPoints?.find((ep: { entryPointType?: string; uri?: string }) => ep.entryPointType === "video")?.uri || event.hangoutLink || "",
      htmlLink: event.htmlLink || "",
    };
  } catch (error) {
    console.error("Error creating Google Calendar Event:", error);
    return null;
  }
}

export async function deleteCalendarEvent(eventId: string) {
  try {
    const configRow = await db.query.pageSections.findFirst({
      where: eq(pageSections.cle, "parametres"),
    });

    const config = (configRow?.contenu as Record<string, unknown>) || {};
    const calendarId = config.google_calendar_id as string | undefined;

    if (!calendarId) return false;

    const token = await getGoogleAccessToken();
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Error deleting Google Calendar Event:", error);
    return false;
  }
}
