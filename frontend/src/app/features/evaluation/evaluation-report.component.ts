import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvaluationTrimestrielle } from '../../core/models/business.models';

@Component({
  selector: 'app-evaluation-report',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="report-container" *ngIf="evaluation">
      <header class="report-header">
        <h2>RAPPORT DU {{ getTrimestreText(evaluation.trimestre) }} DE LA MAINTENANCE</h2>
        <p><strong>Lot :</strong> {{ evaluation.lot }} | <strong>Période :</strong> {{ getPeriodeText(evaluation.trimestre) }}</p>
        <p><strong>Prestataire :</strong> {{ evaluation.prestataireNom }} | <strong>Date évaluation :</strong> {{ formatDate(evaluation.dateEvaluation) }}</p>
      </header>

      <section class="section">
        <h3>I. INTRODUCTION</h3>
        <p>
          Le Ministère de l'Économie et des Finances (MEF) signe annuellement des contrats
          de maintenance informatique avec des prestataires privés.
          Une évaluation trimestrielle est réalisée pour vérifier si les prestations attendues
          sont respectées conformément aux contrats.
        </p>
      </section>

      <section class="section">
        <h3>II. ALLOTISSEMENT</h3>
        <p><strong>Lot {{ evaluation.lot.replace('Lot ', '') }} :</strong> Maintenance du matériel informatique et support bureautique des bâtiments R+5, R+4, R+1 du MEF.</p>
        <p><strong>Direction concernée :</strong> {{ evaluation.lot.includes('BCMP') ? 'BCMP' : 'Direction concernée' }}</p>
      </section>

      <section class="section">
        <h3>III. EXIGENCES À SATISFAIRE</h3>
        <table class="report-table">
          <thead>
            <tr>
              <th>N°</th>
              <th>Exigences du DAO</th>
              <th>Prestataire</th>
              <th>Observations</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Vérification des techniciens avec chef de site certifié ITIL Foundation</td>
              <td>{{ evaluation.techniciensCertifies ? 'Liste effective fournie' : 'Non fournie' }}</td>
              <td>{{ evaluation.obsTechniciens || (evaluation.techniciensCertifies ? 'RAS' : 'À fournir') }}</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Transmission du rapport d'intervention trimestriel</td>
              <td>{{ evaluation.rapportInterventionTransmis ? 'Transmis' : 'Non transmis' }}</td>
              <td>{{ evaluation.obsRapport || (evaluation.rapportInterventionTransmis ? 'RAS' : 'A transmettre au plus tard le ' + getDeadlineDate(evaluation.trimestre)) }}</td>
            </tr>
            <tr>
              <td>3</td>
              <td>Remplissage quotidien du registre et fiches d'interventions</td>
              <td>{{ evaluation.registreRempli ? 'Effectué' : 'Non effectué' }}</td>
              <td>{{ evaluation.obsRegistre || (evaluation.registreRempli ? 'RAS' : 'À régulariser') }}</td>
            </tr>
            <tr>
              <td>4</td>
              <td>Respect des horaires d'intervention</td>
              <td>{{ evaluation.horairesRespectes ? 'Respectés' : 'Non respectés' }}</td>
              <td>{{ evaluation.obsHoraires || (evaluation.horairesRespectes ? 'RAS' : 'Amélioration requise') }}</td>
            </tr>
            <tr>
              <td>5</td>
              <td>Respect du délai de réaction (4h)</td>
              <td>{{ evaluation.delaiReactionRespecte ? 'Respecté' : 'Non respecté' }}</td>
              <td>{{ evaluation.obsDelaiReaction || (evaluation.delaiReactionRespecte ? 'RAS' : 'Délais dépassés constatés') }}</td>
            </tr>
            <tr>
              <td>6</td>
              <td>Respect du délai d'intervention (24h)</td>
              <td>{{ evaluation.delaiInterventionRespecte ? 'Respecté' : 'Non respecté' }}</td>
              <td>{{ evaluation.obsDelaiIntervention || (evaluation.delaiInterventionRespecte ? 'RAS' : 'Interventions tardives') }}</td>
            </tr>
            <tr>
              <td>7</td>
              <td>Disponibilité du véhicule de service</td>
              <td>{{ evaluation.vehiculeDisponible ? 'Disponible' : 'Non disponible' }}</td>
              <td>{{ evaluation.obsVehicule || (evaluation.vehiculeDisponible ? 'RAS' : 'Véhicule indisponible') }}</td>
            </tr>
            <tr>
              <td>8</td>
              <td>Disponibilité de la tenue réglementaire</td>
              <td>{{ evaluation.tenueDisponible ? 'Disponible' : 'Non disponible' }}</td>
              <td>{{ evaluation.obsTenue || (evaluation.tenueDisponible ? 'RAS' : 'Tenue manquante') }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="section">
        <h3>IV. INSTANCES NON RÉSOLUES</h3>
        <table class="report-table">
          <thead>
            <tr>
              <th>N°</th>
              <th>Instance</th>
              <th>Direction</th>
              <th>Date début</th>
              <th>Jours pénalité</th>
              <th>Observation</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="!evaluation.instancesNonResolues || evaluation.instancesNonResolues.trim() === ''">
              <td>1</td>
              <td>RAS</td>
              <td>{{ evaluation.lot.includes('BCMP') ? 'BCMP' : '-' }}</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
            </tr>
            <tr *ngIf="evaluation.instancesNonResolues && evaluation.instancesNonResolues.trim() !== ''">
              <td>1</td>
              <td>{{ evaluation.instancesNonResolues }}</td>
              <td>{{ evaluation.lot.includes('BCMP') ? 'BCMP' : 'Direction concernée' }}</td>
              <td>{{ formatDate(evaluation.dateEvaluation) }}</td>
              <td>{{ evaluation.penalitesCalcul || 0 }}</td>
              <td>Instance en cours de résolution</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="section">
        <h3>V. APPRÉCIATIONS</h3>
        <div class="appreciations">
          <div class="observation-section" *ngIf="evaluation.observationsGenerales">
            <h4>Observations générales :</h4>
            <p>{{ evaluation.observationsGenerales }}</p>
          </div>

          <div class="appreciation-section" *ngIf="evaluation.appreciationRepresentant">
            <h4>Appréciation du représentant :</h4>
            <p>{{ evaluation.appreciationRepresentant }}</p>
          </div>

          <div class="score-section">
            <h4>Note finale : {{ evaluation.noteFinale || calculateScore() }}/8</h4>
            <p>Recommandation : {{ getRecommandationText() }}</p>
          </div>

          <div class="signatures">
            <div><strong>DGSI :</strong> {{ evaluation.evaluateurNom || 'Non spécifié' }}</div>
            <div><strong>Agent DGSI :</strong> {{ evaluation.correspondantId ? 'Agent ' + evaluation.correspondantId : 'Non spécifié' }}</div>
            <div><strong>Prestataire :</strong> {{ evaluation.prestataireNom }}</div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .report-container {
      padding: 2rem;
      background: #f8fafc;
      color: #1e293b;
      font-family: Arial, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
    }

    .report-header {
      text-align: center;
      margin-bottom: 2rem;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 1rem;
    }

    .report-header h2 {
      margin-bottom: 0.5rem;
      color: #0f172a;
      font-size: 1.5rem;
    }

    .report-header p {
      margin: 0.25rem 0;
      font-size: 0.9rem;
    }

    .section {
      margin-bottom: 2rem;
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .section h3 {
      color: #2563eb;
      margin-bottom: 1rem;
      font-size: 1.2rem;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 0.5rem;
    }

    .report-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
      font-size: 0.85rem;
    }

    .report-table th, .report-table td {
      border: 1px solid #cbd5e1;
      padding: 0.75rem;
      text-align: left;
      vertical-align: top;
    }

    .report-table th {
      background: #e2e8f0;
      font-weight: 600;
      color: #374151;
    }

    .report-table tbody tr:nth-child(even) {
      background: #f8fafc;
    }

    .appreciations {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .observation-section, .appreciation-section {
      background: #f8fafc;
      padding: 1rem;
      border-radius: 6px;
      border-left: 4px solid #2563eb;
    }

    .observation-section h4, .appreciation-section h4 {
      margin: 0 0 0.5rem 0;
      color: #374151;
      font-size: 1rem;
    }

    .score-section {
      background: #fef3c7;
      padding: 1rem;
      border-radius: 6px;
      text-align: center;
      border: 2px solid #f59e0b;
    }

    .score-section h4 {
      margin: 0 0 0.5rem 0;
      color: #92400e;
      font-size: 1.1rem;
    }

    .score-section p {
      margin: 0;
      color: #92400e;
      font-weight: 600;
    }

    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .report-container {
        padding: 1rem;
      }

      .signatures {
        flex-direction: column;
        gap: 0.5rem;
      }

      .report-table {
        font-size: 0.75rem;
      }

      .report-table th, .report-table td {
        padding: 0.5rem;
      }
    }

    @media print {
      .report-container {
        box-shadow: none;
        background: white;
      }

      .section {
        break-inside: avoid;
        box-shadow: none;
        border: 1px solid #e2e8f0;
      }
    }
  `]
})
export class EvaluationReportComponent implements OnInit {
  @Input() evaluation!: EvaluationTrimestrielle;

  constructor() {}

  ngOnInit(): void {}

  getTrimestreText(trimestre: string): string {
    const trimestreMap: { [key: string]: string } = {
      'T1': 'PREMIER TRIMESTRE',
      'T2': 'DEUXIÈME TRIMESTRE',
      'T3': 'TROISIÈME TRIMESTRE',
      'T4': 'QUATRIÈME TRIMESTRE'
    };
    return trimestreMap[trimestre] || trimestre;
  }

  getPeriodeText(trimestre: string): string {
    const periodeMap: { [key: string]: string } = {
      'T1': '01 Janvier – 31 Mars',
      'T2': '01 Avril – 30 Juin',
      'T3': '01 Juillet – 30 Septembre',
      'T4': '01 Octobre – 31 Décembre'
    };
    return periodeMap[trimestre] || trimestre;
  }

  getDeadlineDate(trimestre: string): string {
    const deadlineMap: { [key: string]: string } = {
      'T1': '1er Avril 2025',
      'T2': '1er Juillet 2025',
      'T3': '1er Octobre 2025',
      'T4': '1er Janvier 2026'
    };
    return deadlineMap[trimestre] || 'Date à définir';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  calculateScore(): number {
    let score = 0;
    if (this.evaluation.techniciensCertifies) score++;
    if (this.evaluation.rapportInterventionTransmis) score++;
    if (this.evaluation.registreRempli) score++;
    if (this.evaluation.horairesRespectes) score++;
    if (this.evaluation.delaiReactionRespecte) score++;
    if (this.evaluation.delaiInterventionRespecte) score++;
    if (this.evaluation.vehiculeDisponible) score++;
    if (this.evaluation.tenueDisponible) score++;
    return score;
  }

  getRecommandationText(): string {
    const score = this.evaluation.noteFinale || this.calculateScore();
    if (score >= 7) return 'MAINTENIR LE PRESTATAIRE';
    if (score >= 5) return 'FORMATION REQUISE';
    return 'DÉCLASSER LE PRESTATAIRE';
  }
}