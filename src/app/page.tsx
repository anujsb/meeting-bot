// // "use client";

// // import { signIn, signOut, useSession } from "next-auth/react";
// // import { useState } from "react";

// // export default function Home() {
// //   const { data: session, status } = useSession();
// //   const [meetingLink, setMeetingLink] = useState<string | null>(null);
// //   const [inputLink, setInputLink] = useState<string>("");

// //   const createMeeting = async () => {
// //     const res = await fetch("/api/meetings/create", { method: "POST" });
// //     if (res.ok) {
// //       const data = await res.json();
// //       setMeetingLink(data.meetingUri);
// //     } else {
// //       console.error("Failed to create meeting");
// //     }
// //   };

// //   const handleLinkSubmit = () => {
// //     if (inputLink.startsWith("https://meet.google.com/")) {
// //       setMeetingLink(inputLink);
// //       setInputLink(""); // Clear the input field
// //     } else {
// //       alert("Please enter a valid Google Meet link.");
// //     }
// //   };

// //   if (status === "loading") {
// //     return <p>Loading...</p>;
// //   }

// //   if (!session) {
// //     return (
// //       <div>
// //         <h1>Google Meet OAuth Demo</h1>
// //         <button onClick={() => signIn("google")}>Sign in with Google</button>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div>
// //       <h1>Welcome, {session.user?.name}</h1>
// //       <button onClick={createMeeting}>Create New Meeting</button>
// //       <div>
// //         <input
// //           type="text"
// //           placeholder="Enter existing meeting link"
// //           value={inputLink}
// //           onChange={(e) => setInputLink(e.target.value)}
// //         />
// //         <button onClick={handleLinkSubmit}>Submit Link</button>
// //       </div>
// //       {meetingLink && (
// //         <p>
// //           Meeting Link: <a href={meetingLink} target="_blank" rel="noopener noreferrer">{meetingLink}</a>
// //         </p>
// //       )}
// //       <button onClick={() => signOut()}>Sign Out</button>
// //     </div>
// //   );
// // }



// // src/app/page.tsx - Updated version
// "use client";

// import { signIn, signOut, useSession } from "next-auth/react";
// import { useState } from "react";

// export default function Home() {
//   const { data: session, status } = useSession();
//   const [meetingLink, setMeetingLink] = useState<string | null>(null);
//   const [inputLink, setInputLink] = useState<string>("");
//   const [isAgentActive, setIsAgentActive] = useState(false);
//   const [transcription, setTranscription] = useState<any>(null);
//   const [isLoading, setIsLoading] = useState(false);

//   const createMeeting = async () => {
//     const res = await fetch("/api/meetings/create", { method: "POST" });
//     if (res.ok) {
//       const data = await res.json();
//       setMeetingLink(data.meetingUri);
//     } else {
//       console.error("Failed to create meeting");
//     }
//   };

//   const handleLinkSubmit = () => {
//     if (inputLink.startsWith("https://meet.google.com/")) {
//       setMeetingLink(inputLink);
//       setInputLink(""); // Clear the input field
//     } else {
//       alert("Please enter a valid Google Meet link.");
//     }
//   };

//   const joinMeetingWithBot = async () => {
//     if (!meetingLink) return;
    
//     setIsLoading(true);
//     try {
//       const res = await fetch("/api/meetings/join", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ meetingUrl: meetingLink }),
//       });
      
//       if (res.ok) {
//         const data = await res.json();
//         if (data.success) {
//           setIsAgentActive(true);
//           alert("Meeting bot has joined the meeting!");
//         } else {
//           alert(`Failed to join meeting: ${data.error}`);
//         }
//       } else {
//         alert("Failed to join meeting");
//       }
//     } catch (error) {
//       console.error("Failed to join meeting with bot:", error);
//       alert("An error occurred while joining the meeting");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const endMeetingWithBot = async () => {
//     setIsLoading(true);
//     try {
//       const res = await fetch("/api/meetings/end", {
//         method: "POST",
//       });
      
//       if (res.ok) {
//         const data = await res.json();
//         if (data.success) {
//           setIsAgentActive(false);
//           setTranscription(data.transcription);
//           alert("Meeting bot has left the meeting!");
//         } else {
//           alert(`Failed to end meeting: ${data.error}`);
//         }
//       } else {
//         alert("Failed to end meeting");
//       }
//     } catch (error) {
//       console.error("Failed to end meeting with bot:", error);
//       alert("An error occurred while ending the meeting");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (status === "loading") {
//     return <p>Loading...</p>;
//   }

//   if (!session) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen p-4">
//         <h1 className="text-3xl font-bold mb-6">Meeting Bot</h1>
//         <button 
//           className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
//           onClick={() => signIn("google")}
//         >
//           Sign in with Google
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-4">
//       <h1 className="text-3xl font-bold mb-6">Welcome, {session.user?.name}</h1>
      
//       <div className="mb-6">
//         <button 
//           className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded mr-4"
//           onClick={createMeeting}
//         >
//           Create New Meeting
//         </button>
//         <button 
//           className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
//           onClick={() => signOut()}
//         >
//           Sign Out
//         </button>
//       </div>
      
//       <div className="mb-6 flex items-center">
//         <input
//           type="text"
//           placeholder="Enter existing meeting link"
//           value={inputLink}
//           onChange={(e) => setInputLink(e.target.value)}
//           className="border rounded p-2 mr-2 flex-grow"
//         />
//         <button 
//           className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
//           onClick={handleLinkSubmit}
//         >
//           Submit Link
//         </button>
//       </div>
      
//       {meetingLink && (
//         <div className="mb-6 p-4 border rounded bg-gray-50">
//           <p className="mb-2">
//             <strong>Meeting Link:</strong> <a href={meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{meetingLink}</a>
//           </p>
          
//           <div className="mt-4">
//             {!isAgentActive ? (
//               <button 
//                 className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"
//                 onClick={joinMeetingWithBot}
//                 disabled={isLoading}
//               >
//                 {isLoading ? "Joining..." : "Join Meeting with Bot"}
//               </button>
//             ) : (
//               <button 
//                 className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded"
//                 onClick={endMeetingWithBot}
//                 disabled={isLoading}
//               >
//                 {isLoading ? "Ending..." : "End Meeting with Bot"}
//               </button>
//             )}
//           </div>
//         </div>
//       )}
      
//       {transcription && (
//         <div className="border rounded p-4 bg-white">
//           <h2 className="text-xl font-bold mb-4">Meeting Transcription</h2>
          
//           <div className="mb-4">
//             <h3 className="text-lg font-semibold">Full Transcript</h3>
//             <p className="whitespace-pre-wrap">{transcription.transcript}</p>
//           </div>
          
//           {transcription.speakers && transcription.speakers.length > 0 && (
//             <div className="mb-4">
//               <h3 className="text-lg font-semibold">Speaker Timeline</h3>
//               <div className="max-h-60 overflow-y-auto border p-2">
//                 {transcription.speakers.map((item: any, idx: number) => (
//                   <div key={idx} className="mb-2 pb-2 border-b last:border-b-0">
//                     <p className="font-medium">Speaker {item.speaker}</p>
//                     <p>{item.text}</p>
//                     <p className="text-sm text-gray-500">
//                       {new Date(item.timestamp).toLocaleTimeString()}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
          
//           {transcription.summary && (
//             <div className="mb-4">
//               <h3 className="text-lg font-semibold">Summary</h3>
//               <p>{transcription.summary}</p>
//             </div>
//           )}
          
//           {transcription.topics && Object.keys(transcription.topics).length > 0 && (
//             <div>
//               <h3 className="text-lg font-semibold">Topics Discussed</h3>
//               <ul className="list-disc pl-5">
//                 {Object.entries(transcription.topics).map(([topic, confidence]: [string, any]) => (
//                   <li key={topic}>{topic} ({(confidence * 100).toFixed(1)}%)</li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }


// src/app/page.tsx
"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";

interface TranscriptSegment {
  text: string;
  speaker: string;
  timestamp_start: number;
  timestamp_end: number;
}

interface Transcription {
  transcript: string;
  speakers: TranscriptSegment[];
  summary?: string;
}

interface MeetingDuration {
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Home() {
  const { data: session, status } = useSession();
  const [meetingLink, setMeetingLink] = useState<string | null>(null);
  const [inputLink, setInputLink] = useState<string>("");
  const [isAgentActive, setIsAgentActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcription, setTranscription] = useState<Transcription | null>(null);
  const [meetingDuration, setMeetingDuration] = useState<MeetingDuration | null>(null);

  // Check if user has an active meeting session on load
  useEffect(() => {
    if (session) {
      checkMeetingStatus();
    }
  }, [session]);

  const checkMeetingStatus = async () => {
    try {
      const res = await fetch("/api/meetings/status");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.hasActiveSession) {
          setIsAgentActive(true);
          if (data.meetingInfo?.meetingUrl) {
            setMeetingLink(data.meetingInfo.meetingUrl);
          }
        }
      }
    } catch (error) {
      console.error("Failed to check meeting status:", error);
    }
  };

  const createMeeting = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/meetings/create", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setMeetingLink(data.meetingUri);
      } else {
        console.error("Failed to create meeting");
        alert("Failed to create meeting. Please try again.");
      }
    } catch (error) {
      console.error("Error creating meeting:", error);
      alert("An error occurred while creating the meeting.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkSubmit = () => {
    if (inputLink.startsWith("https://meet.google.com/")) {
      setMeetingLink(inputLink);
      setInputLink(""); // Clear the input field
    } else {
      alert("Please enter a valid Google Meet link.");
    }
  };

  const joinMeetingWithBot = async () => {
    if (!meetingLink) return;
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/meetings/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ meetingUrl: meetingLink }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setIsAgentActive(true);
        alert("Meeting bot has joined the meeting!");
      } else {
        alert(`Failed to join meeting: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Failed to join meeting with bot:", error);
      alert("An error occurred while joining the meeting");
    } finally {
      setIsLoading(false);
    }
  };

  const leaveMeetingWithBot = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/meetings/leave", {
        method: "POST",
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setIsAgentActive(false);
        if (data.transcription) {
          setTranscription(data.transcription);
        }
        if (data.meetingDuration) {
          setMeetingDuration(data.meetingDuration);
        }
        alert("Meeting bot has left the meeting!");
      } else {
        alert(`Failed to leave meeting: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Failed to leave meeting with bot:", error);
      alert("An error occurred while leaving the meeting");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Loading...</p>
    </div>;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-3xl font-bold mb-6">Meeting Bot</h1>
        <p className="mb-6 text-gray-600">Sign in to create or join meetings with your AI assistant</p>
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg font-medium"
          onClick={() => signIn("google")}
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <header className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">Meeting Bot</h1>
          <p className="text-gray-600">Hello, {session.user?.name}</p>
        </div>
        <button 
          className="bg-red-500 hover:bg-red-600 text-white py-1 px-4 rounded"
          onClick={() => signOut()}
        >
          Sign Out
        </button>
      </header>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg border shadow-sm">
            <h2 className="text-lg font-medium mb-3">Create New Meeting</h2>
            <button 
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded w-full"
              onClick={createMeeting}
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Google Meet"}
            </button>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border shadow-sm">
            <h2 className="text-lg font-medium mb-3">Or Use Existing Meeting</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Google Meet link"
                value={inputLink}
                onChange={(e) => setInputLink(e.target.value)}
                className="border rounded p-2 flex-grow"
              />
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                onClick={handleLinkSubmit}
              >
                Use Link
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border shadow-sm">
          <h2 className="text-lg font-medium mb-3">Meeting Status</h2>
          {meetingLink ? (
            <div>
              <p className="mb-2">
                <span className="font-medium">Meeting Link:</span>{" "}
                <a 
                  href={meetingLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline break-all"
                >
                  {meetingLink}
                </a>
              </p>
              
              <div className="mt-4">
                {!isAgentActive ? (
                  <button 
                    className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded w-full"
                    onClick={joinMeetingWithBot}
                    disabled={isLoading}
                  >
                    {isLoading ? "Joining..." : "Join Meeting with Bot"}
                  </button>
                ) : (
                  <button 
                    className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded w-full"
                    onClick={leaveMeetingWithBot}
                    disabled={isLoading}
                  >
                    {isLoading ? "Leaving..." : "End Meeting with Bot"}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-600 italic">No active meeting. Create or enter a meeting link to get started.</p>
          )}
        </div>
      </div>
      
      {transcription && (
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h2 className="text-xl font-bold mb-4">Meeting Summary</h2>
          
          {meetingDuration && (
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="font-medium">Meeting Duration: {meetingDuration.hours}h {meetingDuration.minutes}m {meetingDuration.seconds}s</p>
            </div>
          )}
          
          {transcription.summary && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Summary</h3>
              <p className="mt-2 p-3 bg-blue-50 rounded">{transcription.summary}</p>
            </div>
          )}
          
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Full Transcript</h3>
            <div className="mt-2 p-3 bg-gray-50 rounded max-h-60 overflow-y-auto">
              <p className="whitespace-pre-wrap">{transcription.transcript}</p>
            </div>
          </div>
          
          {transcription.speakers && transcription.speakers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold">Speaker Timeline</h3>
              <div className="mt-2 max-h-80 overflow-y-auto border rounded divide-y">
                {transcription.speakers.map((segment, idx) => (
                  <div key={idx} className="p-3 hover:bg-gray-50">
                    <div className="flex justify-between">
                      <span className="font-medium">{segment.speaker}</span>
                      <span className="text-sm text-gray-500">
                        {formatTime(segment.timestamp_start)}
                      </span>
                    </div>
                    <p>{segment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}