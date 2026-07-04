import { google } from "googleapis";

let oAuth2Client = null;

// Lazy-load OAuth2 Client
export const getGmailClient = () => {
  if (!oAuth2Client) {
    oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );
    oAuth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
  }
  
  return google.gmail({ version: "v1", auth: oAuth2Client });
};

