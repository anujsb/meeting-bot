// src/app/api/meetings/leave/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { leaveMeeting, getActiveMeetingBotByUserId } from "@/lib/meetingBot";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.email || "";
    
    // Find user's active meeting bot
    const activeBot = getActiveMeetingBotByUserId(userId);
    
    if (!activeBot) {
      return NextResponse.json({
        success: false,
        error: "You don't have an active meeting bot session"
      }, { status: 404 });
    }
    
    // Leave the meeting
    const result = await leaveMeeting(activeBot.meetingId);
    
    return NextResponse.json({
      success: true,
      message: "Meeting bot has successfully left the meeting",
      transcription: result.transcription,
      meetingDuration: result.meetingDuration,
      meetingUrl: result.meetingUrl
    });
  } catch (error) {
    console.error("Failed to leave meeting:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}