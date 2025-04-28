// src/app/api/meetings/join/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { joinMeeting, getActiveMeetingBotByUserId } from "@/lib/meetingBot";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.email || "";
    
    // Check if user already has an active meeting bot
    const existingBot = getActiveMeetingBotByUserId(userId);
    if (existingBot) {
      return NextResponse.json({
        success: false,
        error: "You already have an active meeting bot. Please end that session first."
      }, { status: 400 });
    }
    
    // Get meeting URL from request body
    const { meetingUrl } = await req.json();
    
    if (!meetingUrl || typeof meetingUrl !== 'string') {
      return NextResponse.json({ 
        success: false,
        error: "Meeting URL is required" 
      }, { status: 400 });
    }
    
    // Validate that it's a Google Meet URL
    if (!meetingUrl.startsWith('https://meet.google.com/')) {
      return NextResponse.json({
        success: false,
        error: "Invalid Google Meet URL. URL must start with 'https://meet.google.com/'"
      }, { status: 400 });
    }
    
    // Join the meeting
    const meetingId = await joinMeeting(meetingUrl, userId);
    
    return NextResponse.json({
      success: true,
      message: "Meeting bot has successfully joined the meeting",
      meetingId
    });
  } catch (error) {
    console.error("Failed to join meeting:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}