// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 8080;

// -------------------
// 1️⃣  Middleware setup
// -------------------
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Serves files from the 'public' folder (your HTML, images, etc.)

// -------------------
// 2️⃣  Default route for main page
// -------------------
app.get("/", (req, res) => {
  // When someone visits https://tag-checker.onrender.com
  // it will load your Tag Checker HTML file
  res.sendFile(new URL("./public/tag-checker-v2.html", import.meta.url));
});

// -------------------
// 3️⃣  API route to fetch contacts from GHL
// -------------------
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

// -------------------
// 4️⃣  Start the server
// -------------------
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
