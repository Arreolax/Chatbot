const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const verifyWebhook = require("./webhookVerification");
const webhookRouter = require("./webhook");

const app = express();
const PORT =  3001;

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// 📂 servir archivos estáticos (PDFs) desde /public
const publicDir = path.join(__dirname, "public");
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
const pdfDir = path.join(publicDir, "pdfs");
if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
app.use(express.static(publicDir));

// Ruta de verificación (GET)
app.get("/webhook", verifyWebhook);

// Rutas de webhook
app.use("/", webhookRouter);

app.listen(PORT, () => {
  console.log(`Webhook listening on port ${PORT}`);
  fs.appendFileSync('api_log.txt', `Webhook listening on port ${PORT}\n`);
});
