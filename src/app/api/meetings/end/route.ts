// src/app/api/meetings/end/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { endMeetingAgent } from '@/lib/meetingAgent';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.email || '';
    const result = await endMeetingAgent(userId);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Meeting agent ended successfully',
        transcription: result.transcription,
        meetingDuration: result.meetingDuration
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error ending meeting agent:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}