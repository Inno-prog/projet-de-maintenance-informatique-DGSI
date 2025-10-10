import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-informations-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="informations-dropdown" (mouseenter)="isHovered = true" (mouseleave)="isHovered = false">
      <button class="informations-btn">
        Informations
      </button>

      <div class="dropdown-menu" [class.show]="isHovered">
        <div class="dropdown-item" (click)="openWebsite()">
          <span class="icon">🌐</span>
          <span>Notre site web</span>
        </div>
        <div class="dropdown-item" (click)="sendEmail()">
          <span class="icon">✉️</span>
          <span>Nous envoyer un mail</span>
        </div>
        <div class="dropdown-item" (click)="showContact()">
          <span class="icon">📞</span>
          <span>Nous contacter</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .informations-dropdown {
      position: relative;
      display: inline-block;
    }

    .informations-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 25px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .informations-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.3s ease;
      z-index: 1000;
      min-width: 220px;
      margin-top: 8px;
    }

    .dropdown-menu.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      border-bottom: 1px solid #f0f0f0;
      font-size: 14px;
      color: #333;
    }

    .dropdown-item:last-child {
      border-bottom: none;
    }

    .dropdown-item:hover {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      color: #667eea;
    }

    .dropdown-item .icon {
      margin-right: 10px;
      font-size: 16px;
    }

    .dropdown-arrow {
      position: absolute;
      top: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-bottom: 6px solid white;
    }
  `]
})
export class InformationsDropdownComponent {
  isHovered = false;

  openWebsite(): void {
    window.open('http://www.it@finances.gov.bf', '_blank');
  }

  sendEmail(): void {
    const email = 'contact@finances.gov.bf';
    const subject = 'Demande d\'information - DGSI';
    const body = 'Bonjour,\n\nJe souhaite obtenir des informations concernant...\n\nCordialement,';
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  showContact(): void {
    const contactInfo = `
DGSI - Direction Générale des Systèmes d'Information
══════════════════════════════════════════════

📍 ADRESSES :
• Boîte postale : 01 BP 1122 Ouagadougou 01

📞 CONTACT :
• Téléphone : (+226) 20 49 02 73
• Fax : (+226) 20 30 66 64

🌐 SITE WEB :
• www.it@finances.gov.bf

Horaires d'ouverture :
Lundi - Vendredi : 7h30 - 17h00
Samedi : 8h00 - 12h00
    `.trim();

    alert(contactInfo);
  }
}