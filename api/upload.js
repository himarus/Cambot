import FormData from "form-data";

export const config = {
  api: {
    bodyParser: false, // para ma-handle natin ang raw form-data
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Parse multipart manually
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Send to Telegram
    const form = new FormData();
    form.append("chat_id", process.env.CHAT_ID);
    form.append("photo", buffer, { filename: "capture.jpg" });

    const tgRes = await fetch(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`,
      { method: "POST", body: form }
    );

    const data = await tgRes.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("Telegram error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
}
    console.error(err);
    return res.status(500).json({ error: "Upload failed" });
  }
}
