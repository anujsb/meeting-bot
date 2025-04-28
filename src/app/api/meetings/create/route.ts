// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../../auth/[...nextauth]/route";
// import { google } from "googleapis";

// export async function POST(req: NextRequest) {
//   const session = await getServerSession(authOptions);

//   if (!session || !session.accessToken) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const auth = new google.auth.OAuth2();
//   auth.setCredentials({ access_token: session.accessToken });
//   const meet = google.meet({ version: "v2", auth });

//   try {
//     const response = await meet.spaces.create({});
//     const meetingUri = response.data.meetingUri;
//     return NextResponse.json({ meetingUri }, { status: 201 });
//   } catch (error) {
//     console.error("Error creating Google Meet meeting:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }


// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../../auth/[...nextauth]/route";
// import { google } from "googleapis";

// export async function POST(req: NextRequest) {
//   const session = await getServerSession(authOptions);

//   if (!session || !session.accessToken) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const auth = new google.auth.OAuth2();
//   auth.setCredentials({ access_token: session.accessToken });
//   const meet = google.meet({ version: "v2", auth });

//   try {
//     const response = await meet.spaces.create({});
//     const meetingUri = response.data.meetingUri;
//     return NextResponse.json({ meetingUri }, { status: 201 });
//   } catch (error) {
//     console.error("Error creating Google Meet meeting:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth";
import { google } from "googleapis";
// import NextAuth from "next-auth";
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: string;
  }
}
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if there was a token refresh error
  if (session.error === "RefreshAccessTokenError") {
    return NextResponse.json(
      { error: "Your session has expired. Please sign in again." },
      { status: 401 }
    );
  }

  try {
    // Initialize the Google Calendar API client
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    auth.setCredentials({ 
      access_token: session.accessToken,
      token_type: 'Bearer'
    });
    
    const calendar = google.calendar({ version: "v3", auth });
    
    // Create a calendar event with a Google Meet link
    const now = new Date();
    const endTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later
    
    const event = {
      summary: "Google Meet with tl;dv",
      start: { dateTime: now.toISOString(), timeZone: "UTC" },
      end: { dateTime: endTime.toISOString(), timeZone: "UTC" },
      attendees: [{ email: "bot@tldv.io" }],
      // This will automatically create a Google Meet link
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" }
        }
      }
    };
    
    const calendarResponse = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      conferenceDataVersion: 1 // Required for creating Meet links
    });

    // Extract the Meet link from the response
    const meetingUri = calendarResponse.data.hangoutLink || 
                      calendarResponse.data.conferenceData?.entryPoints?.[0]?.uri;
    
    if (!meetingUri) {
      throw new Error("Failed to get meeting URI from calendar response");
    }

    return NextResponse.json(
      { meetingUri, eventId: calendarResponse.data.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating Google Meet meeting:", error);
    
    // Check if the error is due to invalid credentials
    if (error.code === 401 || error.status === 401) {
      return NextResponse.json(
        { error: "Your session has expired. Please sign in again." },
        { status: 401 }
      );
    }
    
    // Provide more detailed error information
    const errorMessage = error.response?.data?.error?.message || error.message || "Unknown error";
    const statusCode = error.response?.status || 500;
    
    return NextResponse.json(
      { error: `Failed to create meeting: ${errorMessage}` }, 
      { status: statusCode }
    );
  }
}