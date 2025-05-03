"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const [meetingLink, setMeetingLink] = useState<string | null>(null);
  const [inputLink, setInputLink] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

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

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Loading...</p>
    </div>;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-3xl font-bold mb-6">Meeting Bot</h1>
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          onClick={() => signIn("google")}
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Welcome, {session.user?.name}</h1>
        <button 
          className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
          onClick={() => signOut()}
        >
          Sign Out
        </button>
      </div>
      
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
                <button 
                  className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded w-full"
                  onClick={joinMeetingWithBot}
                  disabled={isLoading}
                >
                  {isLoading ? "Joining..." : "Join Meeting with Bot"}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 italic">No active meeting. Create or enter a meeting link to get started.</p>
          )}
        </div>
      </div>
    </div>
  );
}