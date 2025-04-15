import { google } from "googleapis";

export function getGoogleMeetClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.meet({ version: "v2", auth: oauth2Client });
}