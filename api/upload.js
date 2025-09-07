import multer from "multer";
import FormData from "form-data";

const upload = multer({ storage: multer.memoryStorage() });

export const config = {
  api: {
    bodyParser: false, // kailangan i-disable para gumana si multer
  },
};

export default function handler(req, res) {
  return new Promise((resolve) => {
    upload.single("photo")(req, {}, async (err) => {
      if (err) {
        res.status(500).json({ error: "Upload failed" });
        return resolve();
      }

      try {
        const form = new FormData();
        form.append("chat_id", process.env.CHAT_ID);
        form.append("photo", req.file.buffer, {
          filename: "photo.jpg",
          contentType: "image/jpeg",
        });

        const tgRes = await fetch(
          `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`,
          {
            method: "POST",
            body: form,
          }
        );

        const data = await tgRes.json();
        res.status(200).json(data);
      } catch (e) {
        console.error("❌ Telegram error:", e);
        res.status(500).json({ error: "Failed to send photo" });
      }

      resolve();
    });
  });
}
