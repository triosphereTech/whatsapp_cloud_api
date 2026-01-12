const express = require("express");
const app = express();

// ✅ MUST be before app.post("/webhook")
app.use(express.json());

app.post("/webhook", async (req, res) => {
  try {
    console.log("RAW BODY:", req.body); // debug

    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    // ✅ Always acknowledge webhook
    res.sendStatus(200);

    if (!message) return;

    const from = message.from;
    await sendReply(from);

  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(200);
  }
});
