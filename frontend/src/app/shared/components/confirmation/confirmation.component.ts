import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

export interface ConfirmationConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8) translateY(-20px)', opacity: 0 }),
        animate('300ms cubic-bezier(0.34, 1.56, 0.64, 1)', 
          style({ transform: 'scale(1) translateY(0)', opacity: 1 }))
      ])
    ])
  ],
  template: `
    <div *ngIf="isVisible" class="confirmation-overlay" [@fadeIn] 
         style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 9999;">
      <div class="confirmation-popup" [@slideIn] 
           style="background: white; width: 28rem; max-width: 90vw; border-radius: 1.5rem; box-shadow: 0 25px 50px rgba(0,0,0,0.25); overflow: hidden;">
        <div class="confirmation-icon" 
             style="display: flex; align-items: center; justify-content: center; padding: 2rem 2rem 1rem 2rem; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);">
          <i [class]="getIconClass()" style="font-size: 3rem;"></i>
        </div>
        
        <div class="confirmation-content" 
             style="padding: 1rem 2rem 1.5rem 2rem; text-align: center;">
          <h2 class="confirmation-title" 
              style="font-size: 1.5rem; font-weight: 700; color: #1f2937 !important; margin: 0 0 0.75rem 0;">{{ config.title }}</h2>
          <p class="confirmation-message" 
             style="color: #6b7280 !important; margin: 0; line-height: 1.6; font-size: 1rem;">{{ config.message }}</p>
        </div>
        
        <div class="confirmation-actions" 
             style="display: flex; gap: 0.75rem; padding: 1.5rem 2rem 2rem 2rem; background: #f9fafb; border-top: 1px solid #e5e7eb;">
          <button class="btn btn-cancel" (click)="cancel()" 
                  style="flex: 1; padding: 0.875rem 1.5rem; background: #f3f4f6; color: #374151 !important; border: 1px solid #d1d5db; border-radius: 0.75rem; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
            <i class="fas fa-times" style="color: #374151 !important;"></i>
            {{ config.cancelText || 'Annuler' }}
          </button>
          <button [class]="getConfirmButtonClass()" (click)="confirm()" 
                  [style]="getConfirmButtonStyle()">
            <i [class]="getConfirmIconClass()"></i>
            {{ config.confirmText || 'Confirmer' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirmation-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .confirmation-popup {
      background: white;
      width: 28rem;
      max-width: 90vw;
      border-radius: 1.5rem;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
      padding: 0;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .confirmation-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 2rem 1rem 2rem;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    }

    .confirmation-icon i {
      font-size: 3rem;
      margin-bottom: 0.5rem;
    }

    .icon-danger {
      color: #dc2626;
    }

    .icon-warning {
      color: #d97706;
    }

    .icon-info {
      color: #2563eb;
    }

    .confirmation-content {
      padding: 1rem 2rem 1.5rem 2rem;
      text-align: center;
    }

    .confirmation-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 0.75rem 0;
    }

    .confirmation-message {
      color: #6b7280;
      margin: 0;
      line-height: 1.6;
      font-size: 1rem;
    }

    .confirmation-actions {
      display: flex;
      gap: 0.75rem;
      padding: 1.5rem 2rem 2rem 2rem;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }

    .btn {
      flex: 1;
      padding: 0.875rem 1.5rem;
      border: none;
      border-radius: 0.75rem;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.95rem;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .btn-cancel {
      background: #f3f4f6;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .btn-cancel:hover {
      background: #e5e7eb;
      border-color: #9ca3af;
    }

    .btn-confirm {
      color: white;
      border: none;
    }

    .btn-danger {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      box-shadow: 0 4px 14px rgba(220, 38, 38, 0.3);
    }

    .btn-danger:hover {
      background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
      box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
    }

    .btn-warning {
      background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
      box-shadow: 0 4px 14px rgba(217, 119, 6, 0.3);
    }

    .btn-warning:hover {
      background: linear-gradient(135deg, #b45309 0%, #92400e 100%);
      box-shadow: 0 6px 20px rgba(217, 119, 6, 0.4);
    }

    .btn-info {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
    }

    .btn-info:hover {
      background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
    }

    @media (max-width: 640px) {
      .confirmation-popup {
        width: 95vw;
        margin: 1rem;
      }
      
      .confirmation-actions {
        flex-direction: column;
      }
      
      .btn {
        flex: none;
      }
    }
  `],
})
export class ConfirmationComponent {
  isVisible = false;
  config: ConfirmationConfig = { title: '', message: '' };
  private resolvePromise?: (value: boolean) => void;

  show(config: ConfirmationConfig): Promise<boolean> {
    this.config = config;
    this.isVisible = true;
    
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
    });
  }

  confirm(): void {
    this.isVisible = false;
    if (this.resolvePromise) {
      this.resolvePromise(true);
    }
  }

  cancel(): void {
    this.isVisible = false;
    if (this.resolvePromise) {
      this.resolvePromise(false);
    }
  }

  getConfirmButtonClass(): string {
    const baseClass = 'btn btn-confirm ';
    switch (this.config.type) {
      case 'danger':
        return baseClass + 'btn-danger';
      case 'warning':
        return baseClass + 'btn-warning';
      default:
        return baseClass + 'btn-info';
    }
  }

  getIconClass(): string {
    const baseClass = 'fas ';
    switch (this.config.type) {
      case 'danger':
        return baseClass + 'fa-exclamation-triangle icon-danger';
      case 'warning':
        return baseClass + 'fa-exclamation-circle icon-warning';
      default:
        return baseClass + 'fa-question-circle icon-info';
    }
  }

  getConfirmIconClass(): string {
    switch (this.config.type) {
      case 'danger':
        return 'fas fa-trash';
      case 'warning':
        return 'fas fa-exclamation';
      default:
        return 'fas fa-check';
    }
  }

  getConfirmButtonStyle(): string {
    const baseStyle = 'flex: 1; padding: 0.875rem 1.5rem; border: none; border-radius: 0.75rem; cursor: pointer; font-weight: 600; color: white !important; display: flex; align-items: center; justify-content: center; gap: 0.5rem; ';
    switch (this.config.type) {
      case 'danger':
        return baseStyle + 'background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);';
      case 'warning':
        return baseStyle + 'background: linear-gradient(135deg, #d97706 0%, #b45309 100%);';
      default:
        return baseStyle + 'background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);';
    }
  }
}