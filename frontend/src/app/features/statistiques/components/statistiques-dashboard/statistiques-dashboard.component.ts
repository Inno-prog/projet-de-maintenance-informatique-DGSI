import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../../../../shared/components/layout/layout.component';
import { UserService } from '../../../../core/services/user.service';
import { ContratService } from '../../../../core/services/contrat.service';
import { OrdreCommandeService } from '../../../../core/services/ordre-commande.service';
import { EvaluationService } from '../../../../core/services/evaluation.service';
import { FichePrestationService } from '../../../../core/services/fiche-prestation.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-statistiques-dashboard',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="container">
        <div class="header-section">
          <h1>Tableau de Bord Statistiques</h1>
          <p>Consultez les statistiques détaillées du système de maintenance</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-number">{{ stats.totalUsers }}</div>
            <div class="stat-label">Utilisateurs</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">📄</div>
            <div class="stat-number">{{ stats.totalContrats }}</div>
            <div class="stat-label">Contrats</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">📋</div>
            <div class="stat-number">{{ stats.totalOrdres }}</div>
            <div class="stat-label">Ordres de Commande</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-number">{{ stats.totalEvaluations }}</div>
            <div class="stat-label">Évaluations</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-number">{{ stats.totalPrestations }}</div>
            <div class="stat-label">Prestations</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-number">{{ stats.demandesEnAttente }}</div>
            <div class="stat-label">En Attente</div>
          </div>
        </div>

        <div class="charts-section">
          <div class="chart-placeholder">
            <div class="chart-icon">📈</div>
            <h3>Graphiques d'évolution</h3>
            <p>Visualisation des tendances mensuelles et trimestrielles</p>
          </div>

          <div class="chart-placeholder">
            <div class="chart-icon">🎯</div>
            <h3>Performance par prestataire</h3>
            <p>Analyse comparative des performances</p>
          </div>

          <div class="chart-placeholder">
            <div class="chart-icon">⏱️</div>
            <h3>Délais d'intervention</h3>
            <p>Statistiques sur les délais de réponse</p>
          </div>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .header-section {
      text-align: center;
      margin-bottom: 3rem;
    }

    .header-section h1 {
      font-size: 2.5rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1rem;
    }

    .header-section p {
      color: var(--text-secondary);
      font-size: 1.1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: var(--shadow);
      text-align: center;
      transition: transform 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 1rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .charts-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .chart-placeholder {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: var(--shadow);
      text-align: center;
    }

    .chart-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.7;
    }

    .chart-placeholder h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .chart-placeholder p {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
  `]
})
export class StatistiquesDashboardComponent implements OnInit {
  stats = {
    totalUsers: 0,
    totalContrats: 0,
    totalOrdres: 0,
    totalEvaluations: 0,
    totalDemandes: 0,
    demandesEnAttente: 0,
    totalPrestations: 0
  };

  constructor(
    private userService: UserService,
    private contratService: ContratService,
    private ordreCommandeService: OrdreCommandeService,
    private evaluationService: EvaluationService,
    private fichePrestationService: FichePrestationService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    this.userService.getAllUsers().subscribe(users => {
      this.stats.totalUsers = users.length;
    });

    this.contratService.getAllContrats().subscribe(contrats => {
      this.stats.totalContrats = contrats.length;
    });

    this.ordreCommandeService.getAllOrdresCommande().subscribe(ordres => {
      this.stats.totalOrdres = ordres.length;
    });

    this.evaluationService.getAllEvaluations().subscribe(evaluations => {
      this.stats.totalEvaluations = evaluations.length;
    });

    this.fichePrestationService.getAllFiches().subscribe(prestations => {
      this.stats.totalPrestations = prestations.length;
    });
  }
}