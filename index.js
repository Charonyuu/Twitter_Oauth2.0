import { Client, auth } from "twitter-api-sdk";
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
// Load environment variables
dotenv.config();

// Initialize the Express application
const app = express();
app.use(bodyParser.json());
// Initialize auth client first
const authClient = new auth.OAuth2User({
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  callback: "http://127.0.0.1:8000/api/auth/twitter/callback", // Replace with your callback URL
  scopes: ["tweet.read", "users.read", "offline.access", "follows.read"],
});

const state = "123123";

// Generate the authorization URL and redirect the user to Twitter for authentication
app.get("/api/auth/twitter", (req, res) => {
  const authUrl = authClient.generateAuthURL({
    state: state, // Use the unique state as the key
    code_challenge_method: "s256",
  });

  console.log("authUrl", authUrl);
  res.redirect(authUrl);
});

// Handle the callback from Twitter
app.get("/api/auth/twitter/callback", async (req, res) => {
  const { code, state } = req.query;
  console.log("code", code, "\n state", state);
  if (!code || !state) {
    return res.status(400).send("Missing code or state");
  }

  try {
    const tokenResponse = await authClient.requestAccessToken(code);
    console.log("Token Response:", tokenResponse);
    // Use the access token to initialize the Twitter client
    const twitterClient = new Client(authClient);

    // You can now use twitterClient to call Twitter API
    // Example: Get authenticated user's profile
    const user = await twitterClient.users.findMyUser();
    console.log("user", user);

    res.send("Authorization successful! You can now close this window.");
  } catch (error) {
    console.error("Error during token exchange:", error);
    if (!res.headersSent) {
      res.status(500).send("Error during token exchange");
    }
  }
});

// Start the Express application
app.listen(8000, () => {
  console.log("Server is running on http://localhost:8000");
});
