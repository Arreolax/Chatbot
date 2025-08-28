const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

// Asegura carpeta donde se guardarán los PDFs
function ensureDirs() {
    const pdfsDir = path.join(__dirname, "/public/pdfs");
    if (!fs.existsSync(pdfsDir)) {
        fs.mkdirSync(pdfsDir, { recursive: true });
    }
    return pdfsDir;
}

function generateOrderPdf(user, cart, method, ttcart) {
    const pdfDir = ensureDirs();
    const ts = Date.now();
    const filename = `pedido_${user.id}_${ts}.pdf`;
    const filePath = path.join(pdfDir, filename);

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.pipe(fs.createWriteStream(filePath));

    doc.font("Helvetica-BoldOblique").fontSize(18).text("Ticket to pay products", { align: "center" });
    doc.moveDown();
    doc.font("Helvetica").fontSize(12).text(`Client: ${user.username}`, {lineGap: 5 });
    doc.text(`Phone: +${user.phone}`, {lineGap: 5 });
    doc.moveDown();

    doc.text(`Payment method:  ${method.name}`, {lineGap: 5 });
    doc.text(`${method.description}`, {lineGap: 5 });
    doc.moveDown();

    doc.moveDown();

    doc.fillColor("black").font("Helvetica-Bold").fontSize(14).text("Products:");
    let totalCarrito = 0;
    cart.forEach((item, i) => {
        const subtotal = item.price * item.amount;
        totalCarrito += subtotal;

        doc.font("Helvetica-Oblique").fontSize(12).text(`#${i + 1}. ${item.name} - $${totalCarrito} - ${item.amount} pieces `, {lineGap: 5 });
        totalCarrito = 0;
      });
    doc.moveDown();

    doc.font("Helvetica-BoldOblique").fontSize(14).text("Total:", { continued: true }).font("Helvetica").fillColor("red").fontSize(14).text(`$${ttcart}`, { align: "right" }); // esto aparece justo al lado

    doc.moveDown();

    // ---- PIE DE PÁGINA ----
    doc.moveDown(3);
    doc.font("Helvetica-Oblique").fontSize(10).fillColor("gray").text("Thank you for your preference", { align: "center" });
    doc.end();

    const publicBaseUrl = (process.env.PUBLIC_BASE_URL || "https://localhost:30001").trim();
    const publicUrl = `${publicBaseUrl}/pdfs/${filename}`;

    console.log(`PDF generado en: ${filePath}`);
    console.log(`URL accesible: ${publicUrl}`);

    return { filePath, publicUrl };
}

module.exports = { generateOrderPdf };
