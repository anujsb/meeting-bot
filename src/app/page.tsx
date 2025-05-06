// "use client";

// import { signIn, signOut, useSession } from "next-auth/react";
// import { useState } from "react";

// export default function Home() {
//   const { data: session, status } = useSession();
//   const [meetingLink, setMeetingLink] = useState<string | null>(null);
//   const [inputLink, setInputLink] = useState<string>("");
//   const [isLoading, setIsLoading] = useState(false);

//   const createMeeting = async () => {
//     setIsLoading(true);
//     try {
//       const res = await fetch("/api/meetings/create", { method: "POST" });
//       if (res.ok) {
//         const data = await res.json();
//         setMeetingLink(data.meetingUri);
//       } else {
//         console.error("Failed to create meeting");
//         alert("Failed to create meeting. Please try again.");
//       }
//     } catch (error) {
//       console.error("Error creating meeting:", error);
//       alert("An error occurred while creating the meeting.");
//     } finally {
//       setIsLoading(false);
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
      
//       const data = await res.json();
      
//       if (res.ok && data.success) {
//         alert("Meeting bot has joined the meeting!");
//       } else {
//         alert(`Failed to join meeting: ${data.error || "Unknown error"}`);
//       }
//     } catch (error) {
//       console.error("Failed to join meeting with bot:", error);
//       alert("An error occurred while joining the meeting");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (status === "loading") {
//     return <div className="flex items-center justify-center min-h-screen">
//       <p className="text-lg">Loading...</p>
//     </div>;
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
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Welcome, {session.user?.name}</h1>
//         <button 
//           className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
//           onClick={() => signOut()}
//         >
//           Sign Out
//         </button>
//       </div>
      
//       <div className="grid md:grid-cols-2 gap-4">
//         <div className="space-y-4">
//           <div className="bg-gray-50 p-4 rounded-lg border shadow-sm">
//             <h2 className="text-lg font-medium mb-3">Create New Meeting</h2>
//             <button 
//               className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded w-full"
//               onClick={createMeeting}
//               disabled={isLoading}
//             >
//               {isLoading ? "Creating..." : "Create Google Meet"}
//             </button>
//           </div>
          
//           <div className="bg-gray-50 p-4 rounded-lg border shadow-sm">
//             <h2 className="text-lg font-medium mb-3">Or Use Existing Meeting</h2>
//             <div className="flex gap-2">
//               <input
//                 type="text"
//                 placeholder="Enter Google Meet link"
//                 value={inputLink}
//                 onChange={(e) => setInputLink(e.target.value)}
//                 className="border rounded p-2 flex-grow"
//               />
//               <button 
//                 className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
//                 onClick={handleLinkSubmit}
//               >
//                 Use Link
//               </button>
//             </div>
//           </div>
//         </div>
        
//         <div className="bg-gray-50 p-4 rounded-lg border shadow-sm">
//           <h2 className="text-lg font-medium mb-3">Meeting Status</h2>
//           {meetingLink ? (
//             <div>
//               <p className="mb-2">
//                 <span className="font-medium">Meeting Link:</span>{" "}
//                 <a 
//                   href={meetingLink} 
//                   target="_blank" 
//                   rel="noopener noreferrer" 
//                   className="text-blue-600 hover:underline break-all"
//                 >
//                   {meetingLink}
//                 </a>
//               </p>
              
//               <div className="mt-4">
//                 <button 
//                   className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded w-full"
//                   onClick={joinMeetingWithBot}
//                   disabled={isLoading}
//                 >
//                   {isLoading ? "Joining..." : "Join Meeting with Bot"}
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <p className="text-gray-600 italic">No active meeting. Create or enter a meeting link to get started.</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MoonIcon, SunIcon, LogOutIcon, LogInIcon, PlusIcon, LinkIcon, BotIcon, MicIcon } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"
import { toast } from "sonner"

import { cn } from "@/lib/utils"

export default function Home() {
  const { data: session, status } = useSession()
  const [meetingLink, setMeetingLink] = useState<string | null>(null)
  const [inputLink, setInputLink] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  // const { toast } = useToast()

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  const createMeeting = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/meetings/create", { method: "POST" })
      if (res.ok) {
        const data = await res.json()
        setMeetingLink(data.meetingUri)
        // toast({
        //   title: "Meeting Created",
        //   description: "Your Google Meet link is ready to use",
        //   variant: "default",
        // })
        toast("Meeting Created.")

      } else {
        console.error("Failed to create meeting")
        // toast({
        //   title: "Failed to create meeting",
        //   description: "Please try again later",
        //   variant: "destructive",
        // })
        toast("Failed to create meeting.")
      }
    } catch (error) {
      console.error("Error creating meeting:", error)
      // toast({
      //   title: "Error",
      //   description: "An error occurred while creating the meeting",
      //   variant: "destructive",
      // })
      toast("Error creating meeting.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLinkSubmit = () => {
    if (inputLink.startsWith("https://meet.google.com/")) {
      setMeetingLink(inputLink)
      setInputLink("") // Clear the input field
      // toast({
      //   title: "Meeting Link Added",
      //   description: "Your Google Meet link has been added successfully",
      //   variant: "default",
      // })
      toast("Meeting Link Added.")
    } else {
      // toast({
      //   title: "Invalid Link",
      //   description: "Please enter a valid Google Meet link",
      //   variant: "destructive",
      // })
      toast("Invalid Link.")
    }
  }

  const joinMeetingWithBot = async () => {
    if (!meetingLink) return

    setIsLoading(true)
    try {
      const res = await fetch("/api/meetings/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ meetingUrl: meetingLink }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        // toast({
        //   title: "Success",
        //   description: "Meeting bot has joined the meeting!",
        //   variant: "default",
        // })
        toast("Meeting bot has joined the meeting!")
      } else {
        // toast({
        //   title: "Failed to join meeting",
        //   description: data.error || "Unknown error",
        //   variant: "destructive",
        // })
        toast("Failed to join meeting.")
      }
    } catch (error) {
      console.error("Failed to join meeting with bot:", error)
      // toast({
      //   title: "Error",
      //   description: "An error occurred while joining the meeting",
      //   variant: "destructive",
      // })
      toast("Error joining meeting.")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div
        className={cn(
          "flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/50 p-4",
          isDarkMode ? "dark" : "",
        )}
      >
        <div className="absolute top-4 right-4">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </Button>
        </div>

        <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-background/80 shadow-xl border-muted">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <div className="relative">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 blur opacity-75"></div>
                <div className="relative bg-background rounded-full p-4">
                  <BotIcon className="h-10 w-10 text-primary" />
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Meeting Bot</CardTitle>
            <CardDescription>Your AI assistant for Google Meet meetings</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative w-full max-w-sm">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg blur opacity-25"></div>
              <Button
                className="relative w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                onClick={() => signIn("google")}
              >
                <LogInIcon className="mr-2 h-4 w-4" />
                Sign in with Google
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            Sign in to create and manage your meetings
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("min-h-screen bg-gradient-to-b from-background to-muted/30", isDarkMode ? "dark" : "")}>
      <header className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 blur opacity-75"></div>
              <div className="relative bg-background rounded-full p-2">
                <BotIcon className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h1 className="text-xl font-bold">Meeting Bot</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </Button>

            <div className="flex items-center gap-2">
              {session.user?.image && (
                <img
                  src={session.user.image || "/placeholder.svg"}
                  alt={session.user?.name || "User"}
                  className="h-8 w-8 rounded-full border border-border"
                />
              )}
              <span className="hidden md:inline font-medium">{session.user?.name}</span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut()}
              className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
            >
              <LogOutIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8 shadow-lg border-muted bg-background/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Meeting Dashboard</CardTitle>
              <CardDescription>Create or join a Google Meet session with your AI assistant</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="create" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="create">Create Meeting</TabsTrigger>
                  <TabsTrigger value="existing">Use Existing Meeting</TabsTrigger>
                </TabsList>

                <TabsContent value="create" className="space-y-4">
                  <div className="bg-muted/40 p-6 rounded-lg border border-border">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <PlusIcon className="mr-2 h-5 w-5 text-primary" />
                      Create New Google Meet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Generate a new Google Meet link that you can share with participants.
                    </p>
                    <div className="relative max-w-sm mx-auto">
                      <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg blur opacity-25"></div>
                      <Button
                        className="relative w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                        onClick={createMeeting}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                            Creating...
                          </>
                        ) : (
                          <>Create Google Meet</>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="existing" className="space-y-4">
                  <div className="bg-muted/40 p-6 rounded-lg border border-border">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <LinkIcon className="mr-2 h-5 w-5 text-primary" />
                      Use Existing Meeting Link
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Enter an existing Google Meet link to connect your AI assistant.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
                      <Input
                        type="text"
                        placeholder="https://meet.google.com/..."
                        value={inputLink}
                        onChange={(e) => setInputLink(e.target.value)}
                        className="flex-grow"
                      />
                      <Button onClick={handleLinkSubmit} className="whitespace-nowrap">
                        Use Link
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-muted bg-background/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Meeting Status</CardTitle>
                  <CardDescription>Current meeting information and controls</CardDescription>
                </div>
                {meetingLink && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                    Active
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {meetingLink ? (
                <div className="space-y-6">
                  <div className="p-4 rounded-lg border border-border bg-muted/40">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Meeting Link</h3>
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="bg-primary/10 text-primary p-2 rounded">
                        <LinkIcon className="h-4 w-4" />
                      </div>
                      <a
                        href={meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate"
                      >
                        {meetingLink}
                      </a>
                    </div>
                  </div>

                  <div className="bg-muted/40 p-6 rounded-lg border border-border">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-purple-500/10 p-2 rounded-full">
                        <MicIcon className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">AI Assistant</h3>
                        <p className="text-sm text-muted-foreground">
                          Join the meeting with your AI assistant to transcribe and analyze the conversation
                        </p>
                      </div>
                    </div>

                    <div className="relative max-w-sm mx-auto">
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-25"></div>
                      <Button
                        className="relative w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                        onClick={joinMeetingWithBot}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                            Joining...
                          </>
                        ) : (
                          <>
                            <BotIcon className="mr-2 h-4 w-4" />
                            Join Meeting with Bot
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-muted/60 p-4 rounded-full mb-4">
                    <LinkIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Active Meeting</h3>
                  <p className="text-muted-foreground max-w-md">
                    Create a new meeting or enter an existing Google Meet link to get started with your AI assistant.
                  </p>
                </div>
              )}
            </CardContent>
            {meetingLink && (
              <CardFooter className="border-t border-border pt-6">
                <div className="w-full flex justify-between items-center">
                  <Button variant="outline" onClick={() => window.open(meetingLink, "_blank")}>
                    Open in Browser
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    onClick={() => setMeetingLink(null)}
                  >
                    Clear Meeting
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}
