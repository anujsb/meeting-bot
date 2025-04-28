// src/lib/meetingBot.ts
import puppeteer, { Browser, Page } from 'puppeteer';
import { startTranscription, stopTranscription, sendAudioChunk } from './assemblyAI';

interface MeetingBot {
  meetingId: string;
  meetingUrl: string;
  browser?: Browser;
  page?: Page;
  transcriptionId?: string;
  startTime: Date;
  isActive: boolean;
  userId: string;
}

// Store active meeting bots
const activeBots = new Map<string, MeetingBot>();

export async function joinMeeting(meetingUrl: string, userId: string): Promise<string> {
  try {
    console.log(`[MeetingBot] Joining meeting: ${meetingUrl}`);
    
    // Generate a meeting ID
    const meetingId = `meeting-${Date.now()}`;
    
    // Create a new bot instance
    const bot: MeetingBot = {
      meetingId,
      meetingUrl,
      startTime: new Date(),
      isActive: true,
      userId
    };
    
    // Launch browser
    const browser = await puppeteer.launch({
      headless: false, // Set to true in production
      args: [
        '--use-fake-ui-for-media-stream', // Auto-accept camera/mic permissions
        '--disable-setuid-sandbox',
        '--no-sandbox',
        '--disable-web-security'
      ]
    });
    
    bot.browser = browser;
    
    // Open a new page
    const page = await browser.newPage();
    bot.page = page;
    
    // Allow microphone access
    await page.evaluateOnNewDocument(() => {
      // Mock getUserMedia
      const originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      navigator.mediaDevices.getUserMedia = async (constraints) => {
        // Create fake audio stream
        const tracks = [new MediaStreamTrack()];
        const stream = new MediaStream(tracks);
        return stream;
      };
    });
    
    // Navigate to meeting URL
    await page.goto(meetingUrl, { waitUntil: 'networkidle2' });
    
    // Handle Google login if needed
    if (await page.$('input[type="email"]')) {
      console.log('[MeetingBot] Google login required, but bot cannot authenticate automatically');
      throw new Error('Google login required. Bot cannot authenticate automatically.');
    }
    
    // Wait for meeting page to load
    await page.waitForSelector('div[role="button"]', { timeout: 30000 });
    
    // Disable camera and mic before joining
    await page.evaluate(() => {
      // Find and click buttons to disable camera and mic
      const buttons = Array.from(document.querySelectorAll('div[role="button"]'));
      
      for (const button of buttons) {
        const ariaLabel = button.getAttribute('aria-label') || '';
        if (ariaLabel.includes('camera') && !ariaLabel.includes('off')) {
          (button as HTMLElement).click();
        }
        if (ariaLabel.includes('microphone') && !ariaLabel.includes('off')) {
          (button as HTMLElement).click();
        }
      }
    });
    
    // Click "Join now" button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const joinButton = buttons.find(button => {
        const text = button.textContent?.toLowerCase() || '';
        return text.includes('join now') || text.includes('join meeting');
      });
      
      if (joinButton) {
        (joinButton as HTMLElement).click();
      }
    });
    
    // Wait for meeting to load completely - try multiple selectors
    try {
      await Promise.race([
        page.waitForSelector('[data-self-name]', { timeout: 60000 }),
        page.waitForSelector('[data-meeting-code]', { timeout: 60000 }),
        page.waitForSelector('div[role="main"]', { timeout: 60000 }),
        page.waitForSelector('div[role="presentation"]', { timeout: 60000 })
      ]);
      
      console.log('[MeetingBot] Successfully joined meeting');
    } catch (error) {
      console.error('[MeetingBot] Failed to detect meeting load:', error);
      // Check if we're actually in the meeting by looking for common meeting elements
      const isInMeeting = await page.evaluate(() => {
        return !!(
          document.querySelector('[data-self-name]') ||
          document.querySelector('[data-meeting-code]') ||
          document.querySelector('div[role="main"]') ||
          document.querySelector('div[role="presentation"]')
        );
      });
      
      if (!isInMeeting) {
        throw new Error('Failed to join meeting: Could not detect meeting interface');
      }
      
      console.log('[MeetingBot] Meeting appears to be loaded despite selector timeout');
    }
    
    // Start AssemblyAI transcription
    const transcriptionId = await startTranscription(meetingId);
    bot.transcriptionId = transcriptionId;
    
    // Set up audio capture
    await page.evaluate(() => {
      // In a real implementation, we would capture audio from the meeting
      // This is a simplified implementation
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const destination = audioContext.createMediaStreamDestination();
      
      // Capture audio from the meeting (this is simplified)
      // In a real implementation, you'd need to access the audio elements in the page
      
      // Process and send audio to server
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processor.onaudioprocess = (e) => {
        const audioData = e.inputBuffer.getChannelData(0);
        // Send audio data to server (would need WebSocket or other mechanism)
      };
    });
    
    // Store bot instance
    activeBots.set(meetingId, bot);
    
    return meetingId;
  } catch (error) {
    console.error('[MeetingBot] Failed to join meeting:', error);
    throw error;
  }
}

export async function leaveMeeting(meetingId: string): Promise<any> {
  const bot = activeBots.get(meetingId);
  
  if (!bot) {
    throw new Error(`No meeting bot found with ID: ${meetingId}`);
  }
  
  try {
    console.log(`[MeetingBot] Leaving meeting: ${bot.meetingUrl}`);
    
    // Click on leave meeting button if page is still open
    if (bot.page) {
      await bot.page.evaluate(() => {
        const leaveButton = Array.from(document.querySelectorAll('button')).find(button => {
          const text = button.textContent?.toLowerCase() || '';
          return text.includes('leave') || text.includes('hangup') || text.includes('end');
        });
        
        if (leaveButton) {
          (leaveButton as HTMLElement).click();
        }
      });
    }
    
    // Close the browser
    if (bot.browser) {
      await bot.browser.close();
    }
    
    // Stop transcription and get results
    let transcriptionResult;
    if (bot.transcriptionId) {
      transcriptionResult = await stopTranscription(bot.transcriptionId);
    }
    
    // Mark bot as inactive
    bot.isActive = false;
    
    // Remove from active bots after a delay (to allow for any pending operations)
    setTimeout(() => {
      activeBots.delete(meetingId);
    }, 5000);
    
    // Calculate meeting duration
    const endTime = new Date();
    const durationMs = endTime.getTime() - bot.startTime.getTime();
    const duration = {
      hours: Math.floor(durationMs / (1000 * 60 * 60)),
      minutes: Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((durationMs % (1000 * 60)) / 1000)
    };
    
    return {
      transcription: transcriptionResult,
      meetingDuration: duration,
      meetingUrl: bot.meetingUrl
    };
  } catch (error) {
    console.error('[MeetingBot] Failed to leave meeting:', error);
    throw error;
  }
}

export function getActiveMeetingBot(meetingId: string): MeetingBot | undefined {
  return activeBots.get(meetingId);
}

export function getActiveMeetingBotByUserId(userId: string): MeetingBot | undefined {
  return Array.from(activeBots.values()).find(bot => bot.userId === userId && bot.isActive);
}

export function getAllActiveMeetingBots(): MeetingBot[] {
  return Array.from(activeBots.values());
}