// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // optional if you have HTML/CSS in a folder

// Example route for testing
app.get("/", (req, res) => {
  res.send("✅ Server is running successfully!");
});

// API route to fetch from GHL
app.post("/contacts", async (req, res) => {
  try {
    const { apiKey } = req.body;
    const response = await fetch("https://rest.gohighlevel.com/v1/contacts/", {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    const data = await response.json();
    res.json({ contacts: data.contacts || [] });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
