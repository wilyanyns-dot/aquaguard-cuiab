import jsPDF from "jspdf";

export type ReportScope = "Diário" | "Mensal" | "Anual";

export interface ReportRow {
  label: string;
  liters: number;
}

export interface ReportOptions {
  scope: ReportScope;
  clientName: string;
  periodLabel: string;
  rows: ReportRow[];
  unitLabel?: string; // "Dia" | "Mês"
}

// ── Paleta (sustentabilidade: azul + verde) ─────────────────────────
const INK: [number, number, number] = [23, 42, 58];
const MUTED: [number, number, number] = [110, 126, 140];
const BLUE: [number, number, number] = [0, 132, 176];
const GREEN: [number, number, number] = [22, 145, 121];
const LINE: [number, number, number] = [223, 231, 237];
const ZEBRA: [number, number, number] = [246, 249, 251];

const PAGE_W = 210;
const PAGE_H = 297;
const M = 16;
const CONTENT_W = PAGE_W - M * 2;

const fmt = (n: number) => n.toLocaleString("pt-BR");

function drawLogo(doc: jsPDF, x: number, y: number) {
  // gota estilizada
  doc.setFillColor(...BLUE);
  doc.triangle(x + 5, y, x, y + 7, x + 10, y + 7, "F");
  doc.circle(x + 5, y + 8.5, 5, "F");
  doc.setFillColor(255, 255, 255);
  doc.circle(x + 3.2, y + 8.5, 1.4, "F");
}

function drawHeader(doc: jsPDF) {
  drawLogo(doc, M, M);
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text("Relatório de Consumo de Água", M + 16, M + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  doc.text("Saneamento Cuiabá · Monitoramento hídrico inteligente", M + 16, M + 12);
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.8);
  doc.line(M, M + 18, M + 28, M + 18);
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.line(M + 28, M + 18, PAGE_W - M, M + 18);
}

function drawMetaGrid(doc: jsPDF, items: { label: string; value: string }[], y: number) {
  const gap = 4;
  const w = (CONTENT_W - gap * (items.length - 1)) / items.length;
  const h = 18;
  items.forEach((it, i) => {
    const x = M + i * (w + gap);
    doc.setFillColor(...ZEBRA);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, w, h, 2, 2, "FD");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.setFont("helvetica", "normal");
    doc.text(it.label.toUpperCase(), x + 5, y + 7);
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    doc.setFont("helvetica", "bold");
    doc.text(it.value, x + 5, y + 13.5);
  });
  return y + h;
}

function drawTableHead(doc: jsPDF, y: number, colLabel: string) {
  doc.setFillColor(...INK);
  doc.roundedRect(M, y, CONTENT_W, 9, 1.5, 1.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(colLabel.toUpperCase(), M + 5, y + 6);
  doc.text("CONSUMO (LITROS)", PAGE_W - M - 5, y + 6, { align: "right" });
  return y + 9;
}

function drawFooters(doc: jsPDF) {
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.3);
    doc.line(M, PAGE_H - 18, PAGE_W - M, PAGE_H - 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("Gerado pelo app Saneamento Cuiabá — ODS 6", M, PAGE_H - 12);
    doc.text(`Página ${p} de ${total}`, PAGE_W - M, PAGE_H - 12, { align: "right" });
  }
}

export function generateConsumptionPDF({ scope, clientName, periodLabel, rows, unitLabel }: ReportOptions) {
  const doc = new jsPDF();
  const unit = unitLabel ?? (scope === "Anual" ? "Mês" : "Dia");
  const colLabel = scope === "Anual" ? "Mês" : "Data";

  drawHeader(doc);

  let y = M + 26;
  y = drawMetaGrid(
    doc,
    [
      { label: "Cliente", value: clientName },
      { label: "Período", value: periodLabel },
      { label: "Emissão", value: new Date().toLocaleDateString("pt-BR") },
    ],
    y
  );

  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(`Detalhamento ${scope.toLowerCase()}`, M, y);
  y += 4;

  y = drawTableHead(doc, y, colLabel);

  const rowH = 7.5;
  const bottomLimit = PAGE_H - 26;

  rows.forEach((r, i) => {
    if (y + rowH > bottomLimit) {
      doc.addPage();
      drawHeader(doc);
      y = drawTableHead(doc, M + 26, colLabel);
    }
    if (i % 2 === 1) {
      doc.setFillColor(...ZEBRA);
      doc.rect(M, y, CONTENT_W, rowH, "F");
    }
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.2);
    doc.line(M, y + rowH, PAGE_W - M, y + rowH);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text(r.label, M + 5, y + 5.2);
    doc.text(`${fmt(r.liters)} L`, PAGE_W - M - 5, y + 5.2, { align: "right" });
    y += rowH;
  });

  // ── Card de resumo (nunca quebrado ao meio) ───────────────────────
  const cardH = 34;
  y += 8;
  if (y + cardH > bottomLimit) {
    doc.addPage();
    drawHeader(doc);
    y = M + 26;
  }

  const total = rows.reduce((s, r) => s + r.liters, 0);
  const avg = rows.length ? Math.round(total / rows.length) : 0;

  doc.setFillColor(240, 249, 250);
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.4);
  doc.roundedRect(M, y, CONTENT_W, cardH, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...BLUE);
  doc.text("RESUMO DO PERÍODO", M + 6, y + 8);

  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.text("Consumo Total", M + 6, y + 17);
  doc.text(`Média por ${unit}`, M + CONTENT_W / 2 + 6, y + 17);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...BLUE);
  doc.text(`${fmt(total)} L`, M + 6, y + 27);
  doc.setTextColor(...GREEN);
  doc.text(`${fmt(avg)} L`, M + CONTENT_W / 2 + 6, y + 27);

  drawFooters(doc);
  return doc;
}
