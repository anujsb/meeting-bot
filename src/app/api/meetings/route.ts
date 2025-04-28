import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/auth";
import { getGoogleMeetClient } from "@/lib/googleMeet";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const meetClient = getGoogleMeetClient(session.accessToken) as any;

  try {
    // Example: List spaces
    const response = await meetClient.spaces.list();
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error("Error accessing Google Meet API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}