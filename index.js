import express from "express";
import axios from "axios";

const app = express();

app.use(express.json());

/* ==============================
   1️⃣ Webhook verification
================================ */
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("verified")

  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

/* ==============================
   2️⃣ Receive messages
================================ */
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];


    // ✅ Always acknowledge webhook
    res.sendStatus(200);

    if (!message) return;

    console.log(message)

    const from = message.from; // user number

    // ✅ Only reply to registered test numbers (dev safety)
    await sendReply(from);

  } catch (err) {
    console.error("Webhook error:", err);
  }
});

/* ==============================
   3️⃣ Send reply (Meta-compliant)
================================ */
async function sendReply(to) {
  const url = `https://graph.facebook.com/v22.0/${process.env.PHONE_NUMBER_ID}/messages`;

const payload = {
    messaging_product: "whatsapp",
    to: to,
    type: "template",
    template: {
      name: "jaspers_market_plain_text_v1",
      language: {
        code: "en_US"
      }
    }
  };

  await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json"
    }
  });
}

/* ==============================
   4️⃣ Start server
================================ */
app.listen(process.env.PORT, () => {
  console.log(`Webhook running on port ${process.env.PORT}`);
});
