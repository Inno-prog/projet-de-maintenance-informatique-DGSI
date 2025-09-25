import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {

  exportDemandesInterventionToPdf(demandes: any[]): void {
    const headers = ['ID', 'Demandeur', 'Objet', 'Catégorie', 'Statut', 'Date'];
    const tableData = demandes.map(demande => [
      demande.idDemande || '-',
      demande.prestataireNom || '-',
      demande.objet || '-',
      demande.categorie || '-',
      this.getStatusLabel(demande.statut) || '-',
      demande.dateDemande ? new Date(demande.dateDemande).toLocaleDateString('fr-FR') : '-'
    ]);
    this.generatePrintablePdfWithData(tableData, 'Demandes d\'Intervention', headers);
  }

  exportFichesPrestation(fiches: any[]): void {
    const headers = ['ID', 'Prestataire', 'Item', 'Quantité', 'Statut', 'Date'];
    const tableData = fiches.map(fiche => [
      fiche.idPrestation || '-',
      fiche.nomPrestataire || '-',
      fiche.nomItem || '-',
      fiche.quantite || '-',
      this.getStatusLabel(fiche.statut) || '-',
      fiche.dateRealisation ? new Date(fiche.dateRealisation).toLocaleDateString('fr-FR') : '-'
    ]);
    this.generatePrintablePdfWithData(tableData, 'Fiches de Prestation', headers);
  }

  exportEvaluations(evaluations: any[]): void {
    const headers = ['ID', 'Prestataire', 'Période', 'Note', 'Date'];
    const tableData = evaluations.map(evaluation => [
      evaluation.id || '-',
      evaluation.prestataireNom || '-',
      evaluation.trimestre || '-',
      evaluation.noteFinale ? evaluation.noteFinale + '%' : '-',
      evaluation.dateEvaluation ? new Date(evaluation.dateEvaluation).toLocaleDateString('fr-FR') : '-'
    ]);
    this.generatePrintablePdfWithData(tableData, 'Évaluations', headers);
  }

  exportContrats(contrats: any[]): void {
    const headers = ['ID', 'Prestataire', 'Type', 'Montant', 'Début', 'Fin'];
    const tableData = contrats.map(contrat => [
      contrat.idContrat || '-',
      contrat.nomPrestataire || '-',
      contrat.typeContrat || '-',
      contrat.montant ? contrat.montant + ' FCFA' : '-',
      contrat.dateDebut ? new Date(contrat.dateDebut).toLocaleDateString('fr-FR') : '-',
      contrat.dateFin ? new Date(contrat.dateFin).toLocaleDateString('fr-FR') : '-'
    ]);
    this.generatePrintablePdfWithData(tableData, 'Contrats', headers);
  }

  private generatePrintablePdfWithData(tableData: string[][], title: string, headers: string[]): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>DGSI Maintenance - ${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #f97316; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f97316; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
          .header { text-align: center; margin-bottom: 20px; }
          .date { font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>DGSI Maintenance</h1>
          <h2>${title}</h2>
          <p class="date">Généré le: ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${tableData.map(row => `
              <tr>
                ${row.map(cell => `<td>${cell}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }

  private getStatusLabel(statut: string): string {
    const statusLabels: { [key: string]: string } = {
      'SOUMISE': 'Soumise',
      'EN_COURS': 'En cours',
      'TERMINEE': 'Terminée',
      'ANNULEE': 'Annulée',
      'EN_ATTENTE': 'En attente',
      'VALIDER': 'Validée'
    };
    return statusLabels[statut] || statut;
  }
}