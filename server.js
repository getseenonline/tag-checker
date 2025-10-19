// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 8080;

// Fix for ES module path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (HTML, images, etc.)
app.use(express.static(path.join(__dirname, "public")));

// ✅ Serve the main HTML file correctly
app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "public", "tag-checker-v2.html");
  res.sendFile(filePath); // Must be a string path!
});

// ✅ GHL contacts API endpoint
app.post("/contacts", async (req, res) => {
  try {
    const { apiKey } = req.body;
    const response = await fetch("https://rest.gohighlevel.com/v1/contacts/", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await response.json();
    res.json({ contacts: data.contacts || [] });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
