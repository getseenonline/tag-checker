// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 8080;

// Resolve paths safely in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// ✅ Serve static files from "public" folder
app.use(express.static(path.join(__dirname, "public")));

// ✅ Root route to serve your main HTML
app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "public", "tag-checker-v2.html");
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(500).send("Error loading page");
    }
  });
});

// ✅ Endpoint to fetch contacts from GHL
app.post("/contacts", async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) {
      return res.status(400).json({ error: "Missing API key" });
    }

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

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running successfully on port ${PORT}`);
});
