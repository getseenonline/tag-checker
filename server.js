// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static(".")); // serves your HTML, logo, etc.

// --- Route to fetch contacts using the user's API key ---
app.post("/contacts", async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) return res.status(400).send("Missing API key.");

    const response = await fetch("https://rest.gohighlevel.com/v1/contacts/", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).send(text);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error fetching GHL contacts:", err);
    res.status(500).send("Server error fetching contacts");
  }
});

// --- Start server ---
app.listen(PORT, () =>
  console.log(`✅ Tag Checker running at http://localhost:${PORT}`)
);
