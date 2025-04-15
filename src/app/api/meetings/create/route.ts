import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { google } from "googleapis";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: session.accessToken });
  const meet = google.meet({ version: "v2", auth });

  try {
    const response = await meet.spaces.create({});
    const meetingUri = response.data.meetingUri;
    return NextResponse.json({ meetingUri }, { status: 201 });
  } catch (error) {
    console.error("Error creating Google Meet meeting:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}