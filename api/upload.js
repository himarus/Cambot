import fs from "fs";
import FormData from "form-data";

export const config = {
  api: {
    bodyParser: false, // kasi magha-handle tayo ng form-data
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    const form = new FormData();
    form.append("chat_id", "5728569894");
    form.append("photo", buffer, "photo.jpg");

    const tgRes = await fetch(
      "https://api.telegram.org/bot8011945097:AAENUBUIV5XEwAoTMOegp_Pnw5Ju1FAEAZw/sendPhoto",
      {
        method: "POST",
        body: form,
      }
    );

    const data = await tgRes.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Upload failed" });
  }
}
