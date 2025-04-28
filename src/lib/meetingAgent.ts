// src/lib/meetingAgent.ts
import { joinGoogleMeet } from './googleMeet';
import { startTranscription, stopTranscription } from './assemblyAI';

interface MeetingAgentOptions {
  meetingUrl: string;
  userId: string;
  userName: string;
}

interface MeetingSession {
  meetingUrl: string;
  userId: string;
  transcriptionId: string;
  startTime: Date;
  active: boolean;
}

// Store active meeting sessions
const activeSessions = new Map<string, MeetingSession>();

export async function startMeetingAgent({ meetingUrl, userId, userName }: MeetingAgentOptions) {
  try {
    // Check if user already has an active session
    if (activeSessions.has(userId)) {
      throw new Error('User already has an active meeting session');
    }
    
    // Join the Google Meet
    await joinGoogleMeet(meetingUrl);
    
    // Start transcription with AssemblyAI
    const transcriptionId = await startTranscription(meetingUrl);
    
    // Create a session record
    const session: MeetingSession = {
      meetingUrl,
      userId,
      transcriptionId,
      startTime: new Date(),
      active: true
    };
    
    activeSessions.set(userId, session);
    
    return {
      success: true,
      session
    };
  } catch (error) {
    console.error('Failed to start meeting agent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function endMeetingAgent(userId: string) {
  const session = activeSessions.get(userId);
  
  if (!session) {
    throw new Error('No active meeting session found');
  }
  
  try {
    // Stop the transcription
    const transcriptionResult = await stopTranscription(session.transcriptionId);
    
    // Update session status
    session.active = false;
    activeSessions.delete(userId);
    
    return {
      success: true,
      transcription: transcriptionResult,
      meetingDuration: new Date().getTime() - session.startTime.getTime()
    };
  } catch (error) {
    console.error('Failed to end meeting agent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export function getActiveSessions() {
  return Array.from(activeSessions.values());
}