// src/lib/assemblyAI.ts
import WebSocket from 'ws';

interface TranscriptSegment {
  text: string;
  speaker: string;
  timestamp_start: number;
  timestamp_end: number;
}

interface TranscriptionResult {
  transcript: string;
  speakers: TranscriptSegment[];
  summary?: string;
  topics?: Record<string, number>;
}

interface TranscriptionSession {
  sessionId: string;
  socket?: WebSocket;
  audioStream?: any;
  transcript: TranscriptSegment[];
  isActive: boolean;
}

// Store active transcription sessions
const activeSessions = new Map<string, TranscriptionSession>();

export async function startTranscription(meetingId: string): Promise<string> {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('AssemblyAI API key is not configured');
  }
  
  // Generate a unique session ID
  const sessionId = `${meetingId}-${Date.now()}`;
  
  // Create a new transcription session
  const session: TranscriptionSession = {
    sessionId,
    transcript: [],
    isActive: true
  };
  
  // Create a WebSocket connection to AssemblyAI
  const socket = new WebSocket('wss://api.assemblyai.com/v2/realtime/ws', {
    headers: {
      Authorization: apiKey
    }
  });
  
  session.socket = socket;
  
  // Set up WebSocket event handlers
  socket.on('open', () => {
    console.log(`[AssemblyAI] WebSocket connection established for session ${sessionId}`);
    
    // Configure the real-time transcription
    socket.send(JSON.stringify({
      sample_rate: 16000,
      word_boost: ["meeting", "agenda", "action item", "decision", "follow up"],
      speaker_labels: true,
      punctuate: true,
      format_text: true
    }));
  });
  
  socket.on('message', (message: WebSocket.Data) => {
    const data = JSON.parse(message.toString());
    
    // Handle different message types
    if (data.message_type === 'SessionBegins') {
      console.log(`[AssemblyAI] Session ${sessionId} began`);
    } else if (data.message_type === 'PartialTranscript' || data.message_type === 'FinalTranscript') {
      if (data.text && data.speaker) {
        // Add the transcript segment to our session
        session.transcript.push({
          text: data.text,
          speaker: `Speaker ${data.speaker}`,
          timestamp_start: data.timestamp_start,
          timestamp_end: data.timestamp_end
        });
      }
    }
  });
  
  socket.on('error', (error) => {
    console.error(`[AssemblyAI] WebSocket error for session ${sessionId}:`, error);
  });
  
  socket.on('close', () => {
    console.log(`[AssemblyAI] WebSocket connection closed for session ${sessionId}`);
    session.isActive = false;
  });
  
  // Store the session
  activeSessions.set(sessionId, session);
  
  return sessionId;
}

export async function sendAudioChunk(sessionId: string, audioChunk: Buffer): Promise<void> {
  const session = activeSessions.get(sessionId);
  
  if (!session || !session.socket || !session.isActive) {
    throw new Error(`No active transcription session found with ID: ${sessionId}`);
  }
  
  // Send audio data to AssemblyAI
  if (session.socket.readyState === WebSocket.OPEN) {
    session.socket.send(audioChunk);
  }
}

export async function stopTranscription(sessionId: string): Promise<TranscriptionResult> {
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    throw new Error(`No transcription session found with ID: ${sessionId}`);
  }
  
  // Close the WebSocket connection
  if (session.socket && session.socket.readyState === WebSocket.OPEN) {
    session.socket.close();
  }
  
  // Mark the session as inactive
  session.isActive = false;
  
  // Process and organize the transcript
  const fullTranscript = session.transcript
    .map(segment => segment.text)
    .join(' ');
  
  // Create a simple summary (in a real implementation, you'd use AssemblyAI's 
  // summarization endpoint or another NLP service)
  const summary = fullTranscript.length > 1000 
    ? `${fullTranscript.substring(0, 500)}...` 
    : fullTranscript;
  
  // Clean up
  activeSessions.delete(sessionId);
  
  return {
    transcript: fullTranscript,
    speakers: session.transcript,
    summary
  };
}

export function getActiveSession(sessionId: string): TranscriptionSession | undefined {
  return activeSessions.get(sessionId);
}

export function getAllActiveSessions(): TranscriptionSession[] {
  return Array.from(activeSessions.values());
}