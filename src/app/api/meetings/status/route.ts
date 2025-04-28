// src/app/api/meetings/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getActiveMeetingBotByUserId } from "@/lib/meetingBot";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.email ||"";
    
    // Find user's active meeting bot
    const activeBot = getActiveMeetingBotByUserId(userId);
    
    return NextResponse.json({
      success: true,
      hasActiveSession: !!activeBot,
      meetingInfo: activeBot ? {
        meetingId: activeBot.meetingId,
        meetingUrl: activeBot.meetingUrl,
        startTime: activeBot.startTime
      } : null
    });
  } catch (error) {
    console.error("Failed to get meeting status:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}