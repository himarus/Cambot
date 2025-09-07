import express from "express";
import multer from "multer";
import FormData from "form-data";
import fetch from "node-fetch";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

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
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));
