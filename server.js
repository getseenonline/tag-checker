// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 8080;

// Handle ESM path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// ✅ Root route to serve your Tag Checker app
app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "public", "tag-checker-v2.html");
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(500).send("Error loading page");
    }
  });
});

// ✅ API route to fetch contacts from GoHighLevel
app.post("/contacts", async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) {
      return res.status(400).json({ error: "Missing API key" });
    }

    console.log("🔑 Fetching contacts using API key...");

    // Call GoHighLevel API
    const response = await fetch("https://rest.gohighlevel.com/v1/contacts/", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ GHL API Error:", errorText);
      return res
        .status(response.status)
        .json({ error: "Failed to fetch from GHL", details: errorText });
    }

    const data = await response.json();
    console.log("✅ Contacts fetched:", data.contacts?.length || 0);

    res.json({ contacts: data.contacts || [] });
  } catch (error) {
    console.error("🔥 Server Error fetching contacts:", error);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

// ✅ Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).send("Server is running successfully!");
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running successfully on port ${PORT}`);
});
