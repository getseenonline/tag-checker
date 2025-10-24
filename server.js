// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 10000;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ---------------------------------------------------------
   ⚡ Fast Parallel Fetch: Get ALL Contacts from GoHighLevel
--------------------------------------------------------- */
async function fetchAllGHLContacts(apiKey) {
  const limit = 100;
  let allContacts = [];

  console.log("📄 Fetching first page to determine total...");
  const firstRes = await fetch(`https://rest.gohighlevel.com/v1/contacts/?limit=${limit}&page=1`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!firstRes.ok) {
    const text = await firstRes.text();
    throw new Error(`Failed on first page: ${text}`);
  }

  const firstData = await firstRes.json();
  const total = firstData.meta?.total ?? firstData.contacts?.length ?? 0;
  const firstContacts = firstData.contacts || [];
  allContacts.push(...firstContacts);

  // Calculate total pages
  const totalPages = Math.ceil(total / limit);
  console.log(`📊 Estimated total: ${total} contacts (${totalPages} pages)`);

  // Build page list (skip 1 because we already fetched it)
  const pages = [];
  for (let p = 2; p <= totalPages; p++) pages.push(p);

  // Fetch in parallel batches of 5
  const batchSize = 5;
  for (let i = 0; i < pages.length; i += batchSize) {
    const batch = pages.slice(i, i + batchSize);
    console.log(`🚀 Fetching pages ${batch.join(", ")}...`);

    const results = await Promise.all(
      batch.map(async (page) => {
        const url = `https://rest.gohighlevel.com/v1/contacts/?limit=${limit}&page=${page}`;
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const txt = await res.text();
          console.warn(`⚠️ Failed page ${page}: ${txt}`);
          return [];
        }

        const data = await res.json();
        return data.contacts || [];
      })
    );

    // Combine batch results
    results.forEach(list => allContacts.push(...list));
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
   🩵 Lightweight Keep-Alive Endpoint for UptimeRobot
--------------------------------------------------------- */
app.get("/ping", (req, res) => {
  res.status(200).send("ok");
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
