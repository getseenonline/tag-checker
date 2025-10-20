// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 10000;

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ---------------------------------------------------------
   🔁 Fetch ALL Contacts from GoHighLevel (with pagination)
--------------------------------------------------------- */
async function fetchAllGHLContacts(apiKey) {
  let allContacts = [];
  let page = 1;
  const limit = 100; // Max allowed per page

  while (true) {
    const url = `https://rest.gohighlevel.com/v1/contacts/?limit=${limit}&page=${page}`;
    console.log(`📄 Fetching page ${page}...`);

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to fetch (page ${page}): ${text}`);
    }

    const data = await res.json();
    const contacts = data.contacts || [];
    allContacts = allContacts.concat(contacts);

    // Stop if no more pages
    if (!data.meta || !data.meta.nextPage) break;
    page++;
  }

  console.log(`✅ Total contacts fetched: ${allContacts.length}`);
  return allContacts;
}

/* ---------------------------------------------------------
   🌐 Endpoint for Tag Checker front-end
--------------------------------------------------------- */
app.post("/contacts", async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) return res.status(400).json({ error: "Missing API key" });

    console.log("🔑 Fetching contacts from GoHighLevel...");
    const contacts = await fetchAllGHLContacts(apiKey);
    res.json({ contacts });
  } catch (err) {
    console.error("❌ Error fetching contacts:", err);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

/* ---------------------------------------------------------
   🏠 Serve your Tag Checker interface
--------------------------------------------------------- */
app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "public", "tag-checker-v2.html");
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(500).send("Error loading page");
    }
  });
});

/* ---------------------------------------------------------
   🚀 Start the server
--------------------------------------------------------- */
app.listen(PORT, () => {
  console.log(`✅ Server running successfully on port ${PORT}`);
});
