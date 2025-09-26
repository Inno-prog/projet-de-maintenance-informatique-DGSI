import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../../../../shared/components/layout/layout.component';

@Component({
  selector: 'app-lot-list',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="container">
        <div class="header-section">
          <h1>Gestion des Lots</h1>
          <p>Organisation et gestion des lots de maintenance</p>
        </div>

        <div class="content-section">
          <div class="coming-soon">
            <div class="icon">🏷️</div>
            <h2>Fonctionnalité en développement</h2>
            <p>La gestion des lots sera bientôt disponible.</p>
            <p>Cette fonctionnalité permettra d'organiser et gérer les différents lots de maintenance informatique.</p>
          </div>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .container {
      max-width: 800px;
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

    .content-section {
      background: white;
      border-radius: 12px;
      box-shadow: var(--shadow);
      padding: 3rem;
      text-align: center;
    }

    .coming-soon {
      max-width: 500px;
      margin: 0 auto;
    }

    .icon {
      font-size: 4rem;
      margin-bottom: 1.5rem;
    }

    .coming-soon h2 {
      font-size: 1.8rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1rem;
    }

    .coming-soon p {
      color: var(--text-secondary);
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 1rem;
    }
  `]
})
export class LotListComponent {}