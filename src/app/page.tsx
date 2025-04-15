"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const [meetingLink, setMeetingLink] = useState<string | null>(null);
  const [inputLink, setInputLink] = useState<string>("");

  const createMeeting = async () => {
    const res = await fetch("/api/meetings/create", { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setMeetingLink(data.meetingUri);
    } else {
      console.error("Failed to create meeting");
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

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    return (
      <div>
        <h1>Google Meet OAuth Demo</h1>
        <button onClick={() => signIn("google")}>Sign in with Google</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome, {session.user?.name}</h1>
      <button onClick={createMeeting}>Create New Meeting</button>
      <div>
        <input
          type="text"
          placeholder="Enter existing meeting link"
          value={inputLink}
          onChange={(e) => setInputLink(e.target.value)}
        />
        <button onClick={handleLinkSubmit}>Submit Link</button>
      </div>
      {meetingLink && (
        <p>
          Meeting Link: <a href={meetingLink} target="_blank" rel="noopener noreferrer">{meetingLink}</a>
        </p>
      )}
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}