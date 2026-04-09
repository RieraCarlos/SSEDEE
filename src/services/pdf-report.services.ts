import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Tournament } from "@/api/type/tournaments.api";
import type { FixtureMatch } from "@/utils/fixtureGenerator";

/**
 * Servicio de Generación de Reportes PDF (Senior Architecture)
 * Implementa un diseño profesional con la identidad visual del sistema.
 */
class PdfReportApiService {
  /**
   * Genera y descarga el reporte del calendario de un torneo
   */
  async generateTournamentReport(tournament: Tournament, matches: FixtureMatch[]): Promise<void> {
    return new Promise((resolve) => {
      // Simulamos asincronía para no bloquear el main thread en el inicio
      setTimeout(() => {
        const doc = new jsPDF();
        const primaryColor = [16, 185, 129]; // Emerald-500: #10b981
        const darkColor = [19, 22, 28];    // bg-[#13161c]

        // --- Configuración de Cabecera ---
        doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
        doc.rect(0, 0, 210, 40, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("REPORTE OFICIAL DE TORNEO", 15, 20);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text("GESTIÓN DE COMPETENCIAS DEPORTIVAS v1", 15, 28);

        // --- Información del Torneo ---
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(tournament.name.toUpperCase(), 15, 55);

        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setLineWidth(0.5);
        doc.line(15, 58, 60, 58);

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`Fecha de Inicio: ${tournament.fecha[0] || "N/A"}`, 15, 65);
        doc.text(`Fecha de Cierre: ${tournament.fecha[1] || "N/A"}`, 15, 70);
        doc.text(`Equipos Inscritos: ${tournament.n_equipos}`, 15, 75);

        // --- Tabla de Encuentros ---
        const tableBody = matches.map((m) => [
          m.round.toUpperCase(),
          m.home,
          "VS",
          m.away,
          m.date,
          m.time
        ]);

        autoTable(doc, {
          startY: 85,
          head: [["FASE / LLAVE", "LOCAL", "", "VISITANTE", "FECHA", "HORA"]],
          body: tableBody,
          theme: "grid",
          headStyles: {
            fillColor: primaryColor as [number, number, number],
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: "bold",
            halign: "center"
          },
          columnStyles: {
            0: { cellWidth: 40, fontStyle: "bold" },
            2: { cellWidth: 10, halign: "center", textColor: primaryColor as [number, number, number], fontStyle: "bold" },
            4: { halign: "center" },
            5: { halign: "center" }
          },
          styles: {
            fontSize: 8,
            cellPadding: 4
          },
          alternateRowStyles: {
            fillColor: [245, 255, 250] // Soft emerald tint
          }
        });

        // --- Pie de Página ---
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(
            `Documento generado automáticamente por RG-TECHNOLOGY - Página ${i} de ${pageCount}`,
            105,
            285,
            { align: "center" }
          );
        }

        // Descarga
        doc.save(`reporte_calendario_${tournament.name.toLowerCase().replace(/\s+/g, "_")}.pdf`);
        resolve();
      }, 0);
    });
  }
}

export const PdfReportService = new PdfReportApiService();
