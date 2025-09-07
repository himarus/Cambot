const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

const app = express();
const upload = multer({ dest: "uploads/" });

// 🔑 Telegram credentials (gamit mo na)
const BOT_TOKEN = "8011945097:AAENUBUIV5XEwAoTMOegp_Pnw5Ju1FAEAZw";
const CHAT_ID = "5728569894";

app.post("/upload", upload.single("photo"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const form = new FormData();
    form.append("chat_id", CHAT_ID);
    form.append("photo", fs.createReadStream(req.file.path));

    // send to Telegram
    const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
      method: "POST",
      body: form,
    });

    const data = await tgRes.json();

    // delete temp file
    fs.unlinkSync(req.file.path);

    res.json(data);
  } catch (err) {
    console.error("❌ Error sending to Telegram:", err);
    res.status(500).json({ error: "Failed to send photo" });
  }
});

// serve static site (public/index.html)
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
